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
