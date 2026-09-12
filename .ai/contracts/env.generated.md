# Environment Contract Snapshot

> Generated file. Do not edit by hand.
> Run `pnpm ai:contracts` to refresh this generated file.

## Variable contract

Every variable in `.env.example`, classified from the zod schemas in the
env modules (`apps/*/src/env.ts`, `packages/auth/env.ts`) and the mobile
type declarations. **required** means the process refuses to boot without
it (validation is skipped only under `SKIP_ENV_VALIDATION`, `CI`, `lint`,
and `build` — see `packages/shared/src/env.ts`). Variables with no env
module entry are read straight from `process.env` by the listed packages
and are optional by construction: unset means the feature is off.

| Variable | Required | Runtime / reader | Exposure | Notes |
| --- | --- | --- | --- | --- |
| `APP_URL` | optional | server, worker | server | defaults to "http://localhost:3000" |
| `AUTH_SECRET` | **required** | web, server, worker | server | required at runtime |
| `EXPO_PUBLIC_API_URL` | optional | mobile | public (app bundle) | optional |
| `EXPO_PUBLIC_POSTHOG_KEY` | optional | mobile | public (app bundle) | optional |
| `EXPO_PUBLIC_SENTRY_DSN` | optional | mobile | public (app bundle) | optional |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | optional | mobile | public (app bundle) | optional |
| `EXPO_PUBLIC_SUPABASE_URL` | optional | mobile | public (app bundle) | optional |
| `GITHUB_CLIENT_ID` | optional | web, server, worker | server | optional |
| `GITHUB_CLIENT_SECRET` | optional | web, server, worker | server | optional |
| `GOOGLE_GENERATIVE_AI_API_KEY` | optional | `packages/ai` | server | read directly; unset disables the feature |
| `GROQ_API_KEY` | optional | `packages/ai` | server | read directly; unset disables the feature |
| `JOBS_POSTGRES_URL` | optional | server, worker | server | optional; empty string counts as unset |
| `NEXT_PUBLIC_APP_URL` | optional | web | public (client bundle) | defaults to "http://localhost:3000" |
| `NEXT_PUBLIC_PORT` | optional | web | public (client bundle) | defaults to "3000" |
| `NEXT_PUBLIC_POSTHOG_KEY` | optional | `apps/web` | public | read directly; unset disables the feature |
| `NEXT_PUBLIC_SENTRY_DSN` | optional | `apps/web` | public | read directly; unset disables the feature |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | optional | web | public (client bundle) | optional; empty string counts as unset |
| `NEXT_PUBLIC_SUPABASE_URL` | optional | web | public (client bundle) | optional; empty string counts as unset |
| `OPENROUTER_API_KEY` | optional | `packages/ai` | server | read directly; unset disables the feature |
| `POSTGRES_URL` | **required** | web, server, worker | server | required |
| `POSTHOG_API_KEY` | optional | `packages/analytics` | server | read directly; unset disables the feature |
| `RESEND_API_KEY` | optional | server, worker | server | optional; empty string counts as unset |
| `SENTRY_DSN` | optional | `apps/web`, `packages/analytics` | server | read directly; unset disables the feature |
| `SERVER_PORT` | optional | server, worker | server | defaults to 3001 |
| `SERVER_URL` | optional | server, worker | server | defaults to "http://localhost:3001" |
| `SUPABASE_JWT_SECRET` | optional | web, server, worker | server | optional; empty string counts as unset |
| `SUPPORT_INBOX_EMAIL` | optional | `packages/jobs` | server | read directly; unset disables the feature |

### Required per runtime

The minimum a deployment of each process needs. Everything else in the
table above is optional for that process.

| Runtime | Required variables |
| --- | --- |
| web | `AUTH_SECRET`, `POSTGRES_URL` |
| server | `AUTH_SECRET`, `POSTGRES_URL` |
| worker | `AUTH_SECRET`, `POSTGRES_URL` |
| mobile | None |

Mobile build identity is set per EAS profile in `apps/mobile/eas.json`,
not in `.env`: `EXPO_PUBLIC_APP_NAME`, `EXPO_PUBLIC_PACKAGE_NAME`.

### Groups (from .env.example)

- **Database** — `POSTGRES_URL`
- **App URLs / ports** — `SERVER_PORT`, `SERVER_URL`, `APP_URL`, `NEXT_PUBLIC_PORT`, `NEXT_PUBLIC_APP_URL`, `EXPO_PUBLIC_API_URL`
- **Better Auth** — `AUTH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- **Supabase** — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`
- **Resend (email sending)** — `RESEND_API_KEY`
- **Support inbox (optional — defaults to the mail package's DEFAULT_FROM)** — `SUPPORT_INBOX_EMAIL`
- **Background jobs (optional — pg-boss). When set, POST /support enqueues the** — `JOBS_POSTGRES_URL`
- **PostHog Analytics (keys only — host is hardcoded)** — `NEXT_PUBLIC_POSTHOG_KEY`, `POSTHOG_API_KEY`, `EXPO_PUBLIC_POSTHOG_KEY`
- **Sentry Error Tracking** — `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `EXPO_PUBLIC_SENTRY_DSN`
- **AI Providers** — `GOOGLE_GENERATIVE_AI_API_KEY`, `OPENROUTER_API_KEY`, `GROQ_API_KEY`

## Infisical

Project: `78e4f00e-f639-4c50-a3fd-b373015cb8ca` (from `.infisical.json`),
default environment `dev`.
Each Infisical environment should hold the required variables for the
runtimes it serves (table above) plus whichever optional features that
environment enables. `pnpm with-secrets <cmd>` and the Docker images
inject them at boot (`scripts/infisical-run.sh`).

## turbo.json globalEnv

- `APP_URL`
- `AUTH_SECRET`
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_POSTHOG_KEY`
- `EXPO_PUBLIC_SENTRY_DSN`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `GROQ_API_KEY`
- `JOBS_POSTGRES_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_PORT`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `OPENROUTER_API_KEY`
- `POSTGRES_URL`
- `POSTHOG_API_KEY`
- `RESEND_API_KEY`
- `SENTRY_DSN`
- `SERVER_PORT`
- `SERVER_URL`
- `SUPABASE_JWT_SECRET`
- `SUPPORT_INBOX_EMAIL`

## .env.example variables

- `APP_URL`
- `AUTH_SECRET`
- `EXPO_PUBLIC_API_URL`
- `EXPO_PUBLIC_POSTHOG_KEY`
- `EXPO_PUBLIC_SENTRY_DSN`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `EXPO_PUBLIC_SUPABASE_URL`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GOOGLE_GENERATIVE_AI_API_KEY`
- `GROQ_API_KEY`
- `JOBS_POSTGRES_URL`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_PORT`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `OPENROUTER_API_KEY`
- `POSTGRES_URL`
- `POSTHOG_API_KEY`
- `RESEND_API_KEY`
- `SENTRY_DSN`
- `SERVER_PORT`
- `SERVER_URL`
- `SUPABASE_JWT_SECRET`
- `SUPPORT_INBOX_EMAIL`

## Env validation modules

| File | Variables |
| --- | --- |
| apps/server/src/env.ts | `APP_URL`, `JOBS_POSTGRES_URL`, `PORT`, `POSTGRES_URL`, `RESEND_API_KEY`, `SERVER_PORT`, `SERVER_URL` |
| apps/web/src/env.ts | `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_PORT`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NODE_ENV`, `POSTGRES_URL` |
| packages/auth/env.ts | `AUTH_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `NODE_ENV`, `SUPABASE_JWT_SECRET` |
| packages/shared/src/env.ts | None |

## Drift Report

### In turbo.json but missing from .env.example

- None

### In .env.example but missing from turbo.json globalEnv

- None

### Validated in env modules but missing from .env.example

- None

### Declared in a schema but missing from .env.example

- None
