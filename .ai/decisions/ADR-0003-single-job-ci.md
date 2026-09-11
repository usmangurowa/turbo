# ADR-0003: CI is one job, mirrored by a root `pnpm run ci` script

## Status

Accepted (2026-09-11). The layout was first adopted in `usmangurowa/silo` for
that repository's own reasons; this record states why it is right for the
template as well.

## Context

`.github/workflows/ci.yml` ran seven jobs: six Node jobs (AI contracts, design
governance, lint, format, typecheck, test) plus a Docker matrix. Each Node job
did its own checkout, an un-cached `pnpm install`, and `pnpm add -g turbo` even
though `turbo` is a root devDependency. Nothing tied the workflow to a local
command, so an agent could pass "lint, format, typecheck, test" locally and
still fail a step the workflow ran but no document named. The `pull_request`
trigger carried `branches: ["*"]`, which only matches base branches without a
`/`.

This is a public template repository, so GitHub-hosted runner minutes are not
the constraint (they are free for public repositories on standard runners). The
costs that matter here are contributor wall-clock time, review clarity, and
having one local command that is the merge gate.

## Decision

1. **One Node job.** `ci.yml` runs a single `ci` job: one checkout, one cached
   install via `tooling/github/setup`, `cp .env.example .env`, then the eleven
   check scripts as named steps in this order: `ai:contracts:check`,
   `skills:check`, `docker:check`, `design:lint`, `design:tokens`,
   `ui:composition`, `lint:ws`, `typecheck`, `lint`, `format`, `test`. Once
   Setup succeeds, later steps run even after an earlier check fails
   (`if: !cancelled() && steps.setup.outcome == 'success'`) so one run
   surfaces every problem while the job stays red; a failed install skips them
   all instead of producing eleven misleading reds. `timeout-minutes: 20` (the
   job measured under 3 minutes) caps a hung step; `workflow_dispatch` allows
   a manual run; `pull_request` drops the branch filter.
2. **Docker stays a separate, parallel job** with `timeout-minutes: 30`. It
   needs buildx rather than the Node toolchain, its images are the long pole
   (the server image measured ~8 minutes), and running it in parallel keeps
   total wall-clock time at the Docker build, not the Docker build plus the
   Node checks.
3. **Setup action trimmed.** `actions/setup-node` uses `cache: pnpm` so the
   store persists between runs; `pnpm add -g turbo` is removed; install is
   `--frozen-lockfile`.
4. **Root `pnpm run ci` script.** `package.json` gains `ci` — the same eleven
   steps in the same order, stopping on the first failure. Invoke it as
   `pnpm run ci`: pnpm reserves bare `pnpm ci` as a built-in and exits with
   `ERR_PNPM_CI_NOT_IMPLEMENTED`. It is the local merge gate recorded in
   `.github/PULL_REQUEST_TEMPLATE.md`, `.ai/skills/pr-description.md`, and
   `.ai/skills/debug-failure.md`. No git hook enforces it.
5. **Keep them in sync.** Any step added to or removed from the workflow must
   be mirrored in the `ci` script, and vice versa.

## Consequences

### Positive

- One install per run instead of six, with the pnpm store cached; a green run
  takes about three minutes.
- Every check is visible as its own step with the same name and command an
  agent runs locally, so a red step maps directly to a `pnpm` script.
- A single `ci` status (plus `docker`) is what branch protection should
  require once it is configured — one check to name instead of six.
- The repository has a local merge gate that does not depend on Actions.

### Negative

- Checks run sequentially in one job, so a contributor waits for the slowest
  chain rather than the slowest job. Accepted: the measured chain is under
  three minutes, shorter than the parallel Docker job it runs beside, and
  Turbo caching keeps repeated `^build` work cheap.
- `pnpm run ci` is not enforced by tooling, and `main` currently has no branch
  protection or rulesets, so nothing blocks a red merge today. Enabling
  protection that requires `ci` and `docker` is the durable gate and is the
  recommended follow-up.

## References

- `.github/workflows/ci.yml`
- `tooling/github/setup/action.yml`
- `package.json` (`ci` script)
- `.ai/skills/pr-description.md`, `.ai/skills/debug-failure.md`
