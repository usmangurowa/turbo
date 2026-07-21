# @turbo/jobs

Background job processing with [Trigger.dev](https://trigger.dev).

## What's here

Scaffolding only — no tasks are implemented yet. The package declares the Trigger.dev SDK dependency and reserves the workspace slot for background work.

## What's planned

Background tasks for AI summarisation, email queuing, analytics roll-ups, and any other work that should run outside the request cycle.

## Adding the first task

1. Create `src/tasks/your-task.ts` and implement a Trigger.dev task.
2. Export it from `src/index.ts`.
3. Restore the `"./tasks/*"` subpath export in `package.json`.
4. Add back any `@turbo/*` deps your task actually imports.

See the [Trigger.dev docs](https://trigger.dev/docs) for task authoring patterns.
