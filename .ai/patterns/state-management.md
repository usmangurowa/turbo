# Pattern: State Management

## Overview
State is split by concern:

| Type | Tool | Usage |
|------|------|-------|
| Server state | TanStack Query | API data, caching, synchronization |
| Client state | Zustand | UI state, preferences, ephemeral data |
| Form state | react-hook-form | Form inputs, validation, submission |
| URL state | Next.js/Expo Router | Route params, search params |

## Server State (TanStack Query)
- Use `useQuery` for reads, `useMutation` for writes.
- Query keys follow the pattern: `[resource, ...params]`.
- Invalidate related queries after mutations.
- See: `.agents/skills/tanstack-query/` for detailed patterns.

## Client State (Zustand)
- Create stores in dedicated files.
- Keep stores small and focused on a single concern.
- Used in `apps/web/` — see `apps/web/` for store examples.

## Form State (react-hook-form)
- Use `useForm` with `@hookform/resolvers` for Zod validation.
- Integrate with `@turbo/ui` form components.
- See: `packages/ui/src/components/form.tsx`

## Anti-patterns
- Do not use React Context for server state — use TanStack Query.
- Do not use `useState` for data that should be in a store.
- Do not create global state for data that is URL-derivable.
- Do not mix server and client state in the same store.
