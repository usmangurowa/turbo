/**
 * Server-side analytics and error tracking for Node.js environments.
 *
 * - Sentry: Error tracking and structured logging
 * - PostHog: Product analytics and event tracking
 *
 * ## Auto-initialization
 *
 * Functions like `trackServerEvent()`, `captureError()`, and `identifyUser()`
 * will auto-initialize Sentry using environment variables if not already initialized.
 * For custom configuration, call `initSentry()` explicitly before using these functions.
 *
 * @example
 * ```ts
 * // Option 1: Auto-init from env vars (SENTRY_DSN)
 * captureError(error);
 *
 * // Option 2: Explicit init with custom config
 * initSentry({ dsn: "...", environment: "staging" });
 * captureError(error);
 * ```
 */

import * as Sentry from "@sentry/node";
import { PostHog } from "posthog-node";

import { POSTHOG_HOST } from "@turbo/shared/constants";

import type { AnalyticsEvent } from "./events";

// Sentry state
let sentryInitialized = false;

// PostHog state
let posthogClient: PostHog | null = null;

export interface SentryConfig {
  dsn: string;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
}

export interface PostHogConfig {
  apiKey: string;
  host?: string;
  flushAt?: number;
  flushInterval?: number;
}

/**
 * Initialize Sentry for error tracking.
 *
 * Call this explicitly if you need custom configuration.
 * Otherwise, Sentry will auto-initialize from env vars when functions like
 * `captureError()` or `trackServerEvent()` are first called.
 *
 * @param config - Optional custom configuration (defaults to env vars)
 */
export const initSentry = (config?: SentryConfig): void => {
  if (sentryInitialized) return;

  const dsn = config?.dsn ?? process.env.SENTRY_DSN;
  if (!dsn) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Sentry] DSN not configured, error tracking disabled");
    }
    return;
  }

  Sentry.init({
    dsn,
    environment: config?.environment ?? process.env.NODE_ENV ?? "development",
    release: config?.release ?? process.env.npm_package_version,
    tracesSampleRate: config?.tracesSampleRate ?? 0.1,
  });

  sentryInitialized = true;
};

/**
 * Get or create a PostHog client instance.
 */
export const getPostHogClient = (config?: PostHogConfig): PostHog | null => {
  if (posthogClient) return posthogClient;

  const apiKey = config?.apiKey ?? process.env.POSTHOG_API_KEY;
  const host = config?.host ?? POSTHOG_HOST;

  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[PostHog] API key not configured, analytics disabled");
    }
    return null;
  }

  posthogClient = new PostHog(apiKey, {
    host,
    flushAt: config?.flushAt ?? 20,
    flushInterval: config?.flushInterval ?? 10000,
  });

  return posthogClient;
};

export interface TrackEventOptions {
  distinctId: string;
  event: AnalyticsEvent;
  properties?: Record<string, unknown>;
  groups?: Record<string, string>;
}

/**
 * Track an analytics event with PostHog and add a Sentry breadcrumb.
 */
export const trackServerEvent = (options: TrackEventOptions): void => {
  try {
    // Add Sentry breadcrumb for error context
    if (!sentryInitialized) initSentry();
    Sentry.addBreadcrumb({
      category: options.event,
      message: `User: ${options.distinctId}`,
      data: options.properties,
      level: "info",
    });

    // Track in PostHog for analytics
    const posthog = getPostHogClient();
    if (posthog) {
      posthog.capture({
        distinctId: options.distinctId,
        event: options.event,
        properties: options.properties,
        groups: options.groups,
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Analytics] Failed to track event:", error);
    }
  }
};

export interface CaptureErrorOptions {
  userId?: string;
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
}

/**
 * Capture an exception with Sentry.
 */
export const captureError = (
  error: Error,
  options?: CaptureErrorOptions,
): void => {
  try {
    if (!sentryInitialized) initSentry();

    Sentry.withScope((scope) => {
      if (options?.userId) scope.setUser({ id: options.userId });
      if (options?.extra) scope.setExtras(options.extra);
      if (options?.tags) scope.setTags(options.tags);
      Sentry.captureException(error);
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Sentry] Failed to capture error:", err);
    }
  }
};

export interface IdentifyUserOptions {
  email?: string;
  username?: string;
  extras?: Record<string, unknown>;
}

/**
 * Identify a user with both Sentry and PostHog.
 *
 * @param distinctId - The unique user identifier
 * @param options - Optional user details (email, username, extras)
 */
export const identifyUser = (
  distinctId: string,
  options?: IdentifyUserOptions,
): void => {
  try {
    // Sentry user context - only use Sentry-specific fields
    if (!sentryInitialized) initSentry();
    Sentry.setUser({
      id: distinctId,
      email: options?.email,
      username: options?.username,
    });
    // Set additional properties as extras
    if (options?.extras) {
      Sentry.setExtras(options.extras);
    }

    // PostHog identify - can accept any properties
    const posthog = getPostHogClient();
    if (posthog) {
      posthog.identify({
        distinctId,
        properties: {
          email: options?.email,
          username: options?.username,
          ...options?.extras,
        },
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Analytics] Failed to identify user:", error);
    }
  }
};

/**
 * Clear user context (on logout).
 */
export const clearUser = (): void => {
  try {
    Sentry.setUser(null);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Analytics] Failed to clear user:", error);
    }
  }
};

/**
 * Gracefully shutdown analytics clients.
 */
export const shutdownAnalytics = async (): Promise<void> => {
  const promises: Promise<void>[] = [];

  if (sentryInitialized) {
    promises.push(
      Sentry.close(2000).then(() => {
        sentryInitialized = false;
      }),
    );
  }

  if (posthogClient) {
    promises.push(
      posthogClient.shutdown().then(() => {
        posthogClient = null;
      }),
    );
  }

  await Promise.all(promises);
};

export { Sentry, PostHog };
