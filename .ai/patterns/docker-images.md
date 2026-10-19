# Pattern: Docker images (Coolify / any container host)

## Overview

`apps/web/Dockerfile` and `apps/server/Dockerfile` build slim multi-stage
images with the **repo root as the build context**. They are an additional
deploy path next to Vercel (web) and a plain `pnpm start:server` process
(server); nothing in the non-Docker paths changes. Introduced 2026-09-05,
server bundled 2026-10-19 (spec: `.ai/specs/active/slim-docker-images.spec.md`).

Runtime behavior matches the existing scripts: the server still migrates on
boot and only starts if migrations succeed; the web app serves Next's own
standalone `server.js`. Both boot through `scripts/infisical-run.sh`, so
Infisical remains the secrets source in production exactly as
`pnpm with-secrets` makes it locally.

The server image does **not** ship `node_modules`, pnpm, tsx, TypeScript, or
drizzle-kit. esbuild bundles `src/index.ts` and `src/migrate.ts` (workspace
packages and every npm dependency inlined) into `dist/*.mjs`, and migrations
run through drizzle-orm's programmatic migrator instead of the drizzle-kit
CLI. Forks (silo, Billi, kodo, …) should copy this shape for every Node
API/worker image.

## Stage layout

| Stage       | web                                                                            | server                                                                   |
| ----------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `base`      | `node:22.21.0-alpine` + `libc6-compat` + `pnpm@10.34.5` (via `npm i -g`)       | same                                                                     |
| `manifests` | every workspace `package.json` + lockfile, nothing else                        | same                                                                     |
| `deps`      | `pnpm install --frozen-lockfile --ignore-scripts --filter "@turbo/web..."`     | same with `@turbo/server...` (dev deps included: esbuild bundles)        |
| `build`     | `CI=1 SKIP_ENV_VALIDATION=1 DOCKER_BUILD=1 pnpm turbo build -F @turbo/web`     | `pnpm -F @turbo/server build` (`apps/server/esbuild.config.mjs`)         |
| `runner`    | `node:22.21.0-alpine` + `tini`; `.next/standalone` + `.next/static` + `public` | `node:22.21.0-alpine` + `tini`; `dist/` + `drizzle/` (no `node_modules`) |

Both runners also carry `scripts/infisical-run.sh`, `.infisical.json`, and
the stripped Infisical CLI at `/usr/local/bin/infisical`.

### Server runner layout

```text
/app/dist/index.mjs      API entry (bundle) + shared chunk-*.mjs + *.map
/app/dist/migrate.mjs    migration entry (bundle)
/app/drizzle/*.sql       copied from packages/db/drizzle (with meta/_journal.json)
/app/scripts/infisical-run.sh
/app/.infisical.json
/usr/local/bin/infisical
```

## Invariants

1. **Mobile is never installed.** `.dockerignore` drops `apps/mobile/*` but
   keeps its `package.json` so `--frozen-lockfile` still sees the full
   workspace graph. `nodeLinker: hoisted` means `--filter` barely shrinks the
   build-stage install; only the runner size matters.
2. **Install scripts are skipped, except `@infisical/cli`.** The root
   `postinstall` runs `pnpm dlx sherif@latest` over the network, and nothing
   else at runtime depends on an install script. `@infisical/cli`'s preinstall
   downloads the Infisical CLI binary, so the `deps` stage runs
   `pnpm rebuild @infisical/cli`, strips it, and the runner copies only
   `node_modules/@infisical/cli/bin/infisical` to `/usr/local/bin/infisical`
   (a static Go binary, so the runner needs no `libc6-compat`).
3. **Secrets come from Infisical at boot, or from the platform.** Both CMDs go
   through `scripts/infisical-run.sh` (the same wrapper as root
   `with-secrets`). With `INFISICAL_CLIENT_ID` + `INFISICAL_CLIENT_SECRET`
   (universal-auth machine identity) plus `INFISICAL_PROJECT_ID` (or a
   committed `.infisical.json`) and `INFISICAL_ENV`, the container fetches
   its secrets at start; a half-configured identity fails fast; with no
   credentials it runs the command on platform-injected env vars and logs
   that it did. Package `with-env` (`dotenv -e ../../.env`) is never used in
   containers — there is no `.env` in the image. The build stage guarantees
   `.infisical.json` exists (`{}` if the fork has not run `infisical init`) so
   the runner COPY never fails.
4. **`DOCKER_BUILD=1` gates standalone output.** `next.config.js` only sets
   `output: "standalone"` + `outputFileTracingRoot` (monorepo root) under
   that flag, so local `next start` stays warning-free and Vercel's build is
   untouched. Vercel ignores Dockerfiles entirely.
5. **`CI=1` + `SKIP_ENV_VALIDATION=1` at build time.** `shouldSkipEnvValidation()`
   returns true, so builds need no runtime secrets and `@turbo/db` falls back
   to a placeholder connection string instead of throwing at import.
   `SENTRY_AUTH_TOKEN` is an optional BuildKit secret; without it Sentry skips
   source-map upload. (The server bundle evaluates nothing at build time.)
6. **`NEXT_PUBLIC_*` are build args.** They are inlined into the client
   bundle, so every key in `apps/web/src/env.ts` has an `ARG` line in the web
   Dockerfile. Adding a `NEXT_PUBLIC_*` env var means adding an `ARG`.
   `pnpm docker:check` fails when `apps/web/src/env.ts` `client` keys and the
   web Dockerfile `ARG`s differ.
7. **The server is one bundle; nothing is installed at runtime.**
   `apps/server/esbuild.config.mjs` bundles ESM for `node22` with sourcemaps
   (`node --enable-source-maps`), `jsx: automatic` for the mail templates, a
   `createRequire` banner for bundled CommonJS, and `external: []`. A new
   dependency that cannot be bundled (native addon such as `bcrypt`/`sharp`,
   or a package that reads its own files at runtime such as pino transports)
   goes into `external` **and** gets installed in the runner (a generated
   `package.json` with just those packages at their lockfile versions +
   `npm install --omit=dev`). Boot the image after adding dependencies: a
   bundling mistake shows up as `ERR_MODULE_NOT_FOUND` / `Dynamic require of
"x" is not supported` at start, not at build.
8. **Migrations: drizzle-orm migrator, same bookkeeping as drizzle-kit.**
   `@turbo/db/migrate` (`packages/db/src/migrate.ts`) calls
   `migrate(db, { migrationsFolder, migrationsTable: "__drizzle_migrations", migrationsSchema: "drizzle" })`
   — drizzle-kit's defaults for `packages/db/drizzle.config.ts` — and swaps
   `:6543` for `:5432` like the config does, so a database migrated by
   `pnpm db:migrate` and one migrated by the image are interchangeable. The
   folder resolves as `new URL("../drizzle", import.meta.url)`: `packages/db/drizzle`
   from source, `/app/drizzle` from `/app/dist/*.mjs`, which is why the
   runner copies `packages/db/drizzle` to `/app/drizzle`. If a fork changes
   `out`, `migrations.table`, or `migrations.schema` in `drizzle.config.ts`,
   change `migrate.ts` to match. Local dev keeps `pnpm db:migrate` (drizzle-kit).
9. **Server boot chain.** The CMD mirrors root `start:server`:
   `node dist/migrate.mjs && exec node dist/index.mjs` (both with
   `--enable-source-maps`), so the API only starts if migrations succeed.
   `tini` is the entrypoint (PID 1) so `docker stop` / Coolify's SIGTERM
   reaches node, which installs no signal handler of its own. No Dockerfile
   `HEALTHCHECK`: Coolify probes `GET /health` itself, and a baked-in
   healthcheck would mark a worker container (same image, no HTTP port)
   unhealthy.
10. **Web boot.** Next standalone `server.js` reads `PORT`/`HOSTNAME`; the
    image sets `3000`/`0.0.0.0`. sharp's musl build is traced into the
    standalone output for `/_next/image`.

## Adding a second process (worker) to the server image

Add the entry to `entryPoints` in `apps/server/esbuild.config.mjs` (e.g.
`src/worker.ts` → `dist/worker.mjs`) and branch in the CMD on an env var, the
worker skipping migrations (the API stays the single migration owner):

```dockerfile
CMD ["sh", "scripts/infisical-run.sh", "--", "sh", "-c", \
  "if [ \"$SERVER_PROCESS\" = worker ]; then exec node --enable-source-maps dist/worker.mjs; fi; node --enable-source-maps dist/migrate.mjs && exec node --enable-source-maps dist/index.mjs"]
```

## Size budget (2026-10-19, amd64)

Most of what is left is
fixed: the `node:22-alpine` base (~170 MB, 120 MB of it the `node` binary)
and the stripped Infisical CLI (~88 MB). Dropping Infisical from a fork that
does not use it saves those 88 MB; nothing else in the runner is optional.

| Image  | Before (`pnpm deploy` + tsx) | After  | What is left                                                           |
| ------ | ---------------------------- | ------ | ---------------------------------------------------------------------- |
| server | 563 MB                       | 267 MB | node base 165 MB, Infisical 88 MB, `dist/` 12.5 MB, `drizzle/` 44 KB   |
| web    | 311 MB                       | 311 MB | node base 165 MB, Infisical 88 MB, standalone + static + public ~60 MB |

Unpacked sizes from the CI `docker` job (`docker image ls`, classic image
store). Coolify's containerd store reports larger numbers for the same
images (server 828 MB → 369 MB; web 435 MB).

## Version pins

`NODE_VERSION` mirrors `.nvmrc` and `PNPM_VERSION` mirrors
`package.json#packageManager`. Bump all three together. `pnpm docker:check`
(a step of the single `ci` job, and of `pnpm run ci`) fails when the
Dockerfile `ARG`s disagree with `.nvmrc` or `package.json#packageManager`.

## Coolify settings

Per app: build pack `dockerfile`, base directory `/`, Dockerfile location
`/apps/web/Dockerfile` or `/apps/server/Dockerfile`, port `3000` / `3001`,
health check `GET /` / `GET /health`, and **no custom install/build/start
command** (the CMD is baked in). Mark `NEXT_PUBLIC_*` variables as build-time.

`git_branch: main` does not mean auto-deploy. Coolify rebuilds only when
GitHub delivers a `push` webhook, and the app's **source** decides whether one
exists: a Coolify **GitHub App** source registers and manages the webhook; a
**Public Repository** source registers nothing, so the app silently stays on
whatever commit was last deployed by hand. For a public source, add one
repository webhook per app: payload URL
`https://<coolify-host>/webhooks/source/github/events/manual`, content type
`application/json`, `push` events, secret = that app's GitHub webhook secret
from its Webhooks tab. Coolify matches a delivery to the app whose secret
signed it (the other app logs `Invalid signature` and ignores it). The secret
lives in Coolify and GitHub only — never in this repo.

Set **Watch paths** per app to what its Dockerfile copies once `.dockerignore`
has filtered the context: `apps/web/**` or `apps/server/**`, plus
`packages/**`, `tooling/**`, `scripts/**`, `package.json`, `pnpm-lock.yaml`,
`pnpm-workspace.yaml`, `turbo.json`, `.dockerignore`, `.nvmrc`, and
`.infisical.json`. Empty watch paths rebuild both images on every push,
including `.ai/` and README edits.

## Local verification

```sh
docker build -f apps/web/Dockerfile -t turbo-web .
docker run --rm -p 3000:3000 -e SKIP_ENV_VALIDATION=1 turbo-web
docker build -f apps/server/Dockerfile -t turbo-server .
docker run --rm --entrypoint sh turbo-server -c 'ls dist drizzle; which infisical; ! which pnpm tsx'
# migrations only (exits after applying; a second run is a no-op):
docker run --rm -e POSTGRES_URL=... turbo-server node dist/migrate.mjs
```

The `docker` job in `.github/workflows/ci.yml` builds both images on every
pull request (`push: false`, GHA layer cache). The web smoke test curls `/`;
the server smoke test boots the image against a throwaway `postgres:16-alpine`,
waits for `GET /health`, and re-runs `dist/migrate.mjs` as a no-op;
a red `docker` check means the deploy path is broken even if lint/typecheck
are green.
