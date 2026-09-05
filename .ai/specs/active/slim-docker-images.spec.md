# Feature Spec: Slim multi-stage Docker images

## Status

- State: implemented
- Owner: AI agent
- Created: 2026-09-05
- Updated: 2026-09-05

## Problem

The template documents Vercel for the web app and a plain `pnpm start:server`
process for the API, but forks that deploy to Coolify (or any Docker host)
fall back to Nixpacks with the repo root as base directory. Those images weigh
~4.4 GB: the Nix store, the whole monorepo `pnpm install` (including the Expo
`apps/mobile` tree), all source, `.git`, and docs ship in every container.
Nothing is pruned, so deploys are slow and hosts fill their disks.

Docker is an additional deploy path. Vercel and the plain VPS path must keep
working unchanged.

## Acceptance Criteria

- [x] `apps/web/Dockerfile` builds a Next.js standalone image from the repo-root
      context and boots `node apps/web/server.js` on port 3000.
- [x] `apps/server/Dockerfile` builds a Hono image from the repo-root context and
      boots the same chain as root `start:server`: `drizzle-kit migrate` (via
      `packages/db/scripts/drizzle.mjs`) then `tsx src/index.ts` on port 3001.
- [x] `next.config.js` only sets `output: "standalone"` and
      `outputFileTracingRoot` when `DOCKER_BUILD=1`, so Vercel and local
      `next build` / `next start` are untouched.
- [x] `apps/mobile` is never installed in either image; its `package.json`
      stays in the build context so `--frozen-lockfile` passes.
- [x] Install runs with `--ignore-scripts`; `@infisical/cli` (root devDependency)
      does not end up in either runner and is not rebuilt.
- [x] Runtime deps the server needs at boot (`tsx`, `drizzle-kit`) are
      `dependencies` so `pnpm deploy --prod` keeps them.
- [x] Both images are a few hundred MB, not gigabytes.
- [x] `pnpm typecheck` for web/server/db and `pnpm lint:ws` pass;
      `pnpm -F @turbo/web build` without `DOCKER_BUILD` produces a normal build.
- [x] README documents the Docker path and the Coolify settings.

## Expected Files

| File                            | Expected change                                                                                                             |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `.dockerignore`                 | New. Drops `node_modules`, `.git`, `apps/mobile/*` (keeps its `package.json`), build output, env files, docs, agent memory. |
| `apps/web/Dockerfile`           | New. Stages `base` → `manifests` → `deps` → `build` → `runner`; Next standalone output.                                     |
| `apps/server/Dockerfile`        | New. Stages `base` → `manifests` → `deps` → `build` → `prune` (`pnpm deploy --prod --legacy`) → `runner`.                   |
| `apps/web/next.config.js`       | `output: "standalone"` + `outputFileTracingRoot` gated on `DOCKER_BUILD === "1"`.                                           |
| `apps/server/package.json`      | Move `tsx` from `devDependencies` to `dependencies`.                                                                        |
| `packages/db/package.json`      | Move `drizzle-kit` from `devDependencies` to `dependencies`.                                                                |
| `pnpm-lock.yaml`                | Regenerated for the two dependency moves only.                                                                              |
| `README.md`                     | "Docker (Coolify / any container host)" subsection under Deployment.                                                        |
| `.ai/patterns/docker-images.md` | New pattern: stage layout, invariants, how to extend.                                                                       |
| `.ai/context/tech-stack.md`     | Hosting row mentions the Docker path.                                                                                       |
| `ROADMAP_AI.md`                 | Ledger entry.                                                                                                               |

## Contracts

| Contract        | Change? | Notes                                                                                   |
| --------------- | ------- | --------------------------------------------------------------------------------------- |
| API routes      | no      |                                                                                         |
| DB schema       | no      |                                                                                         |
| Env vars        | no      | Same runtime vars. `DOCKER_BUILD` is a build-only switch set inside the web Dockerfile. |
| Package exports | no      |                                                                                         |
| UI tokens       | no      |                                                                                         |
| Agent memory    | yes     | Tech stack, new pattern, roadmap ledger.                                                |

## Pseudocode

```text
web:
  base      = node:22.21.0-alpine + libc6-compat + pnpm@10.34.5 (npm i -g)
  manifests = every workspace package.json + lockfile + workspace yaml
  deps      = pnpm install --frozen-lockfile --ignore-scripts --filter @turbo/web...
  build     = copy source; CI=1 SKIP_ENV_VALIDATION=1 NEXT_TELEMETRY_DISABLED=1 DOCKER_BUILD=1
              pnpm turbo build -F @turbo/web   (NEXT_PUBLIC_* as ARGs, SENTRY_AUTH_TOKEN as secret)
  runner    = node:22.21.0-alpine; copy .next/standalone, .next/static, public
              CMD node apps/web/server.js

server:
  base/manifests/deps as above with --filter @turbo/server...
  build  = pnpm turbo build -F @turbo/server
  prune  = pnpm deploy --filter @turbo/server --prod --legacy /out
  runner = node:22.21.0-alpine + pnpm (drizzle.mjs spawns `pnpm drizzle-kit`)
           PATH=/app/node_modules/.bin:$PATH
           CMD sh -c 'TURBO_DB_SKIP_DOTENV=1 node node_modules/@turbo/db/scripts/drizzle.mjs migrate && exec tsx src/index.ts'
```

## Decisions

- **No Infisical in images.** The template's `with-env` scripts read
  `../../.env`, which does not exist in a container. Root `with-secrets`
  (`infisical run --`) is a local convenience. Container platforms inject env
  vars directly, so the CMDs call the underlying commands.
- **`DOCKER_BUILD` gate.** Unconditional `output: "standalone"` makes local
  `next start` warn and changes Vercel's build output. Gating keeps both
  paths byte-identical to today.
- **`pnpm deploy --legacy`.** pnpm ≥ 10 requires `--legacy` (or
  `inject-workspace-packages`) to deploy from a workspace that links packages.
- **Hoisted `nodeLinker`.** `--filter` cannot shrink the build-stage install
  much under `hoisted`, but only the runner size matters.
