/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ANALYTICS_EVENTS } from "@turbo/analytics/events";

import { createApp } from "../index";
import { trackApiEvent } from "../middleware/analytics";
import { assignSessionsToHeartbeats } from "../utils/session";

// Mock dependencies
vi.mock("@turbo/db/client", () => ({
  db: {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockReturnThis(),
    // DB chains need to end with a promise for async/await
    then: (resolve: any) => resolve([]),
    // Mock userSettings query
    query: {
      userSettings: {
        findFirst: vi.fn().mockResolvedValue({ sessionTimeoutMinutes: 15 }),
      },
    },
  },
  schema: {},
}));

vi.mock("../utils/session", () => ({
  assignSessionsToHeartbeats: vi.fn(),
  // Mock closeSession as it might be imported by other modules
  closeSession: vi.fn(),
}));

vi.mock("../utils/metrics", () => ({
  fetchTodayMetrics: vi.fn().mockResolvedValue({
    codingTimeSeconds: 120,
    heartbeats: 5,
    sessions: 1,
    flows: 0,
  }),
}));

vi.mock("../middleware/analytics", () => ({
  trackApiEvent: vi.fn(),
}));

// Mock Auth
const mockAuth = {
  api: {
    getSession: vi.fn().mockResolvedValue(null),
    signIn: vi.fn(),
    signOut: vi.fn(),
    verifyApiKey: vi.fn().mockResolvedValue({
      valid: true,
      key: { id: "apikey_1", userId: "user_123" },
    }),
  },
} as any;

describe("API: POST /heartbeats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 if API key is missing", async () => {
    const app = createApp(mockAuth);
    // Request without Authorization header
    const res = await app.request("/heartbeats", {
      method: "POST",
      body: JSON.stringify({ heartbeats: [] }),
    });

    // Authorization middleware in Heartbeats router checks for "Authorization: Bearer <key>"
    // Wait, the router uses 'apiKeyAuthMiddleware'.
    // If it fails, it returns 401.
    expect(res.status).toBe(401);
  });

  it("should process valid heartbeats successfully", async () => {
    // Setup Mocks
    const db = (await import("@turbo/db/client")).db;

    // Mock API Key Auth:
    // The middleware calls db.select... to verify the key.
    // We need to mock the DB response for the API key lookup.
    // Chain: db.select().from(apiKeys).where(eq(apiKeys.key, hashedKey)).limit(1)

    // Simple way: Mock the whole db chain to return a valid API key user
    const mockUser = {
      userId: "user_123",
      id: "apikey_1",
      key: "hashed_turbo_key",
    };
    // This is brittle because 'limit' is used for many things.
    // Ideally use dependency injection or more specific mocks.
    // But for now, let's assume the DB returns our user when queried.

    // We can spy on the mock implementation to return different things?
    // Or just make it always return [mockUser], which fits both "get user" and "get heartbeats" logic roughly.
    (db as any).then = (resolve: any) => resolve([mockUser]);

    // Mock session assignment
    (assignSessionsToHeartbeats as any).mockResolvedValue(["sess_1"]);

    const app = createApp(mockAuth);

    const payload = {
      heartbeats: [
        {
          file: "/Users/user/code/project/index.ts",
          timestamp: new Date().toISOString(),
          language: "typescript",
          isWrite: true,
          project: "project",
          branch: "main",
          os: "macos", // Required by schema
        },
      ],
    };

    const res = await app.request("/heartbeats", {
      method: "POST",
      headers: {
        Authorization: "Bearer turbo_test_key",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body).toMatchObject({
      synced: 1,
      userId: "user_123",
      metrics: {
        codingTimeSeconds: 120,
        heartbeatCount: 5,
      },
    });

    // Verify our logic function was called
    expect(assignSessionsToHeartbeats).toHaveBeenCalled();
    // Verify analytics
    expect(trackApiEvent).toHaveBeenCalledWith(
      "user_123",
      ANALYTICS_EVENTS.SYNC_COMPLETED,
      { count: 1 },
    );
  });
});
