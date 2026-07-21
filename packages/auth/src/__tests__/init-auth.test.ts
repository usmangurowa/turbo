import { describe, expect, it } from "vitest";

process.env.SKIP_ENV_VALIDATION = "1";

describe("initAuth", () => {
  it("returns a better-auth instance", async () => {
    const { initAuth } = await import("../index");
    const auth = initAuth({
      baseUrl: "http://localhost:3001",
      productionUrl: "http://localhost:3001",
      secret: "test-secret",
      supabaseJwtSecret: "test-jwt-secret",
    });
    expect(typeof auth.handler).toBe("function");
    expect(typeof auth.api.getSession).toBe("function");
  });
});

describe("createAppAuth", () => {
  it("returns a better-auth instance with shared wiring", async () => {
    const { createAppAuth } = await import("../index");
    const auth = createAppAuth({
      baseUrl: "http://localhost:3001",
      productionUrl: "http://localhost:3001",
    });
    expect(typeof auth.handler).toBe("function");
    expect(typeof auth.api.getSession).toBe("function");
  });
});
