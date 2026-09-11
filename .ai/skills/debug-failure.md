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
