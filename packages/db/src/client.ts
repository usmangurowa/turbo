import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const connectionString = process.env.POSTGRES_URL;
const skipEnvValidation = !!process.env.SKIP_ENV_VALIDATION;

if (!connectionString && !skipEnvValidation) {
  throw new Error("Missing POSTGRES_URL");
}

const client = postgres(
  connectionString ?? "postgres://postgres:postgres@localhost:5432/postgres",
  {
    prepare: false,
  },
);

export const db = drizzle({
  client,
  schema,
  casing: "snake_case",
});
