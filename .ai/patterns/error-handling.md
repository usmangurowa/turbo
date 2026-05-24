# Pattern: Error Handling

## Overview

Error handling is layered across the API, client, and monitoring.

## API Layer (Hono)

- Return typed error responses with appropriate HTTP status codes.
- Use middleware for auth errors (401, 403).
- Validate inputs with Zod; return 400 for validation failures.

```typescript
// Example (pattern used in packages/api/src/router/support.ts)
import { zValidator } from "@hono/zod-validator";

.post("/", zValidator("json", schema), (c) => {
  const body = c.req.valid("json");
  // ...
});
```

## Client (Web & Mobile)

- TanStack Query handles retries and error states automatically.
- Use `isError` / `error` from query results to render error UI.
- Display user-facing errors with `sonner` (toast notifications) via `@turbo/ui`.

## Error Monitoring

- **Sentry** captures unhandled exceptions in both web (`@sentry/nextjs`) and mobile (`@sentry/react-native`).
- Configure via `SENTRY_DSN` environment variable.

## Key files

- `packages/api/src/middleware/security.ts` — security error responses
- `packages/api/src/middleware/auth.ts` — auth error handling
- `packages/ui/src/components/sonner.tsx` — toast notifications

## Anti-patterns

- Do not swallow errors silently — log or report them.
- Do not expose internal error details to clients.
- Do not use generic error messages — provide actionable feedback.
