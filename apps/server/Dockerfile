# syntax=docker/dockerfile:1.7
#
# @turbo/server: Hono API image (run with tsx, migrations applied on boot).
#
# Build from the repo root (the context must be the monorepo, not apps/server):
#   docker build -f apps/server/Dockerfile -t turbo-server .
#
# Run:
#   docker run --rm -p 3001:3001 -e POSTGRES_URL=... -e AUTH_SECRET=... turbo-server
#
# Boot sequence mirrors root `pnpm start:server`:
#   TURBO_DB_SKIP_DOTENV=1 pnpm db:migrate && pnpm -F @turbo/server start:prod
# i.e. drizzle-kit migrate (via packages/db/scripts/drizzle.mjs) → tsx src/index.ts.
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
# base: Node + pnpm. pnpm is installed with npm rather than corepack so it works
# for any user without a per-user corepack cache.
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
# deps: install @turbo/server and its workspace dependencies. Scripts are
# skipped (the root postinstall runs sherif over the network; esbuild ships
# platform binaries as optional deps). The one exception is @infisical/cli:
# its preinstall downloads the Infisical CLI binary that the runner's secrets
# wrapper needs, so it is rebuilt explicitly (and stripped: the unstripped Go
# binary is 120 MB, stripped ~85 MB).
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
# build: tsc for the server and the workspace packages it depends on. The
# emitted dist/ is only used for type declarations; the runtime is tsx over
# src/ because workspace packages export raw .ts sources.
# ---------------------------------------------------------------------------
FROM deps AS build
COPY . /app
ENV SKIP_ENV_VALIDATION=1
RUN pnpm turbo build -F @turbo/server --concurrency=1

# .infisical.json (written by `pnpm exec infisical init`) is optional for the
# template: forks can set INFISICAL_PROJECT_ID instead. Guarantee the file
# exists so the runner's COPY never fails.
RUN [ -f .infisical.json ] || echo '{}' > .infisical.json

# ---------------------------------------------------------------------------
# prune: the server package plus a self-contained production node_modules.
# `pnpm deploy` copies workspace packages in (not symlinked), including
# packages/db's drizzle/ migrations and scripts/drizzle.mjs, and drops
# devDependencies — which is why tsx (apps/server) and drizzle-kit (packages/db)
# are declared as dependencies. `--legacy` is required by pnpm ≥ 10 when
# inject-workspace-packages is not set.
# ---------------------------------------------------------------------------
FROM build AS prune
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm deploy --filter @turbo/server --prod --legacy --ignore-scripts /out \
  && rm -rf /out/dist /out/.cache /out/.turbo /out/node_modules/@turbo/*/dist

# The hoisted layout nests a full copy of every conflicting package version
# (mostly @opentelemetry/*) under each consumer. Hardlinking byte-identical
# files keeps every path intact for Node while storing each file once; Docker
# preserves hardlinks across COPY --from.
RUN apk add --no-cache rdfind \
  && rdfind -makehardlinks true -makeresultsfile false /out/node_modules >/dev/null

# ---------------------------------------------------------------------------
# runner
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runner
ARG PNPM_VERSION
# pnpm stays because packages/db/scripts/drizzle.mjs spawns `pnpm drizzle-kit`.
RUN apk add --no-cache libc6-compat \
  && npm install -g pnpm@${PNPM_VERSION} \
  && npm cache clean --force
ENV NODE_ENV=production \
  PORT=3001 \
  PATH=/app/node_modules/.bin:$PATH
WORKDIR /app

COPY --from=prune --chown=node:node /out ./

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

# Equivalent to `pnpm with-secrets pnpm start:server`. `pnpm deploy` flattens
# the workspace, so packages/db lives at node_modules/@turbo/db. There is no
# .env in the image: the wrapper injects Infisical secrets (or passes platform
# env vars through), and the dotenv wrappers are skipped.
CMD ["sh", "scripts/infisical-run.sh", "--", "sh", "-c", \
  "TURBO_DB_SKIP_DOTENV=1 node node_modules/@turbo/db/scripts/drizzle.mjs migrate && exec tsx src/index.ts"]
