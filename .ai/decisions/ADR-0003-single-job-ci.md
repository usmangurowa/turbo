# ADR-0003: CI is one job, mirrored by a root `pnpm run ci` script

## Status

Accepted (2026-09-11). Inherited from `usmangurowa/silo`, which adopted the
same layout after running the template's CI in anger.

## Context

`.github/workflows/ci.yml` ran seven jobs: six Node jobs (AI contracts, design
governance, lint, format, typecheck, test) plus a Docker matrix. Each Node job
did its own checkout, `pnpm add -g turbo`, and un-cached `pnpm install` — six
installs per run against a shared Actions-minutes budget, with `turbo` already
a root devDependency. Nothing tied the workflow to a local command, so an agent
could pass "lint, format, typecheck, test" locally and still fail a step the
workflow ran but the docs never named. The `pull_request` trigger also carried
`branches: ["*"]`, which only matches base branches without a `/`.

## Decision

1. **One Node job.** `ci.yml` runs a single `ci` job: one checkout, one
   cached install via `tooling/github/setup`, `cp .env.example .env`, then
   the eleven check scripts as named steps in this order:
   `ai:contracts:check`, `skills:check`, `docker:check`, `design:lint`,
   `design:tokens`, `ui:composition`, `lint:ws`, `typecheck`, `lint`,
   `format`, `test`. Steps after the first carry `if: success() || failure()`
   so one run surfaces every problem while the job stays red.
   `timeout-minutes: 20` caps runaway usage; `workflow_dispatch` allows a
   manual run; `pull_request` drops the branch filter. The Docker matrix stays
   a separate job because it needs buildx, not the Node toolchain.
2. **Setup action trimmed.** `actions/setup-node` uses `cache: pnpm`;
   `pnpm add -g turbo` is removed; install is `--frozen-lockfile`.
3. **Root `pnpm run ci` script.** `package.json` gains `ci` — the same eleven
   steps in the same order, stopping on the first failure. Invoke it as
   `pnpm run ci`: pnpm reserves bare `pnpm ci` as a built-in and exits with
   `ERR_PNPM_CI_NOT_IMPLEMENTED`. It is the local merge gate recorded in
   `.github/PULL_REQUEST_TEMPLATE.md`, `.ai/skills/pr-description.md`, and
   `.ai/skills/debug-failure.md`. No git hook enforces it.
4. **Keep them in sync.** Any step added to or removed from the workflow must
   be mirrored in the `ci` script, and vice versa.

## Consequences

### Positive

- One install per run instead of six; the pnpm store is cached between runs.
- Every check is visible as its own step with the same name and command an
  agent runs locally, so a red step maps directly to a `pnpm` script.
- The repository has a working merge gate that does not depend on Actions
  availability.

### Negative

- Checks run sequentially in one job; wall-clock time per run is longer than
  six parallel jobs. Accepted: minutes are the scarce resource, not latency,
  and Turbo caching keeps repeated `^build` work cheap.
- `pnpm run ci` is not enforced by tooling. Branch protection with a required
  `ci` check remains the durable gate.

## References

- `.github/workflows/ci.yml`
- `tooling/github/setup/action.yml`
- `package.json` (`ci` script)
- `.ai/skills/pr-description.md`, `.ai/skills/debug-failure.md`
