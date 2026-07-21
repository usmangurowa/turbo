import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

import { authEnv } from "@turbo/auth/env";
import { shouldSkipEnvValidation } from "@turbo/shared/env";

const optionalString = z
  .string()
  .transform((value) => (value === "" ? undefined : value))
  .pipe(z.string().min(1).optional());

export const env = createEnv({
  extends: [authEnv()],
  server: {
    SERVER_PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    SERVER_URL: z.url().default("http://localhost:3001"),
    APP_URL: z.url().default("http://localhost:3000"),
    POSTGRES_URL: z.url(),
    RESEND_API_KEY: optionalString,
  },
  runtimeEnv: {
    ...process.env,
    SERVER_PORT: process.env.SERVER_PORT ?? process.env.PORT,
  },
  skipValidation: shouldSkipEnvValidation(),
});
