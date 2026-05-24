# Turbo Monorepo

A full-stack TypeScript monorepo with Next.js, Expo, and Hono RPC.

## Tech Stack

| Category         | Technology          | Version      |
| ---------------- | ------------------- | ------------ |
| Runtime          | Node.js             | ^22.14.0     |
| Package Manager  | pnpm                | ^10.19.0     |
| Monorepo Tool    | Turborepo           | ^2.5.8       |
| Language         | TypeScript          | ^5.9.3       |
| Web Framework    | Next.js             | 16.0.10      |
| Mobile Framework | Expo SDK            | ~55.0.4      |
| React            | React               | 19.2.0       |
| React Native     | React Native        | ~0.83.2      |
| Styling          | Tailwind CSS        | ^4.1.16      |
| Mobile Styling   | Uniwind             | ~1.0.0       |
| API Framework    | Hono                | ^4.10.7      |
| API Validation   | @hono/zod-validator | ^0.7.5       |
| Database ORM     | Drizzle ORM         | ^0.44.7      |
| Database Driver  | @vercel/postgres    | ^0.10.0      |
| Auth             | Better Auth         | 1.4.0-beta.9 |
| Validation       | Zod                 | ^4.1.12      |
| Query Client     | TanStack Query      | ^5.90.8      |
| UI Components    | shadcn/ui           | latest       |
| Testing          | Vitest              | 4.0.15       |

## Codebase Structure

```text
.github/
  └─ workflows/
        └─ CI with pnpm cache setup
.vscode/
  └─ Recommended extensions and settings for VSCode users
apps/
  ├─ mobile/                          # Expo mobile app
  │   ├─ Expo SDK 55 (~55.0.4)
  │   ├─ React Native 0.83.2 with React 19.2.0
  │   ├─ Navigation using Expo Router
  │   ├─ Tailwind CSS using Uniwind
  │   └─ Type-safe API calls using Hono RPC client
  └─ web/                             # Next.js web app
      ├─ Next.js 16.0.10
      ├─ React 19.2.0
      ├─ Tailwind CSS v4.1.16
      └─ Hono RPC API server & type-safe client
packages/
  ├─ api/                             # @turbo/api
  │   └─ Hono RPC routes with @hono/zod-validator
  ├─ auth/                            # @turbo/auth
  │   └─ Authentication using Better Auth
  ├─ db/                              # @turbo/db
  │   └─ Type-safe database using Drizzle ORM & Supabase
  ├─ ui/                              # @turbo/ui
  │   └─ Shared UI components using shadcn/ui
  └─ validators/                      # @turbo/validators
      └─ Shared Zod validation schemas
tooling/
  ├─ eslint/                          # @turbo/eslint-config
  │   └─ Shared ESLint presets
  ├─ prettier/                        # @turbo/prettier-config
  │   └─ Shared Prettier configuration
  ├─ tailwind/                        # @turbo/tailwind-config
  │   └─ Shared Tailwind theme and configuration
  ├─ typescript/                      # @turbo/tsconfig
  │   └─ Shared TypeScript configurations
  └─ vitest/                          # @turbo/vitest-config
      └─ Shared Vitest test configuration
```

## Quick Start

### 1. Setup Dependencies

```bash
# Install dependencies
pnpm i

# Configure environment variables
cp .env.example .env
```

### 2. Database Setup (Drizzle ORM)

The database schema is defined in `packages/db/src/schema.ts`, and durable SQL migrations are generated into `packages/db/drizzle/`.

Use this workflow when you add tables or change columns:

```bash
# 1. Generate a reviewed SQL migration from schema changes
pnpm db:generate -- --name add_projects_table

# 2. Apply pending migrations to your database
pnpm db:migrate

# 3. Inspect data locally
pnpm db:studio
```

> [!TIP]
> Use `pnpm db:generate` and `pnpm db:migrate` for all shared, staging, and production schema changes. `pnpm db:push:local` is only for disposable local databases.

Migration safety rules:

- Treat generated SQL as a reviewed artifact and commit it with the schema change.
- Prefer additive changes first: add nullable columns or columns with defaults, backfill, then enforce constraints in a later migration.
- Avoid rename-in-place for important tables or columns. Prefer add, backfill, switch reads/writes, then drop later.
- Run `pnpm db:migrate` in deployment instead of pushing schema state directly.

### 3. Generate Better Auth Schema

Better Auth requires a schema file to be generated from its configuration. This creates the authentication tables schema:

```bash
# Generate the Better Auth schema
pnpm auth:generate
```

This generates `packages/db/src/auth-schema.ts` from the config at `packages/auth/script/auth-cli.ts`.

After generating, create and apply a real migration for the new auth tables:

```bash
pnpm db:generate -- --name auth_schema_update
pnpm db:migrate
```

### 4. Start Development

```bash
# Start all apps
pnpm dev

# Start web only
pnpm dev:web

# Start mobile only
pnpm dev:mobile
```

## Mobile App Setup (Expo)

### Initialize Expo Project & Get EAS Project ID

To use EAS Build and EAS Update, you need to initialize your project with Expo:

```bash
# Install EAS CLI globally (if not installed)
pnpm add -g eas-cli

# Login to your Expo account
eas login

# Navigate to mobile app
cd apps/mobile

# Initialize EAS for your project (this creates/links to an EAS project)
eas init

# Or configure builds (this also creates an EAS project if needed)
eas build:configure
```

After running `eas init` or `eas build:configure`, you'll receive an **EAS Project ID**. Update these files with your project ID:

1. **`apps/mobile/app.config.ts`** - Update the `extra.eas.projectId` and `updates.url`:

   ```typescript
   updates: {
     url: "https://u.expo.dev/YOUR_PROJECT_ID",
   },
   extra: {
     eas: {
       projectId: "YOUR_PROJECT_ID",
     },
   },
   ```

2. **`apps/mobile/eas.json`** - Already configured with build profiles

### Running on Simulators/Emulators

**iOS Simulator:**

```bash
cd apps/mobile
pnpm dev:ios
# or
expo start --ios
```

**Android Emulator:**

```bash
cd apps/mobile
pnpm dev:android
# or
expo start --android
```

### Building the App

The mobile app includes pre-configured build scripts for all environments:

| Script                         | Description                                 |
| ------------------------------ | ------------------------------------------- |
| `pnpm build:dev:android`       | Development build for Android (cloud)       |
| `pnpm build:dev:ios`           | Development build for iOS (cloud)           |
| `pnpm build:dev:android:local` | Development build for Android (local)       |
| `pnpm build:dev:ios:local`     | Development build for iOS (local)           |
| `pnpm build:dev:simulator`     | Development build for iOS Simulator (local) |
| `pnpm build:preview:android`   | Preview build for Android (cloud)           |
| `pnpm build:preview:ios`       | Preview build for iOS (cloud)               |
| `pnpm build:prod:android`      | Production build for Android (cloud)        |
| `pnpm build:prod:ios`          | Production build for iOS (cloud)            |

**Local builds** run on your machine and require:

- **Android**: Android Studio, JDK 17+, Android SDK
- **iOS**: Xcode, CocoaPods, Apple Developer account (for device builds)

## Development Commands

| Command              | Description                        |
| -------------------- | ---------------------------------- |
| `pnpm dev`           | Start all apps in development mode |
| `pnpm dev:web`       | Start web app only                 |
| `pnpm dev:mobile`    | Start mobile app only              |
| `pnpm build`         | Build all packages and apps        |
| `pnpm typecheck`     | Run TypeScript type checking       |
| `pnpm lint`          | Run ESLint                         |
| `pnpm lint:fix`      | Run ESLint with auto-fix           |
| `pnpm format`        | Check Prettier formatting          |
| `pnpm format:fix`    | Fix Prettier formatting            |
| `pnpm test`          | Run tests                          |
| `pnpm db:push`       | Push Drizzle schema to database    |
| `pnpm db:studio`     | Open Drizzle Studio                |
| `pnpm auth:generate` | Generate Better Auth schema        |
| `pnpm ui-add`        | Add shadcn/ui components           |
| `pnpm verify`        | Run typecheck, lint, and format    |

## Adding Components and Packages

### Add shadcn/ui Components

```bash
pnpm ui-add
```

### Add New Package

```bash
pnpm turbo gen init
```

This generates a new package with `package.json`, `tsconfig.json`, and configured tooling.

## Configuring Better Auth with Expo

### Option 1: Deploy Auth Proxy (Recommended)

Better Auth includes an [auth proxy plugin](https://www.better-auth.com/docs/plugins/oauth-proxy). Deploy the Next.js app to get a stable OAuth callback URL.

### Option 2: Local IP Configuration

Add your local IP (e.g., `192.168.x.y:PORT`) to your OAuth provider's allowed callback URLs.

## Deployment

### Web (Next.js) → Vercel

1. Create a new project on Vercel
2. Select `apps/web` as the root directory
3. Add `POSTGRES_URL` environment variable
4. Deploy

### Production Database Migrations

Production migrations are handled by the GitHub Actions workflow at `.github/workflows/db-migrate-production.yml`.

- The workflow runs automatically on pushes to `main` when a committed migration under `packages/db/drizzle/` changes.
- The workflow can also be run manually from the Actions tab.
- The job uses the protected GitHub Environment named `production` and runs `pnpm db:migrate` against the production database.

If GitHub Actions is running your production migrations, store the production database URL as a GitHub Environment secret named `PRODUCTION_POSTGRES_URL`.

- GitHub repository secrets work, but a GitHub Environment secret is safer because it lets you add production approvals and branch restrictions.
- You do not need that GitHub secret if another platform runs the migration for you and already provides `POSTGRES_URL` there.

Recommended setup:

1. Create a GitHub Environment named `production`.
2. Add `PRODUCTION_POSTGRES_URL` as an Environment secret on that environment.
3. Optionally add required reviewers so production migrations need approval.
4. Keep app deploys backward-compatible with the migration sequence.

### Auth Proxy

The auth proxy is a Better Auth plugin for OAuth in preview deployments. Deploy the Next.js app to Vercel to enable it.

### Mobile (Expo) → App Stores

1. Update `getBaseUrl` in `apps/mobile/src/utils/api.tsx` to point to production URL

2. Build for production:

   ```bash
   cd apps/mobile
   pnpm build:prod:ios
   pnpm build:prod:android
   ```

3. Submit to app stores:

   ```bash
   eas submit --platform ios --latest
   eas submit --platform android --latest
   ```

4. Publish OTA updates:
   ```bash
   eas update --auto
   ```
