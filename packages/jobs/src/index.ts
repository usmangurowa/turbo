/**
 * @turbo/jobs — background jobs on pg-boss.
 *
 * - Handlers live in src/tasks/ and are plain async functions.
 * - src/queues.ts is the typed registry of job names and payloads.
 * - "@turbo/jobs/client" is the producer (`enqueue`); import it from the API.
 * - "@turbo/jobs/worker" builds the worker; apps/server/src/worker.ts runs it.
 *
 * This root barrel stays free of pg-boss so importing a handler for the
 * in-process fallback never loads a connection pool.
 */

export {
  jobHandlers,
  jobNames,
  type JobHandler,
  type JobHandlers,
} from "./handlers";
export {
  QUEUE_POLICY,
  type JobName,
  type JobPayload,
  type JobPayloads,
} from "./queues";
export {
  sendSupportEmail,
  type SendSupportEmailPayload,
} from "./tasks/send-support-email";
