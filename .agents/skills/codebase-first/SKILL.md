---
name: codebase-first
description: Enforces strict adherence to this repository's documented rules and existing patterns. Applies to ALL work in this repo — features, fixes, refactors, config, docs. The codebase decides; the agent does not invent. Use before writing any code and whenever tempted to make a judgment call about structure, naming, dependencies, or patterns.
---

# Codebase First

You are a guest in this codebase. It has opinions, and they outrank yours. Your job is to find the rule or the precedent, follow it, and cite it — not to decide what "good" looks like.

## The one rule

**Never invent when you can imitate.** Every decision — file location, naming, imports, error handling, state, styling, testing, dependencies — must trace to either (a) a documented rule or (b) an existing example in this repo. If you can point to neither, stop and ask the user.

## Rule sources, in order of authority

1. `AGENTS.md` — universal agent rules
2. `.ai/context/conventions.md` — coding conventions (the tie-breaker for style questions)
3. `.ai/context/tech-stack.md` — what libraries are allowed; anything absent is not allowed without asking
4. `.ai/skills/` — task procedures (`00-index.md` is the index); the matching skill's steps are mandatory, not advisory
5. `.ai/contracts/*.generated.md` — current API/DB/env/exports snapshots; treat as ground truth for what exists
6. `ARCHITECTURE.md` + `ROADMAP_AI.md` — the mental model and direction
7. `tooling/` configs — ESLint, Prettier, TypeScript settings are law; never disable a rule to make code fit
8. The nearest existing code — when docs are silent, the closest sibling file is the spec

Higher sources win conflicts. When two sources genuinely conflict, surface the conflict to the user instead of picking one.

## Before writing any code

Run this checklist and keep the answers in mind. Do not skip it for "small" changes.

- [ ] Read `AGENTS.md`, `.ai/context/conventions.md`, `.ai/context/tech-stack.md` (skim if already read this session)
- [ ] Find the matching skill in `.ai/skills/00-index.md` and read it
- [ ] Find at least one **exemplar**: an existing file in this repo that does the same kind of thing (component → `packages/ui/src/components/button.tsx`; router → `packages/api/src/router/`; schema → `packages/db/src/`; test → nearest `__tests__/*.test.ts`)
- [ ] Confirm every library you plan to import already appears in the workspace `package.json` files

## Decision protocol

When you hit a choice point, resolve it in this order:

1. **Documented rule?** Follow it. Cite the file in your explanation.
2. **Existing precedent?** Find 2+ examples; follow the dominant pattern. One-off outliers are not precedent.
3. **Neither?** STOP. Ask the user with concrete options. Do not "use best practices," do not pick the popular approach, do not improvise.

Signals you are about to violate this skill — treat each as a hard stop:

- "I'll just add this small helper library" → not in tech-stack.md, ask first
- "The cleaner way would be…" → cleaner by whose rules? Find the repo's way
- "This ESLint rule is annoying here" → never disable; restructure the code
- "I'll organize it differently since it's new" → new code follows old structure
- "There's no test pattern for this" → there is; look harder in `__tests__/` dirs, then ask

## Hard rules (non-negotiable)

- **UI**: shadcn/ui via the `shadcn` skill and CLI — never hand-roll a component that exists in the registry. CVA + `cn()` + `data-slot`, kebab-case files, named exports.
- **Forms**: `react-hook-form` + shadcn form components. Never `useState` for form state.
- **API**: Hono routers in `packages/api/src/router/`, wired like existing routers.
- **DB**: Drizzle `pgTable()` in `packages/db/src/`; schema changes follow `.ai/skills/database-change.md` — generate migrations, never `db:push` toward prod.
- **Env**: new env vars go through the env schemas (`apps/*/src/env.ts`, `packages/auth/env.ts`) and `.env.example`; validation-skip logic only via `shouldSkipEnvValidation()` from `@turbo/shared/env`.
- **Deps**: adding/removing any dependency requires explicit user approval; use `catalog:` entries where they exist.
- **Commits**: conventional commits per `.ai/skills/commit-message.md`.
- **After structural changes**: run `pnpm ai:contracts` and update `.ai/` memory per `.ai/skills/update-ai-memory.md` — in the same PR.

## Verification gates

Work is not done until the repo's own gates pass:

```bash
pnpm turbo typecheck lint test --output-logs=errors-only
```

Never weaken a gate (skip a test, loosen a tsconfig, add an eslint-disable) to get green. If a gate fails because the rule and your change genuinely cannot coexist, report it — the user decides.

## When you must deviate

Sometimes an exemplar is outdated or a rule is silent for a new situation. Then:

1. Say so explicitly, before writing the code
2. Propose the deviation with the closest precedent you found
3. Wait for the user's decision
4. If approved, update `.ai/context/conventions.md` (or the relevant skill) in the same PR so the deviation becomes the rule

A deviation that is not documented in `.ai/` is a bug, even if the code works.
