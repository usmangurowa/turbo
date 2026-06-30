# Feature Spec: Standalone server entrypoint

## Status

- State: draft
- Owner: AI agent
- Created: 2026-06-30
- Updated: 2026-06-30

## Problem

The repository exposes shared Hono API routes through `packages/api`, but only
hosts those routes inside the Next.js web app. Mobile clients, external API-key
clients, provider callbacks, and future backend-only runtimes need a standalone
server process without moving business API logic out of `packages/api`.

## Acceptance Criteria

- [ ] `apps/server` exists as package `@turbo/server` and starts a Node/Hono server.
- [ ] `apps/server` imports `createApp` from `@turbo/api`; no API route logic is duplicated or moved.
- [ ] The existing Next.js `/api` mount remains supported.
- [ ] `SERVER_URL` and `APP_URL` are documented and included in environment contracts.
- [ ] A focused server test verifies `/health` without starting a long-lived listener.
- [ ] AI context, roadmap, and generated contracts reflect the new app.

## Expected Files

| File | Expected change |
| --- | --- |
| `apps/server/*` | New standalone server app package, env, auth, app factory, and tests. |
| `packages/auth/src/trusted-origins.ts` | Shared trusted-origin normalization helper. |
| `package.json`, `turbo.json`, `.env.example` | Add server script and environment variables. |
| `ARCHITECTURE.md`, `.ai/context/tech-stack.md`, `ROADMAP_AI.md` | Document server runtime boundaries. |
| `.ai/contracts/*.generated.md` | Refresh generated contract snapshots. |

## Contracts

| Contract | Change? | Notes |
| --- | --- | --- |
| API routes | no | Existing `@turbo/api` route surface is hosted by a new runtime. |
| DB schema | no | No schema or migration change. |
| Env vars | yes | Adds `SERVER_URL` and `APP_URL`. |
| Package exports | yes | Adds `@turbo/auth/trusted-origins` and `@turbo/server`. |
| UI tokens | no | No UI change. |
| Agent memory | yes | Architecture, tech stack, roadmap, and contracts must be updated. |

## Pseudocode

```text
1. Create apps/server with standard package scripts and shared tooling config.
2. Add server env validation with @t3-oss/env-core.
3. Add server-local auth configured with SERVER_URL and existing mail OTP sender.
4. Add app factory that wraps @turbo/api createApp with server CORS config.
5. Add Node listener entrypoint using @hono/node-server.
6. Add trusted-origin helper and reuse it from web/server mount points.
7. Add focused test for /health.
8. Refresh generated contracts and update AI memory/docs.
```

## Validation Plan

- [ ] `pnpm install`
- [ ] `pnpm -F @turbo/server typecheck`
- [ ] `pnpm -F @turbo/server lint`
- [ ] `pnpm -F @turbo/server test`
- [ ] `pnpm -F @turbo/api typecheck`
- [ ] `pnpm -F @turbo/web typecheck`
- [ ] `pnpm ai:contracts`
- [ ] `pnpm lint:ws`

## Rollback Plan

Remove `apps/server`, remove the root `dev:server` script, remove
`SERVER_URL`/`APP_URL` from env docs and Turbo globals, revert the trusted-origin
helper/export if no longer used, then refresh AI contracts.

## Notes

- Do not copy `.agent`, `.agents`, plugin apps, Redis, cron jobs, or
  Kodo-specific product code.
- `packages/api` remains the owner of Hono business routes.
