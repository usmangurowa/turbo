#!/usr/bin/env sh
# Run a command with secrets injected from Infisical.
#
# Same script for local dev (`pnpm with-secrets …`) and for the Docker runners
# (`CMD ["sh", "scripts/infisical-run.sh", "--", …]`), so one credential
# contract covers every environment.
#
# Resolution order:
#   1. Machine identity: INFISICAL_CLIENT_ID + INFISICAL_CLIENT_SECRET
#      (universal auth). This is what production containers use — set the two
#      variables (plus INFISICAL_PROJECT_ID / INFISICAL_ENV) on the platform.
#   2. A pre-issued INFISICAL_TOKEN (service token or machine-identity access
#      token). Handy for CI jobs and one-off scripts.
#   3. CI/Vercel without credentials: skip Infisical and use platform env vars.
#   4. A local `infisical login` session.
#   5. Nothing configured: warn and run with whatever the environment (or the
#      repo root .env) already provides, so a fresh clone and a container with
#      platform-injected env vars both still boot.
#
# Project id comes from INFISICAL_PROJECT_ID, falling back to the
# `workspaceId` in .infisical.json (written by `pnpm exec infisical init`).
# Environment slug comes from INFISICAL_ENV (default: dev). Self-hosted
# instances set INFISICAL_API_URL, which the CLI reads natively.
#
# Values injected by Infisical override anything loaded from .env; .env only
# fills the gaps (and supplies the machine-identity credentials locally).
#
# Usage: sh scripts/infisical-run.sh [infisical run flags] -- <command> [args...]

set -eu

if [ "$#" -eq 0 ]; then
  echo "usage: $0 [run flags] -- <command> [args...]" >&2
  exit 1
fi

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Load the repo root .env (fallback values + local machine-identity creds).
# Variables already set in the environment win over .env, matching dotenv
# semantics: the snapshot restores anything .env would have clobbered.
if [ -f "$REPO_ROOT/.env" ]; then
  ENV_SNAPSHOT="$(export -p)"
  set -a
  # shellcheck disable=SC1091
  . "$REPO_ROOT/.env"
  set +a
  eval "$ENV_SNAPSHOT"
fi

INFISICAL_ENV="${INFISICAL_ENV:-dev}"

# Prefer the repo-pinned CLI (installed via @infisical/cli); fall back to a
# global install (the Docker runners ship the binary at /usr/local/bin).
if [ -x "$REPO_ROOT/node_modules/.bin/infisical" ]; then
  INFISICAL_BIN="$REPO_ROOT/node_modules/.bin/infisical"
else
  INFISICAL_BIN="infisical"
fi

PROJECT_ID="${INFISICAL_PROJECT_ID:-}"
if [ -z "$PROJECT_ID" ] && [ -f "$REPO_ROOT/.infisical.json" ]; then
  PROJECT_ID="$(sed -n 's/.*"workspaceId"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$REPO_ROOT/.infisical.json")"
fi

# Drop wrapper flags up to `--`, leaving only the wrapped command in $@.
# Used by the branches that run the command without `infisical run`.
strip_to_command() {
  while [ "$#" -gt 0 ] && [ "$1" != "--" ]; do shift; done
  if [ "$#" -gt 0 ]; then shift; fi
  if [ "$#" -eq 0 ]; then
    echo "infisical-run.sh: no command found after --" >&2
    exit 1
  fi
  exec "$@"
}

require_project_id() {
  if [ -z "$PROJECT_ID" ]; then
    echo "infisical-run.sh: set INFISICAL_PROJECT_ID or commit .infisical.json (pnpm exec infisical init)" >&2
    exit 1
  fi
}

# 1. Machine identity (universal auth) — production containers.
if [ -n "${INFISICAL_CLIENT_ID:-}" ] && [ -n "${INFISICAL_CLIENT_SECRET:-}" ]; then
  require_project_id
  INFISICAL_TOKEN="$("$INFISICAL_BIN" login \
    --method=universal-auth \
    --client-id="$INFISICAL_CLIENT_ID" \
    --client-secret="$INFISICAL_CLIENT_SECRET" \
    --silent --plain)"
  export INFISICAL_TOKEN

  exec "$INFISICAL_BIN" run \
    --token "$INFISICAL_TOKEN" \
    --projectId "$PROJECT_ID" \
    --env "$INFISICAL_ENV" \
    --silent "$@"
fi

# Half-configured machine identity: fail fast instead of triggering the
# CLI's interactive login flow (which hangs/fails in CI and deploy builds).
if [ -n "${INFISICAL_CLIENT_ID:-}" ] || [ -n "${INFISICAL_CLIENT_SECRET:-}" ]; then
  [ -z "${INFISICAL_CLIENT_ID:-}" ] && echo "infisical-run.sh: INFISICAL_CLIENT_ID is empty or unset" >&2
  [ -z "${INFISICAL_CLIENT_SECRET:-}" ] && echo "infisical-run.sh: INFISICAL_CLIENT_SECRET is empty or unset" >&2
  echo "infisical-run.sh: set both variables for machine-identity auth" >&2
  exit 1
fi

# 2. Pre-issued token.
if [ -n "${INFISICAL_TOKEN:-}" ]; then
  require_project_id
  exec "$INFISICAL_BIN" run \
    --token "$INFISICAL_TOKEN" \
    --projectId "$PROJECT_ID" \
    --env "$INFISICAL_ENV" \
    --silent "$@"
fi

# 3. CI/Vercel without credentials: skip Infisical entirely and rely on the
# platform's own environment variables. The CLI's interactive login flow
# cannot work here and would fail the build.
if [ -n "${VERCEL:-}" ] || [ -n "${CI:-}" ]; then
  echo "infisical-run.sh: no Infisical credentials in CI; using platform env vars" >&2
  strip_to_command "$@"
fi

# 4. Local `infisical login` session, if one exists and the project is known.
if "$INFISICAL_BIN" user get token >/dev/null 2>&1; then
  if [ -n "$PROJECT_ID" ]; then
    exec "$INFISICAL_BIN" run --projectId "$PROJECT_ID" --env "$INFISICAL_ENV" --silent "$@"
  fi
  echo "infisical-run.sh: logged in but no project configured (run: pnpm exec infisical init); using existing env vars only" >&2
  strip_to_command "$@"
fi

# 5. No Infisical auth at all: run with whatever the environment provides so a
# fresh clone (with .env) or a container with platform-injected variables
# still boots. Secrets that only live in Infisical will be missing.
echo "infisical-run.sh: no Infisical credentials or login session; using existing env vars only" >&2
strip_to_command "$@"
