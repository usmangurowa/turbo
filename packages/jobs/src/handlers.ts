import type { JobName, JobPayload } from "./queues";
import { sendSupportEmail } from "./tasks/send-support-email";

export type JobHandler<Name extends JobName> = (
  payload: JobPayload<Name>,
) => Promise<unknown>;

export type JobHandlers = { [Name in JobName]: JobHandler<Name> };

/**
 * Queue name → handler. The worker registers one pg-boss worker per entry;
 * the API calls the same functions directly when no queue is configured.
 */
export const jobHandlers: JobHandlers = {
  "send-support-email": sendSupportEmail,
};

export const jobNames = Object.keys(jobHandlers) as JobName[];
