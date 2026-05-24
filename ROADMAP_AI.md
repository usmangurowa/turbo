# AI Roadmap Ledger

This file is the agent-readable implementation ledger. Every coding agent should
read it before non-trivial work and update it after changes that affect features,
architecture, contracts, or conventions.

## Current Focus

- Phase: Phase 1 - Template Hardening
- Active initiative: Keep AI contract snapshots and agent memory current
- Last updated: 2026-05-17

## Active Sprint

| ID     | Status   | Task                                                 | Files                                                                              | Validation           |
| ------ | -------- | ---------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------- |
| AI-001 | complete | Bootstrap AI-native repository controls              | `AGENTS.md`, `.ai/`, `.github/`, `.cursor/`, `ARCHITECTURE.md`, `system_prompt.md` | `pnpm ai:contracts`  |
| AI-002 | complete | Sync stale public documentation with package reality | `README.md`, `.env.example`, `turbo.json`                                          | `pnpm ai:env:strict` |
| AI-003 | complete | Add generated contract snapshots for agents          | `.ai/contracts/*.generated.md`, `scripts/ai/*`                                     | `pnpm ai:contracts`  |

## Implemented Features

| Date       | Feature                         | Files                                                                                                     | Notes                                                                                         |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 2026-05-17 | Agent-native memory foundation  | `AGENTS.md`, `.ai/`, `.github/copilot-instructions.md`, `.cursor/rules/*`, `CLAUDE.md`                    | `.ai/` is the source of truth for agent context.                                              |
| 2026-05-17 | Task-oriented agent skills      | `.ai/skills/*`, `.github/prompts/*`, `.claude/commands/*`                                                 | Common tasks route through explicit procedures.                                               |
| 2026-05-17 | Generated AI contract snapshots | `.ai/contracts/*.generated.md`, `scripts/ai/*`, `package.json`                                            | Agents can inspect API, DB, env, package export, and dependency graph facts without guessing. |
| 2026-05-17 | Spec-first workflow             | `.ai/skills/feature-spec.md`, `.ai/specs/_template.spec.md`, `.github/prompts/new-feature-spec.prompt.md` | Non-trivial work has an explicit planning and validation template.                            |

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
| medium   | Add CI enforcement for stale generated contracts             | `.github/workflows/ci.yml`, `scripts/ai/`                                                                | no        |
| medium   | Add a sync policy for duplicated tool-specific skill bundles | `.agents/`, `.github/skills/`, `.cursor/skills/`, `.claude/skills/`, `.codex/skills/`, `.gemini/skills/` | no        |

## Regression Guards

- Do not move business API logic into `apps/web/src/app/api`; app API files only
  mount or adapt shared API handlers.
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
