/**
 * Centralized analytics event definitions for type-safety across platforms.
 * Use [object] [verb] naming convention as recommended by PostHog.
 */

export const ANALYTICS_EVENTS = {
  // Authentication events
  USER_SIGNED_UP: "user signed up",
  USER_SIGNED_IN: "user signed in",
  USER_SIGNED_OUT: "user signed out",
  USER_ONBOARDING_COMPLETED: "user onboarding completed",

  // Feature usage
  FEATURE_USED: "feature used",

  // Errors
  ERROR_OCCURRED: "error occurred",
} as const;

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
