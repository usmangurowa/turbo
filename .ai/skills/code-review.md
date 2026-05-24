# Skill: Code Review

## When to use

"Review this code", "check my PR", "review changes".

## Prerequisite context to load

- `.ai/context/conventions.md` — coding conventions
- `.ai/context/tech-stack.md` — tech stack
- Relevant `.ai/skills/` file for the type of change

## Inputs required from user

- Code diff or file paths to review
- If review scope is unclear, ask before reviewing.

## Step-by-step procedure

1. **Read conventions**: Load `.ai/context/conventions.md`.
2. **Identify the change type**: component, API, package, test, etc.
3. **Load the matching skill**: Read the relevant skill file for the change type.
4. **Check against the validation checklist** in the skill file.
5. **Review for**:
   - Naming conventions compliance
   - Pattern consistency with existing code
   - Type safety (no `any`, proper generics)
   - Error handling
   - Test coverage
   - Security concerns (auth checks, input validation)
6. **Check AI memory**: If new patterns are introduced, verify `.ai/` files are updated.
7. **Provide feedback** with specific file/line references.

## Canonical example

Review against patterns in `packages/ui/src/components/button.tsx` (components) or `packages/api/src/router/api-key.ts` (API routes).

## Validation checklist

- [ ] Code follows conventions in `.ai/context/conventions.md`
- [ ] No `any` types without justification
- [ ] Error handling is present
- [ ] New patterns are documented in `.ai/`
- [ ] Tests added for new functionality

## Anti-patterns (do NOT do)

- Do not approve PRs that introduce undocumented patterns
- Do not suggest patterns that contradict existing conventions
- Do not ignore type safety issues
