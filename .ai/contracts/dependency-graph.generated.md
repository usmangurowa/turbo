# Workspace Dependency Graph Snapshot

> Generated file. Do not edit by hand.
> Run `pnpm ai:contracts` to refresh this generated file.

## Workspace packages

- `@turbo/mobile`
- `@turbo/web`
- `@turbo/ai`
- `@turbo/analytics`
- `@turbo/api`
- `@turbo/assets`
- `@turbo/auth`
- `@turbo/db`
- `@turbo/jobs`
- `@turbo/mail`
- `@turbo/shared`
- `@turbo/supabase`
- `@turbo/ui`
- `@turbo/validators`
- `@turbo/eslint-config`
- `@turbo/github`
- `@turbo/prettier-config`
- `@turbo/tailwind-config`
- `@turbo/tsconfig`
- `@turbo/vitest-config`

## Internal dependencies

| Package | Path | Internal dependencies |
| --- | --- | --- |
| `@turbo/mobile` | `apps/mobile` | `@turbo/analytics`, `@turbo/api`, `@turbo/assets`, `@turbo/auth`, `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/supabase`, `@turbo/tailwind-config`, `@turbo/tsconfig`, `@turbo/validators` |
| `@turbo/web` | `apps/web` | `@turbo/analytics`, `@turbo/api`, `@turbo/auth`, `@turbo/db`, `@turbo/eslint-config`, `@turbo/mail`, `@turbo/prettier-config`, `@turbo/shared`, `@turbo/supabase`, `@turbo/tailwind-config`, `@turbo/tsconfig`, `@turbo/ui`, `@turbo/validators` |
| `@turbo/ai` | `packages/ai` | `@turbo/analytics`, `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/shared`, `@turbo/tsconfig` |
| `@turbo/analytics` | `packages/analytics` | `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/api` | `packages/api` | `@turbo/ai`, `@turbo/analytics`, `@turbo/auth`, `@turbo/db`, `@turbo/eslint-config`, `@turbo/jobs`, `@turbo/mail`, `@turbo/prettier-config`, `@turbo/shared`, `@turbo/tsconfig`, `@turbo/validators` |
| `@turbo/assets` | `packages/assets` | None |
| `@turbo/auth` | `packages/auth` | `@turbo/db`, `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/db` | `packages/db` | `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/jobs` | `packages/jobs` | `@turbo/ai`, `@turbo/analytics`, `@turbo/db`, `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/shared`, `@turbo/tsconfig` |
| `@turbo/mail` | `packages/mail` | `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/shared` | `packages/shared` | `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/supabase` | `packages/supabase` | `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/ui` | `packages/ui` | `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/validators` | `packages/validators` | `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/eslint-config` | `tooling/eslint` | `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/github` | `tooling/github` | None |
| `@turbo/prettier-config` | `tooling/prettier` | `@turbo/tsconfig` |
| `@turbo/tailwind-config` | `tooling/tailwind` | `@turbo/eslint-config`, `@turbo/prettier-config`, `@turbo/tsconfig` |
| `@turbo/tsconfig` | `tooling/typescript` | None |
| `@turbo/vitest-config` | `tooling/vitest` | `@turbo/prettier-config`, `@turbo/tsconfig` |
