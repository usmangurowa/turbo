# Skill: Create Page

## When to use

"Create a page", "add a route", "add a new screen".

## Prerequisite context to load

- `.ai/context/conventions.md` — routing conventions
- `.ai/context/tech-stack.md` — framework details
- `DESIGN.md` — design language and machine-readable token contract
- `.ai/context/design-system.md` — house surface recipes (stat cards, table cards, page toolbar, header chip)
- `.ai/patterns/ui-composition.md` — page, state, slot, and accessibility grammar
- `.ai/skills/anti-slop-ui.md` — for broad web page composition, landing pages, or visual polish
- `apps/web/src/app/` — existing page structure (Next.js App Router)
- `apps/mobile/src/app/` — existing screen structure (Expo Router)

## Inputs required from user

- Page/screen name and route path
- Target app: web or mobile
- Whether authentication is required
- Data fetching needs
- If any required input is missing or ambiguous, ask before creating/editing files.

## Step-by-step procedure

### Web (Next.js App Router)

1. Create directory: `apps/web/src/app/<route>/`
2. Create `page.tsx` with the page component.
3. Optionally create `layout.tsx` for nested layouts.
4. Use server components by default; add `"use client"` only when needed.
5. Use `@turbo/ui` components for UI.
6. Design flow (all pages): pick the page archetype and card slots from `.ai/patterns/ui-composition.md` → read `DESIGN.md` tokens and the matching surface recipe in `.ai/context/design-system.md` (dashboard sections start with `PageToolbar`, stats use `StatCard`, tables use `TableCard`) → build → run the refinement pass from `.ai/skills/anti-slop-ui.md`.
7. If the page includes broad visual composition or landing-page treatment, apply `.ai/skills/anti-slop-ui.md` in full before finalizing the layout.

### Mobile (Expo Router)

1. Create file: `apps/mobile/src/app/<route>.tsx`
2. Use Expo Router file-based routing conventions.
3. Use Uniwind for styling.

## Canonical example

- Web: `apps/web/src/app/` directory structure
- Mobile: `apps/mobile/src/app/` directory structure

## Validation checklist

- [ ] Route follows file-based routing conventions
- [ ] Uses shared UI components from `@turbo/ui` (web) or local components (mobile)
- [ ] Auth check added if page is protected
- [ ] The screen matches a page archetype from `.ai/patterns/ui-composition.md`; cards follow the slot anatomy; one primary action per region
- [ ] Dashboard pages do not repeat the header-chip title as an `h2`
- [ ] For broad web page design work, the anti-slop UI checklist was applied
- [ ] Page renders without errors
- [ ] `pnpm design:lint` passes
- [ ] `pnpm design:tokens` passes
- [ ] `pnpm ui:composition` passes

## Anti-patterns (do NOT do)

- Do not use `pages/` directory (Next.js Pages Router) — use App Router
- Do not add `"use client"` unless the component needs client-side interactivity
- Do not fetch data in client components when server components suffice (web)
- Do not invent page, loading, empty, or error-state compositions outside the
  documented grammar
