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
  `typecheck`/`lint` and editors read through `types` in `package.json`.

## Startup cost of `dependsOn: ["^dev"]`

Because `dev` is `cache: false` and the apps depend on `^dev`, every `pnpm dev`
runs the nine package `tsc` passes before `next dev` / `tsx watch` start —
roughly ten to twenty seconds cold. The apps do not need that output at
runtime (their imports resolve to `src/`); it keeps `dist/` declarations fresh
for editors and per-package checks. Dropping `^dev` from the app-level
`turbo.json` overrides would start the apps immediately at the cost of stale
declarations until the first `turbo watch` re-run; that trade-off is open, not
decided.

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
