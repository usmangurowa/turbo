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
  with the app frame; the active nav pill is `#ECECEC` (`--sidebar-accent`)
  with a near-black label — subtle, never dark.
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

## Signature Patterns

- Stat cards: `border-dashed` border, muted label top-left, ~text-5xl medium
  numeral (`NumberTicker`), small muted caption below.
- Tables: icon+label column headers, muted grouped section rows ("This Week" +
  count chip), colored squircle date icons, status dots, pill badges on
  secondary background.
- Sidebar: shadcn `sidebar-07` pattern (icon-collapsible), muted-caps group
  labels, ⌘K search entry, footer user dropdown.
- Integration cards: white squircle logo tile, dashed divider, ghost footer
  action.

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
- Registry components use shorthand data variants (`data-checked:`,
  `data-open:`, `data-horizontal:` …) that only work when the consuming app's
  CSS imports `shadcn/tailwind.css` (from the `shadcn` npm package) — see
  `apps/web/src/app/styles.css`. Without it, separators render thick and
  switch/open states lose their styles.
- Documented registry patch — soft focus rings: after regenerating any
  component, replace `ring-[3px]` → `ring-2` and `ring-ring/50` →
  `ring-ring/30` (web `packages/ui` and mobile `apps/mobile/src/components/ui`).
  Never remove focus rings entirely (keyboard a11y).
- `CommandDialog` renders only Dialog chrome — consumers must nest a
  `<Command>` root inside it or cmdk crashes on mount.
- `Tooltip` does not self-provide context; the app wraps everything in
  `<TooltipProvider>` (see `apps/web/src/components/providers.tsx`).

## Color And Tokens

- Use semantic tokens only: `bg-background`, `text-foreground`, `bg-card`,
  `border-border`, `bg-primary`, `text-muted-foreground`, `text-success`,
  `text-warning`.
- Do not hardcode hex values in components (web or mobile).
- Do not change shared theme variables without updating this file and
  `ROADMAP_AI.md`.

## Theming

- Web: `next-themes` with `attribute="class"`, `defaultTheme="system"`,
  `enableSystem`; `<html suppressHydrationWarning>`. Toggle via `ThemeToggle`
  or `useTheme`.
- Mobile: Uniwind adaptive themes — `Uniwind.setTheme("light"|"dark"|"system")`
  via `theme-switcher.tsx`; read tokens in native code with
  `useCSSVariable("--background")` etc. (never hardcode).
- `tooling/tailwind/theme.css` defines `@variant light/dark` blocks consumed by
  both platforms.

## Layout Rules

- Bento grids are appropriate for dashboards, summaries, and landing sections.
- Use conventional forms and lists for workflows that require repeated data
  entry or comparison.
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
