import type { Queue } from "pg-boss";

import type { SendSupportEmailPayload } from "./tasks/send-support-email";

/**
 * Every background job, keyed by its pg-boss queue name.
 *
 * Adding a job: add its payload here, implement the handler in
 * `src/tasks/<name>.ts`, and register it in `src/handlers.ts`. The compiler
 * refuses a registry that is missing a job.
 */
export interface JobPayloads {
  "send-support-email": SendSupportEmailPayload;
}

export type JobName = keyof JobPayloads;

export type JobPayload<Name extends JobName> = JobPayloads[Name];

/**
 * Policy applied to every queue on creation: three attempts total with
 * exponential backoff from 1s capped at 10s, and a five minute run limit.
 */
export const QUEUE_POLICY = {
  retryLimit: 2,
  retryDelay: 1,
  retryBackoff: true,
  retryDelayMax: 10,
  expireInSeconds: 300,
} satisfies Omit<Queue, "name">;
