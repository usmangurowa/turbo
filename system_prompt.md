# Turbo System Prompt

You are working in a TypeScript Turborepo optimized for AI-assisted development.
The canonical agent context lives in `.ai/`; tool-specific files are thin entry
points that should reference `.ai/` instead of duplicating long-form rules.

## Required Context Before Coding

1. Read `AGENTS.md`.
2. Read `.ai/context/tech-stack.md` and `.ai/context/conventions.md`.
3. Read `ARCHITECTURE.md` and `ROADMAP_AI.md`.
4. Read the closest matching `.ai/skills/*.md` file.
5. For non-trivial changes, create or update a spec in `.ai/specs/active/`
   before editing implementation files.

## Stack Constraints

- Package manager: pnpm workspaces.
- Monorepo orchestration: Turborepo.
- Language: strict TypeScript with ESM packages.
- Web: Next.js App Router in `apps/web/src/app`.
- Mobile: Expo Router in `apps/mobile/src/app`.
- API: Hono routers in `packages/api/src/router`.
- Database: Drizzle ORM with Postgres/Supabase in `packages/db`.
- Auth: Better Auth in `packages/auth`.
- Validation: Zod in `packages/validators` or local route files for one-off
  request validation.
- Server state: TanStack Query.
- Client state: Zustand for shared UI state only.
- Form state: `react-hook-form` with Zod resolvers.
- UI: Tailwind CSS 4, Uniwind for mobile, shadcn/ui-style shared components in
  `packages/ui`.

## Architectural Rules

- Apps may import packages; packages must not import from apps.
- Business API behavior belongs in `packages/api`, not in app-local route files.
- Register new Hono routers in `packages/api/src/index.ts`.
- Use `Hono<AppContext>` for API routers.
- Use explicit auth middleware or guards for protected routes.
- Keep shared contracts in `packages/validators` when more than one surface uses
  them.
- Keep package public APIs declared in `package.json` `exports` fields.
- Update `.ai/contracts/*.generated.md` after API, DB, env, dependency, or export
  changes.

## TypeScript Rules

- Prefer named exports.
- Avoid `any`; use explicit types, generics, or Zod-derived types.
- Preserve strict typechecking and ESM.
- Keep runtime validation at external boundaries.
- Do not invent package imports; confirm package exports first.

## UI And Design Rules

- Use `@turbo/ui` for shared web UI.
- Shared components use CVA variants, `cn()`, `data-slot`, named exports, and
  `kebab-case.tsx` filenames.
- Use Tailwind theme tokens instead of hardcoded colors.
- Preserve the mature neutral shadcn-style baseline unless the user explicitly
  approves a palette change.
- Use the existing radius scale. Component shapes should feel soft and precise,
  with rounded/squircle controls where the current UI already uses them.
- Bento grids are appropriate for dashboard summaries and landing sections, not
  dense settings forms or CRUD tables.
- Avoid nested cards, decorative-only gradients, and one-off visual systems.

## Isolation Rules

- Prefer small, local changes over rewriting large files.
- Extract reusable view logic into hooks under `apps/*/src/hooks`.
- Extract shared pure logic into `packages/shared`.
- Extract reusable shared UI into `packages/ui`.
- Do not refactor unrelated code while implementing a feature.
- If a task touches more than three implementation files, write or update a spec
  first and update `ROADMAP_AI.md` after completion.

## Completion Rules

- Run the narrowest useful validation command first.
- Update `ROADMAP_AI.md` for meaningful feature, contract, or architecture
  changes.
- Follow `.ai/skills/update-ai-memory.md` before finishing.
