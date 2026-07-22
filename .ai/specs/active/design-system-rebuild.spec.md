# Feature Spec: Design System Rebuild (web + ui + mobile)

## Status

- State: implemented
- Owner: AI agent
- Created: 2026-07-22
- Updated: 2026-07-22

## Problem

The current `apps/web` and `packages/ui` shadcn setup drifted from current
shadcn CLI best practices (stale generated output, stray
`apps/web/@turbo/ui/empty.tsx` artifact, non-standard `components.json`
aliases) and carries a generic visual identity. The user wants a fresh,
template-grade rebuild with a specific neutral-dark visual identity shared 1:1
between web (Tailwind v4 + shadcn) and mobile (uniwind +
react-native-reusables), keeping all existing functionality.

## Design direction (user-provided)

- Font: Inter Display, letter-spacing −0.15px, body 15–16px, stat numerals
  ~48–56px medium.
- Dark: `#161616` neutral charcoal (explicitly NOT warm/stone `#1A1613`),
  layered lighter panels, subtle hover rows, dashed borders on stat cards.
- Light: near-white neutral background; `#D8D9D4` used as muted/surface tint.
- Accent: `#0659FF` electric blue (replaces orange `#FF4306`).
- Text: `#FFFFFF` primary / `#989A9D` muted (dark mode).
- Radii: 8px small controls, 12px buttons/inputs/cards, 16px panels
  (`--radius: 0.75rem` maps onto shadcn scale).
- Icons: HugeIcons (kept; closest npm match to Stratis UI stroke aesthetic).
- Patterns: stat cards (muted label → huge numeral → caption), tables with
  status dots + pill badges, sidebar with ⌘K search + muted-caps section
  labels, pill buttons/chips, integration-style cards with dashed dividers.

## Acceptance Criteria

- [ ] `tooling/tailwind/theme.css` expresses the new palette in oklch with
      0-chroma neutrals, works for both Tailwind v4 web and uniwind mobile.
- [ ] Inter Display served from `packages/assets` on web (`next/font/local`)
      and mobile (`expo-font`); Plus Jakarta Sans removed.
- [ ] `packages/ui` regenerated with the latest shadcn CLI; all previously
      exported components still exported; `components.json` aliases follow the
      official monorepo shape; `icon.tsx` + `theme.tsx` wrappers preserved.
- [ ] `apps/web` rebuilt with `src/` structure: landing, full auth flow
      (login, create-account, verify-email, forgot/reset-password, onboarding),
      dashboard with collapsible sidebar, stat cards with dashed borders, data
      table with status dots and pill badges, ⌘K command menu.
- [ ] API/auth mounts, Sentry, PostHog, Vercel analytics, nuqs, TanStack Query
      providers preserved and functional (`pnpm build` passes).
- [ ] Dark/light mode via next-themes class strategy, system default, no
      flash; toggle accessible from the UI.
- [ ] `apps/mobile` components refreshed against the shared theme; Inter
      Display loaded via expo-font; screens restyled; typecheck passes.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm format` pass across the workspace.

## Expected Files

| File                               | Expected change                            |
| ---------------------------------- | ------------------------------------------ |
| `tooling/tailwind/theme.css`       | New tokens (palette, radii, fonts)         |
| `packages/assets/*`                | Inter Display font files + exports         |
| `packages/ui/src/**`               | Regenerated components, wrappers           |
| `packages/ui/components.json`      | Official monorepo aliases                  |
| `apps/web/src/**`                  | Rebuilt app (pages, components, providers) |
| `apps/web/components.json`         | Refreshed CLI config                       |
| `apps/web/@turbo/`                 | Deleted stray artifact                     |
| `apps/mobile/src/components/ui/**` | Refreshed RN components                    |
| `apps/mobile/src/app/**`           | Restyled screens                           |
| `.ai/context/design-system.md`     | New visual baseline documented             |
| `.ai/context/tech-stack.md`        | Font/dependency updates                    |
| `ROADMAP_AI.md`                    | Ledger rows                                |

## Contracts

| Contract        | Change? | Notes                                            |
| --------------- | ------- | ------------------------------------------------ |
| API routes      | no      | Mount points ported verbatim                     |
| DB schema       | no      |                                                  |
| Env vars        | no      |                                                  |
| Package exports | yes     | `@turbo/assets` gains font exports; ui unchanged |
| UI tokens       | yes     | Full palette/radius/font swap                    |
| Agent memory    | yes     | design-system.md, tech-stack.md, ROADMAP_AI.md   |

## Pseudocode

```text
1. Rewrite tooling/tailwind/theme.css with new tokens.
2. Vendor Inter Display into packages/assets; wire web + mobile.
3. Regenerate packages/ui via latest shadcn CLI; restore wrappers.
4. Rebuild apps/web pages in the new design; port infra wiring.
5. Refresh apps/mobile ui components + screens with shared tokens.
6. Validate (lint, typecheck, build, visual pass), update AI memory.
```

## Validation Plan

- [x] `pnpm lint` (repo-wide via turbo, 39 tasks green)
- [x] `pnpm typecheck` (repo-wide via turbo, green)
- [x] `pnpm format` (after `format:fix`)
- [x] `pnpm --filter @turbo/web build` (11 routes)
- [x] `turbo test` (16 tasks green)
- [x] Manual visual pass on prod server :3210 (landing, auth, dashboard; /dashboard 307-guards unauthenticated); built CSS verified to contain `#161616`/`#fafafa`, `#989a9d`, `--radius:.75rem`, `-.15px` tracking, InterDisplay woff2
- [x] `pnpm ai:contracts`

## Rollback Plan

Single branch; revert the commit range. No DB/env/API contract changes, so a
git revert fully restores the previous state.

## Notes

- Business packages (`api`, `auth`, `db`, `jobs`, `mail`, `analytics`) and
  `apps/server` are out of scope.
- Uniwind stays (repo convention) even though the expo-tailwind-setup skill
  documents NativeWind v5; the shared `@variant light/dark` theme structure is
  the compatibility contract.
- shadcn preset chosen at implementation time from the current CLI list
  (nova/vega/maia/lyra/mira/luma) — closest to neutral, flat, 12px-radius feel;
  theme values then overridden by our tokens.
