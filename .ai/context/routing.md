# Routing Context

## Web Routing

- Web routes use Next.js App Router under `apps/web/src/app`.
- Pages are `page.tsx`; layouts are `layout.tsx`.
- Use server components by default.
- Add `"use client"` only when client interactivity or browser APIs are required.
- Business API behavior does not belong in `apps/web/src/app/api`; app API files
  should mount or adapt shared handlers from packages.

## API Routing

- Hono routers live in `packages/api/src/router`.
- The API app is assembled in `packages/api/src/index.ts`.
- The web app mounts the API at `apps/web/src/app/api/[[...route]]/route.ts`.
- Protected routes must apply an explicit auth guard.

## Mobile Routing

- Mobile routes use Expo Router under `apps/mobile/src/app`.
- Keep screen-specific components close to the screen until they are reused.
- Shared mobile utilities belong under `apps/mobile/src` or an appropriate
  package if they are cross-surface.

## Agent Rule

Before adding a route, identify whether it is a web page, mobile screen, API
router, or auth adapter. Use the matching `.ai/skills/*` procedure.
