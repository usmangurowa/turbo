import * as Sentry from "@sentry/nextjs";

// instrumentation.ts runs in Next's runtime bootstrap, so we access env vars directly
// eslint-disable-next-line no-restricted-properties
const SENTRY_DSN = process.env.SENTRY_DSN;
// eslint-disable-next-line no-restricted-properties
const NODE_ENV = process.env.NODE_ENV;

export const onRequestError = Sentry.captureRequestError;

export function register() {
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: NODE_ENV,
    enableLogs: true,
    tracesSampleRate: 0.1,
  });
}
