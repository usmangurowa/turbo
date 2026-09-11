import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { createServerApp as CreateServerApp } from "../app";

describe("createServerApp", () => {
  const originalSkipEnvValidation = process.env.SKIP_ENV_VALIDATION;
  const authResponseBody = "auth handler";
  const auth = {
    api: {
      getSession: () => Promise.resolve(null),
    },
    handler: () => Promise.resolve(new Response(authResponseBody)),
  } as unknown as Parameters<typeof CreateServerApp>[0];
  let createServerApp: typeof CreateServerApp;

  // Loading `../app` pulls in the whole server graph (Hono API, Better Auth,
  // Drizzle, AI SDK). Do it once in a hook with the hook timeout, so the
  // tests below time the requests rather than a cold import on a busy
  // runner — the first test used to trip the 5s budget on hosted CI.
  beforeAll(async () => {
    process.env.SKIP_ENV_VALIDATION = "1";
    ({ createServerApp } = await import("../app"));
  });

  afterAll(() => {
    if (originalSkipEnvValidation === undefined) {
      delete process.env.SKIP_ENV_VALIDATION;
      return;
    }

    process.env.SKIP_ENV_VALIDATION = originalSkipEnvValidation;
  });

  it("serves the shared API health route", async () => {
    const app = createServerApp(auth, {
      allowedOrigins: ["http://localhost:3001", "expo://"],
    });

    const response = await app.request("/health");

    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toBe("OK");
  });

  it("serves the shared API under the /api base path", async () => {
    const app = createServerApp(auth, {
      allowedOrigins: ["http://localhost:3001", "expo://"],
    });

    const response = await app.request("/api/health");

    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toBe("OK");
  });

  it("mounts Better Auth handlers under the /api/auth base path", async () => {
    const app = createServerApp(auth, {
      allowedOrigins: ["http://localhost:3001", "expo://"],
    });

    const response = await app.request("/api/auth/sign-in/email", {
      method: "POST",
    });

    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toBe(authResponseBody);
  });
});
