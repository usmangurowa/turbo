# Pattern: Auth Workflow

## Overview

Authentication in this repo is built around Better Auth + Drizzle + Hono middleware.

## Architecture

```text
packages/auth/src/index.ts
  -> Better Auth configuration (providers/plugins/session)
  -> drizzleAdapter(db)
  -> CLI config: packages/auth/script/auth-cli.ts
       -> pnpm auth:generate
       -> outputs packages/db/src/auth-schema.ts
  -> DB apply: pnpm db:push
  -> Runtime enforcement: packages/api/src/middleware/auth.ts
```

## Core flow

1. Configure auth behavior in `packages/auth/src/index.ts`.
2. Generate auth-backed DB schema using `pnpm auth:generate`.
3. Generated schema updates `packages/db/src/auth-schema.ts`.
4. Apply schema to development DB with `pnpm db:push`.
5. Protected API routes enforce auth with `authMiddleware`.

## Key files

- `packages/auth/src/index.ts` — Better Auth initialization and plugins
- `packages/auth/script/auth-cli.ts` — CLI-only config for schema generation
- `packages/db/src/auth-schema.ts` — generated auth tables/relations
- `packages/api/src/middleware/auth.ts` — request-level auth guard

## Operational commands

- `pnpm auth:generate` — regenerate auth schema output
- `pnpm db:push` — apply schema to development database
- `pnpm db:studio` — inspect schema/data in development

## Anti-patterns

- Do not treat `packages/auth/script/auth-cli.ts` as runtime auth configuration.
- Do not change generated auth schema by hand when regeneration should be used.
- Do not ship auth-related schema changes without running `pnpm auth:generate` and `pnpm db:push`.
