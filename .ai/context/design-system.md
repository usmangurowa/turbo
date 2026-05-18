# Design System Context

## Baseline

The visual system is a mature shadcn/ui-style interface built on Tailwind CSS 4,
Radix primitives, CVA variants, and shared theme tokens. Preserve the neutral
baseline unless a task explicitly requests a visual identity change.

## Component Rules

- Shared web components live in `packages/ui/src/components`.
- Component files use `kebab-case.tsx`.
- Components use named exports, not default exports.
- Components use `cva` for variants when variants exist.
- Components use `cn()` for class merging.
- Components include a stable `data-slot` attribute.
- Props extend the correct `React.ComponentProps<"element">` type.

## Shape And Spacing

- Use the shared radius tokens from `tooling/tailwind/theme.css`.
- Existing controls commonly use soft rounded shapes such as `rounded-4xl`.
- Use consistent spacing from Tailwind utilities; avoid arbitrary spacing unless
  it solves a specific layout issue.
- Keep dense product surfaces scannable. Avoid marketing-scale spacing in forms,
  settings, tables, and dashboards.

## Color And Tokens

- Use semantic tokens such as `bg-background`, `text-foreground`, `bg-card`,
  `border-border`, `bg-primary`, and `text-muted-foreground`.
- Do not hardcode one-off brand colors in components.
- Do not change shared theme variables without updating this file and
  `ROADMAP_AI.md`.
- Avoid broad palette changes unless explicitly approved by the user.

## Layout Rules

- Bento grids are appropriate for dashboards, summaries, and landing sections.
- Use conventional forms and lists for workflows that require repeated data
  entry or comparison.
- Avoid nested cards.
- Avoid decorative-only blobs, gradients, and oversized empty hero sections in
  application screens.

## Mobile Rules

- Mobile screens live under `apps/mobile/src/app` and use Expo Router.
- Mobile styling uses Uniwind conventions and local/native primitives rather
  than importing web-only `@turbo/ui` components.
