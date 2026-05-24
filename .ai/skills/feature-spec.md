# Skill: Feature Spec

## When to use

Use for non-trivial feature work, cross-package changes, architecture changes,
API changes, database changes, or tasks likely to touch more than three
implementation files.

## Prerequisite context to load

- `AGENTS.md` - universal rules
- `ARCHITECTURE.md` - repository mental model
- `ROADMAP_AI.md` - active implementation ledger
- `.ai/context/conventions.md` - coding conventions
- Matching task skill from `.ai/skills/00-index.md`

## Step-by-step procedure

1. Create a spec at `.ai/specs/active/<slug>.spec.md` using
   `.ai/specs/_template.spec.md`.
2. Fill in the problem, acceptance criteria, expected files, contracts, and
   validation plan.
3. Identify whether the change affects API, DB, env, package exports, UI tokens,
   or agent memory.
4. Ask for approval before implementation when the spec changes architecture,
   auth, database schema, billing, or a public API.
5. Implement the smallest coherent slice.
6. Run focused validation.
7. Update generated contract snapshots if contracts changed.
8. Update `ROADMAP_AI.md` and any affected `.ai/context`, `.ai/patterns`, or
   `.ai/decisions` files.
9. Move accepted specs to `.ai/specs/accepted/` when the feature is complete, or
   leave them in `.ai/specs/active/` while work remains.

## Validation checklist

- [ ] Spec exists for broad work.
- [ ] Acceptance criteria are testable.
- [ ] Contract changes are identified.
- [ ] Validation commands are listed.
- [ ] `ROADMAP_AI.md` update is planned when needed.
- [ ] AI memory update checklist is complete.

## Anti-patterns

- Do not create specs for tiny one-file fixes unless the user asks.
- Do not keep stale accepted specs in `active/`.
- Do not use a spec to justify unrelated refactors.
