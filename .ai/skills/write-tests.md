# Skill: Write Tests

## When to use

"Write tests", "add test coverage", "test this function".

## Prerequisite context to load

- `.ai/context/tech-stack.md` — testing setup
- `tooling/vitest/vitest.config.ts` — Vitest configuration
- `packages/shared/src/__tests__/sanitize.test.ts` — reference test

## Inputs required from user

- Function/component to test
- Expected behaviors to cover
- If test target or expectations are ambiguous, ask before writing tests.

## Step-by-step procedure

1. **Create test file**: `src/__tests__/<name>.test.ts` (co-located with source).
2. **Follow this pattern**:

   ```typescript
   import { describe, expect, it } from "vitest";

   import { myFunction } from "../my-module";

   describe("myFunction", () => {
     it("should handle the happy path", () => {
       expect(myFunction("input")).toBe("expected");
     });

     it("should handle edge cases", () => {
       expect(myFunction(null)).toBe(undefined);
     });
   });
   ```

3. **Run tests**: `pnpm test --filter=@turbo/<package>`
4. **Check coverage** for the specific file.

## Guarding documented patches

Vendored or CLI-managed files (shadcn registry components, AI Elements) carry
documented local patches that a re-install silently overwrites. Guard each
patch with a source-string test that reads the file and asserts the patched
lines are present — see `packages/ui/src/__tests__/registry-patches.test.ts`
(Card `dashed` variant, Badge status variants, one-click `ThemeToggle`) and
`ai-elements-patches.test.ts`. When you add a patch, add its guard in the same
change.

## Adding tests to a package that has none

Copy the `packages/shared` setup:

1. Add to `package.json`: `"test": "vitest run"` and a `vitest` devDependency
   pinned to the workspace version (`4.1.10`).
2. Create `vitest.config.ts` with `globals: true`, `environment: "node"`, and
   `include: ["src/__tests__/**/*.test.ts"]` (add `.tsx` when testing
   components). Packages that may legitimately have no tests yet add
   `passWithNoTests: true`.
3. `pnpm install`, then `pnpm turbo test` picks the package up automatically
   through the root `test` task.
4. Package-specific needs (jsdom, setup files) extend the local config; do not
   import another package's config.

## Canonical example

`packages/shared/src/__tests__/sanitize.test.ts` — demonstrates `describe`/`it`/`expect` pattern with edge case coverage.

## Validation checklist

- [ ] Test file is in `__tests__/` directory
- [ ] Uses `describe`/`it`/`expect` from Vitest
- [ ] Covers happy path and edge cases
- [ ] Tests pass: `pnpm test`
- [ ] No test depends on external services or network

## Anti-patterns (do NOT do)

- Do not use Jest — use Vitest
- Do not place test files outside `__tests__/` directories
- Do not test implementation details — test behavior
- Do not use `test()` — use `it()` for consistency
