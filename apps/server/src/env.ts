import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

import { authEnv } from "@turbo/auth/env";
import { shouldSkipEnvValidation } from "@turbo/shared/env";

/** Accepts a non-empty string OR an empty string (treated as unset). */
const optionalString = z
  .string()
  .transform((value) => (value === "" ? undefined : value))
  .optional();

/** Accepts a URL OR an empty string (treated as unset). */
const optionalUrl = z
  .union([z.literal(""), z.url()])
  .transform((value) => (value === "" ? undefined : value))
  .optional();

export const env = createEnv({
  extends: [authEnv()],
  server: {
    SERVER_PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    SERVER_URL: z.url().default("http://localhost:3001"),
    APP_URL: z.url().default("http://localhost:3000"),
    POSTGRES_URL: z.url(),
    /** Enables the pg-boss queue; the jobs worker (`src/worker.ts`) requires it. */
    JOBS_POSTGRES_URL: optionalUrl,
    RESEND_API_KEY: optionalString,
  },
  runtimeEnv: {
    ...process.env,
    SERVER_PORT: process.env.SERVER_PORT ?? process.env.PORT,
  },
  skipValidation: shouldSkipEnvValidation(),
});
