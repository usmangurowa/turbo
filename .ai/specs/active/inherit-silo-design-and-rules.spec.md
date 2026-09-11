# Feature Spec: Inherit silo's design language and AI rules

## Status

- State: implemented
- Owner: AI agent
- Created: 2026-09-11
- Updated: 2026-09-11

## Problem

`usmangurowa/silo` was forked from this template and has since matured in two
areas the template lacks:

1. **Design language.** Silo turned the template's hand-written dashed stat
   card into a house system: a documented `Card variant="dashed"` registry
   patch, `Badge` status variants, and app-level house primitives (`StatCard`,
   `TableCard`, `TablePagination`, `PageToolbar`, `HintLabel`, `QueryError`).
   The template still writes `bg-card rounded-2xl border border-dashed` by hand
   on plain `div`s, so every new dashboard surface re-invents the frame.
2. **AI rules.** Silo's `.ai/` memory grew generic engineering guidance (spec
   lifecycle, AI-memory pattern, Turborepo dev-task pattern, per-package
   verification, precedent-first UI workflow) that belongs in the template.

Everything finance-domain-specific in silo (categories, FX, loans, inbox,
providers) is out of scope.

## Acceptance Criteria

- [x] `Card` accepts `variant="default" | "dashed"` and exposes
      `data-variant`; the default variant keeps the registry's ring classes
      unchanged (its markup gains only `data-variant="default"`, matching the
      existing `data-size` attribute).
- [x] `Badge` accepts `variant="success" | "warning"` and
      `size="xs" | "sm"` (default `xs`); existing variants render unchanged.
- [x] `ThemeToggle` is a one-click switch on the resolved theme with an
      accessible label; no dropdown.
- [x] `apps/web` ships `StatCard`, `TableCard`, `TablePagination`,
      `PageToolbar`, `HintLabel`, and `QueryError` under
      `src/components/dashboard/`. The card-bearing recipes (`StatCard`,
      `TableCard`) compose full `Card` anatomy; the others compose their own
      primitives (`Pagination`, `Tooltip`, `Empty`). `pnpm ui:composition`
      passes.
- [x] The dashboard overview, tasks table, integrations, API keys card, and
      section placeholder use the primitives instead of hand-written dashed
      frames.
- [x] `DESIGN.md` prose documents dashed borders as a signature, the stat card
      / table card / header chip recipes, flat-first depth, and the
      precedent-first workflow. Front-matter tokens are unchanged.
- [x] `.ai/` gains the generic rules from silo (see Expected Files) with
      silo-specific names generalised.
- [x] `pnpm design:lint`, `pnpm design:tokens`, `pnpm ui:composition`,
      `pnpm typecheck`, `pnpm lint`, and `pnpm test` pass.

## Expected Files

| File                                                                            | Expected change                                                  |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `packages/ui/src/components/card.tsx`                                           | CVA `variant` (default ring / dashed border), `data-variant`     |
| `packages/ui/src/components/badge.tsx`                                          | `success` / `warning` variants, `size` axis                      |
| `packages/ui/src/components/theme.tsx`                                          | One-click `ThemeToggle`                                          |
| `packages/ui/src/__tests__/registry-patches.test.ts`                            | Patch guards for the three documented patches above              |
| `apps/web/src/components/dashboard/stat-card.tsx`                               | New house `StatCard`                                             |
| `apps/web/src/components/dashboard/table-card.tsx`                              | New house `TableCard`                                            |
| `apps/web/src/components/dashboard/table-pagination.tsx`                        | New `TablePagination`                                            |
| `apps/web/src/components/dashboard/page-toolbar.tsx`                            | New `PageToolbar`                                                |
| `apps/web/src/components/dashboard/hint-label.tsx`                              | New `HintLabel`                                                  |
| `apps/web/src/components/dashboard/query-error.tsx`                             | New `QueryError`                                                 |
| `apps/web/src/components/dashboard/stat-cards.tsx`                              | Compose `StatCard`                                               |
| `apps/web/src/components/dashboard/tasks-table.tsx`                             | Wrap in `TableCard`                                              |
| `apps/web/src/components/dashboard/api-keys-card.tsx`                           | Wrap in `TableCard`                                              |
| `apps/web/src/components/dashboard/integrations.tsx`                            | Compose `Card` anatomy                                           |
| `apps/web/src/components/dashboard/overview-view.tsx`                           | Use `PageToolbar`                                                |
| `apps/web/src/app/dashboard/[section]/page.tsx`                                 | Use `Card variant="dashed"` frame                                |
| `DESIGN.md`                                                                     | Prose only: signatures, recipes, precedent-first workflow        |
| `.ai/context/design-system.md`                                                  | Signature patterns, registry patches, precedent-first workflow   |
| `.ai/patterns/ui-composition.md`                                                | House primitive grammar (`StatCard`, `TableCard`, `PageToolbar`) |
| `.ai/context/conventions.md`                                                    | Generic additions from silo                                      |
| `.ai/patterns/turbo-dev-tasks.md`, `.ai/patterns/external-provider-boundary.md` | New generic patterns                                             |
| `.ai/specs/README.md`                                                           | Spec lifecycle                                                   |
| `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`                     | Per-package verification note, new pattern links                 |
| `ROADMAP_AI.md`                                                                 | Feature row + change-log row                                     |

## Contracts

| Contract        | Change? | Notes                                                           |
| --------------- | ------- | --------------------------------------------------------------- |
| API routes      | no      |                                                                 |
| DB schema       | no      |                                                                 |
| Env vars        | no      |                                                                 |
| Package exports | no      | Existing `./components/*` glob already covers the patched files |
| UI tokens       | no      | Runtime tokens untouched; `DESIGN.md` front matter unchanged    |
| Agent memory    | yes     | New patterns, spec README, conventions, design docs             |

## Pseudocode

```text
1. Patch packages/ui primitives (Card variant, Badge status/size, ThemeToggle).
2. Add patch-guard tests next to the existing ai-elements guard.
3. Add house primitives in apps/web/src/components/dashboard/.
4. Refactor existing dashboard surfaces onto the primitives.
5. Port generic AI rules; generalise silo component names.
6. Update DESIGN.md, design-system.md, ui-composition.md, ROADMAP_AI.md.
7. Run design + composition + typecheck + lint + test.
```

## Validation Plan

- [x] `pnpm design:lint`
- [x] `pnpm design:tokens`
- [x] `pnpm ui:composition`
- [x] `pnpm typecheck`
- [x] `pnpm lint`
- [x] `pnpm test`
- [x] `pnpm format`

## Rollback Plan

Revert the PR. The `Card` and `Badge` changes are additive (new variants with
unchanged defaults), so consumers that never pass the new props are unaffected;
the house primitives are app-local files with no external consumers.

## Notes

- Silo's `category` badge variant and the 28 `--category-*` tokens are a
  finance-domain exception and are deliberately not ported.
- Silo's `.ai/patterns/ai-memory.md`, `trust-microcopy.md`, and
  `recurring-period-outcomes.md` describe silo-only features (assistant
  memory, `TrustNote`, income periods) and are not ported.
- Silo renders `TableCard` without a header when no title is passed; this
  template's composition checker requires one `CardHeader`/`CardTitle` in every
  branch, so `TableCard` here requires a `title`.
- The design language keeps the template name "Structured Restraint"; silo's
  "Ledger" signatures are folded into it rather than renaming.
