---
trigger: always_on
---

# Analytics & Error Tracking

## PostHog Integration

The Turbo monorepo uses PostHog for analytics and error tracking across all platforms.

## Package Structure
- `packages/analytics` - Shared analytics utilities (`@turbo/analytics`)
  - `events.ts` - Centralized event name constants
  - `server.ts` - Server-side PostHog client for API/Node.js

## Platform Integration

| Platform | How to Track |
|----------|--------------|
| **Web (Next.js)** | `posthog.capture()` via `posthog-js`, initialized in `instrumentation-client.ts` |
| **Mobile (Expo)** | `usePostHog()` from `posthog-react-native`, Provider in `_layout.tsx` |
| **VS Code** | `trackEvent()` from `./telemetry.ts` (opt-in via `turbo.enableTelemetry`) |
| **API** | `trackApiEvent()` from `middleware/analytics.ts` |

## User Identification

All platforms identify users with their userId for cross-platform tracking:
- **Web**: `posthog.identify(userId)` via `useIdentifyUser()` hook in providers
- **Mobile**: `posthog.identify(userId)` in `AuthProvider` on session change
- **VS Code**: `identifyUser(userId)` when API key is validated (sync returns userId)
- **API**: Uses `userId` directly as `distinctId`

## What to Track

Track **critical logics and processes** for analytics and error monitoring:

### Must Track
- Authentication events (login, signup, logout)
- API key creation/revocation
- Sync operations (heartbeats synced)
- Error events with context
- Feature usage (commands, settings changes)

### How to Track in API
```typescript
import { trackApiEvent } from "../middleware/analytics";

trackApiEvent(userId, ANALYTICS_EVENTS.API_KEY_CREATED, { 
  source: "dashboard" 
});
```

### How to Track Errors
```typescript
trackApiEvent(userId, "error occurred", {
  error_type: "sync_failed",
  error_message: error.message,
});
```

## Environment Variables
```bash
# Web
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Mobile
EXPO_PUBLIC_POSTHOG_KEY=phc_xxx
EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# API / VS Code
POSTHOG_API_KEY=phc_xxx
POSTHOG_HOST=https://us.i.posthog.com
```