# ADR-0004: Background jobs run on pg-boss, not Trigger.dev

## Status

Accepted (2026-09-12).

## Context

`packages/jobs` was built on Trigger.dev: one task (`send-support-email`), a
`trigger.config.ts`, and an API route that called `tasks.trigger()` when
`TRIGGER_SECRET_KEY` was set and sent the email in-process otherwise.

Trigger.dev is a hosted service. Every clone of this template needs its own
Trigger.dev project, account, and secret before a single background job runs,
and the free tier caps how many projects one account may hold. This repository
is a starter that is cloned once per product, so that cost is paid on every
clone. The repository already runs Postgres for Drizzle, and the one existing
job needs nothing a Postgres-backed queue cannot provide: durable jobs,
retries with backoff, a run-time limit, and (later) cron schedules.

Two side facts shaped the shape of the fix:

- `trigger.config.ts` imported `@sentry/node` without declaring it, so its
  Sentry failure hook only worked by hoisting accident.
- The standalone server runs source with `tsx`, and `tsx` applies a
  tsconfig's `compilerOptions` only to files inside that tsconfig's `include`.
  `apps/server/tsconfig.json` includes `src` alone, so every `@turbo/mail`
  template (OTP, welcome, support) compiled with the classic JSX transform and
  threw `React is not defined` when rendered from `apps/server`. Nothing had
  exercised that path until a worker in `apps/server` rendered a template.

## Decision

1. **pg-boss is the queue.** `packages/jobs` depends on `pg-boss` and nothing
   Trigger-specific. Queue state lives in the `pgboss` schema of the database
   named by `JOBS_POSTGRES_URL`, created by pg-boss on first start and kept
   outside Drizzle migrations.
2. **`JOBS_POSTGRES_URL` is the switch.** Presence-gated like every other
   optional integration here (`RESEND_API_KEY`, `SENTRY_DSN`, provider keys).
   Empty means "run the handler in the request"; set means "enqueue, a worker
   will run it". It is a URL rather than a flag so a deployment can point the
   queue at a separate database or pool without a code change; usually it
   equals `POSTGRES_URL`.
3. **Handlers are plain functions.** `src/tasks/<name>.ts` exports a payload
   type and an `async (payload) => result` that throws on failure. The API
   imports the same function for the inline path, so there is one
   implementation of each job, not two.
4. **A typed registry ties it together.** `src/queues.ts` declares
   `JobPayloads` (queue name → payload) and `QUEUE_POLICY` (three attempts,
   exponential backoff from 1s capped at 10s, five-minute run limit — the old
   Trigger defaults). `src/handlers.ts` maps every name to its handler; the
   compiler rejects a missing entry.
5. **Producer and worker are separate modules.** `@turbo/jobs/client` is
   send-only (`supervise: false`, `schedule: false`, small pool, cached on
   `globalThis` across hot reloads). `@turbo/jobs/worker` builds the pg-boss
   instance that runs maintenance, creates queues, and registers handlers.
   Both call `createQueue` (idempotent in pg-boss) so neither depends on the
   other having started first.
6. **The worker runtime lives in `apps/server`.** `apps/server/src/worker.ts`
   is to `packages/jobs` what `apps/server/src/index.ts` is to `packages/api`:
   a thin process entry that owns env, signals, and exit codes. It runs from
   the same Docker image as the API — `SERVER_PROCESS=worker` swaps the CMD to
   the worker and skips migrations, so the API process stays the only
   migration owner. Locally: `pnpm dev:worker`.
7. **`tsx` runs with `tsconfig.runtime.json`.** Every `tsx` invocation in
   `apps/server` (scripts and Dockerfile) passes
   `--tsconfig tsconfig.runtime.json`, which extends `tsconfig.json` and
   widens `include` to `../../packages/*/src` (workspace) and
   `node_modules/@turbo/*/src` (the flattened `pnpm deploy` image). `tsc`,
   ESLint, and editors keep using `tsconfig.json`.
8. **Failures report through `@turbo/analytics/server`.** The worker passes
   handler errors to `captureError` with the job name and id as tags, then
   rethrows so pg-boss applies the retry policy.

## Consequences

### Positive

- A clone needs no account, key, or project quota to run background jobs;
  the zero-env template still sends the support email inline.
- One fewer service to run and one fewer bill: the queue is a schema in the
  database the app already has.
- Jobs can be enqueued inside a Drizzle transaction later (`fromDrizzle`
  adapter) — something a remote queue cannot offer.
- The `React is not defined` bug in the standalone server's mail path is
  fixed for OTP and welcome emails too, not only for the worker.
- Adding Trigger.dev back, or BullMQ, is one new implementation of `enqueue`
  plus a worker entry; the API and handlers do not change.

### Negative

- No hosted dashboard or run explorer. Inspect `pgboss.job` directly, or add
  pg-boss's dashboard package when the need is real.
- Workers poll Postgres (default interval two seconds), so jobs start with a
  small delay a push-based queue would not have. Fine for email; revisit for
  latency-sensitive work.
- Job load shares the application database. `QUEUE_POLICY` and pg-boss's
  archival defaults keep the tables small; a busy queue can move to its own
  database by changing `JOBS_POSTGRES_URL`.
- A worker is one more process to deploy. The same image and a single env var
  keep that cheap, but it is not zero.

## References

- `.ai/specs/active/pg-boss-jobs.spec.md`
- `packages/jobs/src/{queues,handlers,client,worker}.ts`
- `apps/server/src/worker.ts`, `apps/server/tsconfig.runtime.json`,
  `apps/server/Dockerfile`
- `packages/api/src/router/support.ts`
- `.agents/skills/trigger-dev-tasks/` — kept as a reference bundle for the day
  Trigger.dev is wanted again
