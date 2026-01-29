import { describe, expect, it } from "vitest";

import { completeStaleSessions } from "../domain/session-completion";

describe("completeStaleSessions", () => {
  it("returns empty stats in template", async () => {
    const result = await completeStaleSessions();

    expect(result).toEqual({
      completed: 0,
      deleted: 0,
      failed: 0,
    });
  });
});
*/

/*
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SESSION_GAP_MS, SESSION_STATUS } from "@turbo/shared";

// Mock @trigger.dev/sdk/v3
vi.mock("@trigger.dev/sdk/v3", () => ({
  schedules: {
    task: vi.fn((config) => ({
      ...config,
      // Expose run function for testing
      runTest: config.run,
    })),
  },
}));

// Mock @turbo/analytics
vi.mock("@turbo/analytics", () => ({
  ANALYTICS_EVENTS: {
    AI_SUMMARY_FAILED: "ai_summary_failed",
    SESSION_CLOSED: "session_closed",
    STALE_SESSIONS_COMPLETED: "stale_sessions_completed",
  },
}));

vi.mock("@turbo/analytics/server", () => ({
  trackServerEvent: vi.fn(),
  captureError: vi.fn(),
}));

// Mock @turbo/ai - direct AI call instead of Trigger.dev task
vi.mock("@turbo/ai", () => ({
  generateSessionSummary: vi.fn().mockResolvedValue({
    title: "Mock AI Title",
    summary: "Mock AI Summary",
    actionTag: "building",
  }),
}));

// Mock state for query results - pushed in order
const queryResults: any[][] = [];
let queryIndex = 0;

// Create mock DB with proper query builder chaining
const createMockDb = () => {
  const db: any = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockImplementation(() => {
      // Return object that is BOTH thenable (for heartbeats) and has limit (for sessions)
      const result = {
        // For session query: where().limit() chain
        limit: vi.fn().mockImplementation(() => {
          const data = queryResults[queryIndex] ?? [];
          queryIndex++;
          return Promise.resolve(data);
        }),
        // For heartbeats query: where() returns promise directly
        then: (resolve: any, reject?: any) => {
          const data = queryResults[queryIndex] ?? [];
          queryIndex++;
          return Promise.resolve(data).then(resolve, reject);
        },
      };
      return result;
    }),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
  };
  return db;
};

// Mock @turbo/db/client
let mockDb: ReturnType<typeof createMockDb>;

vi.mock("@turbo/db/client", () => ({
  get db() {
    return mockDb;
  },
}));

// Mock @turbo/db cache functions
vi.mock("@turbo/db", () => ({
  cacheDelete: vi.fn().mockResolvedValue(undefined),
  CACHE_KEYS: {
    pulse: (userId: string) => `pulse:${userId}`,
  },
}));

vi.mock("@turbo/db/schema", () => ({
  codingSession: { id: "id", status: "status", endedAt: "endedAt" },
  heartbeat: { sessionId: "sessionId" },
}));

describe("completeStaleSessionsTask", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockDb = createMockDb();
    // Reset query results
    queryResults.length = 0;
    queryIndex = 0;

    // Reset the AI mock
    const { generateSessionSummary } = await import("@turbo/ai");
    vi.mocked(generateSessionSummary).mockResolvedValue({
      title: "Mock AI Title",
      summary: "Mock AI Summary",
      actionTag: "building",
    });
  });

  describe("Session Filtering", () => {
    it("should return early if no sessions need processing", async () => {
      // Mock empty sessions result
      queryResults.push([]); // sessions query

      const { completeStaleSessionsTask } = await import(
        "../tasks/complete-stale-sessions"
      );
      const result = await (completeStaleSessionsTask as any).runTest();

      expect(result).toEqual({ completed: 0, deleted: 0, failed: 0 });
    });

    it("should process stale ongoing sessions (endedAt > 15 min ago)", async () => {
      const staleTime = new Date(Date.now() - SESSION_GAP_MS - 60000); // 16 mins ago
      const mockSession = {
        id: "sess_1",
        userId: "user_1",
        status: SESSION_STATUS.ONGOING,
        startedAt: new Date(staleTime.getTime() - 3600000),
        endedAt: staleTime,
        mainLanguage: null,
        mainProject: null,
        mainBranch: null,
      };

      // Push query results in order
      queryResults.push([mockSession]); // sessions query (via limit)
      queryResults.push([
        // heartbeats query (via where)
        {
          sessionId: "sess_1",
          file: "test.ts",
          language: "typescript",
          project: "turbo",
          branch: "main",
        },
      ]);

      const { completeStaleSessionsTask } = await import(
        "../tasks/complete-stale-sessions"
      );
      const result = await (completeStaleSessionsTask as any).runTest();

      expect(result.completed).toBe(1);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it("should always process synced sessions regardless of time", async () => {
      const recentTime = new Date(); // Just now
      const mockSession = {
        id: "sess_synced",
        userId: "user_1",
        status: SESSION_STATUS.SYNCED,
        startedAt: new Date(recentTime.getTime() - 60000),
        endedAt: recentTime,
        mainLanguage: "typescript",
        mainProject: "turbo",
        mainBranch: "main",
      };

      queryResults.push([mockSession]); // sessions
      queryResults.push([
        // heartbeats
        {
          sessionId: "sess_synced",
          file: "test.ts",
          language: "typescript",
          project: "turbo",
          branch: "main",
        },
      ]);

      const { completeStaleSessionsTask } = await import(
        "../tasks/complete-stale-sessions"
      );
      const result = await (completeStaleSessionsTask as any).runTest();

      // Synced sessions get completed after AI summary
      expect(result.completed).toBe(1);
    });
  });

  describe("Orphan Session Handling", () => {
    it("should delete sessions with no heartbeats", async () => {
      const staleTime = new Date(Date.now() - SESSION_GAP_MS - 60000);
      const mockSession = {
        id: "sess_orphan",
        userId: "user_1",
        status: SESSION_STATUS.ONGOING,
        startedAt: new Date(staleTime.getTime() - 3600000),
        endedAt: staleTime,
        mainLanguage: null,
        mainProject: null,
        mainBranch: null,
      };

      queryResults.push([mockSession]); // sessions
      queryResults.push([]); // no heartbeats

      const { completeStaleSessionsTask } = await import(
        "../tasks/complete-stale-sessions"
      );
      const result = await (completeStaleSessionsTask as any).runTest();

      expect(result.deleted).toBe(1);
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });

  describe("AI Summary Generation", () => {
    it("should call generateSessionSummary directly for processed sessions", async () => {
      const staleTime = new Date(Date.now() - SESSION_GAP_MS - 60000);
      const mockSession = {
        id: "sess_ai",
        userId: "user_1",
        status: SESSION_STATUS.ONGOING,
        startedAt: new Date(staleTime.getTime() - 3600000),
        endedAt: staleTime,
        mainLanguage: null,
        mainProject: null,
        mainBranch: null,
      };

      queryResults.push([mockSession]); // sessions
      queryResults.push([
        // heartbeats
        {
          sessionId: "sess_ai",
          file: "auth.ts",
          language: "typescript",
          project: "turbo",
          branch: "main",
        },
      ]);

      const { generateSessionSummary } = await import("@turbo/ai");
      const { completeStaleSessionsTask } = await import(
        "../tasks/complete-stale-sessions"
      );

      await (completeStaleSessionsTask as any).runTest();

      expect(generateSessionSummary).toHaveBeenCalledWith(
        expect.objectContaining({
          files: ["auth.ts"],
          languages: ["typescript"],
          project: "turbo",
        }),
      );
    });

    it("should handle AI failures gracefully and mark as failed", async () => {
      const staleTime = new Date(Date.now() - SESSION_GAP_MS - 60000);
      const mockSession = {
        id: "sess_fail",
        userId: "user_1",
        status: SESSION_STATUS.ONGOING,
        startedAt: new Date(staleTime.getTime() - 3600000),
        endedAt: staleTime,
        mainLanguage: null,
        mainProject: null,
        mainBranch: null,
      };

      queryResults.push([mockSession]); // sessions
      queryResults.push([
        // heartbeats
        {
          sessionId: "sess_fail",
          file: "test.ts",
          language: "typescript",
          project: "turbo",
          branch: "main",
        },
      ]);

      const { generateSessionSummary } = await import("@turbo/ai");
      vi.mocked(generateSessionSummary).mockRejectedValueOnce(
        new Error("AI rate limit exceeded"),
      );

      const { trackServerEvent } = await import("@turbo/analytics/server");
      const { completeStaleSessionsTask } = await import(
        "../tasks/complete-stale-sessions"
      );

      // Should not throw
      const result = await (completeStaleSessionsTask as any).runTest();

      expect(result.failed).toBe(1);
      expect(trackServerEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          event: "ai_summary_failed",
        }),
      );
    });
  });

  describe("Stats Computation", () => {
    it("should use shared calculateLineChanges utility", async () => {
      const staleTime = new Date(Date.now() - SESSION_GAP_MS - 60000);
      const mockSession = {
        id: "sess_stats",
        userId: "user_1",
        status: SESSION_STATUS.ONGOING,
        startedAt: new Date(staleTime.getTime() - 3600000),
        endedAt: staleTime,
        mainLanguage: null,
        mainProject: null,
        mainBranch: null,
      };

      queryResults.push([mockSession]); // sessions
      queryResults.push([
        // heartbeats
        {
          sessionId: "sess_stats",
          file: "test.ts",
          language: "typescript",
          project: "turbo",
          branch: "main",
          aiLineChanges: 10,
          humanLineChanges: 5,
        },
        {
          sessionId: "sess_stats",
          file: "test2.ts",
          language: "typescript",
          project: "turbo",
          branch: "main",
          aiLineChanges: -3,
          humanLineChanges: 0,
        },
      ]);

      const { completeStaleSessionsTask } = await import(
        "../tasks/complete-stale-sessions"
      );

      await (completeStaleSessionsTask as any).runTest();

      // Verify set was called with correct stats
      expect(mockDb.set).toHaveBeenCalledWith(
        expect.objectContaining({
          linesAdded: 15, // 10 + 5 = 15
          linesDeleted: 3, // |-3| = 3
        }),
      );
    });
  });
});
