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
- Import shared UI as `@turbo/ui/components/<name>`; `cn` from
  `@turbo/ui/lib/utils`; hooks from `@turbo/ui/hooks/<name>` (no root
  `@turbo/ui` barrel import)
- Registry components are CLI-managed: add/update with `pnpm ui-add` in
  `packages/ui`, don't hand-edit beyond documented patches
- Documented registry patch — `Card variant="dashed"` (`card.tsx`): swaps
  the `ring-1` hairline for `border border-dashed`. Every dashed card frame
  — dashboard and landing page alike — goes through this variant (directly,
  or via `StatCard` / `TableCard` in `apps/web/src/components/dashboard/`);
  never hand-write `bg-card rounded-2xl border border-dashed` on a `div`.
  The two documented exceptions are standalone `Empty` states, which carry
  `rounded-2xl border border-dashed` themselves, and structural dividers
  (`border-t border-dashed`) — see `.ai/patterns/ui-composition.md`.
- Documented registry patch — `Badge` `success` / `warning` variants and a
  `size="xs" | "sm"` axis (`badge.tsx`): `bg-success/10 text-success`,
  `bg-warning/10 text-warning`; `xs` (20px) is the default display badge,
  `sm` (28px) is for pickers and toggles. Never tint a badge via `className`
  — add a variant instead.
- Documented registry patch — `ThemeToggle` (`theme.tsx`) is a one-click
  switch that flips the _resolved_ theme; no dropdown, no explicit "system"
  item (the system default still applies until the first click).
- Registry patches are guarded by
  `packages/ui/src/__tests__/registry-patches.test.ts` — after any CLI
  re-install, run `pnpm --filter @turbo/ui test` and re-apply failing patches.
- A popover or menu that offers a write must not auto-focus that write. Radix
  `PopoverContent` focuses its first focusable child on open; when that child
  commits something irreversible (delete, revoke, confirm), pass
  `ref={contentRef}` and
  `onOpenAutoFocus={(e) => { e.preventDefault(); contentRef.current?.focus(); }}`
  so focus lands on the panel, and add a test that the button is not
  `document.activeElement` after opening.
- AI chat components live in `packages/ui/src/components/ai-elements/`
  (Vercel AI Elements registry, `https://registry.ai-sdk.dev`); import as
  `@turbo/ui/components/ai-elements/<name>`. Patched for AI SDK v7 usage
  fields (`outputTokenDetails.reasoningTokens`,
  `inputTokenDetails.cacheReadTokens` in `context.tsx`) and strict tsconfig;
  `web-preview.tsx` default sandbox drops `allow-same-origin` (override via
  the `sandbox` prop for trusted content); `code-block.tsx` imports
  `shiki/bundle/web` instead of the full `shiki` bundle (CLI re-installs
  restore the full-bundle import — re-apply); `packages/ui/src/css-modules.d.ts`
  provides an ambient `*.css` declaration, so re-vendored components with CSS
  side-effect imports (e.g. `canvas.tsx`) need no suppression; re-apply patches
  after CLI reinstalls. Patches are guarded by
  `packages/ui/src/__tests__/ai-elements-patches.test.ts` — after any CLI
  re-install, run `pnpm --filter @turbo/ui test` and re-apply failing
  patches. Style-rule relaxations for this folder live in
  `packages/ui/eslint.config.ts`.
- Icons: `lucide-react` is an internal implementation detail of the vendored
  `ai-elements/` components only — it must not leak into the package's public
  API (exported `icon` props use `ComponentType<{ className?: string }>`,
  `CheckpointIconProps` is `ComponentProps<"svg">`) and apps must never import
  `lucide-react`. App code and new components use HugeIcons via
  `@turbo/ui/components/icon`.
- `packages/ui/src/components/message.tsx` (layout primitive, data-slot) and
  `ai-elements/message.tsx` (AI SDK chat message) are different components —
  both are kept
- `Button` has no `loading` prop — render
  `{pending && <Spinner data-icon="inline-start" />}` and set `disabled`
- Toasts: `import { toast } from "sonner"` with `<Toaster />` mounted from
  `@turbo/ui/components/sonner`
- UI work starts by reading `DESIGN.md` and
  `.ai/patterns/ui-composition.md`. The former mirrors runtime tokens; the latter
  is the normative slot, accessibility, page, and state grammar.
- UI work is precedent-first: explicit user direction → the nearest existing
  route or component that solves a similar workflow → the configured shadcn
  primitive (verified against current shadcn docs when unfamiliar) → a new
  composition only when none of those solve it. Name the inspected precedent
  in the spec or working notes before editing. Full order in
  `.ai/context/design-system.md`.
- Dashboard house primitives live in `apps/web/src/components/dashboard/`:
  `StatCard` (dashed stat tile), `TableCard` (dashed table/list frame with
  header, body, footer), `TablePagination`, `PageToolbar` (the 48px bar under
  the sticky header, only on pages with page-level controls), `HintLabel`
  (label + tooltip for a hidden calculation), and `QueryError` (the error
  state for dashboard queries — see `api-keys-card.tsx`). Compose these
  instead of writing a private stat or table wrapper again; `TablePagination`
  has no live consumer yet, its tests are the precedent.
- A change to runtime tokens in `tooling/tailwind/theme.css` must update
  `DESIGN.md` in the same commit.
- Authored UI uses semantic color classes and the documented spacing and
  typography scales. Composite slots follow the composition grammar; do not
  baseline or suppress violations.
- Before completing UI work, run `pnpm design:lint`, `pnpm design:tokens`, and
  `pnpm ui:composition`.

Example: `packages/ui/src/components/button.tsx`

## Form Patterns

- **ALWAYS** use `react-hook-form` with `@hookform/resolvers/zod` for forms.
- **NEVER** use `useState` for managing form state or individual form fields.
- **ALWAYS** use `shadcn/ui` form components (`Form`, `FormField`, `FormControl`, `FormItem`, `FormMessage`), with `Field`/`FieldGroup` primitives for layout.
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
- **AI endpoints degrade, never crash.** Call `getDefaultModel()` from `@turbo/ai/client`; when it returns `null` (no provider key — the zero-env template) respond 503 with `{ error, hint }` and return a raw `Response` for streams. New AI routes copy the pattern in `packages/api/src/router/ai.ts`.
- **External providers go through a boundary module, never a raw `fetch` in a router.** See `.ai/patterns/external-provider-boundary.md`: typed config, per-request timeout, every failure collapsed to one typed "unavailable" result, no secrets in logs.

Example: `packages/api/src/router/api-key.ts`

## Auth Patterns (Better Auth)

- Apps create auth via `createAppAuth()` from `@turbo/auth`; only base URLs and framework plugins are app-specific.
- `createAppAuth()` owns all shared wiring: env-derived secrets, the GitHub social provider conditional, and the OTP email bridge.
- Next.js apps pass `extraPlugins: [nextCookies()]`; the standalone server passes no extra plugins.
- Never call `initAuth()` directly from an app — it is the low-level primitive; app code always goes through `createAppAuth()`.
- New social providers or plugins are added once in `packages/auth/src/index.ts`.

## Web Rendering (Next.js Cache Components)

- `apps/web` runs Next.js 16.3 with `cacheComponents` and `partialPrefetching` enabled (`next.config.js`).
- Request-time data in Server Components (`getSession()`, `cookies()`, `headers()`, `params`, uncached `fetch`) must stream inside a `<Suspense>` boundary — move the access into an async child component and wrap it, as in `apps/web/src/app/(auth)/onboarding/page.tsx`. Top-level access fails `next build`.
- Cache shareable server data with the `"use cache"` directive instead of route segment configs (`export const dynamic/revalidate` are incompatible with Cache Components).
- The React Compiler is enabled (`reactCompiler: true` + Rust variant); do not hand-add `useMemo`/`useCallback` for render memoization unless the compiler skips the component (see `react-hooks/incompatible-library` lint warnings).

## Database Patterns (Drizzle)

- Schemas in `packages/db/src/` as `*-schema.ts`
- Use `pgTable()` for table definitions
- Relations defined separately with `relations()`
- Indexes defined in table callback: `(table) => [index(...)]`
- Column naming: `snake_case` in DB, `camelCase` in TypeScript
- All tables include `createdAt` and `updatedAt` timestamps
- Foreign keys with `onDelete: "cascade"` for user-owned data
- Raw SQL reads bypass Drizzle's UTC decoder for `timestamp without time zone`. When reading those stored UTC instants through `db.execute`, select `column AT TIME ZONE 'UTC'` before parsing them as JavaScript dates.
- Schema changes: `pnpm db:generate` then `pnpm db:migrate` — never edit applied migrations, never `db:push` against durable databases. `packages/db/src/__tests__/migrations.test.ts` locks the chain's ability to bootstrap an empty database.

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
- `.ai/contracts/env.generated.md` is the env contract for humans and agents: every `.env.example` variable with required/optional (derived from the zod schemas), the runtime that reads it, and its exposure. A new variable is complete only when it appears there correctly — add it to `.env.example` (under a `# Group` heading), `turbo.json` `globalEnv`, and the owning env module (or read it via `process.env` in exactly one package when it is a pure feature switch), then run `pnpm ai:env:strict`.
- Optional env modules follow the `packages/auth/env.ts` shape: `z.string().transform(v => v === "" ? undefined : v).optional()` (`optionalString`) or the `z.union([z.literal(""), z.url()])` variant (`optionalUrl`). The contract script recognises both as "empty string counts as unset".
- `.infisical.json` (committed, project id only) links the repo to the `turbo` Infisical project with `dev`/`staging`/`prod`. Each environment holds the required variables for the runtimes it serves plus the optional features it enables. Coolify apps read their own env store today; wiring them to Infisical means setting the four `INFISICAL_*` machine-identity variables on the app (`scripts/infisical-run.sh`).

## Operational Commands

- Run `pnpm auth:generate` after Better Auth schema/config changes that affect generated auth schema output.
- Run `pnpm db:generate -- --name <migration_name>` after Drizzle schema changes that need durable migrations.
- Run `pnpm db:migrate` to apply pending Drizzle migrations.
- Production migrations run via migrate-on-boot: `pnpm start:server` chains `db:migrate && start:prod`; the standalone server is the only migration owner.
- Use `pnpm db:push:local` only for disposable local databases.
- Use `pnpm db:studio` for local schema/data inspection during development.
- Prefer workspace/root scripts when available over ad-hoc package commands.
- `pnpm run ci` runs the same checks as `.github/workflows/ci.yml` in the same order and stops on the first failure; it is the local merge gate. Invoke it as `pnpm run ci` — bare `pnpm ci` is a reserved pnpm built-in. Any step added to or removed from the workflow must be mirrored in the script, and vice versa (`.ai/decisions/ADR-0003-single-job-ci.md`).
- Per-package `pnpm typecheck` / `pnpm lint` in a fresh worktree need dependencies built once: `pnpm turbo run build --filter=<pkg>^... --output-logs=errors-only`. Root-level commands do this automatically via `dependsOn: ["^build"]`.
- Package `dev` scripts are one-shot (`tsc`, never `tsc --watch`); long-running processes use a separate script name (`pnpm dev:worker` runs the pg-boss worker). See `.ai/patterns/turbo-dev-tasks.md`.
- `pnpm dev:worker` runs the jobs worker locally (`tsx watch`, reads `.env`); `pnpm start:worker` is the production entry. The server Docker image runs the worker when `SERVER_PROCESS=worker` is set.
- Every `tsx` invocation in `apps/server` passes `--tsconfig tsconfig.runtime.json`. tsx applies `compilerOptions` only to files inside `include`, and that file widens the scope to the workspace packages executed from source (mail templates need the automatic JSX runtime). It is standalone on purpose: the image prunes `@turbo/tsconfig`.

## Copy Voice (user-facing text)

- Plain language over jargon in labels, captions, and empty states; say what the screen shows, not how it is computed.
- Every empty state says what is absent and offers the next action as a real CTA (`Empty` + `EmptyContent` button), never a bare sentence.
- Labels that hide a calculation or a policy get a `HintLabel` (`apps/web/src/components/dashboard/hint-label.tsx`); self-evident labels do not, so hints stay meaningful.
- Status words map to badge variants: positive states (active, connected, verified) are `Badge variant="success"`, attention states (due, pending review) are `warning`, failures are `destructive`, neutral or terminal states stay `outline`.

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

## Background Job Patterns (pg-boss)

- A job is a plain async function in `packages/jobs/src/tasks/<name>.ts` that takes a typed payload, returns a result, and **throws on failure** so pg-boss retries it. It imports no queue code, so the API can call it directly for the inline path.
- Register it twice: the payload in `JobPayloads` (`src/queues.ts`) and the handler in `jobHandlers` (`src/handlers.ts`). The mapped type makes a missing entry a compile error.
- Producers import `@turbo/jobs/client`: `isJobQueueConfigured()` gates on `JOBS_POSTGRES_URL`; `enqueue(name, payload, options?)` is the only send API. Never construct `PgBoss` in a router or app.
- The queue is presence-gated: empty `JOBS_POSTGRES_URL` → run the handler in the request (as `POST /support` does); set → enqueue and let the worker run it. The zero-env template keeps working without a worker.
- One shared `QUEUE_POLICY` (three attempts, backoff 1s→10s, five-minute run limit) is applied at `createQueue`; per-job overrides go through `enqueue`'s `options`, not a second policy object.
- The worker runtime is `apps/server/src/worker.ts` (`pnpm dev:worker` / `pnpm start:worker` / `SERVER_PROCESS=worker` in the server image). `packages/jobs` exports `createWorker()` and owns no process concerns (signals, exit codes, env).
- Handler failures report through `@turbo/analytics/server` `captureError` with `job` and `jobId` tags, then rethrow.
- Tests mock `pg-boss` (`vi.mock("pg-boss", () => ({ PgBoss: vi.fn(function () { return boss; }) }))`) and never need a database; see `packages/jobs/src/__tests__/`.

## Mail Patterns

- `@turbo/mail` exports templates and senders only; import react-email primitives from `react-email` directly inside mail templates — never re-export vendor components from `packages/mail/src/index.ts`.
- Consumers call `sendOTPEmail`, `sendWelcomeEmail`, or `sendSupportEmail` from `@turbo/mail/client`; they do not import react-email primitives from `@turbo/mail`.
- New email types: add a template in `src/templates/`, a `send<Name>Email` wrapper in `src/client.tsx`, and a subject-mapping test following `sendOTPEmail`.
- Flag any new `export ... from "react-email"` added to `src/index.ts` in code review.
