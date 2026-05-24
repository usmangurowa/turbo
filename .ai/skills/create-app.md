# Skill: Create App

## When to use

"Create an app", "add a new application", "scaffold a new web app".

## Prerequisite context to load

- `.ai/context/tech-stack.md` — existing app structure
- `apps/web/package.json` — reference web app
- `apps/mobile/package.json` — reference mobile app
- `turbo.json` — task pipeline

## Inputs required from user

- App name
- Type: web (Next.js) or mobile (Expo) or other
- Required internal packages
- If any required input is missing or ambiguous, ask before creating/editing files.

## Step-by-step procedure

1. Create directory: `apps/<name>/`
2. For **web apps**: scaffold with Next.js, copy patterns from `apps/web/`
3. For **mobile apps**: scaffold with Expo, copy patterns from `apps/mobile/`
4. Configure `package.json` with proper scripts (`dev`, `build`, `lint`, `typecheck`, `format`).
5. Add shared dependencies: `@turbo/ui`, `@turbo/auth`, etc. as needed.
6. Add `tsconfig.json`, `eslint.config.ts` extending shared configs.
7. Ensure `pnpm-workspace.yaml` covers the new app path (or it is already covered by `apps/*`).
8. Run `pnpm install` to link workspace.

## Canonical example

`apps/web/` — full Next.js app with auth, API integration, UI components.

## Validation checklist

- [ ] App lives under `apps/` directory
- [ ] Has all standard scripts: `dev`, `build`, `lint`, `typecheck`, `format`
- [ ] Uses shared tooling configs
- [ ] `pnpm install` and `pnpm build --filter=@turbo/<name>` succeed

## Anti-patterns (do NOT do)

- Do not create apps outside `apps/` directory
- Do not duplicate shared config — use `@turbo/*` tooling packages
- Do not install dependencies that are already available via internal packages
