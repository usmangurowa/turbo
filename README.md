# Turbo Monorepo

A full-stack TypeScript monorepo with Next.js, Expo, and Hono RPC.

## Tech Stack

| Category         | Technology          | Version  |
| ---------------- | ------------------- | -------- |
| Runtime          | Node.js             | ^22.14.0 |
| Package Manager  | pnpm                | ^10.19.0 |
| Monorepo Tool    | Turborepo           | ^2.9.16  |
| Language         | TypeScript          | ^6.0.3   |
| Web Framework    | Next.js             | 16.2.7   |
| Mobile Framework | Expo SDK            | ~56.0.8  |
| React            | React               | 19.2.3   |
| React Native     | React Native        | ~0.85.3  |
| Styling          | Tailwind CSS        | ^4.3.0   |
| Mobile Styling   | Uniwind             | ~1.8.0   |
| API Framework    | Hono                | ^4.12.23 |
| API Validation   | @hono/zod-validator | ^0.8.0   |
| Database ORM     | Drizzle ORM         | ^0.45.2  |
| Database Driver  | postgres.js         | ^3.4.9   |
| Auth             | Better Auth         | 1.6.14   |
| Validation       | Zod                 | 4.4.3    |
| Query Client     | TanStack Query      | ^5.101.0 |
| UI Components    | shadcn/ui           | latest   |
| Testing          | Vitest              | 4.1.8    |

## Codebase Structure

```text
.github/
  └─ workflows/
        └─ CI with pnpm cache setup
.vscode/
  └─ Recommended extensions and settings for VSCode users
apps/
  ├─ mobile/                          # Expo mobile app
  │   ├─ Expo SDK 55 (~55.0.15)
  │   ├─ React Native 0.83.4 with React 19.2.0
  │   ├─ Navigation using Expo Router
  │   ├─ Tailwind CSS using Uniwind
  │   └─ Type-safe API calls using Hono RPC client
  └─ web/                             # Next.js web app
      ├─ Next.js 16.2.4
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

**Which variables, and which are required?** `.env.example` lists every variable with a comment; the generated [`.ai/contracts/env.generated.md`](.ai/contracts/env.generated.md) classifies each one from the zod schemas — required or optional, which process reads it (`web`, `server`, `worker`, `mobile`), and whether it ends up in a client bundle. Today only `POSTGRES_URL` and `AUTH_SECRET` are required; everything else switches a feature on. `pnpm ai:env:strict` fails when `.env.example`, `turbo.json`, and the env modules disagree, so the table is always current.

**Optional — Infisical secrets manager.** Instead of maintaining a local `.env`, you can inject secrets at runtime from [Infisical](https://infisical.com). This repository is linked to the `turbo` project through the committed `.infisical.json` (project id only, no secrets) with `dev`, `staging`, and `prod` environments. The CLI ships as a dev dependency; authenticate once, then use the `:infisical` script variants:

```bash
# One-time: authenticate (the repo is already linked via .infisical.json)
pnpm exec infisical login

# Run dev with secrets injected (auto-reloads when secrets change)
pnpm dev:infisical

# Wrap any other command
pnpm with-secrets pnpm db:migrate
```

Both sources compose: variables injected by Infisical take precedence, and anything missing still falls back to `.env` via each app's `with-env` script. Populate an environment with the variables from the contract table above — the required ones for the runtimes it serves, plus the optional features you want on. Forks that want their own project run `pnpm exec infisical init` and commit the rewritten `.infisical.json`.

`pnpm with-secrets` and `pnpm dev:infisical` run through `scripts/infisical-run.sh`, the same wrapper the Docker images boot with. It picks credentials in this order: `INFISICAL_CLIENT_ID` + `INFISICAL_CLIENT_SECRET` ([machine identity](https://infisical.com/docs/documentation/platform/identities/machine-identities), what production uses), a pre-issued `INFISICAL_TOKEN`, then your local `infisical login` session; in CI or with nothing configured it runs the command on the existing env vars and says so. The project comes from `INFISICAL_PROJECT_ID` or `.infisical.json`, the environment slug from `INFISICAL_ENV` (default `dev`).

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
# Start web + server (mobile is interactive and runs in its own terminal)
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

| Command              | Description                          |
| -------------------- | ------------------------------------ |
| `pnpm dev`           | Start web + server in watch mode     |
| `pnpm dev:web`       | Start web app only                   |
| `pnpm dev:mobile`    | Start mobile app only (own terminal) |
| `pnpm run ci`        | Run every CI check locally, in order |
| `pnpm build`         | Build all packages and apps          |
| `pnpm typecheck`     | Run TypeScript type checking         |
| `pnpm lint`          | Run ESLint                           |
| `pnpm lint:fix`      | Run ESLint with auto-fix             |
| `pnpm format`        | Check Prettier formatting            |
| `pnpm format:fix`    | Fix Prettier formatting              |
| `pnpm test`          | Run tests                            |
| `pnpm db:push`       | Push Drizzle schema to database      |
| `pnpm db:studio`     | Open Drizzle Studio                  |
| `pnpm auth:generate` | Generate Better Auth schema          |
| `pnpm ui-add`        | Add shadcn/ui components             |
| `pnpm verify`        | Run typecheck, lint, and format      |

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

Production migrations are owned by the standalone server's start command (migrate-on-boot). The root script chains them:

```bash
pnpm start:server
# runs: TURBO_DB_SKIP_DOTENV=1 pnpm db:migrate && pnpm -F @turbo/server start:prod
```

How it works on each deploy:

1. The platform (e.g., Coolify) builds and starts a new container with `pnpm start:server`.
2. `pnpm db:migrate` applies only migrations the database hasn't seen (tracked in the Drizzle journal).
3. If migrations succeed, the server boots and the health check passes.
4. If migrations fail, the server never starts, the health check fails, and the previous version keeps serving.

On a brand-new (empty) database, the journal's first entry (`0000_baseline_auth_schema`) creates the Better Auth tables, so a fork's first deploy needs no manual `db:push`. Existing databases skip it because it is dated before their first applied migration, so nothing changes for them.

Requirements:

- Set `POSTGRES_URL` in the deployment environment. `TURBO_DB_SKIP_DOTENV=1` is baked into the script so migrate reads the injected environment instead of a local `.env` file.
- Keep exactly one migration owner: only the server's start command runs `db:migrate`. Other apps (web, mobile) never migrate.
- Keep migrations backward-compatible (expand/contract): add columns and tables first, drop or rename in a later release, since old code briefly runs against the new schema during the deploy window.

### Docker (Coolify / any container host)

`apps/web/Dockerfile` and `apps/server/Dockerfile` build slim multi-stage images (Next.js standalone for web, `pnpm deploy --prod` output for the server). Docker is an additional path: Vercel ignores Dockerfiles and the `output: "standalone"` switch (it is gated on `DOCKER_BUILD=1`, which only the web Dockerfile sets), and `pnpm start:server` keeps working on a plain VPS. Both targets coexist.

Build from the repo root — the context must be the monorepo, not the app folder:

```bash
docker build -f apps/web/Dockerfile -t turbo-web .
docker build -f apps/server/Dockerfile -t turbo-server .

docker run --rm -p 3000:3000 -e POSTGRES_URL=... -e AUTH_SECRET=... turbo-web
docker run --rm -p 3001:3001 -e POSTGRES_URL=... -e AUTH_SECRET=... -e RESEND_API_KEY=... turbo-server
```

What the images do:

- **web** serves `node apps/web/server.js` on port 3000. `NEXT_PUBLIC_*` values are inlined at build time, so pass them as `--build-arg` (every key in `apps/web/src/env.ts` has an `ARG`). `SENTRY_AUTH_TOKEN` is an optional BuildKit secret (`--secret id=SENTRY_AUTH_TOKEN,env=SENTRY_AUTH_TOKEN`); the build succeeds without it.
- **server** runs the same chain as `pnpm start:server` — `drizzle-kit migrate` then `tsx src/index.ts` — on port 3001 with `GET /health`. Set `SERVER_PROCESS=worker` and the same image runs the pg-boss jobs worker (`pnpm start:worker`) instead: no migrations, no port. Deploy it as a separate application once `JOBS_POSTGRES_URL` is set; without that variable the API sends emails in-process and no worker is needed.
- Both images boot through `scripts/infisical-run.sh` with the Infisical CLI on `PATH`. Set `INFISICAL_CLIENT_ID`, `INFISICAL_CLIENT_SECRET`, `INFISICAL_PROJECT_ID` (or commit `.infisical.json`), and `INFISICAL_ENV` (e.g. `prod`) on the platform and the container pulls every other secret from Infisical at start. Leave them unset and the container runs on platform-injected env vars alone — there is no `.env` in the image either way.
- Neither image installs `apps/mobile`, dev toolchains, `.git`, or docs (see `.dockerignore`).

Coolify settings per app:

| Setting                            | Web                    | Server                    |
| ---------------------------------- | ---------------------- | ------------------------- |
| Build pack                         | `dockerfile`           | `dockerfile`              |
| Base directory                     | `/`                    | `/`                       |
| Dockerfile location                | `/apps/web/Dockerfile` | `/apps/server/Dockerfile` |
| Port                               | `3000`                 | `3001`                    |
| Health check                       | `GET /`                | `GET /health`             |
| Custom install/build/start command | clear all three        | clear all three           |
| `NEXT_PUBLIC_*` variables          | mark as **build time** | —                         |
| Watch paths                        | `apps/web/**` + shared | `apps/server/**` + shared |

Shared watch paths for both apps: `packages/**`, `tooling/**`, `scripts/**`, `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `turbo.json`, `.dockerignore`, `.nvmrc`, `.infisical.json` — everything the Dockerfiles copy after `.dockerignore` has filtered the context. Leave watch paths empty and every push rebuilds both images, docs included.

Auto-deploy needs a webhook. Coolify rebuilds on push only when GitHub tells it about the push: a **GitHub App** source sets that up for you, a **Public Repository** source does not, and pushes to `main` then sit undeployed until someone clicks Deploy. If you keep a public source, add a repository webhook per app — payload URL `https://<coolify-host>/webhooks/source/github/events/manual`, content type `application/json`, `push` events, secret = that app's GitHub webhook secret from its Webhooks tab. Each app has its own secret, so one webhook per app; keep the secrets out of the repo.

With Infisical, the only runtime variables Coolify needs are the four `INFISICAL_*` credentials above (plus anything you deliberately keep out of Infisical). Without it, `POSTGRES_URL`, `AUTH_SECRET`, `RESEND_API_KEY`, … are normal Coolify environment variables. Layout and invariants: `.ai/patterns/docker-images.md`.

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
