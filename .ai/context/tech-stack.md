# Tech Stack

> Auto-generated from repository analysis. Update when dependencies change.

## Monorepo Tooling

| Tool      | Version                                | Purpose                                     |
| --------- | -------------------------------------- | ------------------------------------------- |
| Turborepo | ^2.5.8                                 | Task orchestration, caching, build pipeline |
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

| Layer            | Technology  | Version                                  |
| ---------------- | ----------- | ---------------------------------------- |
| Language         | TypeScript  | catalog (workspace-managed)              |
| Web framework    | Next.js     | 16.0.10                                  |
| Mobile framework | Expo SDK    | 55 (React Native 0.83)                   |
| React            | React       | catalog:react19                          |
| API framework    | Hono        | 4.10.7                                   |
| ORM              | Drizzle ORM | drizzle-orm ^0.44.7; drizzle-kit ^0.31.5 |
| Database         | PostgreSQL  | via Supabase                             |
| Auth             | Better Auth | 1.4.0-beta.9                             |
| Validation       | Zod         | catalog (workspace-managed)              |

## UI & Styling

| Tool               | Details                                     |
| ------------------ | ------------------------------------------- |
| Component library  | shadcn/ui (Radix primitives + CVA variants) |
| CSS framework      | Tailwind CSS 4.1.16                         |
| Mobile styling     | Uniwind 1.0 (Tailwind for RN)               |
| Icons              | HugeIcons (React + React Native)            |
| Animation (web)    | Motion (Framer Motion) 12.x                 |
| Animation (mobile) | react-native-reanimated                     |

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
| Vitest            | Unit/integration testing                         |
| ESLint 9          | Linting (flat config)                            |
| Prettier 3.5      | Code formatting with import sort + tailwind sort |
| TypeScript strict | Type checking across all packages                |

## CI/CD

**GitHub Actions** (`.github/workflows/ci.yml`):

- `lint` → `pnpm lint && pnpm lint:ws`
- `format` → `pnpm format`
- `typecheck` → `pnpm typecheck`
- `test` → `pnpm test`

Turbo remote caching via Vercel.
