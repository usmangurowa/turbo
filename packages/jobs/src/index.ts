/**
 * @turbo/jobs — Trigger.dev task definitions.
 *
 * Tasks live in src/tasks/ (see trigger.config.ts `dirs`). Import a task's
 * type from "@turbo/jobs/tasks/<name>" when triggering from other packages
 * so job code never ends up in their runtime bundles.
 */

export {
  sendSupportEmailTask,
  type SendSupportEmailPayload,
} from "./tasks/send-support-email";
