# Conventions

> Derived from actual patterns observed in this repository. Update when conventions change.

## Documentation Rules

- Document only observed repository facts or explicitly approved decisions.
- Do not record guesses, assumptions, or vendor-default behavior as repository conventions.
- When a convention is uncertain, verify from code/config first or mark it as a proposal instead of a fact.

## File & Folder Naming

- **Packages**: `kebab-case` directory names under `packages/` (e.g., `packages/auth`)
- **Components**: `kebab-case.tsx` files (e.g., `button.tsx`, `date-picker.tsx`)
- **Routes (web)**: Next.js App Router — `apps/web/src/app/` with `page.tsx`, `layout.tsx`
- **Routes (mobile)**: Expo Router — `src/app/` directory with file-based routing
- **Config files**: `kebab-case` (e.g., `eslint.config.ts`, `vitest.config.ts`)
- **Test files**: `__tests__/<name>.test.ts` (co-located in `src/`)
- **Schema files**: `<domain>-schema.ts` in `packages/db/src/` (e.g., `auth-schema.ts`)

## Exports

- **Named exports** preferred over default exports (components, utilities)
- **Barrel files**: `index.ts` re-exports from each package root
- **Package entry points**: Defined in `package.json` `exports` field with subpath exports (e.g., `@turbo/auth/client`, `@turbo/db/schema`)
- **Internal packages**: All packages use `"type": "module"`; most packages also define `build: tsc` and emit declaration artifacts in `dist/`

## Component Patterns (shadcn/ui)

- Use `cva` (class-variance-authority) for variant-based styling
- Use `cn()` utility (`cx` from class-variance-authority + `twMerge`) for class merging
- Use `data-slot` attributes for component identification
- Props extend `React.ComponentProps<"element">` with `VariantProps`
- Compound components pattern: `Card`, `CardHeader`, `CardContent`, `CardFooter`
- Export individual named components (not default)

Example: `packages/ui/src/components/button.tsx`

## Form Patterns

- **ALWAYS** use `react-hook-form` with `@hookform/resolvers/zod` for forms.
- **NEVER** use `useState` for managing form state or individual form fields.
- **ALWAYS** use `shadcn/ui` form components (`Form`, `FormField`, `FormControl`, `FormItem`, `FormMessage`).
- **NEVER** use raw HTML `<input>`, `<select>`, etc., when a `shadcn/ui` component exists.

## API Patterns (Hono)

- Routers are separate files under `packages/api/src/router/`
- Each router creates a `new Hono<AppContext>()`
- Auth middleware applied per-router with `.use("*", authMiddleware)`
- Context variables typed via `AppContext` interface
- Typed RPC client exported for frontend consumption (`hcWithType`)
- Security middleware stack: secure headers → CORS → rate limiting
- **Web API auth is cookie-based; never attach `Authorization` headers from session data.** Cookies ride along automatically on same-origin fetches. There is exactly one `hc<AppType>` construction in the web app — `apps/web/src/lib/api.ts`; `useApi()` returns that instance.
- **Mobile uses exactly one Better Auth client: `@/auth/client`.** `apps/mobile/src/utils/api.tsx` reads cookies from that client. Do not create additional `createAuthClient` instances anywhere in the mobile app.
- **API composition: `createApp(auth, db)` — apps own the real db/auth instances; `packages/api` never imports `@turbo/db/client` at runtime.** Middleware and routers receive `db` through `c.get("db")`; never import concrete clients directly inside `packages/api`.

Example: `packages/api/src/router/api-key.ts`

## Auth Patterns (Better Auth)

- Apps create auth via `createAppAuth()` from `@turbo/auth`; only base URLs and framework plugins are app-specific.
- `createAppAuth()` owns all shared wiring: env-derived secrets, the GitHub social provider conditional, and the OTP email bridge.
- Next.js apps pass `extraPlugins: [nextCookies()]`; the standalone server passes no extra plugins.
- Never call `initAuth()` directly from an app — it is the low-level primitive; app code always goes through `createAppAuth()`.
- New social providers or plugins are added once in `packages/auth/src/index.ts`.

## Database Patterns (Drizzle)

- Schemas in `packages/db/src/` as `*-schema.ts`
- Use `pgTable()` for table definitions
- Relations defined separately with `relations()`
- Indexes defined in table callback: `(table) => [index(...)]`
- Column naming: `snake_case` in DB, `camelCase` in TypeScript
- All tables include `createdAt` and `updatedAt` timestamps
- Foreign keys with `onDelete: "cascade"` for user-owned data

Example: `packages/db/src/auth-schema.ts`

## Commit Messages

- Conventional Commits format: `type(scope): description`
- Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`
- Scope is optional, typically the package name (e.g., `feat(ui): add avatar component`)

## Package Internal Naming

- Package names use `@turbo/` scope (e.g., `@turbo/ui`, `@turbo/db`)
- Tooling packages also use `@turbo/` scope (e.g., `@turbo/eslint-config`)

## Environment Variables

- `.env.example` as template — copy to `.env` for local development
- Public vars prefixed with `NEXT_PUBLIC_` (web) or `EXPO_PUBLIC_` (mobile)
- Validated with environment modules (e.g., `apps/web/src/env.ts`)
- Non-secret constants (PostHog host, Expo app identity/EAS project ID, provider API URLs) are hardcoded in the codebase (`apps/mobile/app.config.ts`, `eas.json`), not stored in `.env`
- The standalone server uses `SERVER_PORT` for local port configuration; generic `PORT` is reserved as a platform fallback and should not be set in `.env.example`.
- **Env skip logic: always `shouldSkipEnvValidation()` from `@turbo/shared/env` — never inline `npm_lifecycle_event`/`CI` checks.** New skip conditions belong in `packages/shared/src/env.ts` with a test.

## Operational Commands

- Run `pnpm auth:generate` after Better Auth schema/config changes that affect generated auth schema output.
- Run `pnpm db:generate -- --name <migration_name>` after Drizzle schema changes that need durable migrations.
- Run `pnpm db:migrate` to apply pending Drizzle migrations.
- Production migrations run via migrate-on-boot: `pnpm start:server` chains `db:migrate && start:prod`; the standalone server is the only migration owner.
- Use `pnpm db:push:local` only for disposable local databases.
- Use `pnpm db:studio` for local schema/data inspection during development.
- Prefer workspace/root scripts when available over ad-hoc package commands.

## Code Style

- **Prettier** for formatting (configured via `@turbo/prettier-config`)
- **ESLint 9** flat config with shared base configs
- **TypeScript strict mode** across all packages
- Import sorting via `@ianvs/prettier-plugin-sort-imports`
- Tailwind class sorting via `prettier-plugin-tailwindcss`

## Analytics Patterns

- Analytics sample rates and privacy options live in `@turbo/analytics` (`SENTRY_CONFIG`, `posthogWebOptions`). Apps call the framework-specific `init()` with these shared values.
- Never hardcode sample rates (e.g., `tracesSampleRate: 0.1`) in app files — import from `@turbo/analytics` instead.
- React Native `Sentry.init` consumes `SENTRY_CONFIG.tracesSampleRate` only (the web `replays*` fields are not supported by the React Native SDK).
- `posthogWebOptions` is for web (posthog-js) only; mobile wires PostHog via `PostHogProvider` directly.

## Mail Patterns

- `@turbo/mail` exports templates and senders only; import react-email primitives from `react-email` directly inside mail templates — never re-export vendor components from `packages/mail/src/index.ts`.
- Consumers call `sendOTPEmail`, `sendWelcomeEmail`, or `sendSupportEmail` from `@turbo/mail/client`; they do not import react-email primitives from `@turbo/mail`.
- New email types: add a template in `src/templates/`, a `send<Name>Email` wrapper in `src/client.tsx`, and a subject-mapping test following `sendOTPEmail`.
- Flag any new `export ... from "react-email"` added to `src/index.ts` in code review.
