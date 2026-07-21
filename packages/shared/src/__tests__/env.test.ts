import { describe, expect, it } from "vitest";

import { shouldSkipEnvValidation } from "../env";

describe("shouldSkipEnvValidation", () => {
  it("returns false for an empty env", () => {
    expect(shouldSkipEnvValidation({})).toBe(false);
  });

  it("returns true when CI is set", () => {
    expect(shouldSkipEnvValidation({ CI: "1" })).toBe(true);
  });

  it("returns true when SKIP_ENV_VALIDATION is set", () => {
    expect(shouldSkipEnvValidation({ SKIP_ENV_VALIDATION: "1" })).toBe(true);
  });

  it("returns true when npm_lifecycle_event is build", () => {
    expect(shouldSkipEnvValidation({ npm_lifecycle_event: "build" })).toBe(
      true,
    );
  });

  it("returns true when npm_lifecycle_event is lint", () => {
    expect(shouldSkipEnvValidation({ npm_lifecycle_event: "lint" })).toBe(
      true,
    );
  });

  it("returns false when npm_lifecycle_event is test", () => {
    expect(shouldSkipEnvValidation({ npm_lifecycle_event: "test" })).toBe(
      false,
    );
  });
});
