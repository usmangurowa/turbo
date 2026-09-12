import type { Job } from "pg-boss";
import { PgBoss } from "pg-boss";

import type { JobName, JobPayload } from "./queues";
import { jobHandlers, jobNames } from "./handlers";
import { QUEUE_POLICY } from "./queues";

export interface JobRef {
  job: JobName;
  jobId: string;
}

export interface CreateWorkerOptions {
  /** Postgres connection string; the same database the API enqueues into. */
  connectionString: string;
  /**
   * Called for pg-boss instance errors (connection, maintenance) with no
   * `ref`, and for a handler that threw with the failing job attached.
   * The job is still failed and retried by pg-boss after this returns.
   */
  onError?: (error: Error, ref?: JobRef) => void;
  /** Called after a job completes; defaults to a console line. */
  onComplete?: (ref: JobRef) => void;
}

export interface JobWorker {
  boss: PgBoss;
  /** Start pg-boss, create every queue, and register every handler. */
  start(): Promise<void>;
  /** Let in-flight jobs finish (up to 30s), then close the connection. */
  stop(): Promise<void>;
}

const toError = (value: unknown): Error =>
  value instanceof Error ? value : new Error(String(value));

const registerJob = async <Name extends JobName>(
  boss: PgBoss,
  name: Name,
  options: Required<Pick<CreateWorkerOptions, "onError" | "onComplete">>,
): Promise<void> => {
  const handler = jobHandlers[name];

  await boss.createQueue(name, QUEUE_POLICY);
  await boss.work<JobPayload<Name>>(
    name,
    async (jobs: Job<JobPayload<Name>>[]) => {
      for (const job of jobs) {
        const ref: JobRef = { job: name, jobId: job.id };
        try {
          await handler(job.data);
          options.onComplete(ref);
        } catch (error) {
          options.onError(toError(error), ref);
          throw error;
        }
      }
    },
  );
};

/**
 * Build the jobs worker. `apps/server/src/worker.ts` is the runtime that
 * calls this; keep process concerns (signals, exit codes, env) there.
 */
export const createWorker = ({
  connectionString,
  onError = (error, ref) => {
    console.error(
      ref ? `[jobs] ${ref.job} ${ref.jobId} failed:` : "[jobs] error:",
      error,
    );
  },
  onComplete = ({ job, jobId }) => {
    console.log(`[jobs] ${job} ${jobId} completed`);
  },
}: CreateWorkerOptions): JobWorker => {
  const boss = new PgBoss({
    connectionString,
    application_name: "turbo-jobs-worker",
  });

  boss.on("error", (error) => onError(error));

  return {
    boss,
    async start() {
      await boss.start();
      for (const name of jobNames) {
        await registerJob(boss, name, { onError, onComplete });
      }
    },
    stop: () => boss.stop({ close: true, graceful: true, timeout: 30_000 }),
  };
};
