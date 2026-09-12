import type { SendOptions } from "pg-boss";
import { PgBoss } from "pg-boss";

import type { JobName, JobPayload } from "./queues";
import { QUEUE_POLICY } from "./queues";

/**
 * Producer side of the job queue: what the API imports to enqueue work.
 *
 * Gated on JOBS_POSTGRES_URL like every other optional integration. When it
 * is empty, `isJobQueueConfigured()` is false and callers run the handler
 * in-process instead. The pg-boss instance here only sends: maintenance,
 * archiving, and cron scheduling belong to the worker (`./worker`).
 */

export const getJobsConnectionString = (): string | undefined => {
  const value = process.env.JOBS_POSTGRES_URL;
  return value && value.length > 0 ? value : undefined;
};

export const isJobQueueConfigured = (): boolean =>
  getJobsConnectionString() !== undefined;

const globalForJobs = globalThis as typeof globalThis & {
  __turboJobQueue?: Promise<PgBoss>;
};

const ensuredQueues = new Set<JobName>();

const startProducer = async (connectionString: string): Promise<PgBoss> => {
  const boss = new PgBoss({
    connectionString,
    application_name: "turbo-jobs-producer",
    max: 2,
    supervise: false,
    schedule: false,
  });

  boss.on("error", (error) => {
    console.error("[jobs] queue error:", error);
  });

  await boss.start();
  return boss;
};

/**
 * Lazily start (and cache across hot reloads) the producer connection.
 * Throws when JOBS_POSTGRES_URL is unset; check `isJobQueueConfigured()`
 * first.
 */
export const getJobQueue = (): Promise<PgBoss> => {
  const connectionString = getJobsConnectionString();
  if (!connectionString) {
    throw new Error(
      "JOBS_POSTGRES_URL is not set. Check isJobQueueConfigured() before enqueueing.",
    );
  }

  globalForJobs.__turboJobQueue ??= startProducer(connectionString).catch(
    (error: unknown) => {
      globalForJobs.__turboJobQueue = undefined;
      throw error;
    },
  );

  return globalForJobs.__turboJobQueue;
};

/**
 * Enqueue a job. Creates the queue on first use (idempotent in pg-boss) so a
 * producer never depends on the worker having started first. Resolves to
 * the job id, or null when pg-boss deduplicated it (singleton options).
 */
export const enqueue = async <Name extends JobName>(
  name: Name,
  payload: JobPayload<Name>,
  options?: SendOptions,
): Promise<string | null> => {
  const boss = await getJobQueue();

  if (!ensuredQueues.has(name)) {
    await boss.createQueue(name, QUEUE_POLICY);
    ensuredQueues.add(name);
  }

  return boss.send(name, payload, options);
};

/**
 * Stop the producer and drop the cached instance. For graceful shutdown of
 * a runtime that enqueued jobs, and for tests that need a fresh start.
 */
export const closeJobQueue = async (): Promise<void> => {
  const pending = globalForJobs.__turboJobQueue;
  globalForJobs.__turboJobQueue = undefined;
  ensuredQueues.clear();

  if (!pending) return;

  const boss = await pending.catch(() => undefined);
  await boss?.stop({ close: true, graceful: false });
};
