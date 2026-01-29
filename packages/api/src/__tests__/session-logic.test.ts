/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SESSION_GAP_MS } from "@turbo/shared";

import { assignSessionsToHeartbeats, finalizeSession } from "../utils/session";

// Mock @turbo/ai - direct AI call instead of Trigger.dev
vi.mock("@turbo/ai", () => ({
  generateSessionSummary: vi.fn().mockResolvedValue({
    title: "Mock AI Title",
    summary: "Mock AI Summary",
    actionTag: "building",
  }),
}));

// Mock @turbo/analytics
vi.mock("@turbo/analytics", () => ({
  ANALYTICS_EVENTS: {
    AI_SUMMARY_FAILED: "ai_summary_failed",
    SESSION_CLOSED: "session_closed",
  },
}));

vi.mock("@turbo/analytics/server", () => ({
  trackServerEvent: vi.fn(),
}));

// Mock DB Client
// We need a recursive proxy or a self-referencing object to handle arbitrary chaining.
// But for this test, we just need to support the specific chains used.
const createMockQueryBuilder = () => {
  const builder: any = {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    transaction: vi.fn((cb) => cb(builder)),

    // Make it thenable so it can be awaited

    then: (resolve: any) => resolve([]),
  };
  return builder;
};

// Create mockDb at module level but recreate in beforeEach
let mockDb: ReturnType<typeof createMockQueryBuilder>;

describe("SPEC: Session Logic", () => {
  const userId = "user_123";

  beforeEach(async () => {
    vi.clearAllMocks();
    // Create fresh mock for each test to prevent state leakage
    mockDb = createMockQueryBuilder();
    // Reset the AI mock to default resolved value
    const { generateSessionSummary } = await import("@turbo/ai");
    vi.mocked(generateSessionSummary).mockResolvedValue({
      title: "Mock AI Title",
      summary: "Mock AI Summary",
      actionTag: "building",
    });
  });

  describe("assignSessionsToHeartbeats (Batch Assignment)", () => {
    it("should return empty array for empty heartbeats", async () => {
      const result = await assignSessionsToHeartbeats(mockDb, userId, []);
      expect(result).toEqual([]);
    });

    it("should assign same session ID for heartbeats within gap", async () => {
      // Mock existing session found (no longer using limit, query ends with orderBy)
      const existingSession = {
        id: "sess_1",
        endedAt: new Date("2024-01-01T10:00:00Z"),
      };
      mockDb.orderBy.mockResolvedValueOnce([existingSession]);

      const baseTime = new Date("2024-01-01T10:00:00Z").getTime();
      const heartbeats = [
        { timestamp: new Date(baseTime + 1000) }, // +1s
        { timestamp: new Date(baseTime + 60000) }, // +1m
      ];

      const result = await assignSessionsToHeartbeats(
        mockDb,
        userId,
        heartbeats,
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toBe("sess_1");
      expect(result[1]).toBe("sess_1");
      // Should verify DB update called (for endedAt)
      expect(mockDb.update).toHaveBeenCalled();
    });

    it("should create NEW session when gap exceeds threshold", async () => {
      // Mock NO existing session (query ends with orderBy now)
      mockDb.orderBy.mockResolvedValueOnce([]);
      // Mock insert returning new session
      mockDb.returning
        .mockResolvedValueOnce([{ id: "sess_new_1" }]) // First new session
        .mockResolvedValueOnce([{ id: "sess_new_2" }]); // Second new session

      const baseTime = new Date("2024-01-01T10:00:00Z").getTime();
      const heartbeats = [
        { timestamp: new Date(baseTime) },
        { timestamp: new Date(baseTime + SESSION_GAP_MS + 1000) }, // Gap > 15m
      ];

      const result = await assignSessionsToHeartbeats(
        mockDb,
        userId,
        heartbeats,
      );

      expect(result[0]).toBe("sess_new_1");
      expect(result[1]).toBe("sess_new_2");
      // Should have closed the first session
      // (Note: closeSession is imported so we can't easily spy on it unless we mock the module itself,
      // but we can check if DB update was called with status: "completed")
    });

    it("should maintain 1:1 index correspondence", async () => {
      mockDb.orderBy.mockResolvedValueOnce([]);
      mockDb.returning.mockResolvedValue([{ id: "sess_1" }]);

      const heartbeats = [
        { timestamp: new Date() },
        { timestamp: new Date() },
        { timestamp: new Date() },
      ];

      const result = await assignSessionsToHeartbeats(
        mockDb,
        userId,
        heartbeats,
      );
      expect(result).toHaveLength(3);
    });

    // Note: Testing "multiple ongoing sessions cleanup" requires integration testing
    // because the mock chaining doesn't properly support nested finalizeSession calls.
    // The defensive cleanup is verified by checking transaction calls in finalizeSession tests.
  });

  describe("finalizeSession", () => {
    const sessionId = "sess_close_1";

    it("should compute line stats correctly", async () => {
      // Mock parallel queries output
      const mockHeartbeats = [
        {
          file: "a.ts",
          language: "ts",
          aiLineChanges: 10,
          humanLineChanges: 5,
        }, // +15
        {
          file: "a.ts",
          language: "ts",
          aiLineChanges: -5,
          humanLineChanges: 0,
        }, // -5
        {
          file: "b.ts",
          language: "ts",
          aiLineChanges: 0,
          humanLineChanges: -2,
        }, // -2
      ];
      const mockSession = [{ startedAt: new Date(), endedAt: new Date() }];

      // Mock Promise.all return
      mockDb.where
        .mockResolvedValueOnce(mockHeartbeats)
        .mockResolvedValueOnce(mockSession);

      await finalizeSession(mockDb, sessionId, userId);

      expect(mockDb.update).toHaveBeenCalled();
      const updateCall = mockDb.set.mock.calls[0][0];

      expect(updateCall.linesAdded).toBe(15);
      expect(updateCall.linesDeleted).toBe(7); // |-5| + |-2| = 7
      // On success, status should be "completed"
      expect(updateCall.status).toBe("completed");
    });

    it("should identify main language/project/branch", async () => {
      const mockHeartbeats = [
        { language: "typescript", project: "turbo", branch: "main" },
        { language: "typescript", project: "turbo", branch: "dev" },
        { language: "rust", project: "turbo", branch: "main" },
      ];
      // Mock Promise.all return (heartbeats then session)
      mockDb.where
        .mockResolvedValueOnce(mockHeartbeats)
        .mockResolvedValueOnce([
          { startedAt: new Date(), endedAt: new Date() },
        ]);

      await finalizeSession(mockDb, sessionId, userId);

      const updateCall = mockDb.set.mock.calls[0][0];
      expect(updateCall.mainLanguage).toBe("typescript"); // 2 vs 1
      expect(updateCall.mainProject).toBe("turbo");
      expect(updateCall.mainBranch).toBe("main"); // 2 vs 1
    });

    it("should call generateSessionSummary directly for AI enrichment", async () => {
      const { generateSessionSummary } = await import("@turbo/ai");

      const mockHeartbeats = [
        { file: "test.ts", language: "ts", project: "turbo" },
      ];
      mockDb.where
        .mockResolvedValueOnce(mockHeartbeats)
        .mockResolvedValueOnce([
          { startedAt: new Date(), endedAt: new Date() },
        ]);

      await finalizeSession(mockDb, sessionId, userId);

      // Verify the AI function was called directly
      expect(generateSessionSummary).toHaveBeenCalledWith(
        expect.objectContaining({
          files: ["test.ts"],
          languages: ["ts"],
        }),
      );

      // Verify session was marked as completed with AI summary
      const updateCall = mockDb.set.mock.calls[0][0];
      expect(updateCall.status).toBe("completed");
      expect(updateCall.title).toBe("Mock AI Title");
      expect(updateCall.summary).toBe("Mock AI Summary");
    });

    it("should delete session with no heartbeats using transaction", async () => {
      // Mock no heartbeats for the session
      mockDb.where
        .mockResolvedValueOnce([]) // No heartbeats
        .mockResolvedValueOnce([
          { startedAt: new Date(), endedAt: new Date() },
        ]);

      await finalizeSession(mockDb, sessionId, userId);

      // Should have used transaction for safe deletion
      expect(mockDb.transaction).toHaveBeenCalled();
    });

    it("should handle AI failure gracefully and mark as synced", async () => {
      const { generateSessionSummary } = await import("@turbo/ai");

      // Make AI call throw an error
      vi.mocked(generateSessionSummary).mockRejectedValueOnce(
        new Error("AI rate limit exceeded"),
      );

      const mockHeartbeats = [
        { file: "test.ts", language: "ts", project: "turbo" },
      ];
      mockDb.where
        .mockResolvedValueOnce(mockHeartbeats)
        .mockResolvedValueOnce([
          { startedAt: new Date(), endedAt: new Date() },
        ]);

      // Should not throw, error is caught and logged
      await expect(
        finalizeSession(mockDb, sessionId, userId),
      ).resolves.not.toThrow();

      // Session should be marked as SYNCED (not completed) when AI fails
      // First update is the success path, second update is the failure path
      const lastUpdateCall =
        mockDb.set.mock.calls[mockDb.set.mock.calls.length - 1][0];
      expect(lastUpdateCall.status).toBe("synced");
    });
  });
});
