export type DbClient = unknown;

/*

/**
 * Session management utilities for the "Strava-like" session architecture.
 * Handles finding/creating sessions and managing session lifecycle.
 */

/**
 * Batch-optimized session assignment for a sorted array of heartbeats.
 * Reduces N+1 queries by caching the current session and only querying
 * the database when a session boundary is crossed.
 *
 * **Guarantee:** The returned array has 1:1 index correspondence with the input.
 * `result[i]` is the session ID for `heartbeats[i]`.
 *
 * @param db - Database client
 * @param userId - User ID
 * @param heartbeats - Array of heartbeats, MUST be sorted by timestamp ascending
 * @returns Array of session IDs with same length and order as input heartbeats
 */
export const assignSessionsToHeartbeats = async <T extends { timestamp: Date }>(
  db: DbClient,
  userId: string,
  heartbeats: T[],
  sessionTimeoutMinutes?: number,
): Promise<string[]> => {
  if (heartbeats.length === 0) {
    return [];
  }

  // Use user's setting or fallback to default (15 min)
  const timeoutMs = (sessionTimeoutMinutes ?? 15) * 60 * 1000;

  const sessionIds: string[] = [];

  // Track current session in memory to avoid repeated queries
  let currentSession: { id: string; endedAt: Date } | null = null;

  // DEFENSIVE: Get ALL ongoing sessions for this user (not just one)
  // This ensures we never have more than one ongoing session.
  const ongoingSessions = await db
    .select({ id: codingSession.id, endedAt: codingSession.endedAt })
    .from(codingSession)
    .where(
      and(
        eq(codingSession.userId, userId),
        eq(codingSession.status, SESSION_STATUS.ONGOING),
      ),
    )
    .orderBy(desc(codingSession.endedAt));

  const [latestSession, ...staleSessions] = ongoingSessions;

  if (latestSession) {
    // DEFENSIVE: Close ALL other ongoing sessions (they are stale/orphaned)
    // This guarantees only one ongoing session exists per user
    if (staleSessions.length > 0) {
      console.log(
        `🧹 Cleaning up ${staleSessions.length} stale session(s) for user ${userId}`,
      );
      // Finalize all stale sessions concurrently for better performance
      await Promise.all(
        staleSessions.map((stale) => finalizeSession(db, stale.id, userId)),
      );
    }

    currentSession = latestSession;
  }

  for (const hb of heartbeats) {
    const heartbeatTime = hb.timestamp.getTime();

    if (currentSession) {
      const gap = heartbeatTime - currentSession.endedAt.getTime();

      if (gap <= timeoutMs) {
        // Same session - update endedAt in memory (batch update later)
        currentSession.endedAt = hb.timestamp;
        sessionIds.push(currentSession.id);
        continue;
      }

      // Gap too large - mark old session as SYNCED (don't call finalizeSession!)
      // finalizeSession would delete sessions with no heartbeats, but we haven't
      // inserted heartbeats yet, causing FK violations. Let the scheduled task
      // handle AI summary and cleanup after heartbeats are actually inserted.
      await db
        .update(codingSession)
        .set({ status: SESSION_STATUS.SYNCED })
        .where(eq(codingSession.id, currentSession.id));
      currentSession = null;
    }

    // Create new session
    const [newSession] = await db
      .insert(codingSession)
      .values({
        userId,
        startedAt: hb.timestamp,
        endedAt: hb.timestamp,
        status: SESSION_STATUS.ONGOING,
      })
      .returning({ id: codingSession.id });

    if (!newSession) {
      throw new Error("Failed to create session");
    }

    currentSession = { id: newSession.id, endedAt: hb.timestamp };
    sessionIds.push(newSession.id);
  }

  // Update the final session's endedAt with the last heartbeat timestamp
  if (currentSession) {
    await db
      .update(codingSession)
      .set({ endedAt: currentSession.endedAt })
      .where(eq(codingSession.id, currentSession.id));
  }

  return sessionIds;
*/

/**
 * Close a session by marking it as synced (stats computed, awaiting AI).
 * Calculates stats immediately and triggers AI summary in background.
 *
 * THIS MUST BE AWAITED to prevent race conditions where a session remains "ongoing".
 */
export const finalizeSession = async (
  db: DbClient,
  sessionId: string,
  userId: string,
): Promise<void> => {
  // Gather session metadata from heartbeats and session info in parallel
  const [sessionHeartbeats, sessionResult] = await Promise.all([
    db
      .select({
        file: heartbeat.file,
        language: heartbeat.language,
        branch: heartbeat.branch,
        project: heartbeat.project,
        aiLineChanges: heartbeat.aiLineChanges,
        humanLineChanges: heartbeat.humanLineChanges,
        symbolName: heartbeat.symbolName,
        symbolKind: heartbeat.symbolKind,
      })
      .from(heartbeat)
      .where(eq(heartbeat.sessionId, sessionId)),
    db
      .select({
        startedAt: codingSession.startedAt,
        endedAt: codingSession.endedAt,
      })
      .from(codingSession)
      .where(eq(codingSession.id, sessionId)),
  ]);

  if (sessionHeartbeats.length === 0) {
    // No heartbeats detected - use a transaction to safely delete
    // This prevents race conditions where heartbeats are being inserted concurrently
    await db.transaction(async (tx) => {
      // Re-check heartbeat count inside the transaction
      const [countResult] = await tx
        .select({ count: heartbeat.id })
        .from(heartbeat)
        .where(eq(heartbeat.sessionId, sessionId))
        .limit(1);

      if (!countResult) {
        // Still no heartbeats - safe to delete this orphaned session
        await tx.delete(codingSession).where(eq(codingSession.id, sessionId));
      } else {
        // Heartbeats were inserted concurrently - mark as synced instead
        await tx
          .update(codingSession)
          .set({ status: SESSION_STATUS.SYNCED })
          .where(eq(codingSession.id, sessionId));
      }
    });
    return;
  }

  // Get session duration (ensure non-negative for edge cases)
  const session = sessionResult[0];
  const durationMinutes = session
    ? Math.max(
        0,
        Math.round(
          (session.endedAt.getTime() - session.startedAt.getTime()) / 60000,
        ),
      )
    : 0;

  // Extract all values (with duplicates for frequency counting)
  const files = sessionHeartbeats
    .map((h) => h.file)
    .filter((f): f is string => f !== null);
  const allLanguages = sessionHeartbeats
    .map((h) => h.language)
    .filter((l): l is string => (l as string | null) !== null);
  const allBranches = sessionHeartbeats
    .map((h) => h.branch)
    .filter((b): b is string => b !== null);
  const allProjects = sessionHeartbeats
    .map((h) => h.project)
    .filter((p): p is string => (p as string | null) !== null);

  // Calculate most frequent values
  const mainLanguage = getMostFrequent(allLanguages);
  const mainProject = getMostFrequent(allProjects);
  const mainBranch = getMostFrequent(allBranches);

  // Aggregate symbols (function/class names) from heartbeats
  const symbols = sessionHeartbeats
    .map((h) => h.symbolName)
    .filter((s): s is string => s !== null);

  // Aggregate line changes using shared utility
  const { linesAdded, linesDeleted } = calculateLineChanges(sessionHeartbeats);

  // Generate AI summary directly (no Trigger.dev background task)
  // If this fails, the scheduled complete-stale-sessions task will retry later
  try {
    const result = await generateSessionSummary({
      files,
      languages: allLanguages,
      branch: mainBranch,
      project: mainProject ?? "Unknown Project",
      durationMinutes,
      symbols: symbols.length > 0 ? symbols : undefined,
    });

    // Update session with computed stats AND AI summary in one query
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
      })
      .where(eq(codingSession.id, sessionId));

    // Track success
    trackServerEvent({
      distinctId: userId,
      event: ANALYTICS_EVENTS.SESSION_CLOSED,
      properties: {
        sessionId,
        title: result.title,
        summary: result.summary,
      },
    });
  } catch (error) {
    // AI failed - just mark as SYNCED, the scheduled task will retry later
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
      .where(eq(codingSession.id, sessionId));

    // Track failure so we can monitor
    trackServerEvent({
      distinctId: userId,
      event: ANALYTICS_EVENTS.AI_SUMMARY_FAILED,
      properties: {
        sessionId,
        errorType: error instanceof Error ? error.name : "UnknownError",
      },
    });
  }
};
