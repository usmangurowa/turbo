# Pattern: Data Fetching

## Overview

This repo uses a **type-safe data fetching pipeline**: Hono API → typed RPC client → TanStack Query.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Web / Mobile   │────▶│  Hono RPC Client  │────▶│  Hono API       │
│  (TanStack Query)│    │  (hcWithType)     │     │  (packages/api) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

## Web (Next.js) — Server Components

- Use server components by default for data that doesn't need client interactivity.
- For client-side data, use TanStack Query with the Hono RPC client.

## Web (Next.js) — Client Components

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";

export function UserList() {
  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await client.users.$get();
      if (!res.ok) throw new Error("Failed to fetch users");
      return res.json();
    },
  });
  // ...
}
```

## Mobile (Expo)

- Use TanStack Query with the Hono RPC client.
- Offline persistence can be added with `react-native-mmkv` when mobile caching is implemented.

## API Layer (Hono)

- All business logic lives in `packages/api/src/router/`.
- Type-safe client is auto-generated from Hono routes via `hcWithType`.
- See: `packages/api/src/index.ts`

## Key files

- `packages/api/src/index.ts` — API app creation and typed client export
- `packages/api/src/router/*.ts` — individual route handlers
- `packages/api/src/context.ts` — shared context types

## Anti-patterns

- Do not fetch data directly from the database in app code — go through the API layer.
- Do not use `fetch()` directly — use the typed Hono RPC client.
- Do not put data fetching in `useEffect` — use TanStack Query.
