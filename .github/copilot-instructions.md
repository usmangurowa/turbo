# GitHub Copilot Instructions

> Short task-trigger map. Full procedures live in `.ai/skills/`.

## Before any task

Read `AGENTS.md`, `.ai/context/tech-stack.md`, `.ai/context/conventions.md`, `ARCHITECTURE.md`, and `ROADMAP_AI.md`.

For non-trivial work or changes touching more than three implementation files, read `.ai/skills/feature-spec.md` and create/update a spec in `.ai/specs/active/` before editing code.

## Task → Skill mapping

| When the user says...    | Read this skill                     |
| ------------------------ | ----------------------------------- |
| "create a component"     | `.ai/skills/create-component.md`    |
| "create a package"       | `.ai/skills/create-package.md`      |
| "add an endpoint"        | `.ai/skills/create-api-endpoint.md` |
| "change database schema" | `.ai/skills/database-change.md`     |
| "create a page"          | `.ai/skills/create-page.md`         |
| "write tests"            | `.ai/skills/write-tests.md`         |
| "review this"            | `.ai/skills/code-review.md`         |
| "fix this error"         | `.ai/skills/debug-failure.md`       |
| "refactor"               | `.ai/skills/refactor.md`            |
| "plan a feature"         | `.ai/skills/feature-spec.md`        |

If no exact skill matches a task, use the closest skill and follow `.ai/context/conventions.md`.

## Self-Updating Rule

If your task introduces a new pattern, convention, or dependency, update the relevant `.ai/` files in the same PR. See `.ai/skills/update-ai-memory.md`.

Before completing any task, complete the `update-ai-memory` checklist and update `.ai/` files when required.

## Key patterns

- Components: CVA + cn() + data-slot (see `packages/ui/src/components/button.tsx`)
- API: Hono routers in `packages/api/src/router/`
- DB: Drizzle schemas in `packages/db/src/`
- Tests: Vitest in `__tests__/*.test.ts`
- Contracts: generated snapshots in `.ai/contracts/*.generated.md`
