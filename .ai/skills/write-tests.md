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
