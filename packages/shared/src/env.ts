/**
 * Whether strict env validation should be skipped for the current process.
 *
 * True in CI, when SKIP_ENV_VALIDATION is set, and during `lint`/`build`
 * lifecycle scripts — builds must succeed without runtime secrets; missing
 * vars then fail fast at boot (see migrate-on-boot in apps/server).
 */
export const shouldSkipEnvValidation = (
  env: Record<string, string | undefined> = process.env,
): boolean =>
  !!env.CI ||
  !!env.SKIP_ENV_VALIDATION ||
  env.npm_lifecycle_event === "lint" ||
  env.npm_lifecycle_event === "build";
