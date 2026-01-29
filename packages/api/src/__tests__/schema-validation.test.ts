import { describe, expect, it } from "vitest";

describe("schema validation", () => {
  it("has been removed for auth-only template", () => {
    expect(true).toBe(true);
  });
});
  /**
   * REQUIREMENT: line changes can be positive (added) or negative (removed)
   */
  describe("line changes validation", () => {
    it("should accept positive humanLineChanges (lines added)", () => {
      const heartbeat = { ...createValidHeartbeat(), humanLineChanges: 10 };
      const result = CreateHeartbeatSchema.safeParse(heartbeat);
      expect(result.success).toBe(true);
    });

    it("should accept negative humanLineChanges (lines removed)", () => {
      const heartbeat = { ...createValidHeartbeat(), humanLineChanges: -5 };
      const result = CreateHeartbeatSchema.safeParse(heartbeat);
      expect(result.success).toBe(true);
    });

    it("should accept zero humanLineChanges (no change)", () => {
      const heartbeat = { ...createValidHeartbeat(), humanLineChanges: 0 };
      const result = CreateHeartbeatSchema.safeParse(heartbeat);
      expect(result.success).toBe(true);
    });

    it("should accept positive aiLineChanges", () => {
      const heartbeat = { ...createValidHeartbeat(), aiLineChanges: 50 };
      const result = CreateHeartbeatSchema.safeParse(heartbeat);
      expect(result.success).toBe(true);
    });

    it("should accept negative aiLineChanges", () => {
      const heartbeat = { ...createValidHeartbeat(), aiLineChanges: -20 };
      const result = CreateHeartbeatSchema.safeParse(heartbeat);
      expect(result.success).toBe(true);
    });
  });

  /**
   * REQUIREMENT: category should only accept valid values
   */
  describe("category validation", () => {
    it("should accept 'debugging' category", () => {
      const heartbeat = { ...createValidHeartbeat(), category: "debugging" };
      const result = CreateHeartbeatSchema.safeParse(heartbeat);
      expect(result.success).toBe(true);
    });

    it("should accept 'building' category", () => {
      const heartbeat = { ...createValidHeartbeat(), category: "building" };
      const result = CreateHeartbeatSchema.safeParse(heartbeat);
      expect(result.success).toBe(true);
    });

    it("should accept 'code_reviewing' category", () => {
      const heartbeat = {
        ...createValidHeartbeat(),
        category: "code_reviewing",
      };
      const result = CreateHeartbeatSchema.safeParse(heartbeat);
      expect(result.success).toBe(true);
    });

    it("should reject invalid category", () => {
      const heartbeat = { ...createValidHeartbeat(), category: "invalid" };
      const result = CreateHeartbeatSchema.safeParse(heartbeat);
      expect(result.success).toBe(false);
    });

    it("should allow undefined category (coding is default)", () => {
      const heartbeat = { ...createValidHeartbeat(), category: undefined };
      const result = CreateHeartbeatSchema.safeParse(heartbeat);
      expect(result.success).toBe(true);
    });
  });
});
