import { Hono } from "hono";

import type { AppContext } from "../context";

const app = new Hono<AppContext>();

export default app;

/*

/**
 * Cached pulse content structure.
 */
interface CachedPulse {
  headline: string;
  subtext: string;
  vibe: Vibe;
}

/**
 * Vibe history for cooldown tracking (stored separately with 4-hour TTL).
 */
interface VibeHistory {
  lastVibe: Vibe;
  lastVibeTime: string; // ISO string for JSON serialization
}

/**
 * Get start and end of a day.
 */
const getDayBounds = (date: Date, offsetDays = 0) => {
  const d = new Date(date);
  d.setDate(d.getDate() + offsetDays);
  const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
  const end = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    23,
    59,
    59,
    999,
  );
  return { start, end };
};

// 4-hour TTL for vibe history (matches cooldown period)
const VIBE_HISTORY_TTL_MS = 4 * 60 * 60 * 1000;

/**
 * Sessions router - provides session-related APIs including pulse state.
 */
const app = new Hono<AppContext>()
  /**
   * GET /sessions - Get COMPLETED coding sessions by date range with activity data
   *
   * Query params:
   * - startDate: ISO string for range start (required)
   * - endDate: ISO string for range end (required)
   *
   * Returns sessions with `activity` array for sparkline visualization
   */
  .get("/", authMiddleware, async (c) => {
    const db = c.get("db");
    const session = c.get("session");

    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = session.user.id;
    const startDate = c.req.query("startDate");
    const endDate = c.req.query("endDate");

    if (!startDate || !endDate) {
      return c.json({ error: "startDate and endDate are required" }, 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return c.json({ error: "Invalid date format" }, 400);
    }

    const sessions = await db
      .select()
      .from(codingSession)
      .where(
        and(
          eq(codingSession.userId, userId),
          eq(codingSession.status, "completed"), // Only completed sessions in history
          gte(codingSession.startedAt, start),
          lt(codingSession.startedAt, end),
          // Filters
          c.req.query("project")
            ? inArray(
                codingSession.mainProject,
                (c.req.query("project") ?? "").split(","),
              )
            : undefined,
          c.req.query("branch")
            ? inArray(
                codingSession.mainBranch,
                (c.req.query("branch") ?? "").split(","),
              )
            : undefined,
          c.req.query("action")
            ? inArray(
                codingSession.actionTag,
                (c.req.query("action") ?? "").split(",") as (
                  | "building"
                  | "refactoring"
                  | "debugging"
                  | "testing"
                  | "reviewing"
                  | "configuring"
                )[],
              )
            : undefined,
        ),
      )
      .orderBy(desc(codingSession.startedAt));

    // Fetch heartbeats for all sessions to build activity data
    // ... rest of logic ...

    // Fetch heartbeats for all sessions to build activity data
    const sessionIds = sessions.map((s) => s.id);

    // Get heartbeats for these sessions
    const heartbeats =
      sessionIds.length > 0
        ? await db
            .select({
              sessionId: heartbeat.sessionId,
              timestamp: heartbeat.timestamp,
            })
            .from(heartbeat)
            .where(
              and(
                eq(heartbeat.userId, userId),
                inArray(heartbeat.sessionId, sessionIds),
                gte(heartbeat.timestamp, start),
                lt(heartbeat.timestamp, end),
              ),
            )
        : [];

    // Group heartbeats by session and create activity buckets
    const activityBySession = new Map<string, number[]>();

    // Pre-group heartbeats by sessionId for O(n+m) complexity
    const heartbeatsBySessionId = new Map<string, typeof heartbeats>();
    for (const h of heartbeats) {
      if (!h.sessionId) continue;

      const existing = heartbeatsBySessionId.get(h.sessionId);
      if (existing) {
        existing.push(h);
      } else {
        heartbeatsBySessionId.set(h.sessionId, [h]);
      }
    }

    for (const s of sessions) {
      const sessionHeartbeats = heartbeatsBySessionId.get(s.id) ?? [];

      if (sessionHeartbeats.length === 0) {
        activityBySession.set(s.id, []);
        continue;
      }

      // Divide session duration into 10 buckets
      const sessionStart = s.startedAt.getTime();
      const sessionEnd = s.endedAt.getTime();
      const duration = sessionEnd - sessionStart;
      const bucketSize = duration / 10;

      const buckets: number[] = Array(10).fill(0) as number[];

      for (const h of sessionHeartbeats) {
        const elapsed = h.timestamp.getTime() - sessionStart;
        const bucketIndex = Math.min(Math.floor(elapsed / bucketSize), 9);
        if (buckets[bucketIndex] !== undefined) {
          buckets[bucketIndex]++;
        }
      }

      activityBySession.set(s.id, buckets);
    }

    // Combine sessions with activity data
    const sessionsWithActivity = sessions.map((s) => ({
      ...s,
      activity: activityBySession.get(s.id) ?? [],
    }));

    return c.json({ sessions: sessionsWithActivity });
  })

  /**
   * GET /facets - Get available filter options for the current date range
   */
  .get("/facets", authMiddleware, async (c) => {
    const db = c.get("db");
    const session = c.get("session");

    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = session.user.id;
    const startDate = c.req.query("startDate");
    const endDate = c.req.query("endDate");

    if (!startDate || !endDate) {
      return c.json({ error: "startDate and endDate are required" }, 400);
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return c.json({ error: "Invalid date format" }, 400);
    }

    const whereClause = and(
      eq(codingSession.userId, userId),
      eq(codingSession.status, "completed"),
      gte(codingSession.startedAt, start),
      lt(codingSession.startedAt, end),
    );

    const [projects, branches, actions] = await Promise.all([
      db
        .selectDistinct({ value: codingSession.mainProject })
        .from(codingSession)
        .where(whereClause)
        .orderBy(desc(codingSession.mainProject)),
      db
        .selectDistinct({ value: codingSession.mainBranch })
        .from(codingSession)
        .where(whereClause)
        .orderBy(desc(codingSession.mainBranch)),
      db
        .selectDistinct({ value: codingSession.actionTag })
        .from(codingSession)
        .where(whereClause)
        .orderBy(desc(codingSession.actionTag)),
    ]);

    return c.json({
      projects: projects.map((p) => p.value).filter(Boolean),
      branches: branches.map((b) => b.value).filter(Boolean),
      actions: actions.map((a) => a.value).filter(Boolean),
    });
  })

  /**
   * GET /sessions/current - Get the currently active coding session
   */
  .get("/current", authMiddleware, async (c) => {
    const db = c.get("db");
    const session = c.get("session");

    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = session.user.id;

    // Find the latest session that involves "ongoing" or "synced" status
    // Note: Turbo only allows one active session at a time per user logic
    const activeSession = await db.query.codingSession.findFirst({
      where: (codingSession, { and, eq, or }) =>
        and(
          eq(codingSession.userId, userId),
          or(
            eq(codingSession.status, "ongoing"),
            eq(codingSession.status, "synced"),
          ),
        ),
      orderBy: (codingSession, { desc }) => [desc(codingSession.startedAt)],
    });

    return c.json({ session: activeSession ?? null });
  })

  /**
   * GET /sessions/pulse - Get AI coach message with dynamic vibe
   *
   * Uses DB-based caching with user-configurable TTL.
   * Cache is invalidated when a session ends.
   *
   * OPTIMIZED: Parallel queries, removed unused columns.
   */
  .get("/pulse", authMiddleware, async (c) => {
    const db = c.get("db");
    const session = c.get("session");

    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = session.user.id;
    const now = new Date();
    const cacheKey = CACHE_KEYS.pulse(userId);
    const vibeHistoryKey = CACHE_KEYS.vibeHistory(userId);

    // =========================================================================
    // Phase 1: Fetch settings + check cache (sequential - needed for TTL decision)
    // =========================================================================
    const settings = await db.query.userSettings.findFirst({
      where: eq(userSettings.userId, userId),
      columns: {
        sessionTimeoutMinutes: true,
        pulseRefreshMinutes: true,
      },
    });

    const pulseRefreshMinutes = settings?.pulseRefreshMinutes ?? 15;

    // Check cache first (skip if pulseRefreshMinutes is 0 = always fresh)
    if (pulseRefreshMinutes > 0) {
      const cached = await cacheGet<CachedPulse>(db, cacheKey);
      if (cached) {
        return c.json({
          headline: cached.headline,
          subtext: cached.subtext,
          vibe: cached.vibe,
          cached: true,
        });
      }
    }

    // =========================================================================
    // Phase 2: Fetch all data in parallel (cache miss path)
    // =========================================================================
    const { start: todayStart, end: todayEnd } = getDayBounds(now, 0);
    const { start: yesterdayStart, end: yesterdayEnd } = getDayBounds(now, -1);
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const timeoutOptions = settings?.sessionTimeoutMinutes
      ? { keystrokeTimeoutSeconds: settings.sessionTimeoutMinutes * 60 }
      : undefined;

    // Run all independent queries in parallel (including vibe history)
    const recentSessionCutoff = new Date(
      now.getTime() - pulseRefreshMinutes * 60 * 1000,
    );

    const [
      userRecord,
      todayHeartbeats,
      yesterdayHeartbeats,
      recentSessions,
      recentActivity,
      vibeHistory,
    ] = await Promise.all([
      // User name
      db
        .select({ name: user.name })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1),

      // Today's heartbeats (for time calculation)
      db
        .select({ timestamp: heartbeat.timestamp })
        .from(heartbeat)
        .where(
          and(
            eq(heartbeat.userId, userId),
            gte(heartbeat.timestamp, todayStart),
            lt(heartbeat.timestamp, todayEnd),
          ),
        )
        .orderBy(heartbeat.timestamp),

      // Yesterday's heartbeats (for time calculation)
      db
        .select({ timestamp: heartbeat.timestamp })
        .from(heartbeat)
        .where(
          and(
            eq(heartbeat.userId, userId),
            gte(heartbeat.timestamp, yesterdayStart),
            lt(heartbeat.timestamp, yesterdayEnd),
          ),
        )
        .orderBy(heartbeat.timestamp),

      // Recent sessions with full data for AI narrative
      // Get sessions within pulseRefreshMinutes OR last 5 from today
      db
        .select({
          id: codingSession.id,
          title: codingSession.title,
          summary: codingSession.summary,
          actionTag: codingSession.actionTag,
          mainProject: codingSession.mainProject,
          mainLanguage: codingSession.mainLanguage,
          startedAt: codingSession.startedAt,
          endedAt: codingSession.endedAt,
          status: codingSession.status,
        })
        .from(codingSession)
        .where(
          and(
            eq(codingSession.userId, userId),
            or(
              // Ongoing sessions
              eq(codingSession.status, "ongoing"),
              eq(codingSession.status, "synced"),
              // Recent completed sessions within refresh window
              and(
                eq(codingSession.status, "completed"),
                gte(codingSession.endedAt, recentSessionCutoff),
              ),
              // Or today's completed sessions
              and(
                eq(codingSession.status, "completed"),
                gte(codingSession.endedAt, todayStart),
              ),
            ),
          ),
        )
        .orderBy(desc(codingSession.startedAt))
        .limit(5),

      // Recent activity check (last 30 mins)
      db
        .select({ count: count() })
        .from(heartbeat)
        .where(
          and(
            eq(heartbeat.userId, userId),
            gte(heartbeat.timestamp, thirtyMinutesAgo),
          ),
        ),

      // Vibe history for cooldown
      cacheGet<VibeHistory>(db, vibeHistoryKey),
    ]);

    // =========================================================================
    // Phase 3: Process data and generate AI message
    // =========================================================================
    const userName = userRecord[0]?.name ?? undefined;
    const isCurrentlyActive = (recentActivity[0]?.count ?? 0) > 0;

    // Calculate metrics
    const todayMetrics = calculateAllMetrics(todayHeartbeats, timeoutOptions);
    const yesterdayMetrics = calculateAllMetrics(
      yesterdayHeartbeats,
      timeoutOptions,
    );

    // Transform sessions into SessionContext for AI
    // Filter out sessions without startedAt (shouldn't happen but defensive for tests)
    const sessions: SessionContext[] = recentSessions
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- defensive for test mocks
      .filter((s) => s.startedAt != null)
      .map((s) => {
        // For ongoing sessions, endedAt is null - use now
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- defensive for test mocks
        const endTime = s.endedAt?.getTime() ?? Date.now();
        const startTime = s.startedAt.getTime();
        const durationMinutes = Math.round((endTime - startTime) / 60000);

        return {
          title: s.title,
          summary: s.summary,
          actionTag: s.actionTag,
          project: s.mainProject,
          language: s.mainLanguage,
          durationMinutes: Math.max(0, durationMinutes),
          status: s.status,
          // recentFiles could be populated for ongoing sessions if needed
        };
      });

    // Determine vibe (with cooldown from vibe history)
    // NOTE: streakDays and recentCommitSize are undefined until their respective
    // features are implemented (streak tracking, GitHub integration). The hard
    // triggers in determineVibe safely short-circuit when these are undefined.
    const vibeStats: VibeStats = {
      todayHours: todayMetrics.codingTimeSeconds / 3600,
      streakDays: undefined,
      recentCommitSize: undefined,
      isCurrentlyActive,
    };

    const lastVibe = vibeHistory?.lastVibe;
    const lastVibeTime = vibeHistory?.lastVibeTime
      ? new Date(vibeHistory.lastVibeTime)
      : undefined;

    const vibeResult = determineVibe(vibeStats, lastVibe, lastVibeTime, now);

    // Generate coach message with real session data
    const todayMinutes = Math.round(todayMetrics.codingTimeSeconds / 60);
    const yesterdayMinutes = Math.round(
      yesterdayMetrics.codingTimeSeconds / 60,
    );

    const message = await generateCoachMessage(
      {
        userName,
        todayMinutes,
        yesterdayMinutes,
        sessions,
        isCurrentlyActive,
      },
      vibeResult.vibe,
      vibeResult.analystMode,
    );

    // =========================================================================
    // Phase 4: Cache and return
    // =========================================================================
    const cacheData: CachedPulse = {
      headline: message.headline,
      subtext: message.subtext,
      vibe: message.vibe,
    };

    // Store vibe history separately (4-hour TTL for cooldown)
    const vibeHistoryData: VibeHistory = {
      lastVibe: vibeResult.vibe,
      lastVibeTime: now.toISOString(),
    };

    // Cache pulse content and vibe history in parallel
    await Promise.all([
      pulseRefreshMinutes > 0
        ? cacheSet(db, cacheKey, cacheData, pulseRefreshMinutes * 60 * 1000)
        : Promise.resolve(),
      cacheSet(db, vibeHistoryKey, vibeHistoryData, VIBE_HISTORY_TTL_MS),
    ]);

    return c.json({ ...message, cached: false });
  })

  /**
   * DELETE /sessions/pulse/cache - Invalidate pulse cache for user
   *
   * Called when a session ends to trigger fresh content generation.
   */
  .delete("/pulse/cache", authMiddleware, async (c) => {
    const db = c.get("db");
    const session = c.get("session");

    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = session.user.id;
    const cacheKey = CACHE_KEYS.pulse(userId);

    await cacheDelete(db, cacheKey);

    return c.json({ success: true });
  })

  /**
   * POST /sessions/standup - Generate a narrative standup report
   *
   * Body:
   * - startDate: ISO string
   * - endDate: ISO string
   * - dateRangeLabel: "Yesterday", "Today", "This Week"
   */
  .post("/standup", authMiddleware, async (c) => {
    const db = c.get("db");
    const session = c.get("session");

    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = session.user.id;
    const body = await c.req.json<{
      startDate: string;
      endDate: string;
      dateRangeLabel: string;
      forceRefresh?: boolean;
    }>();
    const { startDate, endDate, dateRangeLabel, forceRefresh } = body;

    if (!startDate || !endDate || !dateRangeLabel) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Fetch sessions
    const sessions = await db.query.codingSession.findMany({
      where: (table, { eq, and, gte, lte }) =>
        and(
          eq(table.userId, userId),
          eq(table.status, "completed"),
          gte(table.startedAt, new Date(startDate)),
          lte(table.endedAt, new Date(endDate)),
        ),
      orderBy: (table, { desc }) => [desc(table.startedAt)],
      limit: 20, // Reasonable limit for context window
    });

    const userName =
      (
        await db.query.user.findFirst({
          where: (table, { eq }) => eq(table.id, userId),
          columns: { name: true },
        })
      )?.name ?? "Developer";

    // Generate standup using AI (or fetch from cache)
    try {
      // Create a simple hash of the dates for cache key
      const dateHash = Buffer.from(`${startDate}-${endDate}`).toString(
        "base64url",
      );
      const cacheKey = CACHE_KEYS.standup(userId, dateRangeLabel, dateHash);
      const dbClient = c.get("db");

      // Check cache unless force refresh is requested
      if (!forceRefresh) {
        const cached = await cacheGet<{ standup: string }>(dbClient, cacheKey);
        if (cached) {
          return c.json(cached);
        }
      }

      // Rate Limiting Check
      const today = new Date().toISOString().split("T")[0] ?? "";
      const usageKey = CACHE_KEYS.standupUsage(userId, today);
      const currentUsage =
        (await cacheGet<{ count: number }>(dbClient, usageKey))?.count ?? 0;

      if (currentUsage >= 2) {
        return c.json(
          {
            error:
              "Daily limit reached. You can only generate 2 standups per day.",
          },
          429,
        );
      }

      // Import dynamically to avoid circular dependencies if any
      const { generateStandup } = await import("@turbo/ai");

      const result = await generateStandup({
        userName,
        dateRange: dateRangeLabel,
        sessions: sessions.map((s) => ({
          title: s.title ?? "Untitled Session",
          summary: s.summary ?? "No summary available.",
          actionTag: s.actionTag ?? "coding",
          project: s.mainProject ?? "unknown",
          linesAdded: s.linesAdded ?? undefined,
          linesDeleted: s.linesDeleted ?? undefined,
          mainLanguage: s.mainLanguage,
        })),
      });

      // Cache the result
      // "Yesterday" -> 24 hours (unlikely to change)
      // "Today" / "This Week" -> 1 hour (active)
      const ttl =
        dateRangeLabel === "Yesterday" ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;

      await cacheSet(dbClient, cacheKey, result, ttl);

      // Increment usage count (expires in 24h)
      await cacheSet(
        dbClient,
        usageKey,
        { count: currentUsage + 1 },
        24 * 60 * 60 * 1000,
      );

      return c.json(result);
    } catch (error) {
      console.error("[API] Failed to generate standup:", error);
      return c.json({ error: "Failed to generate standup" }, 500);
    }
  })

  /**
   * POST /sessions/:id/insights - Generate AI insights for a session
   *
   * Caching: Insights are cached per session (never expires - session data doesn't change)
   * Rate limited: 5 unique sessions per day per user
   *
   * Returns:
   * - story: 2-3 sentence narrative
   * - proofBullets: 2-4 curated facts
   * - patterns: 1-2 pattern observations
   * - titleSuggestions: 3 alternative titles
   */
  .post("/:id/insights", authMiddleware, async (c) => {
    const db = c.get("db");
    const session = c.get("session");

    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = session.user.id;
    const sessionId = c.req.param("id");
    const dbClient = c.get("db");

    // Check if insights are already cached for this session
    const insightsCacheKey = CACHE_KEYS.pulse(`session-insights:${sessionId}`);
    const cachedInsights = await cacheGet<{
      story: string;
      proofBullets: string[];
      patterns: string[];
      titleSuggestions: string[];
    }>(dbClient, insightsCacheKey);

    if (cachedInsights) {
      // Return cached insights without counting toward daily limit
      return c.json(cachedInsights);
    }

    // Check daily rate limit: 5 unique sessions per day
    const today = new Date().toISOString().split("T")[0] ?? "";
    const usageKey = CACHE_KEYS.pulse(`insights-daily:${userId}:${today}`);
    const currentUsage =
      (await cacheGet<{ count: number }>(dbClient, usageKey))?.count ?? 0;

    if (currentUsage >= 5) {
      return c.json(
        {
          error:
            "Daily limit reached. You can generate insights for up to 5 sessions per day.",
        },
        429,
      );
    }

    // Fetch the session
    const codingSessionResult = await db.query.codingSession.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.id, sessionId), eq(table.userId, userId)),
    });

    if (!codingSessionResult) {
      return c.json({ error: "Session not found" }, 404);
    }

    // Fetch all heartbeats for this session
    const heartbeats = await db
      .select()
      .from(heartbeat)
      .where(
        and(eq(heartbeat.sessionId, sessionId), eq(heartbeat.userId, userId)),
      )
      .orderBy(heartbeat.timestamp);

    // Calculate activity timeline (20 buckets)
    const sessionStart = codingSessionResult.startedAt.getTime();
    const sessionEnd = codingSessionResult.endedAt.getTime();
    const duration = sessionEnd - sessionStart;
    const bucketCount = 20;
    const bucketSize = duration / bucketCount;

    const activityBuckets: number[] = Array(bucketCount).fill(0) as number[];
    const fileActivity = new Map<string, number>();
    const languageActivity = new Map<string, number>();
    const commits: { message: string }[] = [];

    for (const h of heartbeats) {
      // Activity buckets
      const elapsed = h.timestamp.getTime() - sessionStart;
      const bucketIndex = Math.min(
        Math.floor(elapsed / bucketSize),
        bucketCount - 1,
      );
      if (activityBuckets[bucketIndex] !== undefined) {
        activityBuckets[bucketIndex]++;
      }

      // File activity
      if (h.file) {
        const fileName = h.file.split("/").pop() ?? h.file;
        fileActivity.set(fileName, (fileActivity.get(fileName) ?? 0) + 1);
      }

      // Language activity
      if (h.language) {
        languageActivity.set(
          h.language,
          (languageActivity.get(h.language) ?? 0) + 1,
        );
      }

      // Collect commits
      if (h.category === "committing" && h.commitMessage) {
        if (!commits.some((c) => c.message === h.commitMessage)) {
          commits.push({ message: h.commitMessage });
        }
      }
    }

    // Calculate activity peaks (buckets with above-average activity)
    const avgActivity =
      activityBuckets.reduce((a, b) => a + b, 0) / bucketCount;
    const activityPeaks = activityBuckets.filter(
      (b) => b > avgActivity * 1.5,
    ).length;

    // Convert maps to arrays
    const topFiles = [...fileActivity.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([file]) => file);

    const totalHeartbeats = heartbeats.length;
    const languages = [...languageActivity.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({
        name,
        percentage:
          totalHeartbeats > 0 ? Math.round((count / totalHeartbeats) * 100) : 0,
      }));

    // Calculate duration in minutes
    const durationMinutes = Math.round(duration / 60000);

    try {
      const { generateSessionInsights } = await import("@turbo/ai");

      const insights = await generateSessionInsights({
        title: codingSessionResult.title ?? "Coding Session",
        summary: codingSessionResult.summary ?? undefined,
        topFiles,
        languages,
        commits,
        durationMinutes,
        project: codingSessionResult.mainProject ?? "unknown",
        branch: codingSessionResult.mainBranch ?? undefined,
        actionTag: codingSessionResult.actionTag ?? undefined,
        activityPeaks,
      });

      // Cache insights permanently for this session (30 days TTL for cleanup)
      await cacheSet(
        dbClient,
        insightsCacheKey,
        insights,
        30 * 24 * 60 * 60 * 1000, // 30 days
      );

      // Increment daily usage count (expires in 24 hours)
      await cacheSet(
        dbClient,
        usageKey,
        { count: currentUsage + 1 },
        24 * 60 * 60 * 1000,
      );

      return c.json(insights);
    } catch (error) {
      console.error("[API] Failed to generate session insights:", error);
      return c.json({ error: "Failed to generate insights" }, 500);
    }
  })

  /**
   * GET /sessions/:id - Get detailed session with heartbeats and commits
   *
   * Returns:
   * - Full session metadata
   * - Activity timeline (heartbeats grouped into 20 buckets)
   * - File activity breakdown
   * - Commits made during session (from heartbeats with category = "committing")
   *
   * NOTE: This route MUST be defined LAST to avoid matching /current, /pulse, etc.
   */
  .get("/:id", authMiddleware, async (c) => {
    const db = c.get("db");
    const session = c.get("session");

    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const userId = session.user.id;
    const sessionId = c.req.param("id");

    // Fetch the session
    const codingSessionResult = await db.query.codingSession.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.id, sessionId), eq(table.userId, userId)),
    });

    if (!codingSessionResult) {
      return c.json({ error: "Session not found" }, 404);
    }

    // Fetch all heartbeats for this session
    const heartbeats = await db
      .select()
      .from(heartbeat)
      .where(
        and(eq(heartbeat.sessionId, sessionId), eq(heartbeat.userId, userId)),
      )
      .orderBy(heartbeat.timestamp);

    // Calculate activity timeline (20 buckets for smoother visualization)
    const sessionStart = codingSessionResult.startedAt.getTime();
    const sessionEnd = codingSessionResult.endedAt.getTime();
    const duration = sessionEnd - sessionStart;
    const bucketCount = 20;
    const bucketSize = duration / bucketCount;

    const activityBuckets: number[] = Array(bucketCount).fill(0) as number[];
    const fileActivity = new Map<string, number>();
    const languageActivity = new Map<string, number>();
    const commits: {
      sha: string;
      message: string;
      filesChanged: number;
      insertions: number;
      deletions: number;
      timestamp: Date;
    }[] = [];

    // Process heartbeats
    for (const h of heartbeats) {
      // Activity buckets
      const elapsed = h.timestamp.getTime() - sessionStart;
      const bucketIndex = Math.min(
        Math.floor(elapsed / bucketSize),
        bucketCount - 1,
      );
      if (activityBuckets[bucketIndex] !== undefined) {
        activityBuckets[bucketIndex]++;
      }

      // File activity
      if (h.file) {
        const fileName = h.file.split("/").pop() ?? h.file;
        fileActivity.set(fileName, (fileActivity.get(fileName) ?? 0) + 1);
      }

      // Language activity
      if (h.language) {
        languageActivity.set(
          h.language,
          (languageActivity.get(h.language) ?? 0) + 1,
        );
      }

      // Collect commits (from heartbeats with category = "committing")
      if (h.category === "committing" && h.commitSha && h.commitMessage) {
        // Avoid duplicates
        if (!commits.some((commit) => commit.sha === h.commitSha)) {
          commits.push({
            sha: h.commitSha,
            message: h.commitMessage,
            filesChanged: h.filesChanged ?? 0,
            insertions: h.insertions ?? 0,
            deletions: h.deletions ?? 0,
            timestamp: h.timestamp,
          });
        }
      }
    }

    // Convert Maps to sorted arrays
    const topFiles = [...fileActivity.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([file, count]) => ({ file, count }));

    const languageBreakdown = [...languageActivity.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([language, count]) => ({ language, count }));

    // Calculate timeline events for narrative (significant moments)
    const timelineEvents: {
      time: Date;
      type: "file_switch" | "commit" | "activity_spike";
      description: string;
    }[] = [];

    // Add commit events to timeline
    for (const commit of commits) {
      timelineEvents.push({
        time: commit.timestamp,
        type: "commit",
        description: commit.message,
      });
    }

    // Sort timeline by time
    timelineEvents.sort((a, b) => a.time.getTime() - b.time.getTime());

    return c.json({
      session: codingSessionResult,
      activity: activityBuckets,
      topFiles,
      languageBreakdown,
      commits,
      timeline: timelineEvents,
      stats: {
        totalHeartbeats: heartbeats.length,
        uniqueFiles: fileActivity.size,
        uniqueLanguages: languageActivity.size,
        totalCommits: commits.length,
      },
    });
  });

*/
