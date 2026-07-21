import { describe, expect, it, vi } from "vitest";

import { posthogWebOptions, SENTRY_CONFIG } from "../config";

describe("SENTRY_CONFIG", () => {
  it("tracesSampleRate is 0.1", () => {
    expect(SENTRY_CONFIG.tracesSampleRate).toBe(0.1);
  });

  it("replaysSessionSampleRate is 0.1", () => {
    expect(SENTRY_CONFIG.replaysSessionSampleRate).toBe(0.1);
  });

  it("replaysOnErrorSampleRate is 1", () => {
    expect(SENTRY_CONFIG.replaysOnErrorSampleRate).toBe(1);
  });

  it("enableLogs is true", () => {
    expect(SENTRY_CONFIG.enableLogs).toBe(true);
  });
});

describe("posthogWebOptions", () => {
  it("persistence is memory", () => {
    const opts = posthogWebOptions({ isDevelopment: false });
    expect(opts.persistence).toBe("memory");
  });

  it("capture_pageview is true", () => {
    const opts = posthogWebOptions({ isDevelopment: false });
    expect(opts.capture_pageview).toBe(true);
  });

  it("calls ph.debug() in development", () => {
    const opts = posthogWebOptions({ isDevelopment: true });
    const debug = vi.fn();
    opts.loaded({ debug });
    expect(debug).toHaveBeenCalled();
  });

  it("does not call ph.debug() in production", () => {
    const opts = posthogWebOptions({ isDevelopment: false });
    const debug = vi.fn();
    opts.loaded({ debug });
    expect(debug).not.toHaveBeenCalled();
  });
});
