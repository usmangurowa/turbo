# @turbo/jobs

Background jobs on [pg-boss](https://pgboss.io): a Postgres-backed queue that
lives in the database the app already runs. No account, no key, no extra
service — set `JOBS_POSTGRES_URL` (usually the same value as `POSTGRES_URL`)
and run a worker.

## Layout

| Path                        | Role                                                                    |
| --------------------------- | ----------------------------------------------------------------------- |
| `src/tasks/<name>.ts`       | One job: its payload type and a plain `async (payload) => result`       |
| `src/queues.ts`             | `JobPayloads` (queue name → payload) and the shared `QUEUE_POLICY`      |
| `src/handlers.ts`           | `jobHandlers`: queue name → handler; the compiler rejects a missing job |
| `src/client.ts`             | Producer: `isJobQueueConfigured()`, `enqueue(name, payload)`            |
| `src/worker.ts`             | `createWorker()`: starts pg-boss, creates queues, registers handlers    |
| `apps/server/src/worker.ts` | The process that runs the worker (not in this package)                  |

Handlers throw on failure; pg-boss retries them per `QUEUE_POLICY` (three
attempts, exponential backoff from 1s capped at 10s, five-minute run limit).

## Using it from the API

```ts
import { enqueue, isJobQueueConfigured } from "@turbo/jobs/client";
import { sendSupportEmail } from "@turbo/jobs/tasks/send-support-email";

if (isJobQueueConfigured()) {
  await enqueue("send-support-email", payload);
} else {
  await sendSupportEmail(payload); // no queue configured: run it now
}
```

`POST /support` in `packages/api/src/router/support.ts` is the precedent.

## Running the worker

```bash
pnpm dev:worker     # local: tsx watch, reads .env
pnpm start:worker   # production: same entry, platform env only
```

The server Docker image runs the worker when `SERVER_PROCESS=worker` is set
(`apps/server/Dockerfile`). On Coolify that is a second application from the
same repository and Dockerfile, no exposed port, health check disabled.

## Adding a job

1. Create `src/tasks/<name>.ts` exporting the payload type and the handler.
2. Add `"<name>": <Payload>` to `JobPayloads` in `src/queues.ts`.
3. Add `"<name>": <handler>` to `jobHandlers` in `src/handlers.ts`.
4. Test the handler in `src/__tests__/` with `@turbo/mail/client` (or whatever
   it calls) mocked, as `send-support-email.test.ts` does.

Cron schedules go through `boss.schedule(...)` on the worker's `boss`
instance; there is no in-repo instance yet.

## Inspecting the queue

pg-boss keeps its state in the `pgboss` schema of `JOBS_POSTGRES_URL`:

```sql
select name, state, retry_count, output from pgboss.job order by created_on desc;
```

Decision record: `.ai/decisions/ADR-0004-pg-boss-jobs.md`.
