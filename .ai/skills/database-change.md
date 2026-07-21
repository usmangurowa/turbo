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
4. Apply DB changes:
   - Generate a durable migration: `pnpm db:generate -- --name <migration_name>`
   - Apply locally: `pnpm db:migrate`
   - `pnpm db:push:local` is allowed only for disposable local databases
   - In production, migrations apply automatically on server boot via `pnpm start:server` (`db:migrate && start:prod`); never run migrations against production manually unless recovering from a failure
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
- [ ] Migration generated with `pnpm db:generate` and applied locally with `pnpm db:migrate`
- [ ] DB package typecheck/lint pass
- [ ] No broken exports from `@turbo/db/schema`

## Anti-patterns (do NOT do)

- Do not edit generated auth schema manually when regeneration is the source of truth
- Do not apply auth schema changes without running `pnpm auth:generate`
- Do not skip `pnpm db:generate` + `pnpm db:migrate` after schema updates — migration files must ship in the same PR as the schema change
- Do not write destructive migrations (drops/renames) in the same release as the code change; use expand/contract across two releases
- Do not introduce schema changes without indexes/relations where required by usage
