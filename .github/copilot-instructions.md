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
| "review the UI"          | `.ai/skills/anti-slop-ui.md`        |
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

---

## Agent Skills

This repository ships reusable agent skills in `.agents/skills/` (symlinked into `.claude/skills/` and `.github/skills/`). Each skill is a folder with a `SKILL.md` describing when and how to apply it. **At the start of any task, check whether one of these skills matches the work and read its `SKILL.md` before proceeding.**

| Skill | Use when |
| ----- | -------- |
| `brainstorming` | Before any creative work — new features, components, or behavior changes. Explore intent, requirements, and design before implementation. |
| `write-a-prd` | Turning a client brief or request into a structured PRD in `issues/`. |
| `grill-me` | A relentless interview to sharpen a plan or design before building. |
| `tdd` | Building features or fixing bugs test-first with a red-green-refactor loop. |
| `improve-codebase-architecture` | Finding refactoring opportunities and deepening shallow modules to improve testability. |
| `to-tickets` | Breaking a plan, spec, or conversation into tracer-bullet tickets with blocking edges. |
| `teach` | Teaching the user a new skill or concept within this workspace. |
| `remotion-best-practices` | Any work involving Remotion video composition. |
| `reddit-automation` | Automating Reddit workflows (posting, scraping, engagement). |
| `find-skills` | The user asks "how do I do X" or wants to discover/install new agent skills. |

Skill workflow rules:

- Skills marked "use when" are auto-applicable: if the task matches, follow the skill — do not wait to be asked.
- `brainstorming` and `tdd` are default workflows for feature work: brainstorm before designing, TDD while implementing, unless the user explicitly opts out.
- When a skill conflicts with repo conventions documented elsewhere in this file, repo conventions win.
