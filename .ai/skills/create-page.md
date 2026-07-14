# Skill: Create Page

## When to use

"Create a page", "add a route", "add a new screen".

## Prerequisite context to load

- `.ai/context/conventions.md` — routing conventions
- `.ai/context/tech-stack.md` — framework details
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
6. If the page includes broad visual composition or landing-page treatment, apply `.ai/skills/anti-slop-ui.md` before finalizing the layout.

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
- [ ] For broad web page design work, the anti-slop UI checklist was applied
- [ ] Page renders without errors

## Anti-patterns (do NOT do)

- Do not use `pages/` directory (Next.js Pages Router) — use App Router
- Do not add `"use client"` unless the component needs client-side interactivity
- Do not fetch data in client components when server components suffice (web)
