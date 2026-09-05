# syntax=docker/dockerfile:1.7
#
# @turbo/web: Next.js standalone image.
#
# Build from the repo root (the context must be the monorepo, not apps/web):
#   docker build -f apps/web/Dockerfile -t turbo-web .
#
# Run:
#   docker run --rm -p 3000:3000 -e POSTGRES_URL=... -e AUTH_SECRET=... turbo-web
#
# This is an additional deploy path. Vercel ignores Dockerfiles and the
# `output: "standalone"` switch below, so both targets coexist. Coolify: build
# pack "dockerfile", dockerfile location "/apps/web/Dockerfile", base directory
# "/", port 3000, and no custom install/build/start command (the CMD is baked in).
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
  NEXT_TELEMETRY_DISABLED=1 \
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
# deps: install @turbo/web and its workspace dependencies. Scripts are skipped
# (the root postinstall runs sherif over the network; esbuild and
# @tailwindcss/oxide ship platform binaries as optional deps). The one
# exception is @infisical/cli: its preinstall downloads the Infisical CLI
# binary that the runner's secrets wrapper needs, so it is rebuilt explicitly
# (and stripped: the unstripped Go binary is 120 MB, stripped ~85 MB).
# ---------------------------------------------------------------------------
FROM base AS deps
COPY --from=manifests /manifests /app
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
  pnpm config set store-dir /pnpm/store \
  && pnpm install --frozen-lockfile --ignore-scripts --filter "@turbo/web..." \
  && pnpm rebuild @infisical/cli \
  && test -x node_modules/@infisical/cli/bin/infisical \
  && apk add --no-cache binutils \
  && strip node_modules/@infisical/cli/bin/infisical

# ---------------------------------------------------------------------------
# build: compile workspace packages and the Next.js app.
# ---------------------------------------------------------------------------
FROM deps AS build
COPY . /app

# NEXT_PUBLIC_* values are inlined into the client bundle at build time, so they
# must arrive as build args (Coolify: mark them "build time" in the UI). Add a
# line here for every NEXT_PUBLIC_* key in apps/web/src/env.ts.
ARG NEXT_PUBLIC_PORT
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Optional: Sentry source-map upload. The build succeeds without them.
ARG SENTRY_ORG
ARG SENTRY_PROJECT

# DOCKER_BUILD=1 turns on `output: "standalone"` in next.config.js. CI=1 and
# SKIP_ENV_VALIDATION=1 let the env schema pass without runtime secrets.
ENV DOCKER_BUILD=1 \
  SKIP_ENV_VALIDATION=1

# SENTRY_AUTH_TOKEN is read from a BuildKit secret so it never lands in a layer:
#   docker build --secret id=SENTRY_AUTH_TOKEN,env=SENTRY_AUTH_TOKEN ...
RUN --mount=type=secret,id=SENTRY_AUTH_TOKEN \
  export SENTRY_AUTH_TOKEN="$(cat /run/secrets/SENTRY_AUTH_TOKEN 2>/dev/null || true)" \
  && pnpm turbo build -F @turbo/web --concurrency=1

# .infisical.json (written by `pnpm exec infisical init`) is optional for the
# template: forks can set INFISICAL_PROJECT_ID instead. Guarantee the file
# exists so the runner's COPY never fails.
RUN [ -f .infisical.json ] || echo '{}' > .infisical.json

# ---------------------------------------------------------------------------
# runner: only the traced standalone output, static assets, public/, and the
# Infisical secrets wrapper.
# ---------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS runner
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production \
  NEXT_TELEMETRY_DISABLED=1 \
  HOSTNAME=0.0.0.0 \
  PORT=3000
WORKDIR /app

# outputFileTracingRoot is the monorepo root, so the standalone tree mirrors the
# apps/web/... layout and server.js lives at apps/web/server.js.
COPY --from=build --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /app/apps/web/public ./apps/web/public

# Secrets wrapper (the same script `pnpm with-secrets` runs locally) and the
# Infisical CLI it falls back to on PATH. With INFISICAL_CLIENT_ID +
# INFISICAL_CLIENT_SECRET (+ INFISICAL_PROJECT_ID / INFISICAL_ENV) set, the
# container pulls its secrets from Infisical at boot; without them it runs on
# platform-injected env vars alone.
COPY --from=build --chown=node:node /app/scripts/infisical-run.sh ./scripts/infisical-run.sh
COPY --from=build --chown=node:node /app/.infisical.json ./.infisical.json
COPY --from=build /app/node_modules/@infisical/cli/bin/infisical /usr/local/bin/infisical

USER node
EXPOSE 3000

# Equivalent to `pnpm with-secrets pnpm -F @turbo/web start`: there is no .env
# in the image, so the wrapper injects Infisical secrets (or passes platform
# env vars through), and standalone ships its own server.js instead of the
# `next` CLI.
CMD ["sh", "scripts/infisical-run.sh", "--", "node", "apps/web/server.js"]
