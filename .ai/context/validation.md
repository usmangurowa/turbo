# Validation Context

Use the narrowest command that can falsify the change first, then broaden only
when needed.

## Common Commands

| Scope             | Command                              |
| ----------------- | ------------------------------------ |
| Full verification | `pnpm verify`                        |
| Full tests        | `pnpm test`                          |
| Package typecheck | `pnpm -F @turbo/<package> typecheck` |
| Package lint      | `pnpm -F @turbo/<package> lint`      |
| Package test      | `pnpm -F @turbo/<package> test`      |
| Format check      | `pnpm format`                        |
| Format fix        | `pnpm format:fix`                    |
| Workspace lint    | `pnpm lint:ws`                       |
| AI contracts      | `pnpm ai:contracts`                  |
| Env contract      | `pnpm ai:env`                        |

## Validation Order

1. Behavior-scoped test or failing check.
2. Package-level typecheck, lint, or test.
3. Generated contract check if contracts changed.
4. Full `pnpm verify` when the blast radius is broad.

## Agent Rule

After the first substantive code edit, run the narrowest available validation
before widening scope.
