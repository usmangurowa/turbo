# Pattern: Vertical Slice

## Overview

To add a feature end-to-end, **copy the `task` slice**. It is the canonical
exemplar for the repo's full data path: Drizzle table → Hono router → typed
`hc<AppType>` client → TanStack Query hook → UI on web and mobile.

## The slice

| Layer | File | What it shows |
| --- | --- | --- |
| DB schema | `packages/db/src/app-schema.ts` | `pgTable` with snake_case columns, text unions for enums, user FK, timestamp conventions; re-exported from `schema.ts` |
| Migration | `packages/db/drizzle/0001_add-task-table.sql` | Generated via `pnpm --filter @turbo/db generate`, trimmed to the new table's statements |
| API router | `packages/api/src/router/task.ts` | Chained Hono router, `zValidator("json", ...)`, `authMiddleware` on writes, Drizzle query via `c.get("db")` |
| Mount | `packages/api/src/index.ts` | `.route("/tasks", taskRouter)` on the single chained expression (keep the chain or `AppType` inference degrades) |
| API tests | `packages/api/src/__tests__/task.test.ts` | Stubbed auth/db against `createApp`, async `app.request(...)` |
| Web hook | `apps/web/src/hooks/use-tasks.ts` | `useQuery` with `["tasks"]` key, fetcher through the typed client, `InferResponseType` for row types |
| Web UI | `apps/web/src/components/dashboard/tasks-table.tsx`, `stat-cards.tsx` | Map API rows → UI shape in the component layer; fall back to `sampleTasks` when the list is empty or errors |
| Mobile UI | `apps/mobile/src/app/(tabs)/index.tsx` | Same `useQuery` + typed client + sample fallback on Expo |
| Contracts | `.ai/contracts/*.generated.md` | Regenerate with `pnpm ai:contracts` after API/DB changes |

## Steps to copy

1. Add the table to `packages/db/src/app-schema.ts` (or a sibling file
   re-exported from `schema.ts`), then generate a migration.
2. Create a chained router in `packages/api/src/router/` and mount it in
   `packages/api/src/index.ts` without breaking the chain.
3. Add tests in `packages/api/src/__tests__/` using the stub pattern.
4. Add a `use-<entity>.ts` hook per app and render with a sample fallback.
5. Run `pnpm ai:contracts` and update `ROADMAP_AI.md`.

## Template affordances (change these in a real app)

- `GET /tasks` is **public** and returns `{ tasks: [] }` when the database
  is unreachable so the zero-env template keeps rendering sample data. A
  real app fork should add `authMiddleware` to GET, scope the query by
  `userId`, and surface database errors instead of swallowing them.
- Presentation concerns (`tone` cycling, today/this-week/earlier grouping,
  date formatting) live in the web mapper only. Keep the API
  presentation-agnostic.

## Anti-patterns

- Do not fetch from the database in app code — go through `@turbo/api`.
- Do not bypass the typed Hono client with raw `fetch`.
- Do not add routers as standalone statements — extend the chained
  expression so `AppType` stays inferable.
