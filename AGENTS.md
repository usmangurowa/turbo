# Agent Instructions

> Universal rules for all AI coding agents working in this repository.

## Before You Start

1. Read this file completely.
2. Read `.ai/context/tech-stack.md` for the technology stack.
3. Read `.ai/context/conventions.md` for coding conventions.
4. Read `ARCHITECTURE.md` for the repository mental model.
5. Read `ROADMAP_AI.md` before writing code or changing files.
6. Identify the matching skill in `.ai/skills/` and read it.
7. For non-trivial or cross-package work, create/update a spec with `.ai/skills/feature-spec.md`.

## Repository Overview

Full-stack TypeScript monorepo using Turborepo + pnpm workspaces.

| Directory         | Contents                                                        |
| ----------------- | --------------------------------------------------------------- |
| `apps/web`        | Next.js 16 web application                                      |
| `apps/mobile`     | Expo SDK 55 mobile app                                          |
| `packages/*`      | Shared libraries (`@turbo/*` scope)                             |
| `tooling/*`       | Shared configs (ESLint, Prettier, TypeScript, Tailwind, Vitest) |
| `.ai/`            | Agent memory: context, skills, patterns, decisions              |
| `.agents/skills/` | Deep technology reference bundles                               |
| `scripts/ai/`     | Generated contract and context helper scripts                   |

## Task Skills

Before executing a task, find and read the matching skill file:

| Task                   | Skill File                          |
| ---------------------- | ----------------------------------- |
| First-time setup       | `.ai/skills/setup-project.md`       |
| Create a component     | `.ai/skills/create-component.md`    |
| Create a package       | `.ai/skills/create-package.md`      |
| Create an app          | `.ai/skills/create-app.md`          |
| Create an API endpoint | `.ai/skills/create-api-endpoint.md` |
| Database change        | `.ai/skills/database-change.md`     |
| Create a page/screen   | `.ai/skills/create-page.md`         |
| Create a form          | `.ai/skills/create-form.md`         |
| Review or polish UI    | `.ai/skills/anti-slop-ui.md`        |
| Write tests            | `.ai/skills/write-tests.md`         |
| Write a commit message | `.ai/skills/commit-message.md`      |
| Write a PR description | `.ai/skills/pr-description.md`      |
| Review code            | `.ai/skills/code-review.md`         |
| Debug a failure        | `.ai/skills/debug-failure.md`       |
| Refactor code          | `.ai/skills/refactor.md`            |
| Non-trivial feature    | `.ai/skills/feature-spec.md`        |

Full index: `.ai/skills/00-index.md`

If no exact skill matches a task, use the closest skill and follow `.ai/context/conventions.md`.

## Mandatory: Self-Updating Rule

> **Every AI agent MUST follow this rule.**

1. If your task introduces a **new pattern, convention, dependency, or architectural decision** not already documented, you MUST — in the same PR:
   - Add or update files under `.ai/skills/`, `.ai/patterns/`, or `.ai/decisions/`
   - Update `.ai/context/conventions.md` if a convention changed
   - Update `.ai/context/tech-stack.md` if a dependency was added/removed
2. If you notice an existing skill is **outdated** or contradicted by new code, update the skill in the same PR.
3. PRs that introduce new patterns without updating AI memory should be flagged.

See: `.ai/skills/update-ai-memory.md`

Before completing any task, complete the `update-ai-memory` checklist and update `.ai/` files when required.

## AI Contract Snapshots

- Run `pnpm ai:contracts` after API, DB, env, package export, or dependency graph changes.
- Run `pnpm ai:context` to refresh the consolidated AI context pack.
- Use `pnpm ai:env` to report environment contract drift and `pnpm ai:env:strict` when drift should fail CI.

## Verifying Work

- `pnpm run ci` is the local merge gate: the same steps as
  `.github/workflows/ci.yml`, in the same order, stopping on the first failure
  (`.ai/decisions/ADR-0003-single-job-ci.md`). Invoke it as `pnpm run ci`.
- Per-package `pnpm typecheck` / `pnpm lint` need dependencies built once per
  fresh worktree: `pnpm turbo run build --filter=<pkg>^...`. Root-level
  commands handle this automatically.
- Package `dev` scripts are one-shot; never put watch mode or a long-running
  process behind `dev` (`.ai/patterns/turbo-dev-tasks.md`).

## UI Design Governance

- Before any UI task, read `DESIGN.md` and
  `.ai/patterns/ui-composition.md`.
- Work precedent-first: explicit user direction → the nearest existing route
  or component → the configured shadcn primitive → a new composition only when
  none of those solve it (`.ai/context/design-system.md`).
- Dashboard surfaces compose the house primitives in
  `apps/web/src/components/dashboard/` (`StatCard`, `TableCard`,
  `PageToolbar`, `TablePagination`, `HintLabel`, `QueryError`) and the
  `Card variant="dashed"` frame; never hand-write a dashed card on a `div`.
- `tooling/tailwind/theme.css` remains the runtime token source of truth. Any
  runtime token change must update `DESIGN.md` in the same commit.
- Authored UI uses semantic colors, the documented spacing and typography
  scales, complete composite slot anatomy, and the accessibility invariants in
  the composition grammar.
- Before completing UI work, run `pnpm design:lint`, `pnpm design:tokens`, and
  `pnpm ui:composition`.

## Key Conventions (Quick Reference)

- **Package scope**: `@turbo/*`
- **Component files**: `kebab-case.tsx` with named exports, CVA variants, `cn()`, `data-slot`
- **API routes**: Hono routers in `packages/api/src/router/`
- **DB schemas**: Drizzle `pgTable()` in `packages/db/src/`
- **Tests**: Vitest in `__tests__/<name>.test.ts`
- **Commits**: `type(scope): description` (conventional commits)
- **Formatting**: Prettier with import sorting + Tailwind class sorting
- **Forms**: `react-hook-form` + `shadcn/ui` (never `useState` for forms)
- **Specs**: Non-trivial work uses `.ai/specs/active/<slug>.spec.md` before implementation
- **UI governance**: `DESIGN.md` + `.ai/patterns/ui-composition.md`; validate with the three design scripts

## Deep References

For detailed technology guides, see `.agents/skills/`:

- TypeScript patterns → `.agents/skills/typescript-expert/`
- TanStack Query → `.agents/skills/tanstack-query/`
- Tailwind CSS → `.agents/skills/tailwind-patterns/`
- Better Auth → `.agents/skills/better-auth-best-practices/`
- Drizzle ORM → `.agents/skills/drizzle/`
- Trigger.dev → `.agents/skills/trigger-dev-tasks/` (reference only; jobs run on
  pg-boss, `.ai/decisions/ADR-0004-pg-boss-jobs.md`)
- Turborepo → `.agents/skills/turborepo/`

---

## Agent Skills

This repository ships reusable agent skills in `.agents/skills/` (symlinked into `.claude/skills/` and `.github/skills/`). Each skill is a folder with a `SKILL.md` describing when and how to apply it. **At the start of any task, check whether one of these skills matches the work and read its `SKILL.md` before proceeding.**

| Skill                           | Use when                                                                                                                                                                                                            |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `brainstorming`                 | Before any creative work — new features, components, or behavior changes. Explore intent, requirements, and design before implementation.                                                                           |
| `write-a-prd`                   | Turning a client brief or request into a structured PRD in `issues/`.                                                                                                                                               |
| `grill-me`                      | A relentless interview to sharpen a plan or design before building.                                                                                                                                                 |
| `tdd`                           | Building features or fixing bugs test-first with a red-green-refactor loop.                                                                                                                                         |
| `improve-codebase-architecture` | Finding refactoring opportunities and deepening shallow modules to improve testability.                                                                                                                             |
| `to-tickets`                    | Breaking a plan, spec, or conversation into tracer-bullet tickets with blocking edges.                                                                                                                              |
| `teach`                         | Teaching the user a new skill or concept within this workspace.                                                                                                                                                     |
| `remotion-best-practices`       | Any work involving Remotion video composition.                                                                                                                                                                      |
| `reddit-automation`             | Automating Reddit workflows (posting, scraping, engagement).                                                                                                                                                        |
| `find-skills`                   | The user asks "how do I do X" or wants to discover/install new agent skills.                                                                                                                                        |
| `codebase-first`                | ALWAYS-ON for any code change: the codebase decides, never invent — follow documented rules and existing patterns, ask when neither exists.                                                                         |
| `selective-routing`             | Before spawning any sub-agent, and for multi-file or high-risk feature work: declare a route (solo/delegate/audit/full) first. Solo is the default; sub-agent output is a claim until you verify the diff yourself. |
| `shadcn`                        | Any shadcn/ui work: adding, composing, styling, or debugging components via the shadcn CLI and registry.                                                                                                            |
| `writing-style`                 | Always-on for prose: READMEs, docs, PR descriptions, commit messages, reports, UI and marketing copy.                                                                                                               |

Skill workflow rules:

- `writing-style` is always-on: apply its prose rules to every README, doc, PR description, commit message, and report without being asked.
- `codebase-first` is always-on for code: before writing any code, follow its checklist — documented rules and existing patterns decide everything; never invent, ask when neither exists.
- Skills marked "use when" are auto-applicable: if the task matches, follow the skill — do not wait to be asked.
- `brainstorming` and `tdd` are default workflows for feature work: brainstorm before designing, TDD while implementing, unless the user explicitly opts out.
- When a skill conflicts with repo conventions documented elsewhere in this file, repo conventions win.

---

## Marketing Skills

This repository also ships a curated subset of the [coreyhaines31/marketingskills](https://skills.sh/coreyhaines31/marketingskills) pack in `.agents/skills/` (symlinked into `.claude/skills/` and `.github/skills/`). Use these whenever the task is marketing-related rather than engineering-related.

Start here:

- `product-marketing` — run this FIRST for any marketing work: it reads the codebase/product and produces the positioning, ICP, and messaging context the other skills consume.

Then pick the matching skill, e.g.: `copywriting`, `copy-editing`, `social`, `ad-creative`, `ads`, `emails`, `launch`, `landing-pages` (via `cro`), `seo-audit`, `ai-seo`, `programmatic-seo`, `schema`, `content-strategy`, `marketing-ideas`, `marketing-psychology`, `image`, `video`, `analytics`, `ab-testing`, `pricing`, `paywalls`, `onboarding`, `referrals`, `churn-prevention`, `competitor-profiling`, `competitors`, `customer-research`, and more — each skill's `SKILL.md` frontmatter describes exactly when to use it.

Rules:

- For flyers/graphics use `image`; for promo videos use `video`; for social posts use `social`; for ad copy use `ad-creative`.
- Always ground marketing output in `product-marketing` results so copy reflects what the product actually does.
