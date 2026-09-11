import { beforeAll, describe, expect, it } from "vitest";

process.env.SKIP_ENV_VALIDATION = "1";

// The env guard above must run before the module loads, hence the dynamic
// import — but it happens once here, under the hook timeout, so the tests
// time their assertions rather than a cold better-auth import on a busy
// runner (the first test tripped the 5s budget on hosted CI).
let mod: typeof import("../index");

beforeAll(async () => {
  mod = await import("../index");
});

describe("initAuth", () => {
  it("returns a better-auth instance", () => {
    const { initAuth } = mod;
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
  it("returns a better-auth instance with shared wiring", () => {
    const { createAppAuth } = mod;
    const auth = createAppAuth({
      baseUrl: "http://localhost:3001",
      productionUrl: "http://localhost:3001",
    });
    expect(typeof auth.handler).toBe("function");
    expect(typeof auth.api.getSession).toBe("function");
  });
});
