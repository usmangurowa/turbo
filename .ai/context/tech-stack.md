# Tech Stack

> Auto-generated from repository analysis. Update when dependencies change.

## Monorepo Tooling

| Tool      | Version                                | Purpose                                     |
| --------- | -------------------------------------- | ------------------------------------------- |
| Turborepo | ^2.9.16                                | Task orchestration, caching, build pipeline |
| pnpm      | ^10.19.0                               | Package manager with workspace support      |
| Node.js   | 22.21.0 (`.nvmrc`), engines `^22.14.0` | Runtime                                     |

### Workspace layout

```text
apps/
  web/          → Next.js web application
  mobile/       → Expo React Native mobile app
packages/
  ai/           → AI SDK integration (Vercel AI SDK)
  analytics/    → PostHog analytics (web + server)
  api/          → Hono API server with typed routes
  assets/       → Font files
  auth/         → Better Auth configuration
  db/           → Drizzle ORM + Postgres schemas
  jobs/         → Trigger.dev background tasks
  mail/         → Email templates (Resend)
  shared/       → Shared utilities and constants
  supabase/     → Supabase client setup
  ui/           → shadcn/ui component library (50+ components)
  validators/   → Zod validation schemas
tooling/
  eslint/       → Shared ESLint configs (@turbo/eslint-config)
  github/       → GitHub Actions setup composite action
  prettier/     → Shared Prettier config with import sorting
  tailwind/     → Shared Tailwind CSS theme + PostCSS config
  typescript/   → Shared tsconfig bases (@turbo/tsconfig)
  vitest/       → Shared Vitest config (@turbo/vitest-config)
```

## Languages & Frameworks

| Layer            | Technology  | Version                                   |
| ---------------- | ----------- | ----------------------------------------- |
| Language         | TypeScript  | catalog (`^6.0.3`)                        |
| Web framework    | Next.js     | 16.2.7                                    |
| Mobile framework | Expo SDK    | 56 (`react-native` ~0.85.3)               |
| React            | React       | 19.2.3 via `catalog:react19`              |
| API framework    | Hono        | ^4.12.23                                  |
| ORM              | Drizzle ORM | drizzle-orm ^0.45.2; drizzle-kit ^0.31.10 |
| Database         | PostgreSQL  | via Supabase                              |
| Database driver  | postgres.js | ^3.4.9 (`prepare: false` for pooled URLs) |
| Auth             | Better Auth | 1.6.14                                    |
| Validation       | Zod         | catalog (`4.4.3`)                         |

## UI & Styling

| Tool               | Details                                        |
| ------------------ | ---------------------------------------------- |
| Component library  | shadcn/ui (Radix primitives + CVA variants)    |
| CSS framework      | Tailwind CSS 4.3.0                             |
| Mobile styling     | Uniwind 1.0 (Tailwind for RN)                  |
| Icons              | HugeIcons (React + React Native)               |
| Animation (web)    | Motion (Framer Motion) 12.x                    |
| Animation (mobile) | react-native-reanimated 4.3.1 + worklets 0.8.3 |

## State & Data

| Concern      | Tool                                  |
| ------------ | ------------------------------------- |
| Server state | TanStack Query 5.x                    |
| Client state | Zustand 5.x                           |
| Forms        | react-hook-form + @hookform/resolvers |
| Tables       | @tanstack/react-table                 |

## Infrastructure & Services

| Service         | Tool                                          |
| --------------- | --------------------------------------------- |
| Hosting         | Vercel (web), EAS (mobile)                    |
| Database        | Supabase (Postgres)                           |
| Email           | Resend                                        |
| Background jobs | Trigger.dev                                   |
| Analytics       | PostHog                                       |
| Error tracking  | Sentry (@sentry/nextjs, @sentry/react-native) |
| AI providers    | Gemini, OpenRouter, Groq (via Vercel AI SDK)  |

## Testing & Quality

| Tool              | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| Vitest            | Unit/integration testing (4.1.x)                 |
| ESLint 9          | Linting (flat config)                            |
| Prettier 3.8      | Code formatting with import sort + tailwind sort |
| TypeScript strict | Type checking across all packages                |

## CI/CD

**GitHub Actions** (`.github/workflows/ci.yml`):

- `lint` → `pnpm lint && pnpm lint:ws`
- `format` → `pnpm format`
- `typecheck` → `pnpm typecheck`
- `test` → `pnpm test`

Turbo remote caching via Vercel.
