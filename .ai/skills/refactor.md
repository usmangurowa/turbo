# Skill: Refactor

## When to use
"Refactor this", "clean up", "improve this code", "extract a utility".

## Prerequisite context to load
- `.ai/context/conventions.md` — coding conventions
- Relevant skill file for the code being refactored

## Inputs required from user
- Code or files to refactor
- Goal of the refactoring (performance, readability, pattern alignment)

## Step-by-step procedure
1. **Understand current behavior**: Read the code and its tests.
2. **Identify the target pattern**: Check `.ai/context/conventions.md` for the expected pattern.
3. **Plan changes**: List what will change and verify no behavior is lost.
4. **Apply changes** incrementally:
   - Extract shared logic to `packages/shared/` if reused across packages
   - Align with existing component/API/DB patterns
   - Remove duplication
5. **Run tests**: Ensure all existing tests pass.
6. **Run type checks**: `pnpm typecheck`
7. **Update AI memory** if the refactoring establishes a new pattern.

## Canonical example
Component patterns: `packages/ui/src/components/button.tsx`
API patterns: `packages/api/src/router/api-key.ts`

## Validation checklist
- [ ] No behavior changes (unless intentional)
- [ ] All existing tests pass
- [ ] Type checks pass
- [ ] Code follows conventions
- [ ] AI memory updated if new pattern introduced

## Anti-patterns (do NOT do)
- Do not refactor and add features in the same change
- Do not change public API signatures without updating consumers
- Do not remove tests during refactoring
