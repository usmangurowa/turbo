import { afterEach, beforeEach, describe, expect, it } from "vitest";

import type { createServerApp } from "../app";

describe("createServerApp", () => {
  const originalSkipEnvValidation = process.env.SKIP_ENV_VALIDATION;
  const authResponseBody = "auth handler";
  const auth = {
    api: {
      getSession: () => Promise.resolve(null),
    },
    handler: () => Promise.resolve(new Response(authResponseBody)),
  } as unknown as Parameters<typeof createServerApp>[0];

  beforeEach(() => {
    process.env.SKIP_ENV_VALIDATION = "1";
  });

  afterEach(() => {
    if (originalSkipEnvValidation === undefined) {
      delete process.env.SKIP_ENV_VALIDATION;
      return;
    }

    process.env.SKIP_ENV_VALIDATION = originalSkipEnvValidation;
  });

  it("serves the shared API health route", async () => {
    const { createServerApp } = await import("../app");
    const app = createServerApp(auth, {
      allowedOrigins: ["http://localhost:3001", "expo://"],
    });

    const response = await app.request("/health");

    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toBe("OK");
  });

  it("serves the shared API under the /api base path", async () => {
    const { createServerApp } = await import("../app");
    const app = createServerApp(auth, {
      allowedOrigins: ["http://localhost:3001", "expo://"],
    });

    const response = await app.request("/api/health");

    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toBe("OK");
  });

  it("mounts Better Auth handlers under the /api/auth base path", async () => {
    const { createServerApp } = await import("../app");
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
