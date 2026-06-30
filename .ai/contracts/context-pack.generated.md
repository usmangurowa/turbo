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
| Create a component     | `.ai/skills/create-component.md`    |
| Create a package       | `.ai/skills/create-package.md`      |
| Create an app          | `.ai/skills/create-app.md`          |
| Create an API endpoint | `.ai/skills/create-api-endpoint.md` |
| Database change        | `.ai/skills/database-change.md`     |
| Create a page/screen   | `.ai/skills/create-page.md`         |
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
- Last updated: 2026-05-24

## Active Sprint

| ID     | Status   | Task                                                 | Files                                                                              | Validation           |
| ------ | -------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------- |
| AI-001 | complete | Bootstrap AI-native repository controls              | `AGENTS.md`, `.ai/`, `.github/`, `.cursor/`, `ARCHITECTURE.md`, `system_prompt.md` | `pnpm ai:contracts`  |
| AI-002 | complete | Sync stale public documentation with package reality | `README.md`, `.env.example`, `turbo.json`                                          | `pnpm ai:env:strict` |
| AI-003 | complete | Add generated contract snapshots for agents          | `.ai/contracts/*.generated.md`, `scripts/ai/*`                                     | `pnpm ai:contracts`  |
| AI-004 | complete | Enforce fresh AI contract snapshots in CI            | `.github/workflows/ci.yml`, `package.json`                                         | `pnpm ai:contracts:check` |

## Implemented Features

| Date       | Feature                         | Files                                                                                                     | Notes                                                                                         |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 2026-05-17 | Agent-native memory foundation  | `AGENTS.md`, `.ai/`, `.github/copilot-instructions.md`, `.cursor/rules/*`, `CLAUDE.md`                    | `.ai/` is the source of truth for agent context.                                              |
| 2026-05-17 | Task-oriented agent skills      | `.ai/skills/*`, `.github/prompts/*`, `.claude/commands/*`                                                 | Common tasks route through explicit procedures.                                               |
| 2026-05-17 | Generated AI contract snapshots | `.ai/contracts/*.generated.md`, `scripts/ai/*`, `package.json`                                            | Agents can inspect API, DB, env, package export, and dependency graph facts without guessing. |
| 2026-05-17 | Spec-first workflow             | `.ai/skills/feature-spec.md`, `.ai/specs/_template.spec.md`, `.github/prompts/new-feature-spec.prompt.md` | Non-trivial work has an explicit planning and validation template.                            |
| 2026-06-30 | Standalone server runtime       | `apps/server`, `packages/auth/src/trusted-origins.ts`, `.env.example`, `turbo.json`                       | `apps/server` hosts the existing `@turbo/api` app without moving API business logic.          |

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
| Turborepo | ^2.9.16                                | Task orchestration, caching, build pipeline |
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
| Web framework    | Next.js     | 16.2.7                                    |
| Mobile framework | Expo SDK    | 56 (`react-native` ~0.85.3)               |
| React            | React       | 19.2.3 via `catalog:react19`              |
| API framework    | Hono        | ^4.12.23 (`@hono/node-server` for server) |
| ORM              | Drizzle ORM | drizzle-orm ^0.45.2; drizzle-kit ^0.31.10 |
| Database         | PostgreSQL  | via Supabase                              |
| Database driver  | postgres.js | ^3.4.9 (`prepare: false` for pooled URLs) |
| Auth             | Better Auth | 1.6.14                                    |
| Validation       | Zod         | catalog (`4.4.3`)                         |

## UI & Styling

| Tool               | Details                                        |
| ------------------ | ---------------------------------------------- |
| Component library  | shadcn/ui (Radix primitives + CVA variants)    |
| CSS framework      | Tailwind CSS 4.3.0                             |
| Mobile styling     | Uniwind 1.8.x (Tailwind for RN)                |
| Icons              | HugeIcons (React + React Native)               |
| Animation (web)    | Motion (Framer Motion) 12.x                    |
| Animation (mobile) | react-native-reanimated 4.3.1 + worklets 0.8.3 |

## State & Data

| Concern      | Tool                                  |
| ------------ | ------------------------------------- |
| Server state | TanStack Query 5.x                    |
| Client state | Zustand 5.x                           |
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
| AI providers    | Gemini, OpenRouter, Groq (via Vercel AI SDK)  |

## Testing & Quality

| Tool              | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| Vitest            | Unit/integration testing (4.1.x)                 |
| ESLint 9          | Linting (flat config)                            |
| Prettier 3.8      | Code formatting with import sort + tailwind sort |
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

Example: `packages/ui/src/components/button.tsx`

## API Patterns (Hono)

- Routers are separate files under `packages/api/src/router/`
- Each router creates a `new Hono<AppContext>()`
- Auth middleware applied per-router with `.use("*", authMiddleware)`
- Context variables typed via `AppContext` interface
- Typed RPC client exported for frontend consumption (`hcWithType`)
- Security middleware stack: secure headers → CORS → rate limiting

Example: `packages/api/src/router/api-key.ts`

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
- The standalone server uses `SERVER_PORT` for local port configuration; generic `PORT` is reserved as a platform fallback and should not be set in `.env.example`.

## Operational Commands

- Run `pnpm auth:generate` after Better Auth schema/config changes that affect generated auth schema output.
- Run `pnpm db:generate -- --name <migration_name>` after Drizzle schema changes that need durable migrations.
- Run `pnpm db:migrate` to apply pending Drizzle migrations.
- Use `pnpm db:push:local` only for disposable local databases.
- Use `pnpm db:studio` for local schema/data inspection during development.
- Prefer workspace/root scripts when available over ad-hoc package commands.

## Code Style

- **Prettier** for formatting (configured via `@turbo/prettier-config`)
- **ESLint 9** flat config with shared base configs
- **TypeScript strict mode** across all packages
- Import sorting via `@ianvs/prettier-plugin-sort-imports`
- Tailwind class sorting via `prettier-plugin-tailwindcss`
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

The visual system is a mature shadcn/ui-style interface built on Tailwind CSS 4,
Radix primitives, CVA variants, and shared theme tokens. Preserve the neutral
baseline unless a task explicitly requests a visual identity change.

## Component Rules

- Shared web components live in `packages/ui/src/components`.
- Component files use `kebab-case.tsx`.
- Components use named exports, not default exports.
- Components use `cva` for variants when variants exist.
- Components use `cn()` for class merging.
- Components include a stable `data-slot` attribute.
- Props extend the correct `React.ComponentProps<"element">` type.

## Shape And Spacing

- Use the shared radius tokens from `tooling/tailwind/theme.css`.
- Existing controls commonly use soft rounded shapes such as `rounded-4xl`.
- Use consistent spacing from Tailwind utilities; avoid arbitrary spacing unless
  it solves a specific layout issue.
- Keep dense product surfaces scannable. Avoid marketing-scale spacing in forms,
  settings, tables, and dashboards.

## Color And Tokens

- Use semantic tokens such as `bg-background`, `text-foreground`, `bg-card`,
  `border-border`, `bg-primary`, and `text-muted-foreground`.
- Do not hardcode one-off brand colors in components.
- Do not change shared theme variables without updating this file and
  `ROADMAP_AI.md`.
- Avoid broad palette changes unless explicitly approved by the user.

## Layout Rules

- Bento grids are appropriate for dashboards, summaries, and landing sections.
- Use conventional forms and lists for workflows that require repeated data
  entry or comparison.
- Avoid nested cards.
- Avoid decorative-only blobs, gradients, and oversized empty hero sections in
  application screens.

## Mobile Rules

- Mobile screens live under `apps/mobile/src/app` and use Expo Router.
- Mobile styling uses Uniwind conventions and local/native primitives rather
  than importing web-only `@turbo/ui` components.
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
- `AUTH_REDIRECT_PROXY_URL`
- `AUTH_SECRET`
- `EAS_PROJECT_ID`
- `EXPO_OWNER`
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_APP_NAME`
- `EXPO_PUBLIC_APP_SCHEME`
- `EXPO_PUBLIC_APP_SLUG`
- `EXPO_PUBLIC_PACKAGE_NAME`
- `EXPO_PUBLIC_POSTHOG_HOST`
- `EXPO_PUBLIC_POSTHOG_KEY`
- `EXPO_PUBLIC_SENTRY_DSN`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_URL`
- `GEMINI_API_KEY`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `GROQ_API_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_PORT`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `OPENROUTER_API_KEY`
- `POSTGRES_URL`
- `POSTHOG_API_KEY`
- `POSTHOG_HOST`
- `RESEND_API_KEY`
- `SENTRY_DSN`
- `SERVER_PORT`
- `SERVER_URL`
- `SUPABASE_JWT_SECRET`
- `TRIGGER_PROJECT_ID`
- `TRIGGER_SECRET_KEY`

## .env.example variables

- `APP_URL`
- `AUTH_REDIRECT_PROXY_URL`
- `AUTH_SECRET`
- `EAS_PROJECT_ID`
- `EXPO_OWNER`
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_APP_NAME`
- `EXPO_PUBLIC_APP_SCHEME`
- `EXPO_PUBLIC_APP_SLUG`
- `EXPO_PUBLIC_PACKAGE_NAME`
- `EXPO_PUBLIC_POSTHOG_HOST`
- `EXPO_PUBLIC_POSTHOG_KEY`
- `EXPO_PUBLIC_SENTRY_DSN`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_URL`
- `GEMINI_API_KEY`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `GROQ_API_KEY`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_PORT`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `OPENROUTER_API_KEY`
- `POSTGRES_URL`
- `POSTHOG_API_KEY`
- `POSTHOG_HOST`
- `RESEND_API_KEY`
- `SENTRY_DSN`
- `SERVER_PORT`
- `SERVER_URL`
- `SUPABASE_JWT_SECRET`
- `TRIGGER_PROJECT_ID`
- `TRIGGER_SECRET_KEY`

## Env validation modules

| File | Variables |
| --- | --- |
| apps/server/src/env.ts | `APP_URL`, `CI`, `PORT`, `POSTGRES_URL`, `RESEND_API_KEY`, `SERVER_PORT`, `SERVER_URL`, `SKIP_ENV_VALIDATION` |
| apps/web/src/env.ts | `CI`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_PORT`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NODE_ENV`, `POSTGRES_URL`, `SKIP_ENV_VALIDATION` |
| packages/auth/env.ts | `AUTH_SECRET`, `CI`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `NODE_ENV`, `SKIP_ENV_VALIDATION`, `SUPABASE_JWT_SECRET` |

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
| `@turbo/jobs` | `packages/jobs` | `.`, `./tasks/*`, `./domain/*` |
| `@turbo/mail` | `packages/mail` | `.`, `./client`, `./templates/*` |
| `@turbo/shared` | `packages/shared` | `.`, `./constants` |
| `@turbo/supabase` | `packages/supabase` | `.`, `./client` |
| `@turbo/ui` | `packages/ui` | `.`, `./*`, `./hooks/*` |
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
| `@turbo/mobile` | `apps/mobile` | `@turbo/analytics`, `@turbo/api`, `@turbo/assets`, `@turbo/auth`, `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/supabase`, `@turbo/tailwind-config`, `@turbo/tsconfig`, `@turbo/validators` |
| `@turbo/web` | `apps/web` | `@turbo/analytics`, `@turbo/api`, `@turbo/auth`, `@turbo/db`, `@turbo/eslint-config`, `@turbo/mail`, `@turbo/prettier-config`, `@turbo/shared`, `@turbo/supabase`, `@turbo/tailwind-config`, `@turbo/tsconfig`, `@turbo/ui`, `@turbo/validators` |
| `@turbo/ai` | `packages/ai` | `@turbo/analytics`, `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/shared`, `@turbo/tsconfig` |
| `@turbo/analytics` | `packages/analytics` | `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/api` | `packages/api` | `@turbo/ai`, `@turbo/analytics`, `@turbo/auth`, `@turbo/db`, `@turbo/eslint-config`, `@turbo/jobs`, `@turbo/mail`, `@turbo/prettier-config`, `@turbo/shared`, `@turbo/tsconfig`, `@turbo/validators` |
| `@turbo/assets` | `packages/assets` | None |
| `@turbo/auth` | `packages/auth` | `@turbo/db`, `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/db` | `packages/db` | `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/jobs` | `packages/jobs` | `@turbo/ai`, `@turbo/analytics`, `@turbo/db`, `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/shared`, `@turbo/tsconfig` |
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
