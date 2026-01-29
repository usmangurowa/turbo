/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UserSettings } from "@turbo/validators";
import { userSettingsSchema } from "@turbo/validators";

import { createApp } from "../index";

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
    onConflictDoUpdate: vi.fn().mockReturnThis(),
    query: {
      userSettings: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    },
    then: (resolve: any) => resolve([]),
  },
  schema: {},
}));

vi.mock("../middleware/analytics", () => ({
  trackApiEvent: vi.fn(),
}));

// Response type for settings API - use UserSettings from validators
type SettingsResponse = UserSettings;

// Default settings derived from schema - single source of truth
const DEFAULT_SETTINGS: SettingsResponse = userSettingsSchema.parse({});

// Mock API key user
const mockApiKeyUser = {
  userId: "user_123",
  id: "apikey_1",
  key: "hashed_turbo_key",
};

// Mock session user
const mockSessionUser = {
  user: {
    id: "user_456",
    email: "test@example.com",
    name: "Test User",
  },
};

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

describe("API: Settings Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /settings (API Key Auth)", () => {
    it("should return 401 if API key is missing", async () => {
      const app = createApp(mockAuth);
      const res = await app.request("/settings", {
        method: "GET",
      });

      expect(res.status).toBe(401);
    });

    it("should return 401 for invalid API key", async () => {
      mockAuth.api.verifyApiKey.mockResolvedValueOnce({ valid: false });

      const app = createApp(mockAuth);
      const res = await app.request("/settings", {
        method: "GET",
        headers: {
          Authorization: "Bearer invalid_key",
        },
      });

      expect(res.status).toBe(401);
    });

    it("should return default settings when user has no settings row", async () => {
      const db = (await import("@turbo/db/client")).db;
      (db as any).then = (resolve: any) => resolve([mockApiKeyUser]);
      (db.query.userSettings.findFirst as any).mockResolvedValue(null);

      const app = createApp(mockAuth);
      const res = await app.request("/settings", {
        method: "GET",
        headers: {
          Authorization: "Bearer turbo_test_key",
        },
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as SettingsResponse;
      expect(body).toMatchObject(DEFAULT_SETTINGS);
    });

    it("should return existing user settings", async () => {
      const db = (await import("@turbo/db/client")).db;
      (db as any).then = (resolve: any) => resolve([mockApiKeyUser]);

      const existingSettings = {
        userId: "user_123",
        enabled: false,
        privacyMode: "stealth",
        breakReminderMinutes: 60,
        sessionTimeoutMinutes: 15,
        enableTelemetry: true,
        captureSymbols: true,
        captureCommits: true,
      };
      (db.query.userSettings.findFirst as any).mockResolvedValue(
        existingSettings,
      );

      const app = createApp(mockAuth);
      const res = await app.request("/settings", {
        method: "GET",
        headers: {
          Authorization: "Bearer turbo_test_key",
        },
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as SettingsResponse;
      expect(body).toMatchObject({
        enabled: false,
        privacyMode: "stealth",
        breakReminderMinutes: 60,
        sessionTimeoutMinutes: 15,
        enableTelemetry: true,
        captureSymbols: true,
        captureCommits: true,
      });
    });
  });

  describe("PUT /settings (API Key Auth)", () => {
    it("should return 401 if API key is missing", async () => {
      const app = createApp(mockAuth);
      const res = await app.request("/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: false }),
      });

      expect(res.status).toBe(401);
    });

    it("should update settings with valid payload", async () => {
      const db = (await import("@turbo/db/client")).db;
      (db as any).then = (resolve: any) => resolve([mockApiKeyUser]);

      // After upsert, return updated settings
      (db.query.userSettings.findFirst as any).mockResolvedValue({
        userId: "user_123",
        enabled: false,
        privacyMode: "normal",
        breakReminderMinutes: 90,
        sessionTimeoutMinutes: 30,
        enableTelemetry: false,
        captureSymbols: false,
        captureCommits: true,
      });

      const app = createApp(mockAuth);
      const res = await app.request("/settings", {
        method: "PUT",
        headers: {
          Authorization: "Bearer turbo_test_key",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: false }),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as SettingsResponse;
      expect(body.enabled).toBe(false);
    });

    it("should validate payload and reject invalid privacy mode", async () => {
      const db = (await import("@turbo/db/client")).db;
      (db as any).then = (resolve: any) => resolve([mockApiKeyUser]);

      const app = createApp(mockAuth);
      const res = await app.request("/settings", {
        method: "PUT",
        headers: {
          Authorization: "Bearer turbo_test_key",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ privacyMode: "invalid_mode" }),
      });

      expect(res.status).toBe(400);
    });

    it("should allow partial updates with only some fields", async () => {
      const db = (await import("@turbo/db/client")).db;
      (db as any).then = (resolve: any) => resolve([mockApiKeyUser]);

      (db.query.userSettings.findFirst as any).mockResolvedValue({
        userId: "user_123",
        enabled: true,
        privacyMode: "normal",
        breakReminderMinutes: 120,
        sessionTimeoutMinutes: 30,
        enableTelemetry: false,
        captureSymbols: false,
        captureCommits: true,
      });

      const app = createApp(mockAuth);
      const res = await app.request("/settings", {
        method: "PUT",
        headers: {
          Authorization: "Bearer turbo_test_key",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ breakReminderMinutes: 120 }),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as SettingsResponse;
      expect(body.breakReminderMinutes).toBe(120);
      // Other fields should remain unchanged
      expect(body.enabled).toBe(true);
      expect(body.privacyMode).toBe("normal");
    });
  });

  describe("GET /settings/web (Session Auth)", () => {
    it("should return 401 if not authenticated", async () => {
      mockAuth.api.getSession.mockResolvedValueOnce(null);

      const app = createApp(mockAuth);
      const res = await app.request("/settings/web", {
        method: "GET",
      });

      expect(res.status).toBe(401);
    });

    it("should return settings for authenticated session user", async () => {
      const db = (await import("@turbo/db/client")).db;
      mockAuth.api.getSession.mockResolvedValueOnce(mockSessionUser);
      (db.query.userSettings.findFirst as any).mockResolvedValue(null);

      const app = createApp(mockAuth);
      const res = await app.request("/settings/web", {
        method: "GET",
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as SettingsResponse;
      expect(body).toMatchObject(DEFAULT_SETTINGS);
    });
  });

  describe("PUT /settings/web (Session Auth)", () => {
    it("should return 401 if not authenticated", async () => {
      mockAuth.api.getSession.mockResolvedValueOnce(null);

      const app = createApp(mockAuth);
      const res = await app.request("/settings/web", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: false }),
      });

      expect(res.status).toBe(401);
    });

    it("should update settings for authenticated session user", async () => {
      const db = (await import("@turbo/db/client")).db;
      mockAuth.api.getSession.mockResolvedValueOnce(mockSessionUser);

      (db.query.userSettings.findFirst as any).mockResolvedValue({
        userId: "user_456",
        enabled: false,
        privacyMode: "stealth",
        breakReminderMinutes: 90,
        sessionTimeoutMinutes: 30,
        enableTelemetry: false,
        captureSymbols: false,
        captureCommits: true,
      });

      const app = createApp(mockAuth);
      const res = await app.request("/settings/web", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: false, privacyMode: "stealth" }),
      });

      expect(res.status).toBe(200);
      const body = (await res.json()) as SettingsResponse;
      expect(body.enabled).toBe(false);
      expect(body.privacyMode).toBe("stealth");
    });

    it("should validate payload and reject invalid values", async () => {
      mockAuth.api.getSession.mockResolvedValueOnce(mockSessionUser);

      const app = createApp(mockAuth);
      const res = await app.request("/settings/web", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ breakReminderMinutes: -5 }), // Negative value
      });

      // Schema should reject negative values
      expect(res.status).toBe(400);
    });
  });
});
