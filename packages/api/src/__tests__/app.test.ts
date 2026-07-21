import { describe, expect, it } from "vitest";

import type { AuthWithApi, Db } from "../context";
import { createApp } from "../index";

const stubAuth = {
  api: {
    getSession: () => Promise.resolve(null),
  },
} as unknown as AuthWithApi;

const stubDb = {} as Db;

describe("createApp", () => {
  it("serves the health check without a database", async () => {
    const app = createApp(stubAuth, stubDb);
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("OK");
  });

  it("rejects unauthenticated access to protected routes", async () => {
    // authMiddleware returns 401 when session is null (no user)
    const app = createApp(stubAuth, stubDb);
    const res = await app.request("/apikeys");
    expect(res.status).toBe(401);
  });
});
