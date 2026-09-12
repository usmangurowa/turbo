import { captureError } from "@turbo/analytics/server";
import { jobNames } from "@turbo/jobs";
import { createWorker } from "@turbo/jobs/worker";

import { env } from "./env.js";

/**
 * Jobs worker runtime. Runs beside the API from the same image
 * (`SERVER_PROCESS=worker`) or locally with `pnpm dev:worker`. It never
 * runs migrations: the API process is the only migration owner.
 */

const connectionString = env.JOBS_POSTGRES_URL;

if (!connectionString) {
  console.error(
    "JOBS_POSTGRES_URL is not set. The worker has no queue to consume; set it to the same value as POSTGRES_URL.",
  );
  process.exit(1);
}

const worker = createWorker({
  connectionString,
  onError: (error, ref) => {
    console.error(
      ref ? `[jobs] ${ref.job} ${ref.jobId} failed:` : "[jobs] error:",
      error,
    );
    captureError(
      error,
      ref ? { tags: { job: ref.job, jobId: ref.jobId } } : undefined,
    );
  },
});

const shutdown = (signal: NodeJS.Signals) => {
  console.log(`Received ${signal}, stopping jobs worker`);
  worker
    .stop()
    .then(() => process.exit(0))
    .catch((error: unknown) => {
      console.error("[jobs] failed to stop cleanly:", error);
      process.exit(1);
    });
};

process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);

await worker.start();

console.log(`Turbo jobs worker running: ${jobNames.join(", ")}`);
