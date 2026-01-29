export interface CompletionStats {
  completed: number;
  deleted: number;
  failed: number;
}

interface CompleteStaleSessionsOptions {
  batchSize?: number;
  concurrency?: number;
  /** Optional time limit in ms to stop processing early */
  timeLimitMs?: number;
  /** Start time to calculate elapsed duration against timeLimitMs */
  startTime?: number;
}

export const completeStaleSessions = async (
  _options: CompleteStaleSessionsOptions = {},
): Promise<CompletionStats> => ({
  completed: 0,
  deleted: 0,
  failed: 0,
});

/*

/**
 * Process items in chunks using Promise.all for parallel execution.
 */
const processInChunks = async <T>(
  items: T[],
  chunkSize: number,
  processor: (item: T) => Promise<void>,
  checkTimeout?: () => boolean,
): Promise<void> => {
  for (let i = 0; i < items.length; i += chunkSize) {
    if (checkTimeout?.()) break;
    const chunk = items.slice(i, i + chunkSize);
    await Promise.all(chunk.map(processor));
  }
};

/**
 * Core logic to find and complete stale coding sessions.
 * Shared between API cron handler and Trigger.dev task.
 */
export const completeStaleSessions = async (
  options: CompleteStaleSessionsOptions = {},
): Promise<CompletionStats> => {
  const {
    batchSize = 20,
    concurrency = 5,
    timeLimitMs,
    startTime = Date.now(),
  } = options;

  // Use a safe global threshold: Max possible user timeout (30m) + buffer (15m) = 45m
  // This ensures we never prematurely close a session for a user with a long timeout setting.
  // The trade-off is that 15m-timeout users might wait extra time for their AI summary,
  // but correctness of session boundaries is prioritized.
  const SAFE_STALE_THRESHOLD_MS = 45 * 60 * 1000;
  const staleThreshold = new Date(Date.now() - SAFE_STALE_THRESHOLD_MS);

  // Helper to check if we're approaching timeout
  const isTimeUp = () => {
    if (!timeLimitMs) return false;
    const elapsed = Date.now() - startTime;
    return elapsed >= timeLimitMs;
  };

  // Find sessions that need processing:
  // 1. Sessions needing AI summary (no title OR no summary)
  // 2. Completed sessions missing actionTag (backfill)
  const staleSessions = await db
    .select({
      id: codingSession.id,
      userId: codingSession.userId,
      status: codingSession.status,
      startedAt: codingSession.startedAt,
      endedAt: codingSession.endedAt,
      mainLanguage: codingSession.mainLanguage,
      mainProject: codingSession.mainProject,
      mainBranch: codingSession.mainBranch,
      title: codingSession.title,
      summary: codingSession.summary,
      actionTag: codingSession.actionTag,
    })
    .from(codingSession)
    .where(
      or(
        // Case 1: Sessions needing AI summary (no title OR no summary)
        and(
          or(isNull(codingSession.title), isNull(codingSession.summary)),
          or(
            eq(codingSession.status, SESSION_STATUS.SYNCED),
            and(
              eq(codingSession.status, SESSION_STATUS.ONGOING),
              lt(codingSession.endedAt, staleThreshold),
            ),
          ),
        ),
        // Case 2: Completed sessions missing actionTag (backfill)
        and(
          eq(codingSession.status, SESSION_STATUS.COMPLETED),
          isNull(codingSession.actionTag),
        ),
      ),
    )
    .limit(batchSize);

  if (staleSessions.length === 0) {
    return { completed: 0, deleted: 0, failed: 0 };
  }

  // Batch fetch heartbeats (including commit data)
  const sessionIds = staleSessions.map((s) => s.id);
  const allHeartbeats = await db
    .select({
      sessionId: heartbeat.sessionId,
      file: heartbeat.file,
      language: heartbeat.language,
      branch: heartbeat.branch,
      project: heartbeat.project,
      aiLineChanges: heartbeat.aiLineChanges,
      humanLineChanges: heartbeat.humanLineChanges,
      symbolName: heartbeat.symbolName,
      symbolKind: heartbeat.symbolKind,
      // Commit data
      category: heartbeat.category,
      commitMessage: heartbeat.commitMessage,
      filesChanged: heartbeat.filesChanged,
      insertions: heartbeat.insertions,
      deletions: heartbeat.deletions,
    })
    .from(heartbeat)
    .where(inArray(heartbeat.sessionId, sessionIds));

  // Group heartbeats by session
  const heartbeatsBySession = new Map<string, typeof allHeartbeats>();
  for (const hb of allHeartbeats) {
    if (!hb.sessionId) continue;
    const existing = heartbeatsBySession.get(hb.sessionId) ?? [];
    existing.push(hb);
    heartbeatsBySession.set(hb.sessionId, existing);
  }

  // Separate sessions into: delete (no heartbeats) or process (needs AI)
  const sessionsToDelete: string[] = [];
  const sessionsToProcess: typeof staleSessions = [];

  for (const session of staleSessions) {
    const sessionHeartbeats = heartbeatsBySession.get(session.id) ?? [];
    if (sessionHeartbeats.length === 0) {
      sessionsToDelete.push(session.id);
    } else {
      sessionsToProcess.push(session);
    }
  }

  // Delete orphaned sessions
  if (sessionsToDelete.length > 0) {
    await db
      .delete(codingSession)
      .where(inArray(codingSession.id, sessionsToDelete));
  }

  let completed = 0;
  let failed = 0;

  // Process sessions with AI
  await processInChunks(
    sessionsToProcess,
    concurrency,
    async (session) => {
      // Create a local check inside the chunk loop, although processInChunks handles strict breaks between chunks
      if (isTimeUp()) return;

      const sessionHeartbeats = heartbeatsBySession.get(session.id) ?? [];

      const files = sessionHeartbeats
        .map((h) => h.file)
        .filter((f): f is string => f !== null);
      const allLanguages = sessionHeartbeats.map((h) => h.language);
      const allBranches = sessionHeartbeats
        .map((h) => h.branch)
        .filter((b): b is string => b !== null);
      const allProjects = sessionHeartbeats.map((h) => h.project);

      const mainLanguage =
        session.mainLanguage ?? getMostFrequent(allLanguages);
      const mainProject = session.mainProject ?? getMostFrequent(allProjects);
      const mainBranch = session.mainBranch ?? getMostFrequent(allBranches);

      const durationMinutes = Math.max(
        0,
        Math.round(
          (session.endedAt.getTime() - session.startedAt.getTime()) / 60000,
        ),
      );

      const { linesAdded, linesDeleted } =
        calculateLineChanges(sessionHeartbeats);

      const symbols = sessionHeartbeats
        .map((h) => h.symbolName)
        .filter((s): s is string => s !== null);

      // Extract unique commits (where category = 'committing' and has message)
      const commits = sessionHeartbeats
        .filter(
          (h): h is typeof h & { commitMessage: string } =>
            h.category === "committing" && h.commitMessage !== null,
        )
        .map((h) => ({
          message: h.commitMessage,
          filesChanged: h.filesChanged ?? undefined,
          insertions: h.insertions ?? undefined,
          deletions: h.deletions ?? undefined,
        }))
        // Dedupe by message (same commit might have multiple heartbeats)
        .filter(
          (c, i, arr) => arr.findIndex((x) => x.message === c.message) === i,
        );

      try {
        const result = await generateSessionSummary({
          files,
          languages: allLanguages,
          branch: mainBranch,
          project: mainProject ?? "Unknown Project",
          durationMinutes,
          symbols: symbols.length > 0 ? symbols : undefined,
          linesAdded,
          linesDeleted,
          commits: commits.length > 0 ? commits : undefined,
        });

        await db
          .update(codingSession)
          .set({
            status: SESSION_STATUS.COMPLETED,
            mainLanguage,
            mainProject,
            mainBranch,
            linesAdded,
            linesDeleted,
            title: result.title,
            summary: result.summary,
            actionTag: result.actionTag,
          })
          .where(eq(codingSession.id, session.id));

        trackServerEvent({
          distinctId: session.userId,
          event: ANALYTICS_EVENTS.SESSION_CLOSED,
          properties: {
            sessionId: session.id,
            title: result.title,
            summary: result.summary,
            actionTag: result.actionTag,
          },
        });

        // Invalidate pulse cache so user gets fresh AI content after session ends
        if (durationMinutes > 0) {
          await cacheDelete(db, CACHE_KEYS.pulse(session.userId));
        }

        completed++;
      } catch (error) {
        if (error instanceof Error) {
          captureError(error, {
            userId: session.userId,
            tags: { task: "complete-stale-sessions" },
            extra: {
              sessionId: session.id,
              mainProject: session.mainProject,
              durationMinutes,
              filesCount: files.length,
            },
          });
        }

        await db
          .update(codingSession)
          .set({
            status: SESSION_STATUS.SYNCED,
            mainLanguage,
            mainProject,
            mainBranch,
            linesAdded,
            linesDeleted,
          })
          .where(eq(codingSession.id, session.id));

        trackServerEvent({
          distinctId: session.userId,
          event: ANALYTICS_EVENTS.AI_SUMMARY_FAILED,
          properties: {
            sessionId: session.id,
            errorType: error instanceof Error ? error.name : "UnknownError",
            errorMessage:
              error instanceof Error ? error.message : String(error),
          },
        });

        failed++;
      }
    },
    isTimeUp,
  );

  trackServerEvent({
    distinctId: "system",
    event: ANALYTICS_EVENTS.STALE_SESSIONS_COMPLETED,
    properties: {
      completed,
      deleted: sessionsToDelete.length,
      failed,
      total: staleSessions.length,
      limit: batchSize,
    },
  });

  return { completed, deleted: sessionsToDelete.length, failed };
};
*/
