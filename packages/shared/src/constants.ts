/**
 * Shared constants for Turbo
 * These values are used across apps and packages.
 *
 * Rule of thumb: a value belongs here once it has two or more consumers.
 * Single-use constants stay next to their usage.
 */

/** PostHog ingestion host (US cloud). Keys stay in env; the host is not a secret. */
export const POSTHOG_HOST = "https://us.i.posthog.com";
