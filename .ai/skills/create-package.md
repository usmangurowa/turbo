# Skill: Create Package

## When to use

"Create a package", "add a shared library", "add a new internal package".

## Prerequisite context to load

- `.ai/context/tech-stack.md` — workspace layout
- `.ai/context/conventions.md` — naming conventions
- `packages/shared/package.json` — reference package.json structure
- `turbo.json` — task pipeline config

## Inputs required from user

- Package name (will be scoped as `@turbo/<name>`)
- Purpose / what it exports
- Dependencies needed
- If any required input is missing or ambiguous, ask before creating/editing files.

## Step-by-step procedure

1. Create directory: `packages/<name>/`
2. Create `package.json`:
   ```json
   {
     "name": "@turbo/<name>",
     "private": true,
     "type": "module",
     "exports": {
       ".": {
         "types": "./dist/index.d.ts",
         "default": "./src/index.ts"
       }
     },
     "scripts": {
       "build": "tsc",
       "dev": "tsc",
       "typecheck": "tsc --noEmit --emitDeclarationOnly false",
       "lint": "eslint",
       "format": "prettier --check . --ignore-path ../../.gitignore",
       "test": "vitest run --passWithNoTests"
     },
     "dependencies": {},
     "devDependencies": {
       "@turbo/eslint-config": "workspace:*",
       "@turbo/prettier-config": "workspace:*",
       "@turbo/tsconfig": "workspace:*",
       "eslint": "catalog:",
       "prettier": "catalog:",
       "typescript": "catalog:",
       "vitest": "4.0.15"
     }
   }
   ```
3. Create `tsconfig.json` extending `@turbo/tsconfig`.
4. Create `eslint.config.ts` extending `@turbo/eslint-config`.
5. Create `src/index.ts` with initial exports.
6. Run `pnpm install` to link the workspace.
7. Add the package to consuming apps/packages as needed.

## Canonical example

`packages/shared/` — minimal package with `src/index.ts`, proper `exports` field, and shared tooling configs.

## Validation checklist

- [ ] Package name uses `@turbo/` scope
- [ ] `package.json` has `"type": "module"`
- [ ] `exports` field maps subpaths to source TypeScript files
- [ ] `tsconfig.json` extends `@turbo/tsconfig`
- [ ] ESLint config extends `@turbo/eslint-config`
- [ ] `pnpm install` succeeds without errors
- [ ] `dev` is one-shot (`tsc`); any long-running process lives under its own script name (`.ai/patterns/turbo-dev-tasks.md`)

## Anti-patterns (do NOT do)

- Do not create packages outside `packages/` directory
- Do not use a different scope than `@turbo/`
- Do not omit a `build` step (`tsc`) for code packages; asset/config-only packages may omit build scripts
- Do not put `tsc --watch` or another never-exiting process behind `dev` — root `turbo watch dev` re-runs one-shot tasks itself, and a persistent package task blocks every dependent app
- Do not forget to add to pnpm workspace (already covered by `packages/*` glob)
