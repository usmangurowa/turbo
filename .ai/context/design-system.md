# Design System Context

## Baseline

The visual system is a template-grade shadcn/ui interface (style `radix-maia`,
base color neutral, icon library HugeIcons) on Tailwind CSS 4, with CVA
variants and shared theme tokens. Web and mobile consume the SAME token file:
`tooling/tailwind/theme.css`. Preserve this identity unless a task explicitly
requests a visual change.

## Visual Identity

- **Font**: Inter Display, vendored in `packages/assets/fonts/` (woff2 for web
  via `next/font/local` in `apps/web/src/fonts/`, ttf for mobile via the
  `expo-font` config plugin). Body tracking is `-0.15px` (set in `@layer base`).
- **Dark mode**: neutral charcoal `#161616` (`oklch(0.2002 0 0)`) — zero
  chroma, never warm/stone. Layered surfaces: card `#1C1C1C`, popover
  `#242424`, secondary/badge `#2A2A2A`.
- **Light mode**: near-white `#FAFAFA` with pure-gray surfaces (zero chroma —
  the earlier `#D8D9D4` greige tint was dropped). Ink hierarchy: foreground
  `#292929`, muted-foreground `#5D5D5D`, borders `#E5E5E5`. Sidebar blends
  with the app frame; the active nav pill is `#F2F2F2` (`--sidebar-accent`,
  same value as `--accent` — icon tiles and hover rows share it) with a
  near-black label — subtle, never dark.
- **Accent**: electric blue `#0659FF` (`oklch(0.5406 0.2549 262.56)`, token
  `--primary-500`) in both modes.
- **Muted text**: `#989A9D` dark / `#5D5D5D` light.
- **Brand mark**: HugeIcons "AI collage template" outline icon (1.5px stroke),
  embedded inline in `apps/web/src/components/turbo-logo.tsx` because
  `AiCollageTemplateIcon` is Pro-only (not in `@hugeicons/core-free-icons`).
  Favicon is `apps/web/src/app/icon.svg` (Next.js file convention, brand-blue
  stroke) — there is no `favicon.ico`. Keep both in sync if the mark changes.
- **Radii**: `--radius: 0.75rem` → sm 8px (badges), lg 12px (buttons/inputs),
  xl 16px (panels); extended `--radius-2xl..4xl` for pills.
- **Status colors**: `--success` (green) and `--warning` (orange) tokens exist
  for status dots and trends; chart palette `--chart-1..5`.
- **Status badges**: state badges use the documented `Badge` patch variants
  `variant="success"` (positive: active, connected, verified),
  `variant="warning"` (attention: due, pending review), or
  `variant="destructive"` (failed, revoked). Terminal or neutral states
  (ended, upcoming, not connected) stay `variant="outline"`. Never tint a
  badge via `className` — add a variant instead.

## Signature Patterns

- Dashed frames: the dashed border is the signature of the language — stat
  cards, table frames, and card dividers use `border-dashed` to evoke ruled
  paper. Every dashed frame goes through `Card variant="dashed"` (directly, or
  via `StatCard` / `TableCard`); empty and error states that stand alone put
  `rounded-2xl border border-dashed` on the `Empty` itself.
- Stat cards: `StatCard` (`apps/web/src/components/dashboard/stat-card.tsx`)
  on `Card variant="dashed"` — muted 12px label (optionally `HintLabel` +
  icon) top-left, one `action` slot (trend, badge, menu) top-right,
  `tabular-nums` numeral (`size="hero"` text-3xl for the overview row,
  `size="compact"` text-xl for detail grids), optional `valueCaption`,
  support-zone `children` (sparkline, `Progress`), muted caption.
  `tone`/`captionTone` take `success | warning | destructive`; `dim` mutes a
  zero; `href` makes the whole card a link. Do not write a private stat tile
  again.
- Table / container cards: `TableCard` (`table-card.tsx`) — `Card
variant="dashed"` with a required `title`, `description`, one `action`, and
  a `footer` slot (pagination, counts, fine print). Body padding is `none`
  for tables and `sm` for charts and lists. Table titles stay 14px; the
  override lives in `TableCard`, not at call sites.
- Pagination: `TablePagination` (`table-pagination.tsx`) composes the shadcn
  `Pagination` primitives for state-driven Previous / "Page x of y" / Next in
  a `TableCard` footer. Anchors carry `aria-disabled` at the bounds; tests
  query `getByRole("link", { name: "Go to next page" })`.
- Tables: icon+label column headers, muted grouped section rows ("This Week" +
  count chip), colored squircle date icons, status dots, pill badges on
  secondary background. Never render a value cell as a bare `text-xs` span
  beside `Badge` siblings — use `Badge variant="outline"`.
- Squircle icon tiles: a rounded square (`rounded-xl`) on `bg-accent` holds
  icons in tables and integration cards; no border, no shadow.
- Sidebar: shadcn `sidebar-07` pattern (icon-collapsible), muted-caps group
  labels, ⌘K search entry, footer user dropdown.
- Dashboard header: sticky bar with page chip (`bg-accent` rounded-full pill,
  icon + nav label from `nav-config.ts`) + muted inline description, right
  side avatar stack / search button / Export dropdown (`header-actions.tsx`).
  Page titles come from the header chip — section pages must NOT repeat an h2.
- Page toolbar: a section page renders exactly one `PageToolbar`
  (`page-toolbar.tsx`) directly under the sticky header — a fixed 48px
  (`h-12`) `border-b` row with controls left and the primary action right.
  Controls inside are `size="sm"` (h-8) or smaller. Detail pages pass `wrap`
  (`min-h-12`) so badges can break onto a second line at narrow widths. Do not
  put page-level padding above the toolbar; banners go in the body column.
- Sort / filter controls inside the `PageToolbar` (Overview): "Sorted by
  **X**" secondary pill → radio dropdown; "Filter" outline pill with count
  badge → checkbox dropdown (`onSelect={(e) => e.preventDefault()}` keeps it
  open while toggling). State lives in a client view component
  (`overview-view.tsx`) that feeds props to `TasksTable` (`tasks-toolbar.tsx`).
- Search: one `SearchCommand` instance owned by `SearchProvider`
  (`search-context.tsx`); sidebar + header both call
  `useSearchCommand().openSearch()`. Never mount `SearchCommand` twice — its
  internal ⌘K listener toggles, so two instances double-fire.
- Integration cards: full `Card` anatomy — squircle `bg-accent` icon tile
  beside the `CardTitle`, `CardDescription`, a `Switch` in `CardAction`, a
  status `Badge` (`success` / `outline`) in `CardContent`, and a
  `border-t border-dashed` `CardFooter` holding the ghost action
  (`integrations.tsx`).
- Query error states: `QueryError` (`query-error.tsx`) — `Empty` with a retry
  button and a sign-in link for expired sessions; `framed={false}` when the
  parent card already draws the dashed frame.

## Precedent-First UI Workflow

New product UI must extend the existing visual language instead of being
composed from agent memory or a generic dashboard pattern. Apply this order:

1. Follow explicit user direction.
2. Inspect the nearest existing route and components that solve a similar
   workflow. Reuse their information hierarchy, action placement, responsive
   behavior, and loading/error/empty states.
3. Compose the configured shadcn/ui primitives from `packages/ui`; when a
   primitive or interaction is unfamiliar, verify it against the current
   shadcn documentation and registry before implementing it.
4. Introduce a new composition only when the nearby precedent and configured
   shadcn system do not solve the requirement. Document reusable additions
   here or in `.ai/patterns/ui-composition.md`.

This is a hierarchy, not a license to copy a screen blindly. The new surface
must preserve the behavior and accessibility appropriate to its own workflow.

## Component Rules

- Shared web components live in `packages/ui/src/components` (shadcn CLI
  managed — regenerate with `pnpm ui-add`, do not hand-edit registry output
  beyond documented patches).
- Import paths: `@turbo/ui/components/<name>`, `cn` from
  `@turbo/ui/lib/utils`, hooks from `@turbo/ui/hooks/<name>`.
- Component files use `kebab-case.tsx`, named exports, `cva` variants, `cn()`
  merging, and a stable `data-slot` attribute.
- Custom wrappers: `icon.tsx` (HugeiconsIcon, 1.5px default stroke) and
  `theme.tsx` (next-themes `ThemeProvider` + `ThemeToggle` + `useTheme`).
- Buttons have no `loading` prop — compose `<Spinner data-icon="inline-start" />`
  with `disabled` instead.
- Documented registry patch — `Card variant="dashed"` (`card.tsx`): swaps the
  `ring-1` hairline for `border border-dashed` and sets `data-variant`. Every
  dashed frame goes through this variant (via `StatCard` / `TableCard`);
  never hand-write `bg-card rounded-2xl border border-dashed` on a `div`.
- Documented registry patch — `Badge` `success` / `warning` variants
  (`badge.tsx`): `bg-success/10 text-success` and `bg-warning/10
text-warning`, plus a `size="xs" | "sm"` axis (20px display badge by
  default, 28px for pickers and toggles). Web only; the mobile badge port has
  no equivalent yet.
- Documented registry patch — `ThemeToggle` (`theme.tsx`) is a one-click
  switch on the resolved theme with an `aria-label`; the registry dropdown
  (Light / Dark / System) is not used.
- All three patches are guarded by
  `packages/ui/src/__tests__/registry-patches.test.ts`; re-apply and re-run
  after any `pnpm ui-add`.
- Registry components use shorthand data variants (`data-checked:`,
  `data-open:`, `data-horizontal:` …) that only work when the consuming app's
  CSS imports `shadcn/tailwind.css` (from the `shadcn` npm package) — see
  `apps/web/src/app/styles.css`. Without it, separators render thick and
  switch/open states lose their styles.
- Documented registry patch — soft focus rings: after regenerating any
  component, replace `ring-[3px]` → `ring-2` and `ring-ring/50` →
  `ring-ring/30` (web `packages/ui` and mobile `apps/mobile/src/components/ui`).
  Buttons go one notch softer: `focus-visible:border-ring/50` +
  `focus-visible:ring-ring/20` (solid border-ring reads too loud on small
  pills). Never remove focus rings entirely (keyboard a11y).
- `CommandDialog` renders only Dialog chrome — consumers must nest a
  `<Command>` root inside it or cmdk crashes on mount.
- `Tooltip` does not self-provide context; the app wraps everything in
  `<TooltipProvider>` (see `apps/web/src/components/providers.tsx`).

## Color And Tokens

- `DESIGN.md` is the machine-readable token mirror and design-language contract.
  `.ai/patterns/ui-composition.md` is the normative arrangement grammar. Read
  both before UI work.
- Use semantic tokens only: `bg-background`, `text-foreground`, `bg-card`,
  `border-border`, `bg-primary`, `text-muted-foreground`, `text-success`,
  `text-warning`.
- Do not hardcode hex values, raw palette classes, arbitrary colors, arbitrary
  spacing, or arbitrary typography in authored components.
- A change to runtime tokens must update `DESIGN.md` in the same commit. Update
  this file and `ROADMAP_AI.md` when the visual identity or token contract
  changes.
- Before completing UI work, run `pnpm design:lint`, `pnpm design:tokens`, and
  `pnpm ui:composition`.

## Theming

- Web: `next-themes` with `attribute="class"`, `defaultTheme="system"`,
  `enableSystem`; `<html suppressHydrationWarning>`. `ThemeToggle` is a
  one-click switch that flips the _resolved_ theme (no dropdown, no explicit
  "system" item — the system default still applies until the first click).
  Toggle via `ThemeToggle` or `useTheme`.
- Mobile: Uniwind adaptive themes — `Uniwind.setTheme("light"|"dark"|"system")`
  via `theme-switcher.tsx`; read tokens in native code with
  `useCSSVariable("--background")` etc. (never hardcode).
- `tooling/tailwind/theme.css` defines `@variant light/dark` blocks consumed by
  both platforms.

## Layout Rules

- Bento grids are appropriate for dashboards, summaries, and landing sections.
- Use conventional forms and lists for workflows that require repeated data
  entry or comparison.
- Flat-first depth: surfaces separate by tonal step (background → card →
  popover), hairline borders, and the dashed frame — not by shadow. Shadows
  are for overlays only.
- Avoid nested cards.
- Avoid decorative-only blobs, gradients, and oversized empty hero sections in
  application screens.

## Mobile Rules

- Mobile screens live under `apps/mobile/src/app` and use Expo Router.
- Mobile UI primitives are react-native-reusables ports in
  `apps/mobile/src/components/ui` styled with Uniwind classNames — do not
  import web-only `@turbo/ui` components.
- Inter Display font utilities on mobile: `font-inter`, `font-inter-medium`,
  `font-inter-semibold`, `font-inter-bold` (per-weight family tokens).
