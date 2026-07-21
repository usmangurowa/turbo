/**
 * Shared analytics configuration. Apps call their framework-specific
 * Sentry/PostHog init with these values so sample rates and privacy
 * settings are decided once.
 */
export const SENTRY_CONFIG = {
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  enableLogs: true,
} as const;

export interface PosthogWebOptionsInput {
  isDevelopment: boolean;
}

/** Options for posthog-js `init` — cookieless, privacy-first defaults. */
export const posthogWebOptions = ({ isDevelopment }: PosthogWebOptionsInput) =>
  ({
    persistence: "memory",
    capture_pageview: true,
    loaded: (ph: { debug: () => void }) => {
      if (isDevelopment) {
        ph.debug();
      }
    },
  }) as const;
