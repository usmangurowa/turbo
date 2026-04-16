# Skill: Create Page

## When to use
"Create a page", "add a route", "add a new screen".

## Prerequisite context to load
- `.ai/context/conventions.md` — routing conventions
- `.ai/context/tech-stack.md` — framework details
- `apps/web/app/` — existing page structure (Next.js App Router)
- `apps/mobile/src/app/` — existing screen structure (Expo Router)

## Inputs required from user
- Page/screen name and route path
- Target app: web or mobile
- Whether authentication is required
- Data fetching needs

## Step-by-step procedure

### Web (Next.js App Router)
1. Create directory: `apps/web/app/<route>/`
2. Create `page.tsx` with the page component.
3. Optionally create `layout.tsx` for nested layouts.
4. Use server components by default; add `"use client"` only when needed.
5. Use `@turbo/ui` components for UI.

### Mobile (Expo Router)
1. Create file: `apps/mobile/src/app/<route>.tsx`
2. Use Expo Router file-based routing conventions.
3. Use NativeWind for styling.

## Canonical example
- Web: `apps/web/app/` directory structure
- Mobile: `apps/mobile/src/app/` directory structure

## Validation checklist
- [ ] Route follows file-based routing conventions
- [ ] Uses shared UI components from `@turbo/ui` (web) or local components (mobile)
- [ ] Auth check added if page is protected
- [ ] Page renders without errors

## Anti-patterns (do NOT do)
- Do not use `pages/` directory (Next.js Pages Router) — use App Router
- Do not add `"use client"` unless the component needs client-side interactivity
- Do not fetch data in client components when server components suffice (web)
