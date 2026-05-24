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
4. **Fix the issue** following the relevant conventions.
5. **Run the full CI check locally**: `pnpm lint && pnpm format && pnpm typecheck && pnpm test`

## Canonical example

CI workflow: `.github/workflows/ci.yml` — shows the exact commands run in CI.

## Validation checklist

- [ ] Error is reproduced locally
- [ ] Root cause identified
- [ ] Fix applied
- [ ] All CI checks pass locally

## Anti-patterns (do NOT do)

- Do not suppress lint/type errors without fixing root cause
- Do not skip typecheck even if build passes
- Do not use `@ts-ignore` — prefer `@ts-expect-error` with explanation if absolutely needed
