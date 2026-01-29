
# Analytics & Error Tracking

## Dual Integration: Sentry + PostHog

The Turbo monorepo uses:
- **Sentry**: Error tracking, performance monitoring, structured logging
- **PostHog**: Product analytics, user tracking, event funnels

## Package Structure
- `packages/analytics` - Shared utilities (`@turbo/analytics`)
  - `events.ts` - Event name constants
  - `server.ts` - Sentry + PostHog server-side client
  - `utils.ts` - User identity helpers

## Platform Integration

| Platform | Error Tracking | Analytics |
|----------|----------------|-----------|
| **Web** | `@sentry/nextjs` | `posthog-js` |
| **Mobile** | `@sentry/react-native` | `posthog-react-native` |
| **VS Code** | `@sentry/node` | `posthog-node` |
| **API/Jobs** | `@turbo/analytics/server` | `@turbo/analytics/server` |

## Configuration

### Web (Next.js)

Sentry: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
PostHog: `instrumentation-client.ts`

```typescript
// sentry.client.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enableLogs: true,
  tracesSampleRate: 0.1,
});
```

### Mobile (Expo)

```typescript
// _layout.tsx
import * as Sentry from "@sentry/react-native";
import { PostHogProvider } from "posthog-react-native";

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
});

const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const posthogHost = process.env.EXPO_PUBLIC_POSTHOG_HOST;

export default Sentry.wrap(() => (
  <PostHogProvider apiKey={posthogKey} options={{ host: posthogHost }}>
    ...
  </PostHogProvider>
));
```

## Error Tracking (Sentry)

### Capture Exceptions
```typescript
import * as Sentry from "@sentry/nextjs";

try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error);
}
```

### In API/Jobs
```typescript
import { captureError } from "@turbo/analytics/server";

captureError(error, {
  userId: "user_123",
  tags: { task: "generate-summary" },
  extra: { sessionId: "sess_abc" },
});
```

### Structured Logging
```typescript
const { logger } = Sentry;

logger.info("Session started", { sessionId });
logger.warn("Rate limit approached", { remaining: 5 });
logger.error("AI generation failed", { model: "gemini" });
```

### Custom Spans
```typescript
Sentry.startSpan({ op: "ai.generate", name: "Generate Summary" }, async () => {
  return await generateSummary(data);
});
```

## Analytics Tracking (PostHog)

### Track Events in Server
```typescript
import { trackServerEvent } from "@turbo/analytics/server";

trackServerEvent({
  distinctId: userId,
  event: ANALYTICS_EVENTS.SESSION_CLOSED,
  properties: { duration: 1800, project: "turbo" },
});
```

### Track in Web Client
```typescript
import posthog from "posthog-js";

posthog.capture("feature_used", { feature: "ai_summary" });
```

### Track in Mobile
```typescript
import { usePostHog } from "posthog-react-native";

const posthog = usePostHog();
posthog.capture("screen_viewed", { screen: "dashboard" });
```

## User Identification

Identify users in both systems for cross-platform tracking:

```typescript
// Sentry
Sentry.setUser({ id: userId, email, username });

// PostHog
posthog.identify(userId, { email, name });

// On logout
Sentry.setUser(null);
posthog.reset();
```

## Environment Variables

```bash
# Sentry
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
EXPO_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx

# PostHog
POSTHOG_API_KEY=phc_xxx
POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
EXPO_PUBLIC_POSTHOG_KEY=phc_xxx
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```
