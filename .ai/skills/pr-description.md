# Skill: PR Description

## When to use

When writing or reviewing a pull request description.

## Prerequisite context to load

- `.github/PULL_REQUEST_TEMPLATE.md` — PR template
- `.ai/context/conventions.md` — conventions

## Inputs required from user

- Branch diff or list of changes

## Step-by-step procedure

1. Follow the PR template in `.github/PULL_REQUEST_TEMPLATE.md`.
2. Write a clear **Summary** of what changed and why.
3. List the **Type of change** (feature, fix, refactor, docs, etc.).
4. Describe **How to test** the changes.
5. Add a **Checklist** confirming quality gates.
6. Run `pnpm run ci` locally and confirm it is green before requesting a merge. It runs the same steps as `.github/workflows/ci.yml` in the same order and stops on the first failure (`.ai/decisions/ADR-0003-single-job-ci.md`).

## Canonical example

See: `.github/PULL_REQUEST_TEMPLATE.md`

## Validation checklist

- [ ] Summary explains the "what" and "why"
- [ ] Type of change is specified
- [ ] Testing instructions are clear
- [ ] `pnpm run ci` is green locally
- [ ] AI memory updated if new patterns were introduced

## Anti-patterns (do NOT do)

- Do not leave the template sections empty
- Do not write "see commit messages" as the description
- Do not skip the testing section
- Do not tick the `pnpm run ci` box based on individual checks; run the full script so the order and the stop-on-first-failure behaviour match CI
