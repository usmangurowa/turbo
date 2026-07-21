import * as Sentry from "@sentry/nextjs";
import posthog from "posthog-js";

import { posthogWebOptions, SENTRY_CONFIG } from "@turbo/analytics";
import { POSTHOG_HOST } from "@turbo/shared/constants";

// instrumentation-client.ts runs very early, so we access env vars directly
// eslint-disable-next-line no-restricted-properties
const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
// eslint-disable-next-line no-restricted-properties
const NODE_ENV = process.env.NODE_ENV;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: NODE_ENV,
  ...SENTRY_CONFIG,
  integrations: [Sentry.replayIntegration()],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;

// eslint-disable-next-line no-restricted-properties
const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;

if (POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    ...posthogWebOptions({ isDevelopment: NODE_ENV === "development" }),
  });
}
