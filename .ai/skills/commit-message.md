# Skill: Commit Message

## When to use
When writing a commit message for staged changes.

## Prerequisite context to load
- `.ai/context/conventions.md` — commit message format

## Inputs required from user
- Staged changes (from `git diff --cached` or context)

## Step-by-step procedure
1. Review the staged changes.
2. Determine the type: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`.
3. Determine the scope (optional): typically the package name without `@turbo/` prefix (e.g., `ui`, `api`, `db`).
4. Write a concise imperative description (lowercase, no period).
5. If the change is complex, add a blank line and a body explaining **why**.

Format: `type(scope): description`

## Canonical example
```
feat(ui): add date-picker component

Uses shadcn/ui date-picker with react-day-picker.
Exports DatePicker and DateRangePicker from @turbo/ui.
```

See: any commit in `git log --oneline`

## Validation checklist
- [ ] Uses conventional commit format
- [ ] Type is one of: feat, fix, chore, docs, refactor, test, ci
- [ ] Description is imperative, lowercase, no trailing period
- [ ] Scope matches affected package (if applicable)

## Anti-patterns (do NOT do)
- Do not use past tense ("added", "fixed")
- Do not capitalize the description
- Do not end with a period
- Do not use generic messages like "update code" or "fix stuff"
