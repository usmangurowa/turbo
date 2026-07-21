import { describe, expect, it, vi } from "vitest";

import { syncUserIdentity } from "../utils";

const makeSpies = () => ({
  sentry: { setUser: vi.fn() },
  posthog: { identify: vi.fn(), reset: vi.fn() },
});

describe("syncUserIdentity", () => {
  it("identifies a new user (sets sentry user, calls posthog.identify, returns id)", () => {
    const { sentry, posthog } = makeSpies();
    const user = { id: "user-1", email: "a@b.com", name: "Alice" };

    const result = syncUserIdentity(user, null, sentry, posthog);

    expect(result).toBe("user-1");
    expect(sentry.setUser).toHaveBeenCalledWith({
      id: "user-1",
      email: "a@b.com",
      username: "Alice",
    });
    expect(posthog.identify).toHaveBeenCalledWith("user-1", {
      email: "a@b.com",
      name: "Alice",
    });
  });

  it("no-ops when already identified (returns currentId, no calls)", () => {
    const { sentry, posthog } = makeSpies();
    const user = { id: "user-1", email: "a@b.com", name: "Alice" };

    const result = syncUserIdentity(user, "user-1", sentry, posthog);

    expect(result).toBe("user-1");
    expect(sentry.setUser).not.toHaveBeenCalled();
    expect(posthog.identify).not.toHaveBeenCalled();
  });

  it("clears on logout (calls setUser(null), posthog.reset(), returns null)", () => {
    const { sentry, posthog } = makeSpies();

    const result = syncUserIdentity(null, "user-1", sentry, posthog);

    expect(result).toBeNull();
    expect(sentry.setUser).toHaveBeenCalledWith(null);
    expect(posthog.reset).toHaveBeenCalled();
  });

  it("swallows a throwing sentry client (returns currentId)", () => {
    const posthog = { identify: vi.fn(), reset: vi.fn() };
    const sentry = {
      setUser: vi.fn().mockImplementation(() => {
        throw new Error("Sentry unavailable");
      }),
    };
    const user = { id: "user-2" };

    const result = syncUserIdentity(user, null, sentry, posthog);

    expect(result).toBeNull();
  });
});
