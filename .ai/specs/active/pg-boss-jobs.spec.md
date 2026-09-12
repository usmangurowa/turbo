# Feature Spec: Background jobs on pg-boss

## Status

- State: implemented
- Owner: AI agent
- Created: 2026-09-12
- Updated: 2026-09-12

## Problem

`packages/jobs` runs background work through Trigger.dev. Trigger.dev is a
hosted service: every clone of this template needs its own Trigger.dev
project, account, and `TRIGGER_SECRET_KEY` before a single job runs, and the
free tier caps how many projects one account may hold. For a starter that is
cloned per product, that is friction the template should not impose.

The repository already runs Postgres for Drizzle. A Postgres-backed queue gives
the same guarantees the one existing task needs (persistence, retries with
backoff, scheduling) with no new service and no vendor account. Trigger.dev
stays a contained swap for later: the API talks to one `enqueue` function.

## Acceptance Criteria

- [x] `packages/jobs` no longer depends on `@trigger.dev/sdk`; `pg-boss` is
      its queue.
- [x] `packages/jobs` exposes a typed job registry (`JobPayloads`), an
      `enqueue(name, payload)` producer, and a `createWorker()` factory. Job
      handlers are plain async functions with no queue dependency, so the API
      can call them inline.
- [x] `POST /support` enqueues `send-support-email` when `JOBS_POSTGRES_URL`
      is set and runs the same handler in-process when it is empty. Existing
      behaviour without a queue is unchanged.
- [x] `apps/server` gains a worker runtime (`src/worker.ts`) that starts
      pg-boss, registers every handler in the registry, and shuts down on
      `SIGTERM`/`SIGINT`. It runs from the same Docker image as the API via
      `SERVER_PROCESS=worker`.
- [x] `TRIGGER_SECRET_KEY` is removed from `.env.example`, `turbo.json`, and
      all docs; `JOBS_POSTGRES_URL` replaces it. `pnpm ai:env:strict` passes.
- [x] Trigger-specific files are gone: `trigger.config.ts`, `GEMINI.md`, the
      `.trigger` gitignore entry, `dev:trigger` and `deploy` scripts.
- [x] Tests cover the API switch (enqueue vs inline), the handler, the
      registry, and worker registration without a live database.
- [x] `ROADMAP_AI.md`, `ARCHITECTURE.md`, `.ai/context/tech-stack.md`,
      `.ai/patterns/turbo-dev-tasks.md`, `.ai/skills/setup-project.md`, and an
      ADR record the switch; generated contracts are refreshed.

## Expected Files

| File                                                 | Expected change                                                                             |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `packages/jobs/package.json`                         | Swap `@trigger.dev/sdk` for `pg-boss`; drop `dev:trigger`/`deploy`; add exports             |
| `packages/jobs/src/queues.ts`                        | Typed job registry: names, payloads, shared queue policy                                    |
| `packages/jobs/src/tasks/send-support-email.ts`      | Plain handler + payload type (no queue import)                                              |
| `packages/jobs/src/client.ts`                        | `isJobQueueConfigured()`, `enqueue()`; lazy producer-only pg-boss                           |
| `packages/jobs/src/worker.ts`                        | `createWorker()`: start, create queues, register handlers, stop                             |
| `packages/jobs/src/index.ts`                         | Barrel                                                                                      |
| `packages/jobs/src/__tests__/*.test.ts`              | Handler, registry, client gate, worker registration                                         |
| `packages/jobs/{trigger.config.ts,GEMINI.md}`        | Delete                                                                                      |
| `packages/jobs/README.md`                            | Rewrite for pg-boss                                                                         |
| `packages/api/package.json`                          | Drop `@trigger.dev/sdk`                                                                     |
| `packages/api/src/router/support.ts`                 | Use `@turbo/jobs/client` + handler                                                          |
| `packages/api/src/__tests__/support.test.ts`         | Mock `@turbo/jobs/client`; gate on `JOBS_POSTGRES_URL`                                      |
| `apps/server/package.json`                           | Add `@turbo/jobs`; `worker` / `worker:prod` scripts                                         |
| `apps/server/src/env.ts`                             | `JOBS_POSTGRES_URL` optional; optionals follow the `packages/auth/env.ts` shape             |
| `apps/server/tsconfig.runtime.json`                  | Standalone tsx tsconfig widening `include` to workspace packages (JSX runtime)              |
| `apps/server/src/worker.ts`                          | Worker entrypoint with signal handling                                                      |
| `apps/server/Dockerfile`                             | `SERVER_PROCESS=worker` runs the worker instead of migrate + API; tsx uses runtime tsconfig |
| `.github/workflows/ci.yml`                           | Server image smoke test asserts `src/worker.ts` and `tsconfig.runtime.json`                 |
| `.ai/patterns/docker-images.md`, `README.md`         | Worker process + runtime tsconfig documented                                                |
| `.ai/context/{conventions,architecture,glossary}.md` | Background job conventions; jobs row; glossary term                                         |
| `package.json`                                       | `start:worker`, `dev:worker` root scripts                                                   |
| `.env.example`, `turbo.json`, `.gitignore`           | Env contract + ignore cleanup                                                               |
| `.ai/decisions/ADR-0004-pg-boss-jobs.md`             | Decision record                                                                             |
| `.ai/context/tech-stack.md`, `ARCHITECTURE.md`       | Background jobs row / package boundary                                                      |
| `.ai/patterns/turbo-dev-tasks.md`                    | Replace `dev:trigger` example with `worker`                                                 |
| `.ai/skills/setup-project.md`                        | Remove Trigger.dev project ID input                                                         |
| `AGENTS.md`                                          | Note the Trigger.dev skill bundle is reference-only                                         |
| `ROADMAP_AI.md`, `.ai/contracts/*.generated.md`      | Ledger row; refreshed snapshots                                                             |

## Contracts

| Contract        | Change? | Notes                                                                                      |
| --------------- | ------- | ------------------------------------------------------------------------------------------ |
| API routes      | no      | `POST /support` keeps its request/response shape.                                          |
| DB schema       | no      | pg-boss owns its own `pgboss` schema, created on worker start; not in Drizzle migrations.  |
| Env vars        | yes     | Remove `TRIGGER_SECRET_KEY`; add `JOBS_POSTGRES_URL` (optional; usually `= POSTGRES_URL`). |
| Package exports | yes     | `@turbo/jobs` adds `./client`, `./worker`, `./queues`; keeps `./tasks/*`.                  |
| UI tokens       | no      |                                                                                            |
| Agent memory    | yes     | ADR, tech stack, architecture, patterns, setup skill, roadmap.                             |

## Pseudocode

```text
1. packages/jobs
   queues.ts        JobPayloads { "send-support-email": SendSupportEmailPayload }
                    JOB_NAMES, QUEUE_POLICY { retryLimit 2, retryDelay 1s, backoff, expire 300s }
   tasks/*.ts       export handler(payload) — throws on failure so pg-boss retries
   client.ts        isJobQueueConfigured() = Boolean(JOBS_POSTGRES_URL)
                    enqueue(name, payload) → lazy PgBoss({ supervise:false, schedule:false })
                    .start() once (globalThis cache), createQueue if missing, send
   worker.ts        createWorker({ connectionString, onError }) → { start, stop }
                    start: boss.start(); for each job: createQueue + work(handler)
2. packages/api     support.ts: isJobQueueConfigured() ? enqueue(...) : sendSupportEmail(...)
3. apps/server      worker.ts: createWorker from env; SIGTERM/SIGINT → stop
                    Dockerfile CMD: SERVER_PROCESS=worker → exec tsx src/worker.ts
4. env + docs       .env.example, turbo.json, ADR-0004, tech-stack, ARCHITECTURE, ROADMAP_AI
5. validate         pnpm ai:contracts; typecheck/lint/test for jobs, api, server; format
```

## Validation Plan

- [ ] `pnpm turbo run build --filter=@turbo/jobs^... --filter=@turbo/api^... --filter=@turbo/server^... --output-logs=errors-only`
- [ ] `pnpm -F @turbo/jobs -F @turbo/api -F @turbo/server typecheck lint test`
- [ ] `pnpm ai:context && pnpm ai:env:strict`
- [ ] `pnpm docker:check`
- [ ] `pnpm format`
- [x] Manual: with `JOBS_POSTGRES_URL` set, `enqueue()` produced a `pgboss.job` row and the worker (both `pnpm worker:prod` and the `pnpm deploy` tree running the Docker CMD with `SERVER_PROCESS=worker`) logged completion, applied the retry policy to a failing job, and exited 0 on SIGTERM. Docker daemon was unavailable locally; the image build runs in CI.

## Rollback Plan

Revert the PR. No Drizzle migration is involved; the `pgboss` schema pg-boss
creates in any database it touched can be dropped with
`DROP SCHEMA pgboss CASCADE`. Leaving `JOBS_POSTGRES_URL` empty disables the
queue at runtime without a deploy.

## Notes

- `JOBS_POSTGRES_URL` is presence-gated like every other optional integration
  here (`RESEND_API_KEY`, `SENTRY_DSN`, provider keys); no boolean flag.
  Keeping it a URL rather than reusing `POSTGRES_URL` lets a deployment point
  the queue at a separate database or pool without a code change.
- The producer in the API is `supervise: false, schedule: false`: it only
  needs `send`. Maintenance, archiving, and cron scheduling run in the worker.
- pg-boss ≥ 10 requires `createQueue` before `send` and hands `work()`
  handlers an array of jobs; the registry hides both.
- The worker lives in `apps/server` (runtime) not `packages/jobs` (library),
  mirroring `apps/server` ↔ `packages/api`. It reuses the server image, so
  Coolify runs it as a second application from the same Dockerfile with
  `SERVER_PROCESS=worker`, no health check, and no exposed port.
- The old `trigger.config.ts` Sentry hook imported `@sentry/node` without
  declaring it; the worker reports failures through `@turbo/analytics/server`
  `captureError`, which is the declared server-side Sentry path.
- Trigger.dev remains a documented option: the `.agents/skills/trigger-dev-tasks/`
  reference bundle stays; re-adding it means one new `enqueue` backend.

### Found during implementation

- `tsx` applies a tsconfig's `compilerOptions` only to files inside its
  `include`, so `apps/server` compiled every `@turbo/mail` template with the
  classic JSX transform (`React is not defined`) — a latent bug for OTP and
  welcome emails sent from the standalone server. Fixed with
  `apps/server/tsconfig.runtime.json`, passed to every `tsx` call. It is
  standalone (does not extend `@turbo/tsconfig`) because the image prunes
  devDependencies and an explicit `--tsconfig` with a broken `extends` makes
  tsx fail to start, where auto-discovery had silently ignored it.
- `apps/server/src/env.ts` used the `transform(...).pipe(z.string().optional())`
  anti-pattern `.ai/patterns/turbo-dev-tasks.md` warns about, so an absent
  (not empty) `RESEND_API_KEY` crashed boot. Both optionals now follow
  `packages/auth/env.ts`.

### Deployment (turbo project on Coolify, 2026-09-12)

The queue runs on a separate Postgres instance from the app database — the
"escape hatch" this spec describes, exercised on day one:

- `infra-postgres` (shared instance, `infra` project) gained a `turbo_jobs`
  database owned by a dedicated `turbo_jobs` role with no other grants. The
  app database stays on `turbo db` in the turbo project.
- `JOBS_POSTGRES_URL` is set on `turbo server` (production scope only;
  previews send inline) and on the new `turbo worker` application.
- `turbo worker` is a second Coolify application from the same repository
  and `apps/server/Dockerfile` with `SERVER_PROCESS=worker`, no domain, health
  check disabled, and the server's watch paths. Its env mirrors the server's
  (`POSTGRES_URL`, `AUTH_SECRET`, `RESEND_API_KEY`, `SERVER_URL`, `APP_URL`)
  because `apps/server/src/env.ts` validates them at boot.
- The database was created from inside the running `turbo server` container
  (same Docker network as `infra-postgres`) via a one-off Coolify task that
  read a base64-encoded script and both credentials from temporary runtime
  env vars, then those vars were deleted. Nothing was exposed publicly and
  no secret was written into a stored command.
- Secrets live in Coolify's env store; turbo's Coolify apps do not use
  Infisical (no `INFISICAL_*` variables). To mirror `JOBS_POSTGRES_URL` into
  Infisical later, copy it from either app's environment in Coolify.
