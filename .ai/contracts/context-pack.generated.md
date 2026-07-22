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

## Deep References

For detailed technology guides, see `.agents/skills/`:

- TypeScript patterns → `.agents/skills/typescript-expert/`
- TanStack Query → `.agents/skills/tanstack-query/`
- Tailwind CSS → `.agents/skills/tailwind-patterns/`
- Better Auth → `.agents/skills/better-auth-best-practices/`
- Drizzle ORM → `.agents/skills/drizzle/`
- Trigger.dev → `.agents/skills/trigger-dev-tasks/`
- Turborepo → `.agents/skills/turborepo/`

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
| `codebase-first` | ALWAYS-ON for any code change: the codebase decides, never invent — follow documented rules and existing patterns, ask when neither exists. |
| `shadcn` | Any shadcn/ui work: adding, composing, styling, or debugging components via the shadcn CLI and registry. |
| `writing-style` | Always-on for prose: READMEs, docs, PR descriptions, commit messages, reports, UI and marketing copy. |

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
- `apps/server` is the standalone Node/Hono runtime for the shared API app.
- `apps/mobile` is the Expo Router mobile application.
- `packages/api` owns business API routes through Hono routers.
- `packages/auth` owns Better Auth runtime configuration and auth generation.
- `packages/db` owns Drizzle/Postgres schema and database clients.
- `packages/ui` owns shared web UI components following shadcn/ui patterns.
- `packages/validators` owns shared Zod contracts.
- `packages/jobs` owns Trigger.dev background tasks.
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
entrypoints. The API app is created in `packages/api/src/index.ts` and exports
`AppType` for typed clients.

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
- Active initiative: Keep AI contract snapshots and agent memory current
- Last updated: 2026-07-22

## Active Sprint

| ID     | Status   | Task                                                 | Files                                                                              | Validation                |
| ------ | -------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------- |
| AI-001 | complete | Bootstrap AI-native repository controls              | `AGENTS.md`, `.ai/`, `.github/`, `.cursor/`, `ARCHITECTURE.md`, `system_prompt.md` | `pnpm ai:contracts`       |
| AI-002 | complete | Sync stale public documentation with package reality | `README.md`, `.env.example`, `turbo.json`                                          | `pnpm ai:env:strict`      |
| AI-003 | complete | Add generated contract snapshots for agents          | `.ai/contracts/*.generated.md`, `scripts/ai/*`                                     | `pnpm ai:contracts`       |
| AI-004 | complete | Enforce fresh AI contract snapshots in CI            | `.github/workflows/ci.yml`, `package.json`                                         | `pnpm ai:contracts:check` |

## Implemented Features

| Date       | Feature                                   | Files                                                                                                                                     | Notes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-05-17 | Agent-native memory foundation            | `AGENTS.md`, `.ai/`, `.github/copilot-instructions.md`, `.cursor/rules/*`, `CLAUDE.md`                                                    | `.ai/` is the source of truth for agent context.                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 2026-05-17 | Task-oriented agent skills                | `.ai/skills/*`, `.github/prompts/*`, `.claude/commands/*`                                                                                 | Common tasks route through explicit procedures.                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| 2026-05-17 | Generated AI contract snapshots           | `.ai/contracts/*.generated.md`, `scripts/ai/*`, `package.json`                                                                            | Agents can inspect API, DB, env, package export, and dependency graph facts without guessing.                                                                                                                                                                                                                                                                                                                                                                                                   |
| 2026-05-17 | Spec-first workflow                       | `.ai/skills/feature-spec.md`, `.ai/specs/_template.spec.md`, `.github/prompts/new-feature-spec.prompt.md`                                 | Non-trivial work has an explicit planning and validation template.                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 2026-06-30 | Standalone server runtime                 | `apps/server`, `packages/auth/src/trusted-origins.ts`, `.env.example`, `turbo.json`                                                       | `apps/server` hosts the existing `@turbo/api` app without moving API business logic.                                                                                                                                                                                                                                                                                                                                                                                                            |
| 2026-07-14 | Anti-slop UI skill                        | `.ai/skills/anti-slop-ui.md`, `.ai/skills/00-index.md`, `AGENTS.md`, `.github/copilot-instructions.md`, `.cursor/rules/design-system.mdc` | UI review and page-polish tasks now have a repo-local quality bar for avoiding generic AI UI patterns while preserving the neutral product baseline.                                                                                                                                                                                                                                                                                                                                            |
| 2026-07-15 | Full anti-slop reference                  | `.ai/references/pols-anti-slop-design-law.md`, `.ai/skills/anti-slop-ui.md`                                                               | The full external design law is vendored separately and linked from the concise repo-local UI workflow.                                                                                                                                                                                                                                                                                                                                                                                         |
| 2026-07-22 | Design system rebuild (web + ui + mobile) | `tooling/tailwind/theme.css`, `packages/ui/src/*`, `packages/assets/fonts/*`, `apps/web/src/*`, `apps/mobile/src/*`                       | Neutral `#161616` dark / `#FAFAFA` light palette, `#0659FF` accent, Inter Display, radius 0.75rem. `packages/ui` regenerated with shadcn CLI (`radix-maia`, 60 components, exports `./components/*` `./lib/*` `./hooks/*`). Web rebuilt: landing, 6 auth pages, dashboard (collapsible sidebar, ⌘K, dashed stat cards, grouped tasks table, integrations). Mobile aligned: Inter fonts, token-driven tab bar, segmented theme switcher. Spec: `.ai/specs/active/design-system-rebuild.spec.md`. |

## Architectural Change Log

| Date       | Decision                                          | ADR / Files                                                          | Regression Guard                                                                   |
| ---------- | ------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 2026-05-17 | Adopt `.ai/` as the canonical agent memory system | `.ai/decisions/ADR-0001-adopt-agent-native-architecture.md`          | New patterns, dependencies, and decisions must update `.ai/` in the same PR.       |
| 2026-05-17 | Keep tool-specific agent files thin               | `.github/copilot-instructions.md`, `.cursor/rules/*`, `CLAUDE.md`    | Do not duplicate long-form rules across tools; link back to `.ai/`.                |
| 2026-05-17 | Generate machine-readable contract snapshots      | `scripts/ai/generate-contracts.mjs`, `.ai/context/data-contracts.md` | Run `pnpm ai:contracts` after API, DB, env, package export, or dependency changes. |

## Known TODOs

| Priority | Task                                                         | Source                                                                                                   | Blocking? |
| -------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | --------- |
| high     | Keep generated contract snapshots current                    | `.ai/contracts/`, `scripts/ai/`                                                                          | no        |
| medium   | Add a sync policy for duplicated tool-specific skill bundles | `.agents/`, `.github/skills/`, `.cursor/skills/`, `.claude/skills/`, `.codex/skills/`, `.gemini/skills/` | no        |

## Regression Guards

- Do not move business API logic into `apps/web/src/app/api`; app API files only
  mount or adapt shared API handlers.
- Do not move business API logic into `apps/server`; it is a runtime host for
  `@turbo/api`.
- Do not bypass the typed Hono client for application API calls.
- Do not introduce database schema changes without updating Drizzle exports and
  generated contract snapshots.
- Do not change shared design tokens or component shape conventions without
  updating `.ai/context/design-system.md`.
- Do not add new package exports without keeping package contract snapshots
  current.
- Do not introduce new workflows without updating the matching `.ai/skills/*`
  file or creating a new skill.

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

| Tool      | Version                                | Purpose                                     |
| --------- | -------------------------------------- | ------------------------------------------- |
| Turborepo | ^2.10.5                                | Task orchestration, caching, build pipeline |
| pnpm      | ^10.19.0                               | Package manager with workspace support      |
| Node.js   | 22.21.0 (`.nvmrc`), engines `^22.14.0` | Runtime                                     |

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
  jobs/         → Trigger.dev background tasks
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
| Web framework    | Next.js     | 16.2.11                                   |
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

| Service         | Tool                                          |
| --------------- | --------------------------------------------- |
| Hosting         | Vercel (web), EAS (mobile)                    |
| API runtime     | Standalone Node/Hono app (`apps/server`)      |
| Database        | Supabase (Postgres)                           |
| Email           | Resend                                        |
| Background jobs | Trigger.dev                                   |
| Analytics       | PostHog                                       |
| Error tracking  | Sentry (@sentry/nextjs, @sentry/react-native) |
| AI providers    | Gemini, OpenRouter, Groq (Vercel AI SDK v7)   |

## Testing & Quality

| Tool              | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| Vitest            | Unit/integration testing (4.1.x)                 |
| ESLint 10         | Linting (flat config)                            |
| Prettier 3.9      | Code formatting with import sort + tailwind sort |
| TypeScript strict | Type checking across all packages                |

## CI/CD

**GitHub Actions** (`.github/workflows/ci.yml`):

- `lint` → `pnpm lint && pnpm lint:ws`
- `format` → `pnpm format`
- `typecheck` → `pnpm typecheck`
- `test` → `pnpm test`

Turbo remote caching via Vercel.
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
- `Button` has no `loading` prop — render
  `{pending && <Spinner data-icon="inline-start" />}` and set `disabled`
- Toasts: `import { toast } from "sonner"` with `<Toaster />` mounted from
  `@turbo/ui/components/sonner`

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

Example: `packages/api/src/router/api-key.ts`

## Auth Patterns (Better Auth)

- Apps create auth via `createAppAuth()` from `@turbo/auth`; only base URLs and framework plugins are app-specific.
- `createAppAuth()` owns all shared wiring: env-derived secrets, the GitHub social provider conditional, and the OTP email bridge.
- Next.js apps pass `extraPlugins: [nextCookies()]`; the standalone server passes no extra plugins.
- Never call `initAuth()` directly from an app — it is the low-level primitive; app code always goes through `createAppAuth()`.
- New social providers or plugins are added once in `packages/auth/src/index.ts`.

## Database Patterns (Drizzle)

- Schemas in `packages/db/src/` as `*-schema.ts`
- Use `pgTable()` for table definitions
- Relations defined separately with `relations()`
- Indexes defined in table callback: `(table) => [index(...)]`
- Column naming: `snake_case` in DB, `camelCase` in TypeScript
- All tables include `createdAt` and `updatedAt` timestamps
- Foreign keys with `onDelete: "cascade"` for user-owned data

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

## Operational Commands

- Run `pnpm auth:generate` after Better Auth schema/config changes that affect generated auth schema output.
- Run `pnpm db:generate -- --name <migration_name>` after Drizzle schema changes that need durable migrations.
- Run `pnpm db:migrate` to apply pending Drizzle migrations.
- Production migrations run via migrate-on-boot: `pnpm start:server` chains `db:migrate && start:prod`; the standalone server is the only migration owner.
- Use `pnpm db:push:local` only for disposable local databases.
- Use `pnpm db:studio` for local schema/data inspection during development.
- Prefer workspace/root scripts when available over ad-hoc package commands.

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
| Jobs       | `packages/jobs`       | Trigger.dev tasks                        |

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
- **Light mode**: near-white `#FAFAFA`; greige `#D8D9D4`-family tints are used
  for secondary surfaces and input borders only, never the page background.
- **Accent**: electric blue `#0659FF` (`oklch(0.5406 0.2549 262.56)`, token
  `--primary-500`) in both modes.
- **Muted text**: `#989A9D` dark / neutral gray light.
- **Brand mark**: HugeIcons "AI collage template" outline icon (1.5px stroke),
  embedded inline in `apps/web/src/components/turbo-logo.tsx` because
  `AiCollageTemplateIcon` is Pro-only (not in `@hugeicons/core-free-icons`).
  Favicon is `apps/web/src/app/icon.svg` (Next.js file convention, brand-blue
  stroke) — there is no `favicon.ico`. Keep both in sync if the mark changes.
- **Radii**: `--radius: 0.75rem` → sm 8px (badges), lg 12px (buttons/inputs),
  xl 16px (panels); extended `--radius-2xl..4xl` for pills.
- **Status colors**: `--success` (green) and `--warning` (orange) tokens exist
  for status dots and trends; chart palette `--chart-1..5`.

## Signature Patterns

- Stat cards: `border-dashed` border, muted label top-left, ~text-5xl medium
  numeral (`NumberTicker`), small muted caption below.
- Tables: icon+label column headers, muted grouped section rows ("This Week" +
  count chip), colored squircle date icons, status dots, pill badges on
  secondary background.
- Sidebar: shadcn `sidebar-07` pattern (icon-collapsible), muted-caps group
  labels, ⌘K search entry, footer user dropdown.
- Integration cards: white squircle logo tile, dashed divider, ghost footer
  action.

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
- Registry components use shorthand data variants (`data-checked:`,
  `data-open:`, `data-horizontal:` …) that only work when the consuming app's
  CSS imports `shadcn/tailwind.css` (from the `shadcn` npm package) — see
  `apps/web/src/app/styles.css`. Without it, separators render thick and
  switch/open states lose their styles.
- Documented registry patch — soft focus rings: after regenerating any
  component, replace `ring-[3px]` → `ring-2` and `ring-ring/50` →
  `ring-ring/30` (web `packages/ui` and mobile `apps/mobile/src/components/ui`).
  Never remove focus rings entirely (keyboard a11y).
- `CommandDialog` renders only Dialog chrome — consumers must nest a
  `<Command>` root inside it or cmdk crashes on mount.
- `Tooltip` does not self-provide context; the app wraps everything in
  `<TooltipProvider>` (see `apps/web/src/components/providers.tsx`).

## Color And Tokens

- Use semantic tokens only: `bg-background`, `text-foreground`, `bg-card`,
  `border-border`, `bg-primary`, `text-muted-foreground`, `text-success`,
  `text-warning`.
- Do not hardcode hex values in components (web or mobile).
- Do not change shared theme variables without updating this file and
  `ROADMAP_AI.md`.

## Theming

- Web: `next-themes` with `attribute="class"`, `defaultTheme="system"`,
  `enableSystem`; `<html suppressHydrationWarning>`. Toggle via `ThemeToggle`
  or `useTheme`.
- Mobile: Uniwind adaptive themes — `Uniwind.setTheme("light"|"dark"|"system")`
  via `theme-switcher.tsx`; read tokens in native code with
  `useCSSVariable("--background")` etc. (never hardcode).
- `tooling/tailwind/theme.css` defines `@variant light/dark` blocks consumed by
  both platforms.

## Layout Rules

- Bento grids are appropriate for dashboards, summaries, and landing sections.
- Use conventional forms and lists for workflows that require repeated data
  entry or comparison.
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
| DELETE | `/apikeys/:id` | `packages/api/src/router/api-key.ts` | no |
| GET | `/apikeys` | `packages/api/src/router/api-key.ts` | no |
| GET | `/auth/secret` | `packages/api/src/router/auth.ts` | yes |
| GET | `/auth/session` | `packages/api/src/router/auth.ts` | no |
| GET | `/health` | `packages/api/src/index.ts` | no |
| POST | `/apikeys` | `packages/api/src/router/api-key.ts` | no |
| POST | `/support` | `packages/api/src/router/support.ts` | no |

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

- `packages/db/src/auth-schema.ts`
- `packages/db/src/schema.ts`

## Tables

| Export | DB table | Source |
| --- | --- | --- |
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

## Env validation modules

| File | Variables |
| --- | --- |
| apps/server/src/env.ts | `APP_URL`, `PORT`, `POSTGRES_URL`, `RESEND_API_KEY`, `SERVER_PORT`, `SERVER_URL` |
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
| `@turbo/jobs` | `packages/jobs` | `.` |
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
| `@turbo/api` | `packages/api` | `@turbo/analytics`, `@turbo/auth`, `@turbo/db`, `@turbo/eslint-config`, `@turbo/mail`, `@turbo/prettier-config`, `@turbo/shared`, `@turbo/tsconfig`, `@turbo/validators` |
| `@turbo/assets` | `packages/assets` | None |
| `@turbo/auth` | `packages/auth` | `@turbo/db`, `@turbo/eslint-config`, `@turbo/mail`, `@turbo/prettier-config`, `@turbo/shared`, `@turbo/tsconfig` |
| `@turbo/db` | `packages/db` | `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/shared`, `@turbo/tsconfig` |
| `@turbo/jobs` | `packages/jobs` | `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/tsconfig` |
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
