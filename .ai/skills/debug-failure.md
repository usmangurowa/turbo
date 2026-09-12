# Skill: Debug Failure

## When to use

"Fix this error", "debug CI failure", "why is this failing", "build error".

## Prerequisite context to load

- `.ai/context/tech-stack.md` — tooling and CI setup
- `.github/workflows/ci.yml` — CI pipeline
- `turbo.json` — task configuration

## Inputs required from user

- Error message or CI job logs
- Which step failed (lint, format, typecheck, test, build)
- If failure context is missing, ask before applying changes.

## Step-by-step procedure

1. **Identify the failure type**:
   - `lint` → ESLint issue → check `eslint.config.ts`
   - `format` → Prettier issue → run `pnpm format`
   - `typecheck` → TypeScript error → run `pnpm typecheck`
   - `test` → Vitest failure → run `pnpm test`
   - `build` → Build error → run `pnpm build`
2. **Reproduce locally**: Run the failing command with the same flags.
3. **Check for common causes**:
   - Missing environment variables (compare with `.env.example`)
   - A process fails env validation on boot (`Invalid environment variables`,
     a zod error naming `POSTGRES_URL` or `AUTH_SECRET`) in a deployment that
     reads secrets from Infisical — the environment is missing a required
     key. Run `pnpm ai:env:infisical --env prod` (or the environment's slug):
     it lists the required variables the environment lacks and any keys the
     contract does not know, without printing a value. Strict mode
     (`pnpm ai:env:infisical:strict`) exits 1 on drift, 2 when Infisical is
     unreadable.
   - Missing dependencies (`pnpm install`)
   - Type errors from package changes (check `exports` in `package.json`)
   - Turborepo cache issues (`pnpm clean`)
   - Unbuilt workspace dependencies in a fresh worktree — `pnpm typecheck` or
     `pnpm lint` run _inside_ a package (not from the root) fails with
     `TS6142 … '--jsx' is not set` or `no-unsafe-call` lint errors, because
     dependency packages point `types` at `dist/`. Build them first:
     `pnpm turbo run build --filter=<pkg>^... --output-logs=errors-only`
     (e.g. `--filter=@turbo/api^...`). The root `pnpm typecheck`/`pnpm lint`
     do this automatically via `dependsOn: ["^build"]` in `turbo.json`.
   - A `dev` task that never starts the apps — a package `dev` script is in
     watch mode or hosts a long-running process (see
     `.ai/patterns/turbo-dev-tasks.md`).
   - Every connection to a remote Postgres fails with
     `AggregateError [ETIMEDOUT]` while `nc` succeeds — Node 20+ races
     IPv6/IPv4 with a 250ms per-attempt timeout (`autoSelectFamilyAttemptTimeout`)
     that slow links exceed. Raise it with
     `net.setDefaultAutoSelectFamilyAttemptTimeout(3000)` in the shared client,
     or `NODE_OPTIONS="--network-family-autoselection-attempt-timeout=3000"`
     for `drizzle-kit`, which swallows the error and exits 1 with no message.
   - A Coolify app is healthy but serving an old commit and its deployment
     history is all manual — nothing tells Coolify about pushes. A **Public
     Repository** source registers no GitHub webhook; either switch the source
     to a Coolify GitHub App or add a per-app push webhook to
     `/webhooks/source/github/events/manual` signed with the app's GitHub
     webhook secret (see `.ai/patterns/docker-images.md`, "Coolify settings").
4. **Fix the issue** following the relevant conventions.
5. **Run the full CI check locally**: `pnpm run ci` (same steps and order as `.github/workflows/ci.yml`, stops on first failure; needs a root `.env` — `cp .env.example .env` if missing)

## Canonical example

CI workflow: `.github/workflows/ci.yml` — shows the exact commands run in CI.

## Validation checklist

- [ ] Error is reproduced locally
- [ ] Root cause identified
- [ ] Fix applied
- [ ] All CI checks pass locally (`pnpm run ci` is green)

## Anti-patterns (do NOT do)

- Do not suppress lint/type errors without fixing root cause
- Do not skip typecheck even if build passes
- Do not use `@ts-ignore` — prefer `@ts-expect-error` with explanation if absolutely needed
