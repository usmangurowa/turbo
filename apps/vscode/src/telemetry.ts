/**
 * Telemetry module for the Turbo VS Code extension.
 *
 * Opt-in error tracking using Sentry and analytics using PostHog.
 * Respects the `turbo.enableTelemetry` setting.
 */

import * as Sentry from "@sentry/node";
import { PostHog } from "posthog-node";
import * as vscode from "vscode";

import type { AnalyticsEvent } from "@turbo/analytics/events";

let enabled = false;
let sentryInitialized = false;
let posthogClient: PostHog | null = null;
let machineId: string | null = null;
let currentUserId: string | null = null;

/**
 * Initialize the telemetry clients.
 */
export const initTelemetry = (context: vscode.ExtensionContext) => {
  machineId = vscode.env.machineId;
  enabled = vscode.workspace
    .getConfiguration("turbo")
    .get<boolean>("enableTelemetry", false);

  if (!enabled) {
    console.log("[Turbo]: Telemetry disabled");
    return;
  }

  // Initialize Sentry
  const sentryDsn = process.env.SENTRY_DSN;
  if (sentryDsn) {
    Sentry.init({
      dsn: sentryDsn,
      environment: process.env.NODE_ENV ?? "production",
      release:
          vscode.extensions.getExtension("usmangurowa.turbo-template")?.packageJSON
            ?.version,
    });
    sentryInitialized = true;
  }

  // Initialize PostHog
  const posthogKey = process.env.POSTHOG_API_KEY;
  const posthogHost = process.env.POSTHOG_HOST;
  if (posthogKey) {
    posthogClient = new PostHog(posthogKey, {
      host: posthogHost,
      flushAt: 10,
      flushInterval: 30000,
    });
  }

  // Listen for setting changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("turbo.enableTelemetry")) {
        const newValue = vscode.workspace
          .getConfiguration("turbo")
          .get<boolean>("enableTelemetry", false);

        if (newValue && !enabled) {
          enabled = true;

          // Initialize clients if not already done
          const sentryDsn = process.env.SENTRY_DSN;
          if (sentryDsn && !sentryInitialized) {
            Sentry.init({
              dsn: sentryDsn,
              environment: process.env.NODE_ENV ?? "production",
              release:
                vscode.extensions.getExtension("usmangurowa.turbo-template")?.packageJSON
                  ?.version,
            });
            sentryInitialized = true;
          }

          const posthogKey = process.env.POSTHOG_API_KEY;
          if (posthogKey && !posthogClient) {
            posthogClient = new PostHog(posthogKey, {
              host: process.env.POSTHOG_HOST,
              flushAt: 10,
              flushInterval: 30000,
            });
          }

          console.log("[Turbo]: Telemetry enabled by user");
        } else if (!newValue && enabled) {
          enabled = false;
          void shutdownTelemetry();
          console.log("[Turbo]: Telemetry disabled by user");
        }
      }
    }),
  );

  console.log("[Turbo]: Telemetry initialized");
};

/**
 * Track an analytics event.
 */
export const trackEvent = (
  event: AnalyticsEvent,
  properties?: Record<string, unknown>,
) => {
  if (!enabled || !machineId) return;

  const distinctId = currentUserId ?? machineId;
  const props = {
    ...properties,
    vscode_version: vscode.version,
    extension_version:
      vscode.extensions.getExtension("usmangurowa.turbo-template")?.packageJSON
        ?.version ?? "unknown",
    platform: process.platform,
    machine_id: machineId,
  };

  // Sentry breadcrumb
  if (sentryInitialized) {
    Sentry.addBreadcrumb({
      category: event,
      data: props,
      level: "info",
    });
  }

  // PostHog event
  if (posthogClient) {
    posthogClient.capture({ distinctId, event, properties: props });
  }
};

/**
 * Capture an error with Sentry.
 */
export const captureError = (
  error: Error,
  context?: Record<string, unknown>,
) => {
  if (!enabled || !sentryInitialized) return;

  Sentry.withScope((scope) => {
    if (currentUserId) scope.setUser({ id: currentUserId });
    if (machineId) scope.setTag("machineId", machineId);
    if (context) scope.setExtras(context);
    Sentry.captureException(error);
  });
};

/**
 * Identify the user.
 */
export const identifyUser = (userId: string) => {
  if (!enabled || !machineId) return;
  if (currentUserId === userId) return;

  currentUserId = userId;

  // Sentry
  if (sentryInitialized) {
    Sentry.setUser({ id: userId });
    Sentry.setTag("machineId", machineId);
  }

  // PostHog
  if (posthogClient) {
    posthogClient.alias({ distinctId: userId, alias: machineId });
  }

  console.log("[Turbo]: User identified for telemetry");
};

/**
 * Gracefully shutdown telemetry.
 */
export const shutdownTelemetry = async () => {
  const promises: Promise<unknown>[] = [];

  if (sentryInitialized) {
    promises.push(Sentry.close(2000));
  }

  if (posthogClient) {
    promises.push(posthogClient.shutdown());
  }

  await Promise.all(promises);
  sentryInitialized = false;
  posthogClient = null;
};

export const isTelemetryEnabled = () => enabled;
