---
trigger: always_on
---

# Turbo Monorepo Architecture

## Structure Overview
```
turbo/
├── apps/           # Deployable applications
│   ├── web/        # Next.js web app (@turbo/web)
│   ├── mobile/     # Expo React Native app (@turbo/mobile)
├── packages/       # Shared internal packages
│   ├── analytics/  # PostHog analytics wrapper (@turbo/analytics)
│   ├── api/        # Hono API routes (@turbo/api)
│   ├── auth/       # Better-Auth authentication (@turbo/auth)
│   ├── db/         # Drizzle ORM + schemas (@turbo/db)
│   ├── mail/       # Resend + React Email (@turbo/mail)
│   ├── shared/     # Shared constants (@turbo/shared)
│   ├── supabase/   # Supabase client wrapper (@turbo/supabase)
│   ├── ui/         # Shadcn/UI components (@turbo/ui)
│   └── validators/ # Zod schemas (@turbo/validators)
└── tooling/        # Shared dev configurations
    ├── eslint/     # @turbo/eslint-config
    ├── prettier/   # @turbo/prettier-config
    ├── tailwind/   # @turbo/tailwind-config (theme.css)
    ├── typescript/ # @turbo/tsconfig
    └── vitest/     # Vitest config
```

## Key Technologies
| Layer | Technology |
|-------|------------|
| Build | Turborepo, pnpm workspaces |
| Web | Next.js 16 (App Router) |
| Mobile | Expo 54, React Native |
| API | Hono |
| Auth | Better-Auth |
| Database | Drizzle ORM + Postgres (Supabase) |
| Email | Resend + React Email |
| Styling | Tailwind CSS v4 |
| UI | Shadcn/UI |
| Analytics | PostHog |

## Environment Variables
- Root `.env` file is shared across all apps/packages
- Use `dotenv -e ../../.env --` prefix for scripts needing env vars
- Key vars: `POSTGRES_URL`, `AUTH_SECRET`, `RESEND_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`
- PostHog: `NEXT_PUBLIC_POSTHOG_KEY`, `EXPO_PUBLIC_POSTHOG_KEY`, `POSTHOG_API_KEY`
