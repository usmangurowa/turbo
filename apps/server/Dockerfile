# syntax=docker/dockerfile:1.7
#
# @turbo/server: Hono API image. The server is bundled with esbuild into
# dist/ (every dependency inlined), so the runner is node + dist/ + the drizzle
# migrations + the Infisical CLI: no node_modules, pnpm, tsx, or drizzle-kit.
#
# Build from the repo root (the context must be the monorepo, not apps/server):
#   docker build -f apps/server/Dockerfile -t turbo-server .
#
# Run:
#   docker run --rm -p 3001:3001 -e POSTGRES_URL=... -e AUTH_SECRET=... turbo-server
#
# Boot sequence mirrors root `pnpm start:server`
# (`TURBO_DB_SKIP_DOTENV=1 pnpm db:migrate && pnpm -F @turbo/server start:prod`):
# dist/migrate.mjs applies pending migrations with drizzle-orm's migrator
# (same `drizzle/` folder and `drizzle.__drizzle_migrations` table as
# drizzle-kit), then dist/index.mjs starts the API.
#
# Coolify: build pack "dockerfile", dockerfile location "/apps/server/Dockerfile",
# base directory "/", port 3001, health check GET /health, and no custom
# install/build/start command (the CMD is baked in).
#
# Keep NODE_VERSION in sync with .nvmrc and PNPM_VERSION with
# package.json#packageManager.

ARG NODE_VERSION=22.21.0
ARG PNPM_VERSION=10.34.5

# ---------------------------------------------------------------------------
# base: Node + pnpm (build stages only). pnpm is installed with npm rather than
# corepack so it works for any user without a per-user corepack cache.
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS base
ARG PNPM_VERSION
RUN apk add --no-cache libc6-compat \
  && npm install -g pnpm@${PNPM_VERSION} \
  && npm cache clean --force
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV CI=1 \
  DO_NOT_TRACK=1 \
  TURBO_TELEMETRY_DISABLED=1
WORKDIR /app

# ---------------------------------------------------------------------------
# manifests: every workspace package.json plus the lockfile and nothing else,
# so the install layer below is cached until a manifest or the lockfile changes.
# apps/mobile/package.json is kept (see .dockerignore) so --frozen-lockfile
# still sees the full workspace graph, but the --filter below never installs it.
# ---------------------------------------------------------------------------
FROM base AS manifests
COPY . /src
RUN set -eu; \
  mkdir -p /manifests; \
  cd /src; \
  find . -name package.json -not -path '*/node_modules/*' \
    -exec sh -c 'mkdir -p "/manifests/$(dirname "$1")" && cp "$1" "/manifests/$1"' _ {} \; ; \
  cp pnpm-lock.yaml pnpm-workspace.yaml /manifests/; \
  [ -f .npmrc ] && cp .npmrc /manifests/ || true

# ---------------------------------------------------------------------------
# deps: install @turbo/server and its workspace dependencies (dev deps
# included: esbuild does the bundling). Scripts are skipped (the root
# postinstall runs sherif over the network; esbuild ships its platform binary
# as an optional dep). The one exception is @infisical/cli: its preinstall
# downloads the Infisical CLI binary that the runner's secrets wrapper needs,
# so it is rebuilt explicitly (and stripped: unstripped 120 MB, stripped ~88 MB).
# ---------------------------------------------------------------------------
FROM base AS deps
COPY --from=manifests /manifests /app
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm config set store-dir /pnpm/store \
  && pnpm install --frozen-lockfile --ignore-scripts --filter "@turbo/server..." \
  && pnpm rebuild @infisical/cli \
  && test -x node_modules/@infisical/cli/bin/infisical \
  && apk add --no-cache binutils \
  && strip node_modules/@infisical/cli/bin/infisical

# ---------------------------------------------------------------------------
# build: bundle src/index.ts and src/migrate.ts into apps/server/dist (see
# apps/server/esbuild.config.mjs). Workspace packages export raw .ts sources,
# so no `turbo build` of the dependencies is needed.
# ---------------------------------------------------------------------------
FROM deps AS build
COPY . /app
RUN pnpm -F @turbo/server build

# .infisical.json (written by `pnpm exec infisical init`) is optional for the
# template: forks can set INFISICAL_PROJECT_ID instead. Guarantee the file
# exists so the runner's COPY never fails.
RUN [ -f .infisical.json ] || echo '{}' > .infisical.json

# ---------------------------------------------------------------------------
# typecheck: tsc --noEmit over the server and the workspace sources it
# imports. esbuild strips types without checking them, so this stage is what
# fails the deploy on a type error. BuildKit runs it in parallel with `build`;
# the runner copies its empty marker file, so TypeScript never ships.
# ---------------------------------------------------------------------------
FROM deps AS typecheck
COPY . /app
RUN pnpm -F @turbo/server typecheck && touch /typecheck.ok

# ---------------------------------------------------------------------------
# runner: node, the bundle, the migrations, and the Infisical secrets wrapper.
# tini is PID 1 so SIGTERM reaches node (which installs no handler of its own).
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runner
COPY --from=typecheck /typecheck.ok /tmp/typecheck.ok
RUN apk add --no-cache tini
ENV NODE_ENV=production \
  PORT=3001
WORKDIR /app

COPY --from=build --chown=node:node /app/apps/server/dist ./dist
# drizzle-orm's migrator reads drizzle/*.sql + drizzle/meta/_journal.json at
# runtime; @turbo/db/migrate resolves the folder as <bundle dir>/../drizzle.
COPY --from=build --chown=node:node /app/packages/db/drizzle ./drizzle

# Secrets wrapper (the same script `pnpm with-secrets` runs locally) and the
# Infisical CLI it falls back to on PATH. With INFISICAL_CLIENT_ID +
# INFISICAL_CLIENT_SECRET (+ INFISICAL_PROJECT_ID / INFISICAL_ENV) set, the
# container pulls its secrets from Infisical at boot; without them it runs on
# platform-injected env vars alone.
COPY --from=build --chown=node:node /app/scripts/infisical-run.sh ./scripts/infisical-run.sh
COPY --from=build --chown=node:node /app/.infisical.json ./.infisical.json
COPY --from=build /app/node_modules/@infisical/cli/bin/infisical /usr/local/bin/infisical

USER node
EXPOSE 3001

# Equivalent to `pnpm with-secrets pnpm start:server`. There is no .env in the
# image: the wrapper injects Infisical secrets (or passes platform env vars
# through). Migrations run first; the API starts only if they succeed.
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "scripts/infisical-run.sh", "--", "sh", "-c", \
  "node --enable-source-maps dist/migrate.mjs && exec node --enable-source-maps dist/index.mjs"]
