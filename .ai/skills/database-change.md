# Skill: Database Change

## When to use

"Update schema", "add a table", "add a column", "change database model", "auth schema changed".

## Prerequisite context to load

- `.ai/context/conventions.md` — DB and command conventions
- `packages/db/src/schema.ts` — schema export surface
- `packages/db/src/auth-schema.ts` — auth-related DB schema
- `packages/auth/script/auth-cli.ts` — Better Auth CLI config

## Inputs required from user

- What schema change is needed
- Whether the change is auth-related (Better Auth) or app-data related
- Backward-compatibility constraints (if any)
- If any required input is missing or ambiguous, ask before creating/editing files.

## Step-by-step procedure

1. Identify the target schema file under `packages/db/src/`.
2. Apply the schema change using established Drizzle patterns (`pgTable`, indexes, relations, timestamps).
3. If the change is auth-related, update `packages/auth/src/index.ts` as needed and run:
   - `pnpm auth:generate`
4. Apply DB changes to dev database:
   - `pnpm db:push`
5. Validate exports remain correct via `packages/db/src/schema.ts` and package exports in `packages/db/package.json`.
6. Run checks:
   - `pnpm -F @turbo/db typecheck`
   - `pnpm -F @turbo/db lint`

## Canonical example

- `packages/db/src/auth-schema.ts` — Drizzle schema definitions + relations
- `packages/auth/script/auth-cli.ts` — Better Auth CLI generation source

## Validation checklist

- [ ] Schema change applied in the correct `packages/db/src/*` file
- [ ] Auth-driven schema updates regenerated with `pnpm auth:generate` (if applicable)
- [ ] Dev DB updated with `pnpm db:push`
- [ ] DB package typecheck/lint pass
- [ ] No broken exports from `@turbo/db/schema`

## Anti-patterns (do NOT do)

- Do not edit generated auth schema manually when regeneration is the source of truth
- Do not apply auth schema changes without running `pnpm auth:generate`
- Do not skip `pnpm db:push` after schema updates intended for local DB
- Do not introduce schema changes without indexes/relations where required by usage
