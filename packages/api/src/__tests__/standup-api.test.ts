import { beforeEach, describe, expect, it, vi } from "vitest";

import type { Auth } from "@turbo/auth";

import { createApp } from "../index";

const mockGenerateStandup = vi.fn();

// Mock @turbo/ai
vi.mock("@turbo/ai", () => ({
  generateStandup: (...args: unknown[]) =>
    mockGenerateStandup(...args) as unknown,
}));

// Mock auth
const mockAuth = {
  handler: vi.fn(),
  api: {
    getSession: vi.fn(),
  },
} as unknown as Auth;

// Create app instance
const app = createApp(mockAuth);

// Mock database type compliance
const mockDb = {
  query: {
    user: {
      findFirst: vi.fn(),
    },
    codingSession: {
      findMany: vi.fn(),
    },
  },
  // To be mocked per test
  select: vi.fn(),
  delete: vi.fn(),
  insert: vi.fn(),
};

// Mock authentication middleware
vi.mock("../middleware/auth", () => ({
  authMiddleware: async (
    c: { set: (k: string, v: unknown) => void },
    next: () => Promise<void>,
  ) => {
    c.set("session", { user: { id: "user_123" } });
    c.set("db", mockDb);
    await next();
  },
}));

describe("POST /sessions/standup", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should generate a standup report", async () => {
    // Mock DB responses
    mockDb.query.user.findFirst.mockResolvedValue({ name: "Test User" });
    mockDb.query.codingSession.findMany.mockResolvedValue([
      {
        title: "Session 1",
        summary: "Worked on auth",
        actionTag: "building",
        mainProject: "turbo",
        linesAdded: 100,
        mainLanguage: "TypeScript",
        startedAt: new Date(),
      },
    ]);

    // Mock Cache Miss default
    const mockSelect = vi.fn();
    const mockFrom = vi.fn();
    const mockWhere = vi.fn();
    const mockLimit = vi.fn();

    // Partial mock
    mockDb.select = mockSelect;
    // Partial mock
    mockDb.insert = vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({ onConflictDoUpdate: vi.fn() }),
    });

    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ limit: mockLimit });
    mockLimit.mockResolvedValue([]); // Empty result = cache miss

    // Mock AI response
    mockGenerateStandup.mockResolvedValue({
      standup: "Yesterday I worked on authentication.",
    });

    const res = await app.request("/sessions/standup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        dateRangeLabel: "Yesterday",
      }),
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as { standup: string };
    expect(body).toEqual({ standup: "Yesterday I worked on authentication." });

    expect(mockGenerateStandup).toHaveBeenCalledWith({
      userName: "Test User",
      dateRange: "Yesterday",
      sessions: expect.arrayContaining([
        expect.objectContaining({
          title: "Session 1",
        }),
      ]),
    });
  });

  it("should return 400 if fields are missing", async () => {
    const res = await app.request("/sessions/standup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: new Date().toISOString(),
      }),
    });

    expect(res.status).toBe(400);
  });

  it("should return cached standup if available", async () => {
    // Mock db for cache hit
    const mockSelect = vi.fn();
    const mockFrom = vi.fn();
    const mockWhere = vi.fn();
    const mockLimit = vi.fn();

    // Chain: db.select().from().where().limit()

    mockDb.select = mockSelect;
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ limit: mockLimit });

    mockLimit.mockResolvedValue([
      {
        value: JSON.stringify({ standup: "Cached standup" }),
        expiresAt: new Date(Date.now() + 10000), // Future expiration
      },
    ]);

    const res = await app.request("/sessions/standup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        dateRangeLabel: "Yesterday",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ standup: "Cached standup" });
    expect(mockGenerateStandup).not.toHaveBeenCalled();
  });

  it("should bypass cache if forceRefresh is true", async () => {
    // Mock DB responses
    mockDb.query.user.findFirst.mockResolvedValue({ name: "Test User" });
    mockDb.query.codingSession.findMany.mockResolvedValue([]);

    // Mock Cache mechanism to return a hit if checked (should not be used for result, but maybe for rate limit)
    // Actually forceRefresh bypasses the *read* of the standup cache, but it still reads the usage cache.
    // Let's assume usage is 0.

    const mockSelect = vi.fn();
    const mockFrom = vi.fn();
    const mockWhere = vi.fn();
    const mockLimit = vi.fn();

    mockDb.select = mockSelect;

    mockDb.insert = vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({ onConflictDoUpdate: vi.fn() }),
    });

    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ limit: mockLimit });

    // Usage check (first call to select) -> returns empty [] (0 usage)
    // Standup cache check -> skipped because forceRefresh is true
    // Wait, implementation:
    // const usage = await getCache(...)
    // if (!forceRefresh) { const cached = await getCache(...) }

    mockLimit.mockResolvedValue([]); // Usage is 0

    mockGenerateStandup.mockResolvedValue({
      standup: "Fresh standup",
    });

    const res = await app.request("/sessions/standup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        dateRangeLabel: "Yesterday",
        forceRefresh: true,
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ standup: "Fresh standup" });
    expect(mockGenerateStandup).toHaveBeenCalled();
  });

  it("should return 429 if daily limit reached", async () => {
    // Mock DB responses
    mockDb.query.user.findFirst.mockResolvedValue({ name: "Test User" });

    const mockSelect = vi.fn();
    const mockFrom = vi.fn();
    const mockWhere = vi.fn();
    const mockLimit = vi.fn();

    mockDb.select = mockSelect;
    mockSelect.mockReturnValue({ from: mockFrom });
    mockFrom.mockReturnValue({ where: mockWhere });
    mockWhere.mockReturnValue({ limit: mockLimit });

    // Mock usage check returning count >= 2
    // usage key returns value: JSON string of { count: 2 }
    mockLimit.mockResolvedValue([
      {
        value: JSON.stringify({ count: 2 }),
        expiresAt: new Date(Date.now() + 10000),
      },
    ]);

    const res = await app.request("/sessions/standup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        dateRangeLabel: "Yesterday",
        forceRefresh: true, // even with force refresh, limit should apply
      }),
    });

    expect(res.status).toBe(429);
    expect(mockGenerateStandup).not.toHaveBeenCalled();
  });
});
