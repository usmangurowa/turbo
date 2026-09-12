# AI Context Pack

> Generated file. Do not edit by hand.
> Run `pnpm ai:context` to refresh this generated file.

## AGENTS.md

````md
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
````

## ARCHITECTURE.md

````md
# Architecture

This repository is a full-stack TypeScript monorepo. Deployable apps live in
`apps/`; shared capabilities live in `packages/`; shared toolchain configuration
lives in `tooling/`.

## Mental Model

- `apps/web` is the Next.js App Router application and public web runtime.
- `apps/server` is the standalone Node/Hono runtime for the shared API app and
  hosts the jobs worker entrypoint.
- `apps/mobile` is the Expo Router mobile application.
- `packages/api` owns business API routes through Hono routers.
- `packages/auth` owns Better Auth runtime configuration and auth generation.
- `packages/db` owns Drizzle/Postgres schema and database clients.
- `packages/ui` owns shared web UI components following shadcn/ui patterns.
- `packages/validators` owns shared Zod contracts.
- `packages/jobs` owns pg-boss background jobs: typed queue registry, plain
  handler functions, the `enqueue` producer, and the worker factory.
  `apps/server/src/worker.ts` is the process that runs the worker
  (`.ai/decisions/ADR-0004-pg-boss-jobs.md`).
- `tooling/*` owns reusable ESLint, Prettier, TypeScript, Tailwind, and Vitest
  configuration.

## Request Flow

```text
Web or mobile UI
  -> typed Hono RPC client
  -> packages/api/src/router/*
  -> validators, auth, db, jobs, mail, analytics
  -> typed JSON response
```

The web app mounts the Hono API in `apps/web/src/app/api/[[...route]]/route.ts`.
The standalone server hosts the same API app from `apps/server` under `/api` and
keeps a root `/health` runtime check. Better Auth handlers are mounted under
`/api/auth/*` by each runtime. Business logic belongs in
`packages/api/src/router/`, not in app-local API route handlers or runtime
entrypoints. Adapters for external APIs, when a feature needs one, live beside
the routers in `packages/api/src/providers/` and hold no business logic
(`.ai/patterns/external-provider-boundary.md`; none exist yet). The API app is
created in `packages/api/src/index.ts` and exports `AppType` for typed clients.

## Frontend Data Flow

- Use server components by default in `apps/web/src/app` when no client
  interactivity is needed.
- Use the typed Hono client for API calls.
- Use TanStack Query for client-side server state.
- Use Zustand only for shared client-side UI state.
- Use `react-hook-form` with Zod resolvers for forms.
- Use route params/search params for URL state.

## Backend Boundaries

- Hono routers live in `packages/api/src/router/` and use `Hono<AppContext>`.
- Runtime entrypoints such as `apps/web` and `apps/server` may host the shared
  API app, but must not own business API logic.
- Protected routes apply `authMiddleware` or another explicit auth guard.
- Shared request/response validation lives in `packages/validators` when reused
  across packages or apps.
- Drizzle schemas live in `packages/db/src/*-schema.ts` and are exported through
  `packages/db/src/schema.ts` or `packages/db/src/index.ts`.
- Better Auth schema changes are generated with `pnpm auth:generate`.

## Package Boundaries

- Apps may import packages.
- Packages must not import from apps.
- Package public APIs are declared in each package's `package.json` `exports`
  field.
- Internal packages use the `@turbo/*` scope and ESM.

## Agent Context Sources

- Universal workflow: `AGENTS.md`
- Tool-specific entrypoints: `.github/copilot-instructions.md`, `CLAUDE.md`,
  `.cursor/rules/*.mdc`
- Repo facts: `.ai/context/*`
- Task procedures: `.ai/skills/*`
- Patterns: `.ai/patterns/*`
- Architecture decisions: `.ai/decisions/*`
- Generated contract snapshots: `.ai/contracts/*.generated.md`
- Active implementation ledger: `ROADMAP_AI.md`

When these sources conflict, prefer observed code and package configuration,
then update the stale documentation in the same change.
````

## ROADMAP_AI.md

````md
# AI Roadmap Ledger

This file is the agent-readable implementation ledger. Every coding agent should
read it before non-trivial work and update it after changes that affect features,
architecture, contracts, or conventions.

## Current Focus

- Phase: Phase 1 - Template Hardening
- Active initiative: Inherit silo's design language and AI rules
- Last updated: 2026-09-12

## Active Sprint

| ID     | Status   | Task                                                 | Files                                                                                                            | Validation                                                      |
| ------ | -------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| AI-001 | complete | Bootstrap AI-native repository controls              | `AGENTS.md`, `.ai/`, `.github/`, `.cursor/`, `ARCHITECTURE.md`, `system_prompt.md`                               | `pnpm ai:contracts`                                             |
| AI-002 | complete | Sync stale public documentation with package reality | `README.md`, `.env.example`, `turbo.json`                                                                        | `pnpm ai:env:strict`                                            |
| AI-003 | complete | Add generated contract snapshots for agents          | `.ai/contracts/*.generated.md`, `scripts/ai/*`                                                                   | `pnpm ai:contracts`                                             |
| AI-004 | complete | Enforce fresh AI contract snapshots in CI            | `.github/workflows/ci.yml`, `package.json`                                                                       | `pnpm ai:contracts:check`                                       |
| AI-005 | complete | Enforce design language and UI composition           | `DESIGN.md`, `.ai/patterns/ui-composition.md`, `scripts/ai/check-*.mjs`                                          | `pnpm design:lint && pnpm design:tokens && pnpm ui:composition` |
| AI-006 | complete | Inherit silo design language + AI rules              | `packages/ui/src/components/{card,badge,theme}.tsx`, `apps/web/src/components/dashboard/*`, `DESIGN.md`, `.ai/*` | `pnpm run ci`                                                   |

## Implemented Features

| Date       | Feature                                                                                         | Files                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ---------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-05-17 | Agent-native memory foundation                                                                  | `AGENTS.md`, `.ai/`, `.github/copilot-instructions.md`, `.cursor/rules/*`, `CLAUDE.md`                                                                                                                                                                                                                                                                                                                                                                                                                                | `.ai/` is the source of truth for agent context.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-05-17 | Task-oriented agent skills                                                                      | `.ai/skills/*`, `.github/prompts/*`, `.claude/commands/*`                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Common tasks route through explicit procedures.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-05-17 | Generated AI contract snapshots                                                                 | `.ai/contracts/*.generated.md`, `scripts/ai/*`, `package.json`                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Agents can inspect API, DB, env, package export, and dependency graph facts without guessing.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-05-17 | Spec-first workflow                                                                             | `.ai/skills/feature-spec.md`, `.ai/specs/_template.spec.md`, `.github/prompts/new-feature-spec.prompt.md`                                                                                                                                                                                                                                                                                                                                                                                                             | Non-trivial work has an explicit planning and validation template.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-06-30 | Standalone server runtime                                                                       | `apps/server`, `packages/auth/src/trusted-origins.ts`, `.env.example`, `turbo.json`                                                                                                                                                                                                                                                                                                                                                                                                                                   | `apps/server` hosts the existing `@turbo/api` app without moving API business logic.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-07-14 | Anti-slop UI skill                                                                              | `.ai/skills/anti-slop-ui.md`, `.ai/skills/00-index.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `.cursor/rules/design-system.mdc`                                                                                                                                                                                                                                                                                                                                                                             | UI review and page-polish tasks now have a repo-local quality bar for avoiding generic AI UI patterns while preserving the neutral product baseline.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-07-15 | Full anti-slop reference                                                                        | `.ai/references/pols-anti-slop-design-law.md`, `.ai/skills/anti-slop-ui.md`                                                                                                                                                                                                                                                                                                                                                                                                                                           | The full external design law is vendored separately and linked from the concise repo-local UI workflow.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-07-22 | Design system rebuild (web + ui + mobile)                                                       | `tooling/tailwind/theme.css`, `packages/ui/src/*`, `packages/assets/fonts/*`, `apps/web/src/*`, `apps/mobile/src/*`                                                                                                                                                                                                                                                                                                                                                                                                   | Neutral `#161616` dark / `#FAFAFA` light palette, `#0659FF` accent, Inter Display, radius 0.75rem. `packages/ui` regenerated with shadcn CLI (`radix-maia`, 60 components, exports `./components/*` `./lib/*` `./hooks/*`). Web rebuilt: landing, 6 auth pages, dashboard (collapsible sidebar, ⌘K, dashed stat cards, grouped tasks table, integrations). Mobile aligned: Inter fonts, token-driven tab bar, segmented theme switcher. Spec: `.ai/specs/active/design-system-rebuild.spec.md`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-07-23 | Skills bundle sync check                                                                        | `scripts/ai/check-skills-sync.mjs`, `package.json`, `.github/workflows/ci.yml`                                                                                                                                                                                                                                                                                                                                                                                                                                        | `pnpm skills:check` verifies every tool-specific skill mirror (`.claude`, `.github` full; `.cursor`, `.codex`, `.gemini` subsets) is valid symlinks into `.agents/skills/`, and CI fails on missing, dangling, or unknown entries.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-07-23 | Support email flow via Trigger.dev (superseded 2026-09-12: pg-boss, ADR-0004)                   | `packages/jobs/src/tasks/send-support-email.ts`, `packages/api/src/router/support.ts`, `packages/api/src/__tests__/support.test.ts`, `.env.example`, `turbo.json`                                                                                                                                                                                                                                                                                                                                                     | POST /support now requires auth and sends the SupportEmail template: enqueued via the `send-support-email` Trigger.dev task when `TRIGGER_SECRET_KEY` is set, otherwise sent in-process via `@turbo/mail` (mock-logged without `RESEND_API_KEY`). Recipient is `SUPPORT_INBOX_EMAIL` falling back to `DEFAULT_FROM`; the API imports the task as a type only.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-07-23 | Tasks tracer-bullet vertical slice                                                              | `packages/db/src/app-schema.ts`, `packages/db/drizzle/0001_add-task-table.sql`, `packages/api/src/router/task.ts`, `packages/api/src/__tests__/task.test.ts`, `apps/web/src/hooks/use-tasks.ts`, `apps/web/src/components/dashboard/tasks-table.tsx`, `apps/web/src/components/dashboard/stat-cards.tsx`, `apps/mobile/src/app/(tabs)/index.tsx`, `.ai/patterns/vertical-slice.md`                                                                                                                                    | First feature travelling the full DB → API → typed client → TanStack Query path on web and mobile. GET /tasks is public and returns an empty list when the database is unavailable; the dashboard and mobile home fall back to sample data, so the zero-env template keeps rendering. Copy this slice to add a feature end-to-end (see `.ai/patterns/vertical-slice.md`).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-07-23 | API keys management (router + settings UI)                                                      | `packages/api/src/router/api-key.ts`, `packages/api/src/__tests__/api-key.test.ts`, `apps/web/src/hooks/use-api-keys.ts`, `apps/web/src/components/dashboard/api-keys-card.tsx`, `apps/web/src/app/dashboard/settings/page.tsx`, `apps/web/src/app/dashboard/[section]/page.tsx`                                                                                                                                                                                                                                      | List/create/revoke API keys, delegated entirely to Better Auth's apiKey plugin (`auth.listApiKeys` / `createApiKey` / `deleteApiKey` with forwarded session headers — no direct `apikey` table access, no custom crypto). The plaintext key appears exactly once, in the 201 create response, and the settings dialog shows it once with copy-to-clipboard. GET maps to a safe DTO that never includes the `key` hash. `/dashboard/settings` is a static route; the `settings` slug is filtered out of the `[section]` `generateStaticParams`. Signed out, the card renders a sign-in empty state (zero-env safe).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-07-23 | Streaming AI assistant (endpoint + web page)                                                    | `packages/ai/src/client.ts`, `packages/ai/src/__tests__/get-default-model.test.ts`, `packages/api/src/router/ai.ts`, `packages/api/src/__tests__/ai.test.ts`, `apps/web/src/components/dashboard/assistant-view.tsx`, `apps/web/src/app/dashboard/assistant/page.tsx`, `apps/web/src/app/dashboard/[section]/page.tsx`                                                                                                                                                                                                | First demonstration of `packages/ai` in app code and of streaming through the Hono → typed-client stack. POST /ai/chat requires auth and streams plain text via `streamText().toTextStreamResponse()`; with no provider key it returns 503 with a hint naming the three env vars, and the assistant page renders sign-in / setup empty states instead of crashing (zero-env safe). Provider preference (google → groq → openrouter) lives in `getDefaultModel()` in `@turbo/ai/client` — change it there, never in routers. Conversations are stateless (no persistence). Future streaming endpoints should copy the 503-fallback + raw-Response pattern.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-07-26 | Vercel AI Elements kit in @turbo/ui                                                             | `packages/ui/src/components/ai-elements/*` (30 components), `packages/ui/package.json`, `packages/ui/eslint.config.ts`, `.ai/context/tech-stack.md`, `.ai/context/conventions.md`                                                                                                                                                                                                                                                                                                                                     | Full AI Elements catalogue (conversation, message, prompt-input, reasoning, tool, sources, canvas, etc.) vendored from `https://registry.ai-sdk.dev` via the shadcn CLI into `components/ai-elements/`; components import existing `@turbo/ui` primitives (button, tooltip, …) through the components.json aliases, so no primitives were duplicated or overwritten. Patched for AI SDK v7 (`outputTokenDetails.reasoningTokens`, `inputTokenDetails.cacheReadTokens`) and strict tsconfig; scoped eslint relaxations for the folder. `message.tsx` (layout primitive) and `ai-elements/message.tsx` (AI SDK chat message) intentionally coexist. Spec: `.ai/specs/active/ai-elements-integration.spec.md`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 2026-07-27 | Assistant chat rendered with AI Elements                                                        | `apps/web/src/components/dashboard/assistant-view.tsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                | First consumer of the vendored ai-elements kit: the dashboard assistant message list now uses `Conversation`/`ConversationContent`/`ConversationScrollButton` (stick-to-bottom autoscroll via `use-stick-to-bottom`), `Message`/`MessageContent` (`from` prop replaces the old `align`/`Bubble` styling), `MessageResponse` (Streamdown markdown for assistant replies), and `Loader` for the pre-stream placeholder. User content stays plain text; the typed Hono client + manual ReadableStream reader, react-hook-form composer, and 401/503 handling are unchanged — `@ai-sdk/react` useChat was deliberately NOT introduced (v7 UIMessage protocol conflicts with the endpoint's plain-text `toTextStreamResponse()`). The file-local empty state was renamed `AssistantEmptyState` to avoid colliding with ai-elements' `ConversationEmptyState` export.                                                                                                                                                                                                                                                                                                                      |
| 2026-09-02 | Structural design governance                                                                    | `DESIGN.md`, `.ai/patterns/ui-composition.md`, `scripts/ai/check-design-tokens.mjs`, `scripts/ai/check-ui-composition.mjs`, `.github/workflows/ci.yml`                                                                                                                                                                                                                                                                                                                                                                | Structured Restraint now has a machine-readable runtime-token mirror, a normative composition grammar, and zero-dependency CI checks. Authored UI must use complete Card/overlay/Avatar anatomy, accessible icon actions, semantic colors, the shared spacing/type scales, and standard state primitives. Runtime token changes update `DESIGN.md` in the same commit.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 2026-09-05 | Slim multi-stage Docker images (web + server)                                                   | `.dockerignore`, `apps/web/Dockerfile`, `apps/server/Dockerfile`, `apps/web/next.config.js`, `apps/server/package.json`, `packages/db/package.json`, `.ai/patterns/docker-images.md`, `README.md`                                                                                                                                                                                                                                                                                                                     | Additional deploy path for Coolify / any container host; Vercel and `pnpm start:server` unchanged. Web ships Next standalone output (`output: "standalone"` gated on `DOCKER_BUILD=1`) and boots `node apps/web/server.js`; server ships `pnpm deploy --prod --legacy` output and boots `drizzle.mjs migrate` → `tsx src/index.ts`, the same chain as root `start:server`. `tsx` and `drizzle-kit` moved to `dependencies` so `--prod` keeps them. No Infisical or dotenv in the images. Spec: `.ai/specs/active/slim-docker-images.spec.md`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-09-05 | Fresh-database migration baseline + Docker contract CI                                          | `packages/db/drizzle/0000_baseline_auth_schema.sql` (new), `packages/db/drizzle/0000_migrate_apikey_reference_id.sql` (guarded), `packages/db/drizzle/meta/_journal.json`, `packages/db/src/__tests__/migrations.test.ts` (new), `scripts/ai/check-docker-contract.mjs` (new), `.github/workflows/ci.yml` (`docker:check` step + `docker` build job)                                                                                                                                                                  | `pnpm db:migrate` now bootstraps an empty database: a baseline entry dated before `0000` creates the Better Auth tables only when no `user` table exists, and `0000` is wrapped in a guard that no-ops unless the legacy `apikey.user_id` column is present; existing databases are untouched. `pnpm docker:check` fails CI when Dockerfile `NODE_VERSION`/`PNPM_VERSION` drift from `.nvmrc`/`packageManager` or `NEXT_PUBLIC_*` `ARG`s drift from `apps/web/src/env.ts`. CI `docker` matrix job builds both images with GHA cache and smoke-tests them.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-09-05 | Infisical secrets at container boot                                                             | `scripts/infisical-run.sh` (new), `apps/web/Dockerfile`, `apps/server/Dockerfile`, `package.json` (`with-secrets`, `dev:infisical`), `.env.example`, `README.md`, `.ai/patterns/docker-images.md`                                                                                                                                                                                                                                                                                                                     | Both images now boot through `scripts/infisical-run.sh` with the Infisical CLI baked in (`pnpm rebuild @infisical/cli` in `deps`, binary copied to `/usr/local/bin`). Credential order: machine identity (`INFISICAL_CLIENT_ID`/`SECRET`) → `INFISICAL_TOKEN` → CI passthrough → local login → plain env with a warning, so a container with only platform env vars still boots. Project from `INFISICAL_PROJECT_ID` or `.infisical.json`; env slug from `INFISICAL_ENV`. Root `with-secrets`/`dev:infisical` use the same wrapper, so local and production share one contract.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 2026-09-11 | Silo design language + house primitives                                                         | `packages/ui/src/components/card.tsx` (`variant="dashed"`), `badge.tsx` (`success`/`warning`, `size`), `theme.tsx` (one-click toggle), `packages/ui/src/__tests__/registry-patches.test.ts`, `apps/web/src/components/dashboard/{stat-card,table-card,table-pagination,page-toolbar,hint-label,query-error}.tsx`, `stat-cards.tsx`, `tasks-table.tsx`, `api-keys-card.tsx`, `integrations.tsx`, `overview-view.tsx`, `DESIGN.md`, `.ai/context/design-system.md`, `.ai/patterns/ui-composition.md`                    | Back-ported from `usmangurowa/silo`. The dashed border is now a documented `Card` registry patch instead of hand-written `div` classes; `StatCard`, `TableCard`, `TablePagination`, `PageToolbar`, `HintLabel`, and `QueryError` are the house recipes every dashboard screen composes. `Badge` gains `success`/`warning` status variants and an `xs`/`sm` size axis; `ThemeToggle` flips the resolved theme in one click. Runtime tokens and `DESIGN.md` front matter are unchanged; the prose documents dashed frames, flat-first depth, squircle tiles, status-badge rules, and the precedent-first UI workflow. Silo's finance-only category palette was deliberately not ported. Spec: `.ai/specs/active/inherit-silo-design-and-rules.spec.md`.                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2026-09-11 | Generic AI rules + tooling inherited from silo                                                  | `AGENTS.md`, `.ai/context/conventions.md`, `.ai/patterns/turbo-dev-tasks.md` (new), `.ai/patterns/external-provider-boundary.md` (new), `.ai/specs/README.md` (new), `.ai/decisions/ADR-0003-single-job-ci.md` (new), `.ai/skills/{anti-slop-ui,create-page,debug-failure,feature-spec,pr-description,setup-project,write-tests}.md`, `.github/workflows/ci.yml`, `tooling/github/setup/action.yml`, `package.json` (`ci`, `dev`), `packages/{ai,analytics,mail,shared,jobs}/package.json`, `.gitignore`, `README.md` | CI is one Node job mirrored by `pnpm run ci` (ADR-0003); the setup action caches the pnpm store and drops the global turbo install. Package `dev` scripts are one-shot `tsc` (`tsc --watch` and the trigger.dev loop blocked `turbo watch dev` via `dependsOn: ["^dev"]`); trigger.dev moved to `pnpm -F @turbo/jobs dev:trigger`; root `dev` excludes the interactive mobile task. Spec lifecycle: finished specs stay in `active/` as `implemented`, archive only when no longer decision-relevant. Committed `.playwright-mcp/` browser artifacts removed and ignored.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-09-11 | Review round: test harnesses, hydration-safe toggle, landing on Card                            | `apps/web/vitest.config.ts`, `apps/web/src/__tests__/*.test.tsx`, `packages/ui/src/__tests__/theme.test.tsx`, `packages/ui/vitest.config.ts`, `packages/ui/src/components/theme.tsx`, `apps/web/src/components/dashboard/{table-card,stat-card,hint-label,query-error,api-keys-card,integrations,nav-user}.tsx`, `apps/web/src/app/page.tsx`, `.github/workflows/ci.yml`, `.ai/decisions/ADR-0003-single-job-ci.md`, `.ai/skills/write-tests.md`                                                                      | `apps/web` gains a node-only Vitest harness (`renderToStaticMarkup`, `oxc` automatic JSX, `@` alias) and `packages/ui` a jsdom hydration harness; `ThemeToggle` decides its direction only after mount (neutral SSR label, no hydration mismatch) and the user menu offers "Use system theme"; `StatCard` `href` is a stretched link (label anchor + overlay, no button inside the anchor); `TableCard` titles are real headings at the `title` role; the landing page's feature grids and CTA compose `Card`; CI steps run only after Setup succeeds and the docker job has a 30-minute cap. Reviews: Copilot PR review + five persona reviews on #11.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-09-12 | Env contract classifies required/optional per runtime; repo linked to Infisical `turbo` project | `scripts/ai/check-env-contract.mjs`, `.ai/contracts/env.generated.md`, `.infisical.json`, `README.md`, `.ai/context/conventions.md`                                                                                                                                                                                                                                                                                                                                                                                   | The generated env contract now derives required vs optional from the zod schemas in `apps/*/src/env.ts` and `packages/auth/env.ts` (plus `apps/mobile/src/types/env.d.ts`), names the runtime (`web`, `server`, `worker`, `mobile`) or reading package for each `.env.example` variable, marks client-bundle exposure, and lists the required set per runtime (only `POSTGRES_URL` + `AUTH_SECRET` today). EAS-profile variables in `apps/mobile/eas.json` are recognised and excluded from drift; a new drift check fails on schema entries missing from `.env.example`. `.infisical.json` links the repo to the new Infisical project `turbo` (`78e4f00e-…`, `dev`/`staging`/`prod`); `prod` is seeded with the seven live values (incl. `JOBS_POSTGRES_URL`). Coolify apps still read their own env store.                                                                                                                                                                                                                                                                                                                                                                        |
| 2026-09-12 | Infisical environment drift check (`pnpm ai:env:infisical`)                                     | `scripts/ai/check-infisical-env.mjs` (new), `scripts/ai/_env.mjs` (new), `scripts/ai/__tests__/check-infisical-env.test.mjs` (new), `scripts/ai/check-env-contract.mjs`, `package.json`, `turbo.json`, `README.md`, `.ai/context/conventions.md`, `.ai/skills/debug-failure.md`, `.ai/specs/active/infisical-env-drift.spec.md`                                                                                                                                                                                       | `pnpm ai:env:infisical --env <slug>` / `--all` / `--envs a,b` compares the key names in a live Infisical environment with the env contract and reports missing required variables (the process would refuse to boot), missing optional ones (feature off), unknown keys, and public `NEXT_PUBLIC_*`/`EXPO_PUBLIC_*` keys present; `--json` for machines. It reads names only from `infisical export --format=dotenv --silent` (stdin ignored, 30s timeout) and redacts error output, so no value is ever printed or written. Credentials follow `scripts/infisical-run.sh`: machine identity, `INFISICAL_TOKEN`, then a login session (never in CI). `:strict` exits 1 on missing required, 2 when Infisical is unreadable, so a credential-less pipeline can skip rather than fail. Not a CI step by design (spec Notes). Live run 2026-09-12: `prod` complete; `dev`/`staging` empty, missing `POSTGRES_URL` + `AUTH_SECRET`. The env-contract parsing moved to `scripts/ai/_env.mjs` and is shared with `check-env-contract.mjs` (generated output unchanged). First tests for `scripts/ai`: `node --test` via root `test:scripts` (Turbo `//#test:scripts`), run by `pnpm test`. |

## Architectural Change Log

| Date       | Decision                                                    | ADR / Files                                                                                                                                                                                                                                                                                                                                                                                                  | Regression Guard                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-17 | Adopt `.ai/` as the canonical agent memory system           | `.ai/decisions/ADR-0001-adopt-agent-native-architecture.md`                                                                                                                                                                                                                                                                                                                                                  | New patterns, dependencies, and decisions must update `.ai/` in the same PR.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-05-17 | Keep tool-specific agent files thin                         | `.github/copilot-instructions.md`, `.cursor/rules/*`, `CLAUDE.md`                                                                                                                                                                                                                                                                                                                                            | Do not duplicate long-form rules across tools; link back to `.ai/`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-05-17 | Generate machine-readable contract snapshots                | `scripts/ai/generate-contracts.mjs`, `.ai/context/data-contracts.md`                                                                                                                                                                                                                                                                                                                                         | Run `pnpm ai:contracts` after API, DB, env, package export, or dependency changes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| 2026-09-02 | Treat design language and composition as contracts          | `DESIGN.md`, `.ai/patterns/ui-composition.md`, `scripts/ai/check-*.mjs`                                                                                                                                                                                                                                                                                                                                      | CI runs the pinned design.md linter plus token-parity and authored-JSX composition checks.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 2026-09-05 | Docker is an additional deploy path, never a replacement    | `apps/web/Dockerfile`, `apps/server/Dockerfile`, `.ai/patterns/docker-images.md`                                                                                                                                                                                                                                                                                                                             | Standalone output stays behind `DOCKER_BUILD=1`; server runtime deps (`tsx`, `drizzle-kit`) stay in `dependencies`; images never carry Infisical, `.env`, or `apps/mobile`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 2026-09-11 | CI is one job mirrored by a root `pnpm run ci` script       | `.ai/decisions/ADR-0003-single-job-ci.md`, `.github/workflows/ci.yml`, `package.json`                                                                                                                                                                                                                                                                                                                        | Any step added to or removed from the workflow is mirrored in the `ci` script, and vice versa; the Docker matrix stays a separate job.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-09-11 | Dashed frames and house primitives are the dashboard recipe | `packages/ui/src/components/card.tsx`, `apps/web/src/components/dashboard/*`, `DESIGN.md`                                                                                                                                                                                                                                                                                                                    | `pnpm ui:composition` enforces Card anatomy; `registry-patches.test.ts` guards the `dashed`, `success`/`warning`, and `ThemeToggle` patches after any `pnpm ui-add`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2026-09-12 | Background jobs run on pg-boss instead of Trigger.dev       | `.ai/decisions/ADR-0004-pg-boss-jobs.md`, `.ai/specs/active/pg-boss-jobs.spec.md`, `packages/jobs/src/{queues,handlers,client,worker}.ts`, `packages/jobs/src/tasks/send-support-email.ts`, `packages/api/src/router/support.ts`, `apps/server/src/{worker,env}.ts`, `apps/server/tsconfig.runtime.json`, `apps/server/Dockerfile`, `package.json`, `.env.example`, `turbo.json`, `.github/workflows/ci.yml` | `JOBS_POSTGRES_URL` replaces `TRIGGER_SECRET_KEY`: empty runs the handler in the request, set enqueues to pg-boss. Handlers are plain functions registered in a typed `JobPayloads`/`jobHandlers` registry; `@turbo/jobs/client` is the send-only producer, `@turbo/jobs/worker` the factory, `apps/server/src/worker.ts` the process (`pnpm dev:worker`, `pnpm start:worker`, `SERVER_PROCESS=worker` in the server image, which then skips migrations). Every `tsx` run in `apps/server` now passes `--tsconfig tsconfig.runtime.json` (standalone; widens `include` to workspace packages) — this fixes a latent `React is not defined` when the standalone server rendered any mail template. `apps/server/src/env.ts` optionals now follow the `optionalString` pattern so an absent `RESEND_API_KEY` no longer crashes boot. Trigger files, `dev:trigger`, and `deploy` removed; `.agents/skills/trigger-dev-tasks/` stays as reference. |

## Known TODOs

| Priority | Task                                      | Source                          | Blocking? |
| -------- | ----------------------------------------- | ------------------------------- | --------- |
| high     | Keep generated contract snapshots current | `.ai/contracts/`, `scripts/ai/` | no        |

## Regression Guards

- Do not derive server-rendered text from `next-themes`' `resolvedTheme`; gate it on mount as `ThemeToggle` does (`packages/ui/src/__tests__/theme.test.tsx` guards it). Do not wrap a `StatCard` in a `Link`; use `href`.
- Do not move business API logic into `apps/web/src/app/api`; app API files only
  mount or adapt shared API handlers.
- Do not move business API logic into `apps/server`; it is a runtime host for
  `@turbo/api`.
- Do not bypass the typed Hono client for application API calls.
- Do not introduce database schema changes without updating Drizzle exports and
  generated contract snapshots.
- Do not change runtime design tokens without updating `DESIGN.md` in the same
  commit; do not change component shape conventions without updating
  `.ai/patterns/ui-composition.md`.
- Do not add new package exports without keeping package contract snapshots
  current.
- Do not introduce new workflows without updating the matching `.ai/skills/*`
  file or creating a new skill.
- Do not hand-write a dashed card frame on a `div`; use `Card variant="dashed"`
  through `StatCard` / `TableCard`. Do not put watch mode or a long-running
  process behind a package `dev` script (`.ai/patterns/turbo-dev-tasks.md`).
- Do not add a CI step without mirroring it in the root `ci` script (or
  remove one without removing it from both).
- Do not set Next `output: "standalone"` unconditionally (Vercel and local
  `next start` must stay untouched); do not move `tsx` or `drizzle-kit` back to
  `devDependencies` (the server image is built with `pnpm deploy --prod`).

## Update Checklist

After non-trivial changes, update the rows above when any of these changed:

- User-visible features
- API routes or response contracts
- Database schema or relations
- Package exports
- Environment variables
- Design tokens or UI conventions
- Agent workflows, prompts, rules, or skills
````

## system_prompt.md

````md
# Turbo System Prompt

You are working in a TypeScript Turborepo optimized for AI-assisted development.
The canonical agent context lives in `.ai/`; tool-specific files are thin entry
points that should reference `.ai/` instead of duplicating long-form rules.

## Required Context Before Coding

1. Read `AGENTS.md`.
2. Read `.ai/context/tech-stack.md` and `.ai/context/conventions.md`.
3. Read `ARCHITECTURE.md` and `ROADMAP_AI.md`.
4. Read the closest matching `.ai/skills/*.md` file.
5. For non-trivial changes, create or update a spec in `.ai/specs/active/`
   before editing implementation files.

## Stack Constraints

- Package manager: pnpm workspaces.
- Monorepo orchestration: Turborepo.
- Language: strict TypeScript with ESM packages.
- Web: Next.js App Router in `apps/web/src/app`.
- Mobile: Expo Router in `apps/mobile/src/app`.
- API: Hono routers in `packages/api/src/router`.
- Database: Drizzle ORM with Postgres/Supabase in `packages/db`.
- Auth: Better Auth in `packages/auth`.
- Validation: Zod in `packages/validators` or local route files for one-off
  request validation.
- Server state: TanStack Query.
- Client state: Zustand for shared UI state only.
- Form state: `react-hook-form` with Zod resolvers.
- UI: Tailwind CSS 4, Uniwind for mobile, shadcn/ui-style shared components in
  `packages/ui`.

## Architectural Rules

- Apps may import packages; packages must not import from apps.
- Business API behavior belongs in `packages/api`, not in app-local route files.
- Register new Hono routers in `packages/api/src/index.ts`.
- Use `Hono<AppContext>` for API routers.
- Use explicit auth middleware or guards for protected routes.
- Keep shared contracts in `packages/validators` when more than one surface uses
  them.
- Keep package public APIs declared in `package.json` `exports` fields.
- Update `.ai/contracts/*.generated.md` after API, DB, env, dependency, or export
  changes.

## TypeScript Rules

- Prefer named exports.
- Avoid `any`; use explicit types, generics, or Zod-derived types.
- Preserve strict typechecking and ESM.
- Keep runtime validation at external boundaries.
- Do not invent package imports; confirm package exports first.

## UI And Design Rules

- Use `@turbo/ui` for shared web UI.
- Shared components use CVA variants, `cn()`, `data-slot`, named exports, and
  `kebab-case.tsx` filenames.
- Use Tailwind theme tokens instead of hardcoded colors.
- Preserve the mature neutral shadcn-style baseline unless the user explicitly
  approves a palette change.
- Use the existing radius scale. Component shapes should feel soft and precise,
  with rounded/squircle controls where the current UI already uses them.
- Bento grids are appropriate for dashboard summaries and landing sections, not
  dense settings forms or CRUD tables.
- Avoid nested cards, decorative-only gradients, and one-off visual systems.

## Isolation Rules

- Prefer small, local changes over rewriting large files.
- Extract reusable view logic into hooks under `apps/*/src/hooks`.
- Extract shared pure logic into `packages/shared`.
- Extract reusable shared UI into `packages/ui`.
- Do not refactor unrelated code while implementing a feature.
- If a task touches more than three implementation files, write or update a spec
  first and update `ROADMAP_AI.md` after completion.

## Completion Rules

- Run the narrowest useful validation command first.
- Update `ROADMAP_AI.md` for meaningful feature, contract, or architecture
  changes.
- Follow `.ai/skills/update-ai-memory.md` before finishing.
````

## .ai/context/tech-stack.md

````md
# Tech Stack

> Auto-generated from repository analysis. Update when dependencies change.

## Monorepo Tooling

| Tool      | Version                                | Purpose                                                                                                      |
| --------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Turborepo | ^2.10.5                                | Task orchestration, caching, build pipeline                                                                  |
| pnpm      | ^10.19.0                               | Package manager with workspace support                                                                       |
| Node.js   | 22.21.0 (`.nvmrc`), engines `^22.14.0` | Runtime                                                                                                      |
| Infisical | `@infisical/cli` ^0.43.113             | Opt-in secrets injection (`pnpm dev:infisical`, `pnpm with-secrets`); `.env` remains the zero-setup fallback |

### Workspace layout

```text
apps/
  web/          → Next.js web application
  server/       → Standalone Node/Hono API runtime
  mobile/       → Expo React Native mobile app
packages/
  ai/           → AI SDK integration (Vercel AI SDK)
  analytics/    → PostHog analytics (web + server)
  api/          → Hono API server with typed routes
  assets/       → Font files
  auth/         → Better Auth configuration
  db/           → Drizzle ORM + Postgres schemas
  jobs/         → pg-boss background jobs (queue registry, handlers, producer, worker)
  mail/         → Email templates (Resend)
  shared/       → Shared utilities and constants
  supabase/     → Supabase client setup
  ui/           → shadcn/ui component library (50+ components)
  validators/   → Zod validation schemas
tooling/
  eslint/       → Shared ESLint configs (@turbo/eslint-config)
  github/       → GitHub Actions setup composite action
  prettier/     → Shared Prettier config with import sorting
  tailwind/     → Shared Tailwind CSS theme + PostCSS config
  typescript/   → Shared tsconfig bases (@turbo/tsconfig)
  vitest/       → Shared Vitest config (@turbo/vitest-config)
```

## Languages & Frameworks

| Layer            | Technology  | Version                                   |
| ---------------- | ----------- | ----------------------------------------- |
| Language         | TypeScript  | catalog (`^6.0.3`)                        |
| Web framework    | Next.js     | 16.3.0                                    |
| Mobile framework | Expo SDK    | 57 (`react-native` ~0.86.0)               |
| React            | React       | 19.2.8 via `catalog:react19`              |
| API framework    | Hono        | ^4.12.31 (`@hono/node-server` ^2.0.11)    |
| ORM              | Drizzle ORM | drizzle-orm ^0.45.2; drizzle-kit ^0.31.10 |
| Database         | PostgreSQL  | via Supabase                              |
| Database driver  | postgres.js | ^3.4.9 (`prepare: false` for pooled URLs) |
| Auth             | Better Auth | 1.6.23                                    |
| Validation       | Zod         | catalog (`4.4.3`)                         |

## UI & Styling

| Tool               | Details                                                                  |
| ------------------ | ------------------------------------------------------------------------ |
| Component library  | shadcn/ui `radix-maia` style (Radix + CVA), CLI-managed in `packages/ui` |
| AI chat UI         | Vercel AI Elements, vendored in `packages/ui` `components/ai-elements/`  |
| Variant shorthands | `shadcn` npm pkg (web devDep) — `shadcn/tailwind.css` custom variants    |
| CSS framework      | Tailwind CSS 4.3.3                                                       |
| Shared theme       | `tooling/tailwind/theme.css` (web + mobile single source)                |
| Fonts              | Inter Display, vendored in `packages/assets/fonts`                       |
| Theming (web)      | next-themes (class strategy, system default)                             |
| Mobile styling     | Uniwind 1.10.x (Tailwind for RN)                                         |
| Icons              | HugeIcons (React + React Native)                                         |
| Animation (web)    | Motion (Framer Motion) 12.x                                              |
| Animation (mobile) | react-native-reanimated 4.5.x + worklets 0.10.x                          |
| Toasts (web)       | sonner (via `@turbo/ui/components/sonner`)                               |

## State & Data

| Concern      | Tool                                  |
| ------------ | ------------------------------------- |
| Server state | TanStack Query 5.x                    |
| Forms        | react-hook-form + @hookform/resolvers |
| Tables       | @tanstack/react-table                 |

## Infrastructure & Services

| Service         | Tool                                                                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Hosting         | Vercel (web), EAS (mobile), or Docker on Coolify / any container host (web + server, `apps/*/Dockerfile`; see `.ai/patterns/docker-images.md`) |
| API runtime     | Standalone Node/Hono app (`apps/server`)                                                                                                       |
| Database        | Supabase (Postgres)                                                                                                                            |
| Email           | Resend                                                                                                                                         |
| Background jobs | pg-boss (Postgres-backed; `JOBS_POSTGRES_URL`, worker runs from `apps/server`)                                                                 |
| Analytics       | PostHog                                                                                                                                        |
| Error tracking  | Sentry (@sentry/nextjs, @sentry/react-native)                                                                                                  |
| AI providers    | Gemini, OpenRouter, Groq (Vercel AI SDK v7)                                                                                                    |

## Testing & Quality

| Tool              | Purpose                                                                             |
| ----------------- | ----------------------------------------------------------------------------------- |
| Vitest            | Unit/integration testing (4.1.x); `jsdom` only in `packages/ui` for hydration tests |
| `node --test`     | Tests for `scripts/ai/*.mjs` (`scripts/ai/__tests__/`, root `pnpm test:scripts`)    |
| ESLint 10         | Linting (flat config)                                                               |
| Prettier 3.9      | Code formatting with import sort + tailwind sort                                    |
| TypeScript strict | Type checking across all packages                                                   |

## CI/CD

**GitHub Actions** (`.github/workflows/ci.yml`) — one `ci` job, one cached
install, then the same steps as the root `pnpm run ci` script in the same order
(`.ai/decisions/ADR-0003-single-job-ci.md`); later steps still run after an
earlier failure so one run surfaces every problem:

1. `pnpm ai:contracts:check`
2. `pnpm skills:check`
3. `pnpm docker:check`
4. `pnpm design:lint`
5. `pnpm design:tokens`
6. `pnpm ui:composition`
7. `pnpm lint:ws`
8. `pnpm typecheck`
9. `pnpm lint`
10. `pnpm format`
11. `pnpm test`

Check steps run only after Setup succeeded (`steps.setup.outcome`), so a
broken install is one red step rather than eleven. A separate, parallel
`docker` matrix job (30-minute cap) builds and smoke-tests the web and server
images. `tooling/github/setup` installs pnpm + Node from `.nvmrc` with the pnpm
store cached and `pnpm install --frozen-lockfile`. Turbo remote caching via
Vercel.

## AI Tooling (MCP)

| Surface     | Config                                                   |
| ----------- | -------------------------------------------------------- |
| Claude Code | `.mcp.json` (repo root)                                  |
| Cursor      | `.cursor/mcp.json`                                       |
| VS Code     | `.vscode/mcp.json`                                       |
| Server      | Expo MCP — Streamable HTTP at `https://mcp.expo.dev/mcp` |

Auth is OAuth (browser sign-in with an Expo account) — no tokens in the repo.

Local capabilities (simulator screenshots, tap-by-testID, expo-router sitemap,
DevTools) come from the `expo-mcp` dev dependency in `apps/mobile`. Start the
dev server with them enabled via `pnpm --filter @turbo/mobile dev:mcp`
(`EXPO_UNSTABLE_MCP_SERVER=1`). Reconnect the MCP client after starting or
stopping the dev server so it refreshes capabilities.
````

## .ai/context/conventions.md

````md
# Conventions

> Derived from actual patterns observed in this repository. Update when conventions change.

## Documentation Rules

- Document only observed repository facts or explicitly approved decisions.
- Do not record guesses, assumptions, or vendor-default behavior as repository conventions.
- When a convention is uncertain, verify from code/config first or mark it as a proposal instead of a fact.

## File & Folder Naming

- **Packages**: `kebab-case` directory names under `packages/` (e.g., `packages/auth`)
- **Components**: `kebab-case.tsx` files (e.g., `button.tsx`, `date-picker.tsx`)
- **Routes (web)**: Next.js App Router — `apps/web/src/app/` with `page.tsx`, `layout.tsx`
- **Routes (mobile)**: Expo Router — `src/app/` directory with file-based routing
- **Config files**: `kebab-case` (e.g., `eslint.config.ts`, `vitest.config.ts`)
- **Test files**: `__tests__/<name>.test.ts` (co-located in `src/`)
- **Script tests**: `scripts/ai/__tests__/<name>.test.mjs`, run with `node --test` via the root `pnpm test:scripts` (Turbo task `//#test:scripts`, part of `pnpm test`). A script under test exports its functions and runs `main()` only when executed directly (`check-infisical-env.mjs`).
- **Schema files**: `<domain>-schema.ts` in `packages/db/src/` (e.g., `auth-schema.ts`)

## Exports

- **Named exports** preferred over default exports (components, utilities)
- **Barrel files**: `index.ts` re-exports from each package root
- **Package entry points**: Defined in `package.json` `exports` field with subpath exports (e.g., `@turbo/auth/client`, `@turbo/db/schema`)
- **Internal packages**: All packages use `"type": "module"`; most packages also define `build: tsc` and emit declaration artifacts in `dist/`

## Component Patterns (shadcn/ui)

- Use `cva` (class-variance-authority) for variant-based styling
- Use `cn()` utility (`cx` from class-variance-authority + `twMerge`) for class merging
- Use `data-slot` attributes for component identification
- Props extend `React.ComponentProps<"element">` with `VariantProps`
- Compound components pattern: `Card`, `CardHeader`, `CardContent`, `CardFooter`
- Export individual named components (not default)
- Import shared UI as `@turbo/ui/components/<name>`; `cn` from
  `@turbo/ui/lib/utils`; hooks from `@turbo/ui/hooks/<name>` (no root
  `@turbo/ui` barrel import)
- Registry components are CLI-managed: add/update with `pnpm ui-add` in
  `packages/ui`, don't hand-edit beyond documented patches
- Documented registry patch — `Card variant="dashed"` (`card.tsx`): swaps
  the `ring-1` hairline for `border border-dashed`. Every dashed card frame
  — dashboard and landing page alike — goes through this variant (directly,
  or via `StatCard` / `TableCard` in `apps/web/src/components/dashboard/`);
  never hand-write `bg-card rounded-2xl border border-dashed` on a `div`.
  The two documented exceptions are standalone `Empty` states, which carry
  `rounded-2xl border border-dashed` themselves, and structural dividers
  (`border-t border-dashed`) — see `.ai/patterns/ui-composition.md`.
- Documented registry patch — `Badge` `success` / `warning` variants and a
  `size="xs" | "sm"` axis (`badge.tsx`): `bg-success/10 text-success`,
  `bg-warning/10 text-warning`; `xs` (20px) is the default display badge,
  `sm` (28px) is for pickers and toggles. Never tint a badge via `className`
  — add a variant instead.
- Documented registry patch — `ThemeToggle` (`theme.tsx`) is a one-click
  switch that flips the _resolved_ theme; no dropdown, no explicit "system"
  item (the system default still applies until the first click).
- Registry patches are guarded by
  `packages/ui/src/__tests__/registry-patches.test.ts` — after any CLI
  re-install, run `pnpm --filter @turbo/ui test` and re-apply failing patches.
- A popover or menu that offers a write must not auto-focus that write. Radix
  `PopoverContent` focuses its first focusable child on open; when that child
  commits something irreversible (delete, revoke, confirm), pass
  `ref={contentRef}` and
  `onOpenAutoFocus={(e) => { e.preventDefault(); contentRef.current?.focus(); }}`
  so focus lands on the panel, and add a test that the button is not
  `document.activeElement` after opening.
- AI chat components live in `packages/ui/src/components/ai-elements/`
  (Vercel AI Elements registry, `https://registry.ai-sdk.dev`); import as
  `@turbo/ui/components/ai-elements/<name>`. Patched for AI SDK v7 usage
  fields (`outputTokenDetails.reasoningTokens`,
  `inputTokenDetails.cacheReadTokens` in `context.tsx`) and strict tsconfig;
  `web-preview.tsx` default sandbox drops `allow-same-origin` (override via
  the `sandbox` prop for trusted content); `code-block.tsx` imports
  `shiki/bundle/web` instead of the full `shiki` bundle (CLI re-installs
  restore the full-bundle import — re-apply); `packages/ui/src/css-modules.d.ts`
  provides an ambient `*.css` declaration, so re-vendored components with CSS
  side-effect imports (e.g. `canvas.tsx`) need no suppression; re-apply patches
  after CLI reinstalls. Patches are guarded by
  `packages/ui/src/__tests__/ai-elements-patches.test.ts` — after any CLI
  re-install, run `pnpm --filter @turbo/ui test` and re-apply failing
  patches. Style-rule relaxations for this folder live in
  `packages/ui/eslint.config.ts`.
- Icons: `lucide-react` is an internal implementation detail of the vendored
  `ai-elements/` components only — it must not leak into the package's public
  API (exported `icon` props use `ComponentType<{ className?: string }>`,
  `CheckpointIconProps` is `ComponentProps<"svg">`) and apps must never import
  `lucide-react`. App code and new components use HugeIcons via
  `@turbo/ui/components/icon`.
- `packages/ui/src/components/message.tsx` (layout primitive, data-slot) and
  `ai-elements/message.tsx` (AI SDK chat message) are different components —
  both are kept
- `Button` has no `loading` prop — render
  `{pending && <Spinner data-icon="inline-start" />}` and set `disabled`
- Toasts: `import { toast } from "sonner"` with `<Toaster />` mounted from
  `@turbo/ui/components/sonner`
- UI work starts by reading `DESIGN.md` and
  `.ai/patterns/ui-composition.md`. The former mirrors runtime tokens; the latter
  is the normative slot, accessibility, page, and state grammar.
- UI work is precedent-first: explicit user direction → the nearest existing
  route or component that solves a similar workflow → the configured shadcn
  primitive (verified against current shadcn docs when unfamiliar) → a new
  composition only when none of those solve it. Name the inspected precedent
  in the spec or working notes before editing. Full order in
  `.ai/context/design-system.md`.
- Dashboard house primitives live in `apps/web/src/components/dashboard/`:
  `StatCard` (dashed stat tile), `TableCard` (dashed table/list frame with
  header, body, footer), `TablePagination`, `PageToolbar` (the 48px bar under
  the sticky header, only on pages with page-level controls), `HintLabel`
  (label + tooltip for a hidden calculation), and `QueryError` (the error
  state for dashboard queries — see `api-keys-card.tsx`). Compose these
  instead of writing a private stat or table wrapper again; `TablePagination`
  has no live consumer yet, its tests are the precedent.
- A change to runtime tokens in `tooling/tailwind/theme.css` must update
  `DESIGN.md` in the same commit.
- Authored UI uses semantic color classes and the documented spacing and
  typography scales. Composite slots follow the composition grammar; do not
  baseline or suppress violations.
- Before completing UI work, run `pnpm design:lint`, `pnpm design:tokens`, and
  `pnpm ui:composition`.

Example: `packages/ui/src/components/button.tsx`

## Form Patterns

- **ALWAYS** use `react-hook-form` with `@hookform/resolvers/zod` for forms.
- **NEVER** use `useState` for managing form state or individual form fields.
- **ALWAYS** use `shadcn/ui` form components (`Form`, `FormField`, `FormControl`, `FormItem`, `FormMessage`), with `Field`/`FieldGroup` primitives for layout.
- **NEVER** use raw HTML `<input>`, `<select>`, etc., when a `shadcn/ui` component exists.

## API Patterns (Hono)

- Routers are separate files under `packages/api/src/router/`
- Each router creates a `new Hono<AppContext>()`
- Auth middleware applied per-router with `.use("*", authMiddleware)`
- Context variables typed via `AppContext` interface
- Typed RPC client exported for frontend consumption (`hcWithType`)
- Security middleware stack: secure headers → CORS → rate limiting
- **Web API auth is cookie-based; never attach `Authorization` headers from session data.** Cookies ride along automatically on same-origin fetches. There is exactly one `hc<AppType>` construction in the web app — `apps/web/src/lib/api.ts`; `useApi()` returns that instance.
- **Mobile uses exactly one Better Auth client: `@/auth/client`.** `apps/mobile/src/utils/api.tsx` reads cookies from that client. Do not create additional `createAuthClient` instances anywhere in the mobile app.
- **API composition: `createApp(auth, db)` — apps own the real db/auth instances; `packages/api` never imports `@turbo/db/client` at runtime.** Middleware and routers receive `db` through `c.get("db")`; never import concrete clients directly inside `packages/api`.
- **AI endpoints degrade, never crash.** Call `getDefaultModel()` from `@turbo/ai/client`; when it returns `null` (no provider key — the zero-env template) respond 503 with `{ error, hint }` and return a raw `Response` for streams. New AI routes copy the pattern in `packages/api/src/router/ai.ts`.
- **External providers go through a boundary module, never a raw `fetch` in a router.** See `.ai/patterns/external-provider-boundary.md`: typed config, per-request timeout, every failure collapsed to one typed "unavailable" result, no secrets in logs.

Example: `packages/api/src/router/api-key.ts`

## Auth Patterns (Better Auth)

- Apps create auth via `createAppAuth()` from `@turbo/auth`; only base URLs and framework plugins are app-specific.
- `createAppAuth()` owns all shared wiring: env-derived secrets, the GitHub social provider conditional, and the OTP email bridge.
- Next.js apps pass `extraPlugins: [nextCookies()]`; the standalone server passes no extra plugins.
- Never call `initAuth()` directly from an app — it is the low-level primitive; app code always goes through `createAppAuth()`.
- New social providers or plugins are added once in `packages/auth/src/index.ts`.

## Web Rendering (Next.js Cache Components)

- `apps/web` runs Next.js 16.3 with `cacheComponents` and `partialPrefetching` enabled (`next.config.js`).
- Request-time data in Server Components (`getSession()`, `cookies()`, `headers()`, `params`, uncached `fetch`) must stream inside a `<Suspense>` boundary — move the access into an async child component and wrap it, as in `apps/web/src/app/(auth)/onboarding/page.tsx`. Top-level access fails `next build`.
- Cache shareable server data with the `"use cache"` directive instead of route segment configs (`export const dynamic/revalidate` are incompatible with Cache Components).
- The React Compiler is enabled (`reactCompiler: true` + Rust variant); do not hand-add `useMemo`/`useCallback` for render memoization unless the compiler skips the component (see `react-hooks/incompatible-library` lint warnings).

## Database Patterns (Drizzle)

- Schemas in `packages/db/src/` as `*-schema.ts`
- Use `pgTable()` for table definitions
- Relations defined separately with `relations()`
- Indexes defined in table callback: `(table) => [index(...)]`
- Column naming: `snake_case` in DB, `camelCase` in TypeScript
- All tables include `createdAt` and `updatedAt` timestamps
- Foreign keys with `onDelete: "cascade"` for user-owned data
- Raw SQL reads bypass Drizzle's UTC decoder for `timestamp without time zone`. When reading those stored UTC instants through `db.execute`, select `column AT TIME ZONE 'UTC'` before parsing them as JavaScript dates.
- Schema changes: `pnpm db:generate` then `pnpm db:migrate` — never edit applied migrations, never `db:push` against durable databases. `packages/db/src/__tests__/migrations.test.ts` locks the chain's ability to bootstrap an empty database.

Example: `packages/db/src/auth-schema.ts`

## Commit Messages

- Conventional Commits format: `type(scope): description`
- Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`
- Scope is optional, typically the package name (e.g., `feat(ui): add avatar component`)

## Package Internal Naming

- Package names use `@turbo/` scope (e.g., `@turbo/ui`, `@turbo/db`)
- Tooling packages also use `@turbo/` scope (e.g., `@turbo/eslint-config`)

## Environment Variables

- `.env.example` as template — copy to `.env` for local development
- Public vars prefixed with `NEXT_PUBLIC_` (web) or `EXPO_PUBLIC_` (mobile)
- Validated with environment modules (e.g., `apps/web/src/env.ts`)
- Non-secret constants (PostHog host, Expo app identity/EAS project ID, provider API URLs) are hardcoded in the codebase (`apps/mobile/app.config.ts`, `eas.json`), not stored in `.env`
- The standalone server uses `SERVER_PORT` for local port configuration; generic `PORT` is reserved as a platform fallback and should not be set in `.env.example`.
- **Env skip logic: always `shouldSkipEnvValidation()` from `@turbo/shared/env` — never inline `npm_lifecycle_event`/`CI` checks.** New skip conditions belong in `packages/shared/src/env.ts` with a test.
- `.ai/contracts/env.generated.md` is the env contract for humans and agents: every `.env.example` variable with required/optional (derived from the zod schemas), the runtime that reads it, and its exposure. A new variable is complete only when it appears there correctly — add it to `.env.example` (under a `# Group` heading), `turbo.json` `globalEnv`, and the owning env module (or read it via `process.env` in exactly one package when it is a pure feature switch), then run `pnpm ai:env:strict`.
- Optional env modules follow the `packages/auth/env.ts` shape: `z.string().transform(v => v === "" ? undefined : v).optional()` (`optionalString`) or the `z.union([z.literal(""), z.url()])` variant (`optionalUrl`). The contract script recognises both as "empty string counts as unset".
- `.infisical.json` (committed, project id only) links the repo to the `turbo` Infisical project with `dev`/`staging`/`prod`. Each environment holds the required variables for the runtimes it serves plus the optional features it enables. Coolify apps read their own env store today; wiring them to Infisical means setting the four `INFISICAL_*` machine-identity variables on the app (`scripts/infisical-run.sh`).
- `pnpm ai:env:infisical --env <slug>` (or `--all`) compares an Infisical environment's key names with the contract: missing required, missing optional, unknown keys, public keys present. Run it before a deploy and after adding a variable; it reads names only and never prints a value. `pnpm ai:env:infisical:strict` exits 1 on missing required variables, 2 when Infisical is unreadable. It is deliberately not a CI step — CI holds no Infisical credentials (`.ai/specs/active/infisical-env-drift.spec.md`). Env-contract parsing shared by both env scripts lives in `scripts/ai/_env.mjs`; add new parsing there, not in a script.

## Operational Commands

- Run `pnpm auth:generate` after Better Auth schema/config changes that affect generated auth schema output.
- Run `pnpm db:generate -- --name <migration_name>` after Drizzle schema changes that need durable migrations.
- Run `pnpm db:migrate` to apply pending Drizzle migrations.
- Production migrations run via migrate-on-boot: `pnpm start:server` chains `db:migrate && start:prod`; the standalone server is the only migration owner.
- Use `pnpm db:push:local` only for disposable local databases.
- Use `pnpm db:studio` for local schema/data inspection during development.
- Prefer workspace/root scripts when available over ad-hoc package commands.
- `pnpm run ci` runs the same checks as `.github/workflows/ci.yml` in the same order and stops on the first failure; it is the local merge gate. Invoke it as `pnpm run ci` — bare `pnpm ci` is a reserved pnpm built-in. Any step added to or removed from the workflow must be mirrored in the script, and vice versa (`.ai/decisions/ADR-0003-single-job-ci.md`).
- Per-package `pnpm typecheck` / `pnpm lint` in a fresh worktree need dependencies built once: `pnpm turbo run build --filter=<pkg>^... --output-logs=errors-only`. Root-level commands do this automatically via `dependsOn: ["^build"]`.
- Package `dev` scripts are one-shot (`tsc`, never `tsc --watch`); long-running processes use a separate script name (`pnpm dev:worker` runs the pg-boss worker). See `.ai/patterns/turbo-dev-tasks.md`.
- `pnpm dev:worker` runs the jobs worker locally (`tsx watch`, reads `.env`); `pnpm start:worker` is the production entry. The server Docker image runs the worker when `SERVER_PROCESS=worker` is set.
- Every `tsx` invocation in `apps/server` passes `--tsconfig tsconfig.runtime.json`. tsx applies `compilerOptions` only to files inside `include`, and that file widens the scope to the workspace packages executed from source (mail templates need the automatic JSX runtime). It is standalone on purpose: the image prunes `@turbo/tsconfig`.

## Copy Voice (user-facing text)

- Plain language over jargon in labels, captions, and empty states; say what the screen shows, not how it is computed.
- Every empty state says what is absent and offers the next action as a real CTA (`Empty` + `EmptyContent` button), never a bare sentence.
- Labels that hide a calculation or a policy get a `HintLabel` (`apps/web/src/components/dashboard/hint-label.tsx`); self-evident labels do not, so hints stay meaningful.
- Status words map to badge variants: positive states (active, connected, verified) are `Badge variant="success"`, attention states (due, pending review) are `warning`, failures are `destructive`, neutral or terminal states stay `outline`.

## Code Style

- **Prettier** for formatting (configured via `@turbo/prettier-config`)
- **ESLint 9** flat config with shared base configs
- **TypeScript strict mode** across all packages
- Import sorting via `@ianvs/prettier-plugin-sort-imports`
- Tailwind class sorting via `prettier-plugin-tailwindcss`

## Analytics Patterns

- Analytics sample rates and privacy options live in `@turbo/analytics` (`SENTRY_CONFIG`, `posthogWebOptions`). Apps call the framework-specific `init()` with these shared values.
- Never hardcode sample rates (e.g., `tracesSampleRate: 0.1`) in app files — import from `@turbo/analytics` instead.
- React Native `Sentry.init` consumes `SENTRY_CONFIG.tracesSampleRate` only (the web `replays*` fields are not supported by the React Native SDK).
- `posthogWebOptions` is for web (posthog-js) only; mobile wires PostHog via `PostHogProvider` directly.

## Background Job Patterns (pg-boss)

- A job is a plain async function in `packages/jobs/src/tasks/<name>.ts` that takes a typed payload, returns a result, and **throws on failure** so pg-boss retries it. It imports no queue code, so the API can call it directly for the inline path.
- Register it twice: the payload in `JobPayloads` (`src/queues.ts`) and the handler in `jobHandlers` (`src/handlers.ts`). The mapped type makes a missing entry a compile error.
- Producers import `@turbo/jobs/client`: `isJobQueueConfigured()` gates on `JOBS_POSTGRES_URL`; `enqueue(name, payload, options?)` is the only send API. Never construct `PgBoss` in a router or app.
- The queue is presence-gated: empty `JOBS_POSTGRES_URL` → run the handler in the request (as `POST /support` does); set → enqueue and let the worker run it. The zero-env template keeps working without a worker.
- One shared `QUEUE_POLICY` (three attempts, backoff 1s→10s, five-minute run limit) is applied at `createQueue`; per-job overrides go through `enqueue`'s `options`, not a second policy object.
- The worker runtime is `apps/server/src/worker.ts` (`pnpm dev:worker` / `pnpm start:worker` / `SERVER_PROCESS=worker` in the server image). `packages/jobs` exports `createWorker()` and owns no process concerns (signals, exit codes, env).
- Handler failures report through `@turbo/analytics/server` `captureError` with `job` and `jobId` tags, then rethrow.
- Tests mock `pg-boss` (`vi.mock("pg-boss", () => ({ PgBoss: vi.fn(function () { return boss; }) }))`) and never need a database; see `packages/jobs/src/__tests__/`.

## Mail Patterns

- `@turbo/mail` exports templates and senders only; import react-email primitives from `react-email` directly inside mail templates — never re-export vendor components from `packages/mail/src/index.ts`.
- Consumers call `sendOTPEmail`, `sendWelcomeEmail`, or `sendSupportEmail` from `@turbo/mail/client`; they do not import react-email primitives from `@turbo/mail`.
- New email types: add a template in `src/templates/`, a `send<Name>Email` wrapper in `src/client.tsx`, and a subject-mapping test following `sendOTPEmail`.
- Flag any new `export ... from "react-email"` added to `src/index.ts` in code review.
````

## .ai/context/architecture.md

````md
# Architecture Context

> Root overview: `ARCHITECTURE.md`

## Source Of Truth

The root `ARCHITECTURE.md` explains the full repository mental model. This file
is the compact context version for agents that need the shortest architecture
summary.

## Runtime Surfaces

| Surface    | Location              | Responsibility                           |
| ---------- | --------------------- | ---------------------------------------- |
| Web app    | `apps/web`            | Next.js App Router web runtime           |
| Mobile app | `apps/mobile`         | Expo Router mobile runtime               |
| API        | `packages/api`        | Hono routers and typed RPC surface       |
| Auth       | `packages/auth`       | Better Auth config and generation source |
| Database   | `packages/db`         | Drizzle/Postgres schema and client       |
| UI         | `packages/ui`         | Shared web components                    |
| Validators | `packages/validators` | Shared Zod schemas and inferred types    |
| Jobs       | `packages/jobs`       | pg-boss jobs: registry, handlers, worker |

## Dependency Direction

- Apps may import packages.
- Packages must not import from apps.
- Tooling packages configure the repo but should not contain product logic.
- Package public APIs must be declared through `package.json` `exports`.

## Data Flow

```text
apps/web or apps/mobile
  -> typed Hono client using AppType
  -> packages/api/src/router/*
  -> auth, validators, db, jobs, mail, analytics
  -> typed JSON response
```

## Agent Rule

When a requested change crosses an app/package boundary, read `ARCHITECTURE.md`
and update `ROADMAP_AI.md` if the boundary or flow changes.
````

## .ai/context/data-contracts.md

````md
# Data Contracts

> Generated snapshots live in `.ai/contracts/*.generated.md`.

## Contract Sources

| Contract         | Source                                                        | Generated Snapshot                            |
| ---------------- | ------------------------------------------------------------- | --------------------------------------------- |
| API routes       | `packages/api/src/index.ts`, `packages/api/src/router/*.ts`   | `.ai/contracts/api-routes.generated.md`       |
| DB schema        | `packages/db/src/schema.ts`, `packages/db/src/auth-schema.ts` | `.ai/contracts/db-schema.generated.md`        |
| Environment      | `turbo.json`, `.env.example`, app env modules                 | `.ai/contracts/env.generated.md`              |
| Package exports  | workspace `package.json` files                                | `.ai/contracts/package-exports.generated.md`  |
| Dependency graph | workspace manifests                                           | `.ai/contracts/dependency-graph.generated.md` |

## API Rules

- Hono routers use `Hono<AppContext>`.
- Register routers in `packages/api/src/index.ts`.
- Reused request/response schemas belong in `packages/validators`.
- One-off request validation may stay near the route with `zValidator`.
- Clients should use the typed Hono RPC surface inferred from `AppType`.

## Database Rules

- Drizzle schemas live in `packages/db/src/*-schema.ts`.
- `packages/db/src/schema.ts` is the schema export surface used by the DB client.
- Auth schema output is generated from Better Auth and should not be edited by
  hand when regeneration is the source of truth.
- Keep indexes, relations, and timestamp conventions aligned with
  `.ai/context/conventions.md`.

## Env Rules

- `turbo.json` `globalEnv` defines environment variables that affect tasks.
- `.env.example` documents local setup variables and must not contain secrets.
- Public variables use `NEXT_PUBLIC_` for web and `EXPO_PUBLIC_` for mobile.
- Run `pnpm ai:env` after env changes.

## Agent Rule

Do not infer contracts from memory. Read source files or generated snapshots, then
update snapshots after contract changes.
````

## .ai/context/design-system.md

````md
# Design System Context

## Baseline

The visual system is a template-grade shadcn/ui interface (style `radix-maia`,
base color neutral, icon library HugeIcons) on Tailwind CSS 4, with CVA
variants and shared theme tokens. Web and mobile consume the SAME token file:
`tooling/tailwind/theme.css`. Preserve this identity unless a task explicitly
requests a visual change.

## Visual Identity

- **Font**: Inter Display, vendored in `packages/assets/fonts/` (woff2 for web
  via `next/font/local` in `apps/web/src/fonts/`, ttf for mobile via the
  `expo-font` config plugin). Body tracking is `-0.15px` (set in `@layer base`).
- **Dark mode**: neutral charcoal `#161616` (`oklch(0.2002 0 0)`) — zero
  chroma, never warm/stone. Layered surfaces: card `#1C1C1C`, popover
  `#242424`, secondary/badge `#2A2A2A`.
- **Light mode**: near-white `#FAFAFA` with pure-gray surfaces (zero chroma —
  the earlier `#D8D9D4` greige tint was dropped). Ink hierarchy: foreground
  `#292929`, muted-foreground `#5D5D5D`, borders `#E5E5E5`. Sidebar blends
  with the app frame; the active nav pill is `#F2F2F2` (`--sidebar-accent`,
  same value as `--accent` — icon tiles and hover rows share it) with a
  near-black label — subtle, never dark.
- **Accent**: electric blue `#0659FF` (`oklch(0.5406 0.2549 262.56)`, token
  `--primary-500`) in both modes.
- **Muted text**: `#989A9D` dark / `#5D5D5D` light.
- **Brand mark**: HugeIcons "AI collage template" outline icon (1.5px stroke),
  embedded inline in `apps/web/src/components/turbo-logo.tsx` because
  `AiCollageTemplateIcon` is Pro-only (not in `@hugeicons/core-free-icons`).
  Favicon is `apps/web/src/app/icon.svg` (Next.js file convention, brand-blue
  stroke) — there is no `favicon.ico`. Keep both in sync if the mark changes.
- **Radii**: `--radius: 0.75rem` → sm 8px (badges), lg 12px (buttons/inputs),
  xl 16px (panels); extended `--radius-2xl..4xl` for pills.
- **Status colors**: `--success` (green) and `--warning` (orange) tokens exist
  for status dots and trends; chart palette `--chart-1..5`.
- **Status badges**: state badges use the documented `Badge` patch variants
  `variant="success"` (positive: active, connected, verified),
  `variant="warning"` (attention: due, pending review), or
  `variant="destructive"` (failed, revoked). Terminal or neutral states
  (ended, upcoming, not connected) stay `variant="outline"`. Never tint a
  badge via `className` — add a variant instead.

## Signature Patterns

- Dashed frames: the dashed border is the signature of the language — stat
  cards, table frames, and card dividers use `border-dashed` to evoke ruled
  paper. Every dashed frame goes through `Card variant="dashed"` (directly, or
  via `StatCard` / `TableCard`); empty and error states that stand alone put
  `rounded-2xl border border-dashed` on the `Empty` itself.
- Stat cards: `StatCard` (`apps/web/src/components/dashboard/stat-card.tsx`)
  on `Card variant="dashed"` — muted 12px label (optionally `HintLabel` +
  icon) top-left, one `action` slot (trend, badge, menu) top-right,
  `tabular-nums` numeral (`size="hero"` text-3xl for the overview row,
  `size="compact"` text-xl for detail grids), optional `valueCaption`,
  support-zone `children` (sparkline, `Progress`), muted caption.
  `tone`/`captionTone` take `success | warning | destructive`; `dim` mutes a
  zero; `href` makes the label a stretched link over the whole card — keep the
  support zone (`children`, captions) non-interactive on a linked card, and
  note the overlay relies on `container-type` no longer creating a positioning
  containing block (Chrome 129 / Firefox 133 / Safari 18.4+). Do not write a
  private stat tile again.
- Table / container cards: `TableCard` (`table-card.tsx`) — `Card
variant="dashed"` with a required `title`, `description`, one `action`, and
  a `footer` slot (pagination, counts, fine print) behind a dashed divider.
  Body padding is `none` for tables and `sm` for charts and lists. The title
  renders in a real heading (`titleAs`, default `h2`) at the `title` role
  (`text-base font-semibold`) so table cards and plain section headers such as
  the Integrations grid share one scale and one outline.
- Pagination: `TablePagination` (`table-pagination.tsx`) composes the shadcn
  `Pagination` primitives for state-driven Previous / "Page x of y" / Next in
  a `TableCard` footer. Both `page` and `pageCount` are clamped; anchors
  carry `aria-disabled` and `tabIndex={-1}` at the bounds. No live page
  paginates yet — `apps/web/src/__tests__/table-pagination.test.tsx` is the
  precedent for its behaviour.
- Tables: icon+label column headers, muted grouped section rows ("This Week" +
  count chip), colored squircle date icons, status dots, pill badges on
  secondary background. Never render a value cell as a bare `text-xs` span
  beside `Badge` siblings — use `Badge variant="outline"`.
- Squircle icon tiles: a rounded square (`rounded-xl`) on `bg-accent` holds
  icons in tables and integration cards; no border, no shadow.
- Sidebar: shadcn `sidebar-07` pattern (icon-collapsible), muted-caps group
  labels, ⌘K search entry, footer user dropdown.
- Dashboard header: sticky bar with page chip (`bg-accent` rounded-full pill,
  icon + nav label from `nav-config.ts`) + muted inline description, right
  side avatar stack / search button / Export dropdown (`header-actions.tsx`).
  Page titles come from the header chip — section pages must NOT repeat an h2.
- Page toolbar: a section page **with page-level controls** renders exactly
  one `PageToolbar` (`page-toolbar.tsx`) directly under the sticky header;
  routes without controls (Settings, the section placeholders) start with
  their primary workflow instead of an empty bar. The toolbar is a fixed 48px
  (`h-12`) `border-b` row with controls left and the primary action right.
  Controls inside are `size="sm"` (h-8) or smaller. Detail pages pass `wrap`
  (`min-h-12`) so badges can break onto a second line at narrow widths. Do not
  put page-level padding above the toolbar; banners go in the body column.
- Sort / filter controls inside the `PageToolbar` (Overview): "Sorted by
  **X**" secondary pill → radio dropdown; "Filter" outline pill with count
  badge → checkbox dropdown (`onSelect={(e) => e.preventDefault()}` keeps it
  open while toggling). State lives in a client view component
  (`overview-view.tsx`) that feeds props to `TasksTable` (`tasks-toolbar.tsx`).
- Search: one `SearchCommand` instance owned by `SearchProvider`
  (`search-context.tsx`); sidebar + header both call
  `useSearchCommand().openSearch()`. Never mount `SearchCommand` twice — its
  internal ⌘K listener toggles, so two instances double-fire.
- Integration cards: full `Card` anatomy — squircle `bg-accent` icon tile
  beside the `CardTitle`, `CardDescription`, a `Switch` in `CardAction`, a
  status `Badge` (`success` / `outline`) in `CardContent`, and a
  `border-t border-dashed` `CardFooter` holding the ghost action
  (`integrations.tsx`).
- Query error states: `QueryError` (`query-error.tsx`) — `Empty` with a retry
  button and a sign-in link for expired sessions; `framed={false}` when the
  parent card already draws the dashed frame; `className` puts a divider on the
  state itself (`border-t border-dashed` inside a `TableCard`). The divider is
  never on a wrapper `div`.

## Precedent-First UI Workflow

New product UI must extend the existing visual language instead of being
composed from agent memory or a generic dashboard pattern. Apply this order:

1. Follow explicit user direction.
2. Inspect the nearest existing route and components that solve a similar
   workflow. Reuse their information hierarchy, action placement, responsive
   behavior, and loading/error/empty states.
3. Compose the configured shadcn/ui primitives from `packages/ui`; when a
   primitive or interaction is unfamiliar, verify it against the current
   shadcn documentation and registry before implementing it.
4. Introduce a new composition only when the nearby precedent and configured
   shadcn system do not solve the requirement. Document reusable additions
   here or in `.ai/patterns/ui-composition.md`.

This is a hierarchy, not a license to copy a screen blindly. The new surface
must preserve the behavior and accessibility appropriate to its own workflow.

## Component Rules

- Shared web components live in `packages/ui/src/components` (shadcn CLI
  managed — regenerate with `pnpm ui-add`, do not hand-edit registry output
  beyond documented patches).
- Import paths: `@turbo/ui/components/<name>`, `cn` from
  `@turbo/ui/lib/utils`, hooks from `@turbo/ui/hooks/<name>`.
- Component files use `kebab-case.tsx`, named exports, `cva` variants, `cn()`
  merging, and a stable `data-slot` attribute.
- Custom wrappers: `icon.tsx` (HugeiconsIcon, 1.5px default stroke) and
  `theme.tsx` (next-themes `ThemeProvider` + `ThemeToggle` + `useTheme`).
- Buttons have no `loading` prop — compose `<Spinner data-icon="inline-start" />`
  with `disabled` instead.
- Documented registry patch — `Card variant="dashed"` (`card.tsx`): swaps the
  `ring-1` hairline for `border border-dashed` and sets `data-variant`. Every
  dashed frame goes through this variant (via `StatCard` / `TableCard`);
  never hand-write `bg-card rounded-2xl border border-dashed` on a `div`.
- Documented registry patch — `Badge` `success` / `warning` variants
  (`badge.tsx`): `bg-success/10 text-success` and `bg-warning/10
text-warning`, plus a `size="xs" | "sm"` axis (20px display badge by
  default, 28px for pickers and toggles). Web only; the mobile badge port has
  no equivalent yet.
- Custom wrapper — `ThemeToggle` (`theme.tsx`, not registry output) is a
  one-click switch on the resolved theme. It decides its direction only after
  mount (`useSyncExternalStore`), so the server renders a neutral
  `aria-label="Toggle theme"` and hydration never mismatches;
  `packages/ui/src/__tests__/theme.test.tsx` hydrates it under jsdom to prove
  it. The way back to "system" is the user menu's "Use system theme" item
  (`nav-user.tsx`).
- The `Card` and `Badge` patches are guarded structurally by
  `packages/ui/src/__tests__/registry-patches.test.ts`; re-apply and re-run
  after any `pnpm ui-add`.
- Registry components use shorthand data variants (`data-checked:`,
  `data-open:`, `data-horizontal:` …) that only work when the consuming app's
  CSS imports `shadcn/tailwind.css` (from the `shadcn` npm package) — see
  `apps/web/src/app/styles.css`. Without it, separators render thick and
  switch/open states lose their styles.
- Documented registry patch — soft focus rings: after regenerating any
  component, replace `ring-[3px]` → `ring-2` and `ring-ring/50` →
  `ring-ring/30` (web `packages/ui` and mobile `apps/mobile/src/components/ui`).
  Buttons go one notch softer: `focus-visible:border-ring/50` +
  `focus-visible:ring-ring/20` (solid border-ring reads too loud on small
  pills). Never remove focus rings entirely (keyboard a11y).
- `CommandDialog` renders only Dialog chrome — consumers must nest a
  `<Command>` root inside it or cmdk crashes on mount.
- `Tooltip` does not self-provide context; the app wraps everything in
  `<TooltipProvider>` (see `apps/web/src/components/providers.tsx`).

## Color And Tokens

- `DESIGN.md` is the machine-readable token mirror and design-language contract.
  `.ai/patterns/ui-composition.md` is the normative arrangement grammar. Read
  both before UI work.
- Use semantic tokens only: `bg-background`, `text-foreground`, `bg-card`,
  `border-border`, `bg-primary`, `text-muted-foreground`, `text-success`,
  `text-warning`.
- Do not hardcode hex values, raw palette classes, arbitrary colors, arbitrary
  spacing, or arbitrary typography in authored components.
- A change to runtime tokens must update `DESIGN.md` in the same commit. Update
  this file and `ROADMAP_AI.md` when the visual identity or token contract
  changes.
- Before completing UI work, run `pnpm design:lint`, `pnpm design:tokens`, and
  `pnpm ui:composition`.

## Theming

- Web: `next-themes` with `attribute="class"`, `defaultTheme="system"`,
  `enableSystem`; `<html suppressHydrationWarning>`. `ThemeToggle` is a
  one-click switch that flips the _resolved_ theme (no dropdown, no explicit
  "system" item — the system default still applies until the first click).
  Toggle via `ThemeToggle` or `useTheme`.
- Mobile: Uniwind adaptive themes — `Uniwind.setTheme("light"|"dark"|"system")`
  via `theme-switcher.tsx`; read tokens in native code with
  `useCSSVariable("--background")` etc. (never hardcode).
- `tooling/tailwind/theme.css` defines `@variant light/dark` blocks consumed by
  both platforms.

## Layout Rules

- Bento grids are appropriate for dashboards, summaries, and landing sections.
- Use conventional forms and lists for workflows that require repeated data
  entry or comparison.
- Flat-first depth: surfaces separate by tonal step (background → card →
  popover), hairline borders, and the dashed frame — not by shadow. Shadows
  are for overlays only.
- Avoid nested cards.
- Avoid decorative-only blobs, gradients, and oversized empty hero sections in
  application screens.

## Mobile Rules

- Mobile screens live under `apps/mobile/src/app` and use Expo Router.
- Mobile UI primitives are react-native-reusables ports in
  `apps/mobile/src/components/ui` styled with Uniwind classNames — do not
  import web-only `@turbo/ui` components.
- Inter Display font utilities on mobile: `font-inter`, `font-inter-medium`,
  `font-inter-semibold`, `font-inter-bold` (per-weight family tokens).
````

## .ai/context/routing.md

````md
# Routing Context

## Web Routing

- Web routes use Next.js App Router under `apps/web/src/app`.
- Pages are `page.tsx`; layouts are `layout.tsx`.
- Use server components by default.
- Add `"use client"` only when client interactivity or browser APIs are required.
- Business API behavior does not belong in `apps/web/src/app/api`; app API files
  should mount or adapt shared handlers from packages.
- Page auth guards are currently disabled for template browsing:
  `apps/web/src/proxy.ts` is a pass-through (re-enable instructions are inline)
  and `dashboard/layout.tsx` / `onboarding/page.tsx` no longer redirect.
- Dashboard nav lives in `apps/web/src/components/dashboard/nav-config.ts` —
  the single source consumed by the sidebar, ⌘K palette, header title, and the
  `/dashboard/[section]` SSG placeholder route. Add nav items there, not in
  components.

## API Routing

- Hono routers live in `packages/api/src/router`.
- The API app is assembled in `packages/api/src/index.ts`.
- The web app mounts the API at `apps/web/src/app/api/[[...route]]/route.ts`.
- Protected routes must apply an explicit auth guard.

## Mobile Routing

- Mobile routes use Expo Router under `apps/mobile/src/app`.
- Keep screen-specific components close to the screen until they are reused.
- Shared mobile utilities belong under `apps/mobile/src` or an appropriate
  package if they are cross-surface.

## Agent Rule

Before adding a route, identify whether it is a web page, mobile screen, API
router, or auth adapter. Use the matching `.ai/skills/*` procedure.
````

## .ai/contracts/api-routes.generated.md

````md
# API Routes Snapshot

> Generated file. Do not edit by hand.
> Run `pnpm ai:contracts` to refresh this generated file.

## Routes

| Method | Path | Source | Auth middleware |
| --- | --- | --- | --- |
| DELETE | `/apikeys/:id` | `packages/api/src/router/api-key.ts` | yes |
| GET | `/apikeys` | `packages/api/src/router/api-key.ts` | yes |
| GET | `/auth/secret` | `packages/api/src/router/auth.ts` | yes |
| GET | `/auth/session` | `packages/api/src/router/auth.ts` | no |
| GET | `/health` | `packages/api/src/index.ts` | no |
| GET | `/tasks` | `packages/api/src/router/task.ts` | no |
| POST | `/ai/chat` | `packages/api/src/router/ai.ts` | yes |
| POST | `/apikeys` | `packages/api/src/router/api-key.ts` | yes |
| POST | `/support` | `packages/api/src/router/support.ts` | yes |
| POST | `/tasks` | `packages/api/src/router/task.ts` | yes |

## Typed client source

- `packages/api/src/index.ts` exports `AppType` and `hcWithType`.
- Web and mobile clients should infer from `AppType` instead of hand-written route types.
````

## .ai/contracts/db-schema.generated.md

````md
# Database Schema Snapshot

> Generated file. Do not edit by hand.
> Run `pnpm ai:contracts` to refresh this generated file.

## Schema files

- `packages/db/src/app-schema.ts`
- `packages/db/src/auth-schema.ts`
- `packages/db/src/schema.ts`

## Tables

| Export | DB table | Source |
| --- | --- | --- |
| `task` | `task` | `packages/db/src/app-schema.ts` |
| `user` | `user` | `packages/db/src/auth-schema.ts` |
| `session` | `session` | `packages/db/src/auth-schema.ts` |
| `account` | `account` | `packages/db/src/auth-schema.ts` |
| `verification` | `verification` | `packages/db/src/auth-schema.ts` |
| `apikey` | `apikey` | `packages/db/src/auth-schema.ts` |

## Relations

| Export | Table export | Source |
| --- | --- | --- |
| `userRelations` | `user` | `packages/db/src/auth-schema.ts` |
| `sessionRelations` | `session` | `packages/db/src/auth-schema.ts` |
| `accountRelations` | `account` | `packages/db/src/auth-schema.ts` |
| `apikeyRelations` | `apikey` | `packages/db/src/auth-schema.ts` |
````

## .ai/contracts/env.generated.md

````md
# Environment Contract Snapshot

> Generated file. Do not edit by hand.
> Run `pnpm ai:contracts` to refresh this generated file.

## Variable contract

Every variable in `.env.example`, classified from the zod schemas in the
env modules (`apps/*/src/env.ts`, `packages/auth/env.ts`) and the mobile
type declarations. **required** means the process refuses to boot without
it (validation is skipped only under `SKIP_ENV_VALIDATION`, `CI`, `lint`,
and `build` — see `packages/shared/src/env.ts`). Variables with no env
module entry are read straight from `process.env` by the listed packages
and are optional by construction: unset means the feature is off.

| Variable | Required | Runtime / reader | Exposure | Notes |
| --- | --- | --- | --- | --- |
| `APP_URL` | optional | server, worker | server | defaults to "http://localhost:3000" |
| `AUTH_SECRET` | **required** | web, server, worker | server | required at runtime |
| `EXPO_PUBLIC_API_URL` | optional | mobile | public (app bundle) | optional |
| `EXPO_PUBLIC_POSTHOG_KEY` | optional | mobile | public (app bundle) | optional |
| `EXPO_PUBLIC_SENTRY_DSN` | optional | mobile | public (app bundle) | optional |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | optional | mobile | public (app bundle) | optional |
| `EXPO_PUBLIC_SUPABASE_URL` | optional | mobile | public (app bundle) | optional |
| `GITHUB_CLIENT_ID` | optional | web, server, worker | server | optional |
| `GITHUB_CLIENT_SECRET` | optional | web, server, worker | server | optional |
| `GOOGLE_GENERATIVE_AI_API_KEY` | optional | `packages/ai` | server | read directly; unset disables the feature |
| `GROQ_API_KEY` | optional | `packages/ai` | server | read directly; unset disables the feature |
| `JOBS_POSTGRES_URL` | optional | server, worker | server | optional; empty string counts as unset |
| `NEXT_PUBLIC_APP_URL` | optional | web | public (client bundle) | defaults to "http://localhost:3000" |
| `NEXT_PUBLIC_PORT` | optional | web | public (client bundle) | defaults to "3000" |
| `NEXT_PUBLIC_POSTHOG_KEY` | optional | `apps/web` | public | read directly; unset disables the feature |
| `NEXT_PUBLIC_SENTRY_DSN` | optional | `apps/web` | public | read directly; unset disables the feature |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | optional | web | public (client bundle) | optional; empty string counts as unset |
| `NEXT_PUBLIC_SUPABASE_URL` | optional | web | public (client bundle) | optional; empty string counts as unset |
| `OPENROUTER_API_KEY` | optional | `packages/ai` | server | read directly; unset disables the feature |
| `POSTGRES_URL` | **required** | web, server, worker | server | required |
| `POSTHOG_API_KEY` | optional | `packages/analytics` | server | read directly; unset disables the feature |
| `RESEND_API_KEY` | optional | server, worker | server | optional; empty string counts as unset |
| `SENTRY_DSN` | optional | `apps/web`, `packages/analytics` | server | read directly; unset disables the feature |
| `SERVER_PORT` | optional | server, worker | server | defaults to 3001 |
| `SERVER_URL` | optional | server, worker | server | defaults to "http://localhost:3001" |
| `SUPABASE_JWT_SECRET` | optional | web, server, worker | server | optional; empty string counts as unset |
| `SUPPORT_INBOX_EMAIL` | optional | `packages/jobs` | server | read directly; unset disables the feature |

### Required per runtime

The minimum a deployment of each process needs. Everything else in the
table above is optional for that process.

| Runtime | Required variables |
| --- | --- |
| web | `AUTH_SECRET`, `POSTGRES_URL` |
| server | `AUTH_SECRET`, `POSTGRES_URL` |
| worker | `AUTH_SECRET`, `POSTGRES_URL` |
| mobile | None |

Mobile build identity is set per EAS profile in `apps/mobile/eas.json`,
not in `.env`: `EXPO_PUBLIC_APP_NAME`, `EXPO_PUBLIC_PACKAGE_NAME`.

### Groups (from .env.example)

- **Database** — `POSTGRES_URL`
- **App URLs / ports** — `SERVER_PORT`, `SERVER_URL`, `APP_URL`, `NEXT_PUBLIC_PORT`, `NEXT_PUBLIC_APP_URL`, `EXPO_PUBLIC_API_URL`
- **Better Auth** — `AUTH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- **Supabase** — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`
- **Resend (email sending)** — `RESEND_API_KEY`
- **Support inbox (optional — defaults to the mail package's DEFAULT_FROM)** — `SUPPORT_INBOX_EMAIL`
- **Background jobs (optional — pg-boss). When set, POST /support enqueues the** — `JOBS_POSTGRES_URL`
- **PostHog Analytics (keys only — host is hardcoded)** — `NEXT_PUBLIC_POSTHOG_KEY`, `POSTHOG_API_KEY`, `EXPO_PUBLIC_POSTHOG_KEY`
- **Sentry Error Tracking** — `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `EXPO_PUBLIC_SENTRY_DSN`
- **AI Providers** — `GOOGLE_GENERATIVE_AI_API_KEY`, `OPENROUTER_API_KEY`, `GROQ_API_KEY`

## Infisical

Project: `78e4f00e-f639-4c50-a3fd-b373015cb8ca` (from `.infisical.json`),
default environment `dev`.
Each Infisical environment should hold the required variables for the
runtimes it serves (table above) plus whichever optional features that
environment enables. `pnpm with-secrets <cmd>` and the Docker images
inject them at boot (`scripts/infisical-run.sh`).

## turbo.json globalEnv

- `APP_URL`
- `AUTH_SECRET`
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_POSTHOG_KEY`
- `EXPO_PUBLIC_SENTRY_DSN`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `GROQ_API_KEY`
- `JOBS_POSTGRES_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_PORT`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `OPENROUTER_API_KEY`
- `POSTGRES_URL`
- `POSTHOG_API_KEY`
- `RESEND_API_KEY`
- `SENTRY_DSN`
- `SERVER_PORT`
- `SERVER_URL`
- `SUPABASE_JWT_SECRET`
- `SUPPORT_INBOX_EMAIL`

## .env.example variables

- `APP_URL`
- `AUTH_SECRET`
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_POSTHOG_KEY`
- `EXPO_PUBLIC_SENTRY_DSN`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `GROQ_API_KEY`
- `JOBS_POSTGRES_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_PORT`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `OPENROUTER_API_KEY`
- `POSTGRES_URL`
- `POSTHOG_API_KEY`
- `RESEND_API_KEY`
- `SENTRY_DSN`
- `SERVER_PORT`
- `SERVER_URL`
- `SUPABASE_JWT_SECRET`
- `SUPPORT_INBOX_EMAIL`

## Env validation modules

| File | Variables |
| --- | --- |
| apps/server/src/env.ts | `APP_URL`, `JOBS_POSTGRES_URL`, `PORT`, `POSTGRES_URL`, `RESEND_API_KEY`, `SERVER_PORT`, `SERVER_URL` |
| apps/web/src/env.ts | `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_PORT`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NODE_ENV`, `POSTGRES_URL` |
| packages/auth/env.ts | `AUTH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `NODE_ENV`, `SUPABASE_JWT_SECRET` |
| packages/shared/src/env.ts | None |

## Drift Report

### In turbo.json but missing from .env.example

- None

### In .env.example but missing from turbo.json globalEnv

- None

### Validated in env modules but missing from .env.example

- None

### Declared in a schema but missing from .env.example

- None
````

## .ai/contracts/package-exports.generated.md

````md
# Package Exports Snapshot

> Generated file. Do not edit by hand.
> Run `pnpm ai:contracts` to refresh this generated file.

| Package | Path | Exports |
| --- | --- | --- |
| `@turbo/mobile` | `apps/mobile` | None |
| `@turbo/web` | `apps/web` | None |
| `@turbo/ai` | `packages/ai` | `.`, `./client` |
| `@turbo/analytics` | `packages/analytics` | `.`, `./server`, `./events` |
| `@turbo/api` | `packages/api` | `.` |
| `@turbo/assets` | `packages/assets` | `./fonts/*` |
| `@turbo/auth` | `packages/auth` | `.`, `./middleware`, `./client`, `./env`, `./trusted-origins` |
| `@turbo/db` | `packages/db` | `.`, `./client`, `./schema` |
| `@turbo/jobs` | `packages/jobs` | `.`, `./client`, `./worker`, `./tasks/*` |
| `@turbo/mail` | `packages/mail` | `.`, `./client`, `./templates/*` |
| `@turbo/shared` | `packages/shared` | `.`, `./constants`, `./env` |
| `@turbo/supabase` | `packages/supabase` | `.`, `./client` |
| `@turbo/ui` | `packages/ui` | `./components/*`, `./lib/*`, `./hooks/*` |
| `@turbo/validators` | `packages/validators` | `.` |
| `@turbo/eslint-config` | `tooling/eslint` | `./base`, `./nextjs`, `./react` |
| `@turbo/github` | `tooling/github` | None |
| `@turbo/prettier-config` | `tooling/prettier` | `.` |
| `@turbo/tailwind-config` | `tooling/tailwind` | `./theme`, `./postcss-config` |
| `@turbo/tsconfig` | `tooling/typescript` | None |
| `@turbo/vitest-config` | `tooling/vitest` | `.` |
````

## .ai/contracts/dependency-graph.generated.md

````md
# Workspace Dependency Graph Snapshot

> Generated file. Do not edit by hand.
> Run `pnpm ai:contracts` to refresh this generated file.

## Workspace packages

- `@turbo/mobile`
- `@turbo/web`
- `@turbo/ai`
- `@turbo/analytics`
- `@turbo/api`
- `@turbo/assets`
- `@turbo/auth`
- `@turbo/db`
- `@turbo/jobs`
- `@turbo/mail`
- `@turbo/shared`
- `@turbo/supabase`
- `@turbo/ui`
- `@turbo/validators`
- `@turbo/eslint-config`
- `@turbo/github`
- `@turbo/prettier-config`
- `@turbo/tailwind-config`
- `@turbo/tsconfig`
- `@turbo/vitest-config`

## Internal dependencies

| Package | Path | Internal dependencies |
| --- | --- | --- |
| `@turbo/mobile` | `apps/mobile` | `@turbo/analytics`, `@turbo/api`, `@turbo/assets`, `@turbo/auth`, `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/shared`, `@turbo/supabase`, `@turbo/tailwind-config`, `@turbo/tsconfig`, `@turbo/validators` |
| `@turbo/web` | `apps/web` | `@turbo/analytics`, `@turbo/api`, `@turbo/auth`, `@turbo/db`, `@turbo/eslint-config`, `@turbo/mail`, `@turbo/prettier-config`, `@turbo/shared`, `@turbo/tailwind-config`, `@turbo/tsconfig`, `@turbo/ui`, `@turbo/validators` |
| `@turbo/ai` | `packages/ai` | `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/analytics` | `packages/analytics` | `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/shared`, `@turbo/tsconfig` |
| `@turbo/api` | `packages/api` | `@turbo/ai`, `@turbo/analytics`, `@turbo/auth`, `@turbo/db`, `@turbo/eslint-config`, `@turbo/jobs`, `@turbo/mail`, `@turbo/prettier-config`, `@turbo/shared`, `@turbo/tsconfig`, `@turbo/validators` |
| `@turbo/assets` | `packages/assets` | None |
| `@turbo/auth` | `packages/auth` | `@turbo/db`, `@turbo/eslint-config`, `@turbo/mail`, `@turbo/prettier-config`, `@turbo/shared`, `@turbo/tsconfig` |
| `@turbo/db` | `packages/db` | `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/shared`, `@turbo/tsconfig` |
| `@turbo/jobs` | `packages/jobs` | `@turbo/eslint-config`, `@turbo/mail`, `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/mail` | `packages/mail` | `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/shared` | `packages/shared` | `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/supabase` | `packages/supabase` | `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/ui` | `packages/ui` | `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/validators` | `packages/validators` | `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/eslint-config` | `tooling/eslint` | `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/github` | `tooling/github` | None |
| `@turbo/prettier-config` | `tooling/prettier` | `@turbo/tsconfig` |
| `@turbo/tailwind-config` | `tooling/tailwind` | `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/tsconfig` | `tooling/typescript` | None |
| `@turbo/vitest-config` | `tooling/vitest` | `@turbo/prettier-config`, `@turbo/tsconfig` |
````
