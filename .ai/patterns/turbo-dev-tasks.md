# Pattern: Turbo Dev Tasks

## Never use watch-mode commands in non-persistent `dev` tasks

The root `turbo.json` defines `dev` with `dependsOn: ["^dev"]` and
`persistent: false`. Only apps (`apps/web`, `apps/server`, `apps/mobile`)
override `persistent: true`. Any package whose `dev` script never exits
(`tsc --watch`, `npx trigger.dev dev`) blocks every dependent task forever —
the apps never start under `turbo watch dev`.

Rules:

- Package `dev` scripts must be one-shot (`tsc`, not `tsc --watch`).
  `turbo watch dev` re-runs them on file change, so watch mode is redundant.
- Long-running package dev processes run under a separate script name:
  `@turbo/jobs` keeps its trigger.dev loop on `dev:trigger`
  (`pnpm -F @turbo/jobs dev:trigger`, needs `TRIGGER_SECRET_KEY`).
- `@turbo/mobile` marks `dev` as `interactive`, which `turbo watch` cannot
  host — root `dev` and `dev:infisical` exclude it (`-F "!@turbo/mobile"`).
  Use `pnpm dev:mobile` in its own terminal.
- Web works without built package `dist/` at all (Next `transpilePackages`);
  the one-shot `tsc` exists only for declaration output that per-package
  `typecheck`/`lint` read through `types` in `package.json`.

## Optional env vars with empty-string tolerance

Use the pattern from `packages/auth/env.ts`:

```ts
const optionalString = z
  .string()
  .transform((val) => (val === "" ? undefined : val))
  .optional(); // required: without it, undefined is rejected by z.string()
```

Do not write `z.string().transform(...).pipe(z.string().optional())` — the
outer `z.string()` runs first and rejects `undefined`, making the var
effectively required (this crashes `apps/server` on boot when the var is
unset).

## Remote Postgres on slow links: Happy Eyeballs timeout

Node 20+ races IPv6/IPv4 connection attempts with a 250ms per-attempt
timeout (`autoSelectFamilyAttemptTimeout`). On links where the SYN
round-trip to a remote Postgres exceeds that, **every** connect fails with
`AggregateError [ETIMEDOUT]` even though the host is reachable (`nc`
succeeds because it does not race).

- Raise the default with `net.setDefaultAutoSelectFamilyAttemptTimeout(3000)`
  in the shared client module if a deployment hits this.
- Standalone scripts (`drizzle-kit`) need
  `NODE_OPTIONS="--network-family-autoselection-attempt-timeout=3000"`.
  `drizzle-kit migrate`/`push` swallow connection errors and exit 1 with no
  message — suspect this timeout first.
