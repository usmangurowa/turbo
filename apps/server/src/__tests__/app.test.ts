import { describe, expect, it } from "vitest";

describe("createServerApp", () => {
  it("serves the shared API health route", async () => {
    process.env.SKIP_ENV_VALIDATION = "1";

    const { createServerApp } = await import("../app");
    const app = createServerApp(
      {
        api: {
          getSession: () => Promise.resolve(null),
        },
      } as Parameters<typeof createServerApp>[0],
      {
        allowedOrigins: ["http://localhost:3001", "expo://"],
      },
    );

    const response = await app.request("/health");

    expect(response.status).toBe(200);
    const body = await response.text();
    expect(body).toBe("OK");
  });
});
