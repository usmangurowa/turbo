# Tech Stack

> Auto-generated from repository analysis. Update when dependencies change.

## Monorepo Tooling

| Tool      | Version                                | Purpose                                     |
| --------- | -------------------------------------- | ------------------------------------------- |
| Turborepo | ^2.10.5                                | Task orchestration, caching, build pipeline |
| pnpm      | ^10.19.0                               | Package manager with workspace support      |
| Node.js   | 22.21.0 (`.nvmrc`), engines `^22.14.0` | Runtime                                     |

### Workspace layout

```text
apps/
  web/          → Next.js web application
  server/       → Standalone Node/Hono API runtime
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
| Web framework    | Next.js     | 16.2.11                                   |
| Mobile framework | Expo SDK    | 57 (`react-native` ~0.86.0)               |
| React            | React       | 19.2.8 via `catalog:react19`              |
| API framework    | Hono        | ^4.12.31 (`@hono/node-server` ^2.0.11)    |
| ORM              | Drizzle ORM | drizzle-orm ^0.45.2; drizzle-kit ^0.31.10 |
| Database         | PostgreSQL  | via Supabase                              |
| Database driver  | postgres.js | ^3.4.9 (`prepare: false` for pooled URLs) |
| Auth             | Better Auth | 1.6.23                                    |
| Validation       | Zod         | catalog (`4.4.3`)                         |

## UI & Styling

| Tool               | Details                                                                  |
| ------------------ | ------------------------------------------------------------------------ |
| Component library  | shadcn/ui `radix-maia` style (Radix + CVA), CLI-managed in `packages/ui` |
| Variant shorthands | `shadcn` npm pkg (web devDep) — `shadcn/tailwind.css` custom variants    |
| CSS framework      | Tailwind CSS 4.3.3                                                       |
| Shared theme       | `tooling/tailwind/theme.css` (web + mobile single source)                |
| Fonts              | Inter Display, vendored in `packages/assets/fonts`                       |
| Theming (web)      | next-themes (class strategy, system default)                             |
| Mobile styling     | Uniwind 1.10.x (Tailwind for RN)                                         |
| Icons              | HugeIcons (React + React Native)                                         |
| Animation (web)    | Motion (Framer Motion) 12.x                                              |
| Animation (mobile) | react-native-reanimated 4.5.x + worklets 0.10.x                          |
| Toasts (web)       | sonner (via `@turbo/ui/components/sonner`)                               |

## State & Data

| Concern      | Tool                                  |
| ------------ | ------------------------------------- |
| Server state | TanStack Query 5.x                    |
| Forms        | react-hook-form + @hookform/resolvers |
| Tables       | @tanstack/react-table                 |

## Infrastructure & Services

| Service         | Tool                                          |
| --------------- | --------------------------------------------- |
| Hosting         | Vercel (web), EAS (mobile)                    |
| API runtime     | Standalone Node/Hono app (`apps/server`)      |
| Database        | Supabase (Postgres)                           |
| Email           | Resend                                        |
| Background jobs | Trigger.dev                                   |
| Analytics       | PostHog                                       |
| Error tracking  | Sentry (@sentry/nextjs, @sentry/react-native) |
| AI providers    | Gemini, OpenRouter, Groq (Vercel AI SDK v7)   |

## Testing & Quality

| Tool              | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| Vitest            | Unit/integration testing (4.1.x)                 |
| ESLint 10         | Linting (flat config)                            |
| Prettier 3.9      | Code formatting with import sort + tailwind sort |
| TypeScript strict | Type checking across all packages                |

## CI/CD

**GitHub Actions** (`.github/workflows/ci.yml`):

- `lint` → `pnpm lint && pnpm lint:ws`
- `format` → `pnpm format`
- `typecheck` → `pnpm typecheck`
- `test` → `pnpm test`

Turbo remote caching via Vercel.

## AI Tooling (MCP)

| Surface     | Config                                                   |
| ----------- | -------------------------------------------------------- |
| Claude Code | `.mcp.json` (repo root)                                  |
| Cursor      | `.cursor/mcp.json`                                       |
| VS Code     | `.vscode/mcp.json`                                       |
| Server      | Expo MCP — Streamable HTTP at `https://mcp.expo.dev/mcp` |

Auth is OAuth (browser sign-in with an Expo account) — no tokens in the repo.

Local capabilities (simulator screenshots, tap-by-testID, expo-router sitemap,
DevTools) come from the `expo-mcp` dev dependency in `apps/mobile`. Start the
dev server with them enabled via `pnpm --filter @turbo/mobile dev:mcp`
(`EXPO_UNSTABLE_MCP_SERVER=1`). Reconnect the MCP client after starting or
stopping the dev server so it refreshes capabilities.
