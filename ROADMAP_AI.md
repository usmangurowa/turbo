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
| 2026-07-23 | Skills bundle sync check                  | `scripts/ai/check-skills-sync.mjs`, `package.json`, `.github/workflows/ci.yml`                                                            | `pnpm skills:check` verifies every tool-specific skill mirror (`.claude`, `.github` full; `.cursor`, `.codex`, `.gemini` subsets) is valid symlinks into `.agents/skills/`, and CI fails on missing, dangling, or unknown entries.                                                                                                                                                                                                                                                              |
| 2026-07-23 | Support email flow via Trigger.dev | `packages/jobs/src/tasks/send-support-email.ts`, `packages/api/src/router/support.ts`, `packages/api/src/__tests__/support.test.ts`, `.env.example`, `turbo.json` | POST /support now requires auth and sends the SupportEmail template: enqueued via the `send-support-email` Trigger.dev task when `TRIGGER_SECRET_KEY` is set, otherwise sent in-process via `@turbo/mail` (mock-logged without `RESEND_API_KEY`). Recipient is `SUPPORT_INBOX_EMAIL` falling back to `DEFAULT_FROM`; the API imports the task as a type only. |
| 2026-07-23 | Tasks tracer-bullet vertical slice | `packages/db/src/app-schema.ts`, `packages/db/drizzle/0001_add-task-table.sql`, `packages/api/src/router/task.ts`, `packages/api/src/__tests__/task.test.ts`, `apps/web/src/hooks/use-tasks.ts`, `apps/web/src/components/dashboard/tasks-table.tsx`, `apps/web/src/components/dashboard/stat-cards.tsx`, `apps/mobile/src/app/(tabs)/index.tsx`, `.ai/patterns/vertical-slice.md` | First feature travelling the full DB → API → typed client → TanStack Query path on web and mobile. GET /tasks is public and returns an empty list when the database is unavailable; the dashboard and mobile home fall back to sample data, so the zero-env template keeps rendering. Copy this slice to add a feature end-to-end (see `.ai/patterns/vertical-slice.md`). |
| 2026-07-23 | API keys management (router + settings UI) | `packages/api/src/router/api-key.ts`, `packages/api/src/__tests__/api-key.test.ts`, `apps/web/src/hooks/use-api-keys.ts`, `apps/web/src/components/dashboard/api-keys-card.tsx`, `apps/web/src/app/dashboard/settings/page.tsx`, `apps/web/src/app/dashboard/[section]/page.tsx` | List/create/revoke API keys, delegated entirely to Better Auth's apiKey plugin (`auth.listApiKeys` / `createApiKey` / `deleteApiKey` with forwarded session headers — no direct `apikey` table access, no custom crypto). The plaintext key appears exactly once, in the 201 create response, and the settings dialog shows it once with copy-to-clipboard. GET maps to a safe DTO that never includes the `key` hash. `/dashboard/settings` is a static route; the `settings` slug is filtered out of the `[section]` `generateStaticParams`. Signed out, the card renders a sign-in empty state (zero-env safe). |
| 2026-07-23 | Streaming AI assistant (endpoint + web page) | `packages/ai/src/client.ts`, `packages/ai/src/__tests__/get-default-model.test.ts`, `packages/api/src/router/ai.ts`, `packages/api/src/__tests__/ai.test.ts`, `apps/web/src/components/dashboard/assistant-view.tsx`, `apps/web/src/app/dashboard/assistant/page.tsx`, `apps/web/src/app/dashboard/[section]/page.tsx` | First demonstration of `packages/ai` in app code and of streaming through the Hono → typed-client stack. POST /ai/chat requires auth and streams plain text via `streamText().toTextStreamResponse()`; with no provider key it returns 503 with a hint naming the three env vars, and the assistant page renders sign-in / setup empty states instead of crashing (zero-env safe). Provider preference (google → groq → openrouter) lives in `getDefaultModel()` in `@turbo/ai/client` — change it there, never in routers. Conversations are stateless (no persistence). Future streaming endpoints should copy the 503-fallback + raw-Response pattern. |

## Architectural Change Log

| Date       | Decision                                          | ADR / Files                                                          | Regression Guard                                                                   |
| ---------- | ------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| 2026-05-17 | Adopt `.ai/` as the canonical agent memory system | `.ai/decisions/ADR-0001-adopt-agent-native-architecture.md`          | New patterns, dependencies, and decisions must update `.ai/` in the same PR.       |
| 2026-05-17 | Keep tool-specific agent files thin               | `.github/copilot-instructions.md`, `.cursor/rules/*`, `CLAUDE.md`    | Do not duplicate long-form rules across tools; link back to `.ai/`.                |
| 2026-05-17 | Generate machine-readable contract snapshots      | `scripts/ai/generate-contracts.mjs`, `.ai/context/data-contracts.md` | Run `pnpm ai:contracts` after API, DB, env, package export, or dependency changes. |

## Known TODOs

| Priority | Task                                      | Source                          | Blocking? |
| -------- | ----------------------------------------- | ------------------------------- | --------- |
| high     | Keep generated contract snapshots current | `.ai/contracts/`, `scripts/ai/` | no        |

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
