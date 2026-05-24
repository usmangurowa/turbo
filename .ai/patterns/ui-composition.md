# Pattern: UI Composition

## Overview

UI should be composed from small, reusable primitives and feature-specific
containers. Shared primitives live in `packages/ui`; app-specific composition
lives inside the app that owns the workflow.

## Shared UI Components

- Put reusable web primitives in `packages/ui/src/components`.
- Follow the component pattern in `packages/ui/src/components/button.tsx`.
- Export named components from the package barrel when they are public.
- Keep visual variants in CVA when they are part of the component API.

## App Components

- Put web-specific feature components in `apps/web/src/components`.
- Put mobile-specific feature components in `apps/mobile/src` near their route or
  feature.
- Extract hooks into `apps/*/src/hooks` when behavior is reused or when a
  component becomes difficult to scan.

## Layout Guidance

- Use full-width page sections or layout containers for page structure.
- Use cards for individual repeated items, dialogs, and framed tools.
- Avoid cards inside cards.
- For dashboard summaries, bento-style grids are acceptable when each tile has a
  distinct purpose.
- For settings and CRUD screens, prioritize compact scanning and predictable
  controls over decorative layout.

## Anti-patterns

- Do not rewrite large components to add isolated behavior.
- Do not introduce one-off CSS files for component styling.
- Do not hardcode theme colors in JSX.
- Do not move app-specific workflows into `packages/ui`.
