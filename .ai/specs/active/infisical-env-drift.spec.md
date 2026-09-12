# Feature Spec: Infisical environment drift check

## Status

- State: implemented
- Owner: AI agent
- Created: 2026-09-12
- Updated: 2026-09-12

## Problem

`.ai/contracts/env.generated.md` says which variables each runtime needs, and
`.infisical.json` links the repo to the `turbo` Infisical project, but nothing
compares the two. A deploy that boots from Infisical can still fail env
validation because a required key was never added to that environment, and
nobody notices until the container refuses to start. Adding a variable to
`.env.example` today has no step that says "now put it in `prod`".

## Acceptance Criteria

- [x] `pnpm ai:env:infisical [--env <slug>|--all|--envs a,b] [--json]` prints,
      per environment, the required variables it lacks, the optional variables
      it lacks, the keys it holds that the contract does not know, and the
      public (`NEXT_PUBLIC_*`/`EXPO_PUBLIC_*`) keys it holds.
- [x] `pnpm ai:env:infisical:strict` exits 1 when any environment is missing a
      required variable, 2 when Infisical could not be read, 0 otherwise.
      Report mode exits 0 in every case except a usage error.
- [x] The script never prints, logs, or writes a secret value. Only key names
      leave the `infisical export` buffer; error output is redacted.
- [x] The CLI can never block on interactive login: `--silent`,
      `stdin: "ignore"`, and a timeout on every spawn.
- [x] Credential resolution mirrors `scripts/infisical-run.sh`: machine
      identity, then `INFISICAL_TOKEN`, then (outside CI) the login session.
- [x] `scripts/ai/check-env-contract.mjs` shares its env-contract parsing
      through `scripts/ai/_env.mjs`; `.ai/contracts/env.generated.md` is
      byte-identical before and after the refactor.
- [x] Tests cover comparison, name-only extraction (no value leaks), argument
      parsing, and the exit-code contract without touching the network.
- [x] The strict check is not a CI step (see Notes).

## Expected Files

| File                                                | Expected change                                                                                   |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `scripts/ai/_env.mjs`                               | New. Env-contract parsing moved out of `check-env-contract.mjs`; `loadEnvContract()` entry point. |
| `scripts/ai/check-env-contract.mjs`                 | Import the shared parsing; output unchanged.                                                      |
| `scripts/ai/check-infisical-env.mjs`                | New. Drift check: CLI wrapper, comparison, report, exit codes.                                    |
| `scripts/ai/__tests__/check-infisical-env.test.mjs` | New. `node --test` suite.                                                                         |
| `package.json`, `turbo.json`                        | `ai:env:infisical`, `ai:env:infisical:strict`, `test:scripts` root task.                          |
| `README.md`, `.ai/context/conventions.md`           | When to run the check; test location for `scripts/ai`.                                            |
| `.ai/skills/debug-failure.md`                       | Symptom: process fails env validation on boot.                                                    |
| `ROADMAP_AI.md`                                     | Implemented Features row.                                                                         |

## Contracts

| Contract        | Change? | Notes                                                                                  |
| --------------- | ------- | -------------------------------------------------------------------------------------- |
| API routes      | no      |                                                                                        |
| DB schema       | no      |                                                                                        |
| Env vars        | no      | Reads the contract; adds no variable. Honours the existing `INFISICAL_*` credentials.  |
| Package exports | no      |                                                                                        |
| UI tokens       | no      |                                                                                        |
| Agent memory    | yes     | Conventions, debug skill, roadmap, this spec. Generated contracts unchanged by design. |

## Pseudocode

```text
1. loadEnvContract(): .env.example names + groups, turbo.json globalEnv /
   globalPassThroughEnv, zod classification per runtime (shared with
   check-env-contract.mjs).
2. Resolve credentials in infisical-run.sh order; refuse to spawn when CI has
   none or machine identity is half-configured.
3. For each environment: spawnSync(infisical export --env <slug>
   --format=dotenv --silent [--token …] --projectId …) with stdin ignored and
   a 30s timeout; keep only /^([A-Z][A-Z0-9_]*)=/ names; drop the buffer.
4. compareEnvironment(keys, contract) -> missingRequired, missingOptional,
   unknownKeys, publicKeys.
5. Print a markdown report (formatTable + .env.example groups) or --json.
6. Exit: drift && strict -> 1; unavailable && strict -> 2; else 0.
```

## Validation Plan

- [x] `node --test scripts/ai/__tests__/` (also `pnpm test:scripts`, part of `pnpm test`)
- [x] `pnpm ai:contracts:check` — refactor left `env.generated.md` unchanged
- [x] `pnpm ai:env:infisical --all` against the live project (report below)
- [x] `pnpm run ci`

### Live report (2026-09-12)

`pnpm ai:env:infisical --all`, exit 0. `--strict --all` exits 1 (dev and
staging drift); `--strict --env prod` exits 0. Output verbatim — the script
fetches names only, so there is nothing to redact:

```markdown
# Infisical environment drift

Project `78e4f00e-f639-4c50-a3fd-b373015cb8ca` (from `.infisical.json`), CLI `node_modules/.bin/infisical`, credentials: local `infisical login` session.

| Environment | Keys | Missing required | Missing optional | Unknown keys |
| ----------- | ---- | ---------------- | ---------------- | ------------ |
| dev         | 0    | 2                | 25               | 0            |
| staging     | 0    | 2                | 25               | 0            |
| prod        | 7    | 0                | 20               | 0            |

## dev — 0 keys

### Missing required (fails --strict)

- **Database** — `POSTGRES_URL` (web, server, worker)
- **Better Auth** — `AUTH_SECRET` (web, server, worker)

### Missing optional (feature off)

- **App URLs / ports** — `SERVER_PORT`, `SERVER_URL`, `APP_URL`, `NEXT_PUBLIC_PORT`, `NEXT_PUBLIC_APP_URL`, `EXPO_PUBLIC_API_URL`
- **Better Auth** — `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- **Supabase** — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`
- **Resend (email sending)** — `RESEND_API_KEY`
- **Support inbox (optional — defaults to the mail package's DEFAULT_FROM)** — `SUPPORT_INBOX_EMAIL`
- **Background jobs (optional — pg-boss). When set, POST /support enqueues the** — `JOBS_POSTGRES_URL`
- **PostHog Analytics (keys only — host is hardcoded)** — `NEXT_PUBLIC_POSTHOG_KEY`, `POSTHOG_API_KEY`, `EXPO_PUBLIC_POSTHOG_KEY`
- **Sentry Error Tracking** — `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `EXPO_PUBLIC_SENTRY_DSN`
- **AI Providers** — `GOOGLE_GENERATIVE_AI_API_KEY`, `OPENROUTER_API_KEY`, `GROQ_API_KEY`

### Unknown keys (not in .env.example)

- None

### Public keys present (build-time, not secret)

- None

## staging — 0 keys

### Missing required (fails --strict)

- **Database** — `POSTGRES_URL` (web, server, worker)
- **Better Auth** — `AUTH_SECRET` (web, server, worker)

### Missing optional (feature off)

- **App URLs / ports** — `SERVER_PORT`, `SERVER_URL`, `APP_URL`, `NEXT_PUBLIC_PORT`, `NEXT_PUBLIC_APP_URL`, `EXPO_PUBLIC_API_URL`
- **Better Auth** — `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- **Supabase** — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`
- **Resend (email sending)** — `RESEND_API_KEY`
- **Support inbox (optional — defaults to the mail package's DEFAULT_FROM)** — `SUPPORT_INBOX_EMAIL`
- **Background jobs (optional — pg-boss). When set, POST /support enqueues the** — `JOBS_POSTGRES_URL`
- **PostHog Analytics (keys only — host is hardcoded)** — `NEXT_PUBLIC_POSTHOG_KEY`, `POSTHOG_API_KEY`, `EXPO_PUBLIC_POSTHOG_KEY`
- **Sentry Error Tracking** — `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `EXPO_PUBLIC_SENTRY_DSN`
- **AI Providers** — `GOOGLE_GENERATIVE_AI_API_KEY`, `OPENROUTER_API_KEY`, `GROQ_API_KEY`

### Unknown keys (not in .env.example)

- None

### Public keys present (build-time, not secret)

- None

## prod — 7 keys

### Missing required (fails --strict)

- None

### Missing optional (feature off)

- **App URLs / ports** — `SERVER_PORT`, `EXPO_PUBLIC_API_URL`
- **Better Auth** — `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
- **Supabase** — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_JWT_SECRET`
- **Resend (email sending)** — `RESEND_API_KEY`
- **Support inbox (optional — defaults to the mail package's DEFAULT_FROM)** — `SUPPORT_INBOX_EMAIL`
- **PostHog Analytics (keys only — host is hardcoded)** — `NEXT_PUBLIC_POSTHOG_KEY`, `POSTHOG_API_KEY`, `EXPO_PUBLIC_POSTHOG_KEY`
- **Sentry Error Tracking** — `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_DSN`, `EXPO_PUBLIC_SENTRY_DSN`
- **AI Providers** — `GOOGLE_GENERATIVE_AI_API_KEY`, `OPENROUTER_API_KEY`, `GROQ_API_KEY`

### Unknown keys (not in .env.example)

- None

### Public keys present (build-time, not secret)

- `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_PORT`
```

## Rollback Plan

Delete `scripts/ai/check-infisical-env.mjs`, its test, and the three root
scripts. `_env.mjs` can stay: `check-env-contract.mjs` depends on it and its
output is unchanged, so reverting the split is optional.

## Notes

### Why this is not a CI step

ADR-0003 makes `.github/workflows/ci.yml` and `pnpm run ci` the same eleven
steps, and every step must pass on a fresh clone with `cp .env.example .env`
and no credentials. This check needs an Infisical credential to say anything;
without one it can only report "skipped", and a step that is always skipped in
CI is noise that erodes trust in the green tick. The credential that would make
it meaningful (a machine identity with read access to `prod`) is also the one
thing the repo has chosen not to hand to GitHub Actions — the Coolify apps
read their own env store and nothing in CI deploys. Until a deploy runs from
Actions, the check is a pre-deploy and post-change command run by whoever holds
a login session. When that changes, add `INFISICAL_CLIENT_ID`/`_SECRET` as
Actions secrets, add `pnpm ai:env:infisical:strict --env prod` as a twelfth
step in both places, and amend ADR-0003.

### Listing environments

The CLI has no "list environments" command and `.infisical.json` records only
the project id and default environment. `--all` therefore iterates `--envs`
(default `dev,staging,prod`, the project's current environments). A fork that
renames environments passes `--envs`.

### Tests for `scripts/ai`

No `scripts/ai` file had tests before this. They are plain `.mjs` with no
build, so the suite uses `node --test` (no dependency) in
`scripts/ai/__tests__/`, registered as the Turbo root task `//#test:scripts`
and run by `pnpm test` alongside the package Vitest suites. The script exports
its pure functions and only runs `main()` when executed directly, which is
what makes it testable without a network.

### Known limits

- A quoted multi-line secret whose inner line looks like `KEY=` would be
  misread as a key name. `.env.example` parsing has the same limit.
- "Required" is the union over runtimes. An environment that serves only the
  worker still shows web-only required variables (none exist today).
- `INFISICAL_API_URL` / `INFISICAL_DOMAIN` are honoured by the CLI itself; the
  script adds no domain handling.
