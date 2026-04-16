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

## Step-by-step procedure
1. Create directory: `packages/<name>/`
2. Create `package.json`:
   ```json
   {
     "name": "@turbo/<name>",
     "version": "0.0.0",
     "private": true,
     "type": "module",
     "exports": {
       ".": { "default": "./src/index.ts" }
     },
     "scripts": {
       "typecheck": "tsc --noEmit",
       "lint": "eslint",
       "format": "prettier --check . --ignore-path ../../.gitignore"
     },
     "dependencies": {},
     "devDependencies": {
       "@turbo/eslint-config": "workspace:*",
       "@turbo/prettier-config": "workspace:*",
       "@turbo/tsconfig": "workspace:*",
       "typescript": "catalog:"
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

## Anti-patterns (do NOT do)
- Do not create packages outside `packages/` directory
- Do not use a different scope than `@turbo/`
- Do not add a build step unless the package needs pre-compilation
- Do not forget to add to pnpm workspace (already covered by `packages/*` glob)
