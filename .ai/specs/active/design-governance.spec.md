# Feature Spec: Structural Design Governance

## Status

- State: complete
- Owner: AI agent
- Created: 2026-09-02
- Updated: 2026-09-02

## Problem

The repository has a shared runtime theme and several prose references, but it
does not have one machine-readable design language contract or deterministic
checks for UI composition. Humans and agents can therefore use valid primitives
in structurally inconsistent, inaccessible, or token-breaking arrangements
without CI detecting the drift.

This change establishes three complementary controls:

1. `DESIGN.md` documents the runtime token system and visual personality.
2. `.ai/patterns/ui-composition.md` defines the component and page grammar.
3. Plain Node ESM checkers enforce token parity and mechanically verifiable
   composition invariants in CI.

## Approved Design

### Source boundaries

- `tooling/tailwind/theme.css` remains the repository-owned runtime token source.
- The installed Tailwind 4.3.3 `theme.css` is the inherited runtime source for
  spacing, typography, and shadow defaults that this repository does not
  override.
- `DESIGN.md` mirrors those runtime values; it never becomes a competing token
  source.
- `.ai/context/design-system.md` remains factual implementation context.
- `.ai/patterns/ui-composition.md` becomes the normative arrangement and UX
  grammar.

### Design personality

The design language is named **Structured Restraint**. It is neutral, dense,
hierarchy-first, token-disciplined, and function-before-decoration. It rejects
nested cards, decorative gradients and glows, hardcoded colors, arbitrary
spacing, duplicate page titles, raw loading pulses, and inaccessible
icon/overlay/avatar compositions.

### Composition productions

```text
Card
  -> CardHeader(CardTitle, CardDescription?, CardAction?)
  -> CardContent
  -> CardFooter?

DialogContent | SheetContent | DrawerContent
  -> Header(Title, Description?)
  -> body
  -> Footer?

Avatar
  -> AvatarImage?
  -> AvatarFallback
```

- Card title and content are required, slot order is fixed, and nested cards are
  invalid.
- Every dialog, sheet, and drawer content subtree has its matching title. The
  title may be visually hidden with `sr-only`.
- Every avatar has a fallback.
- Every icon-sized button has `aria-label`, `aria-labelledby`, or meaningful
  `sr-only` text.
- Dashboard routes use the shared sticky page header and do not repeat its title.
- Standalone pages use a page header with an `h1`, optional description, optional
  actions, then content.
- Loading states use `Skeleton`; empty and error states use the existing `Empty`
  anatomy, with a recovery action when one exists.

### Static-analysis boundary

The composition checker scans authored web and mobile application JSX plus
authored shared composites. It excludes:

- `packages/ui/src/components/ai-elements/**`
- registry-managed web shadcn primitive files
- `apps/mobile/src/components/ui/**`

New root shared component files are scanned unless explicitly classified as
vendored. The checker tracks relevant import aliases, conditional branches, and
balanced JSX elements, including fragments and multiline attributes. It ignores
comments and code string literals. It is intentionally not a full TypeScript
parser.

Errors cover missing or misordered slots, missing accessibility companions,
`animate-pulse` outside the Skeleton primitive, raw or arbitrary class colors,
and arbitrary spacing or typography values. Warnings cover qualitative patterns
that can be identified with high confidence but should not fail CI. There is no
baseline or blanket suppression mechanism; existing authored violations are
fixed before the check is enabled.

### Token comparison

The token checker parses the constrained YAML front matter and the runtime CSS
with Node standard-library code. It:

- compares complete expected token key sets;
- verifies every semantic `--color-*` mapping points at its matching runtime
  variable;
- resolves one `var()` indirection;
- evaluates the repository's radius `calc()` forms;
- normalizes supported colors to OKLCH;
- converts hex through sRGB, linear RGB, and OKLab with inline math;
- runs startup fixtures for black, white, red, and the repository blue;
- compares colors with `|delta L| <= 0.005`, `|delta C| <= 0.005`, and wrapped
  `|delta H| <= 0.5`;
- skips hue when either chroma is below `0.01`;
- compares alpha explicitly; and
- normalizes whitespace and numeric forms for non-color values.

The forward-compatible top-level `shadows` extension is accepted by the pinned
`@google/design.md@0.4.0` linter.

## Acceptance Criteria

- [x] Root `DESIGN.md` has valid YAML front matter containing `colors`,
      `typography`, `spacing`, `rounded`, and `shadows`.
- [x] Light color names are plain and matching dark values use the `-dark`
      suffix.
- [x] Every documented token mirrors the repository-owned or inherited runtime
      source.
- [x] `DESIGN.md` defines Structured Restraint, three to five operating
      principles, intended product feel, and explicit anti-patterns.
- [x] `.ai/patterns/ui-composition.md` documents required/optional slot order,
      accessibility invariants, page layout, state patterns, and real
      repository JSX do/don't pairs.
- [x] `scripts/ai/check-ui-composition.mjs` scans only authored UI surfaces,
      emits sorted `file:line` diagnostics, and exits 1 on errors.
- [x] `scripts/ai/check-design-tokens.mjs` detects missing, extra, and changed
      token values and passes its startup color-conversion fixtures.
- [x] Root scripts expose the exact pinned design.md linter command plus
      `ui:composition` and `design:tokens`.
- [x] CI runs `design:lint`, `ui:composition`, and `design:tokens` as separate
      named steps.
- [x] Existing authored violations are fixed; no baseline is introduced.
- [x] Agent entrypoints and UI task skills require reading `DESIGN.md` and the
      composition grammar before UI changes.
- [x] Agent guidance requires `DESIGN.md` updates in the same commit as runtime
      token changes and requires both local checkers before UI completion.
- [x] Each checker is proven to fail against a temporary adversarial violation
      and to pass after that violation is removed.
- [x] No runtime dependency is added.

## Expected Files

| File                                            | Expected change                                                         |
| ----------------------------------------------- | ----------------------------------------------------------------------- |
| `DESIGN.md`                                     | Machine-readable token mirror and Structured Restraint prose            |
| `scripts/ai/check-ui-composition.mjs`           | Zero-dependency authored-JSX grammar checker                            |
| `scripts/ai/check-design-tokens.mjs`            | Zero-dependency DESIGN/runtime drift checker                            |
| `scripts/ai/_lib.mjs`                           | Shared helpers only if needed by both checkers                          |
| `package.json`                                  | Add pinned `design:lint`, `ui:composition`, and `design:tokens` scripts |
| `.github/workflows/ci.yml`                      | Add separate design-governance CI steps                                 |
| `.ai/patterns/ui-composition.md`                | Replace broad guidance with normative composition grammar               |
| `.ai/context/design-system.md`                  | Point token and composition changes at their new canonical docs/checks  |
| `.ai/context/conventions.md`                    | Record mandatory UI governance workflow                                 |
| `.ai/skills/create-component.md`                | Require design context and checker validation                           |
| `.ai/skills/create-page.md`                     | Require page grammar and checker validation                             |
| `.ai/skills/anti-slop-ui.md`                    | Require DESIGN.md and mechanical validation                             |
| `AGENTS.md`                                     | Add universal UI/token governance rules                                 |
| `CLAUDE.md`                                     | Add UI governance quick-start rule                                      |
| `.github/copilot-instructions.md`               | Add UI governance quick-start rule                                      |
| `.cursor/rules/design-system.mdc`               | Align Cursor UI guidance with the canonical docs and checks             |
| `ROADMAP_AI.md`                                 | Record the implemented governance system                                |
| Authored app/composite JSX found by the checker | Repair pre-existing violations without changing product behavior        |

## Contracts

| Contract        | Change? | Notes                                                          |
| --------------- | ------- | -------------------------------------------------------------- |
| API routes      | no      |                                                                |
| DB schema       | no      |                                                                |
| Env vars        | no      |                                                                |
| Package exports | no      |                                                                |
| UI tokens       | no      | Runtime values remain unchanged; the new document mirrors them |
| Agent memory    | yes     | New mandatory design and composition workflow                  |

## Pseudocode

```text
1. Extract runtime tokens and author DESIGN.md from observed values.
2. Expand the existing UI composition pattern with slot and page productions.
3. Implement a constrained front-matter parser and runtime CSS token extractor.
4. Self-check color math, normalize tokens, and report complete-set drift.
5. Implement an import-aware balanced JSX scanner over authored source roots.
6. Report deterministic composition diagnostics and fix existing violations.
7. Wire pinned scripts and separate CI steps.
8. Update every UI-facing agent entrypoint and skill.
9. Inject adversarial JSX and token drift; prove both checks fail.
10. Remove the violations; prove all governance checks pass.
11. Format changed files and complete the AI-memory checklist.
```

## Validation Plan

- [x] `pnpm design:lint`
- [x] `pnpm design:tokens`
- [x] `pnpm ui:composition`
- [x] Temporary invalid authored JSX causes `pnpm ui:composition` to exit 1
      with rule-specific `file:line` errors.
- [x] Removing the invalid JSX restores `pnpm ui:composition` exit 0.
- [x] Temporary DESIGN.md color drift causes `pnpm design:tokens` to exit 1
      naming the changed token.
- [x] Restoring the token restores `pnpm design:tokens` exit 0.
- [x] `pnpm format`
- [x] `pnpm skills:check`

## Rollback Plan

Revert the governance commits. No runtime token, API, database, environment, or
package export contract changes are required, so rollback removes only docs,
checkers, scripts, CI wiring, agent guidance, and any behavior-preserving
composition repairs.

## Notes

- The design.md package is pinned to `0.4.0`, the current release observed on
  2026-09-02.
- The design.md alpha schema does not document a `shadows` top-level group, but
  version 0.4.0 preserves and accepts it without warnings or errors.
- Static checks enforce syntax-level invariants. Qualitative UX correctness
  remains governed by the composition pattern and UI review workflow.
