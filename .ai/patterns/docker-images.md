# Pattern: Docker images (Coolify / any container host)

## Overview

`apps/web/Dockerfile` and `apps/server/Dockerfile` build slim multi-stage
images with the **repo root as the build context**. They are an additional
deploy path next to Vercel (web) and a plain `pnpm start:server` process
(server); nothing in the non-Docker paths changes. Introduced 2026-09-05
(spec: `.ai/specs/active/slim-docker-images.spec.md`).

Runtime behavior matches the existing scripts: the server still applies
`drizzle-kit migrate` on boot and still runs from `src/` with `tsx`; the web
app serves Next's own standalone `server.js`. Both boot through
`scripts/infisical-run.sh`, so Infisical remains the secrets source in
production exactly as `pnpm with-secrets` makes it locally.

## Stage layout

| Stage       | web                                                                        | server                                                               |
| ----------- | -------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `base`      | `node:22.21.0-alpine` + `libc6-compat` + `pnpm@10.34.5` (via `npm i -g`)   | same                                                                 |
| `manifests` | every workspace `package.json` + lockfile, nothing else                    | same                                                                 |
| `deps`      | `pnpm install --frozen-lockfile --ignore-scripts --filter "@turbo/web..."` | same with `@turbo/server...`                                         |
| `build`     | `CI=1 SKIP_ENV_VALIDATION=1 DOCKER_BUILD=1 pnpm turbo build -F @turbo/web` | `pnpm turbo build -F @turbo/server`                                  |
| `prune`     | — (Next `output: "standalone"` does the tracing)                           | `pnpm deploy --filter @turbo/server --prod --legacy /out` + `rdfind` |
| `runner`    | `.next/standalone` + `.next/static` + `public`                             | `/out` + pnpm                                                        |

## Invariants

1. **Mobile is never installed.** `.dockerignore` drops `apps/mobile/*` but
   keeps its `package.json` so `--frozen-lockfile` still sees the full
   workspace graph. `nodeLinker: hoisted` means `--filter` barely shrinks the
   build-stage install; only the runner size matters.
2. **Install scripts are skipped, except `@infisical/cli`.** The root
   `postinstall` runs `pnpm dlx sherif@latest` over the network, and nothing
   else at runtime depends on an install script. `@infisical/cli`'s preinstall
   downloads the Infisical CLI binary, so the `deps` stage runs
   `pnpm rebuild @infisical/cli` and the runner copies
   `node_modules/@infisical/cli/bin/infisical` to `/usr/local/bin/infisical`.
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
   source-map upload.
6. **`NEXT_PUBLIC_*` are build args.** They are inlined into the client
   bundle, so every key in `apps/web/src/env.ts` has an `ARG` line in the web
   Dockerfile. Adding a `NEXT_PUBLIC_*` env var means adding an `ARG`. The
   same check fails when `apps/web/src/env.ts` `client` keys and the web
   Dockerfile `ARG`s differ.
7. **Runtime deps must be `dependencies`.** `pnpm deploy --prod` drops
   `devDependencies`, so `tsx` (`apps/server`) and `drizzle-kit`
   (`packages/db`) live in `dependencies`. Anything new the server needs at
   boot must too.
8. **Server boot chain.** `pnpm deploy` flattens the workspace, so
   `packages/db` sits at `/app/node_modules/@turbo/db`. The CMD mirrors root
   `start:server` by path:
   `TURBO_DB_SKIP_DOTENV=1 node node_modules/@turbo/db/scripts/drizzle.mjs migrate && exec tsx src/index.ts`.
   `drizzle.mjs` spawns `pnpm drizzle-kit migrate`, which is why pnpm stays
   in the runner and `/app/node_modules/.bin` is on `PATH`.
9. **Web boot.** Next standalone `server.js` reads `PORT`/`HOSTNAME`; the
   image sets `3000`/`0.0.0.0`.

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

## Local verification

```sh
docker build -f apps/web/Dockerfile -t turbo-web .
docker run --rm -p 3000:3000 -e SKIP_ENV_VALIDATION=1 turbo-web
docker build -f apps/server/Dockerfile -t turbo-server .
docker run --rm --entrypoint sh turbo-server -c 'which pnpm tsx drizzle-kit infisical; ls node_modules/@turbo/db/drizzle'
```

The `docker` job in `.github/workflows/ci.yml` builds both images on every
pull request (`push: false`, GHA layer cache) and runs the same smoke checks;
a red `docker` check means the deploy path is broken even if lint/typecheck
are green.
