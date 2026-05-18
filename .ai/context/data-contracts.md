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
