import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { shouldSkipEnvValidation } from "@turbo/shared/env";

import * as schema from "./schema";

const connectionString = process.env.POSTGRES_URL;

if (!connectionString && !shouldSkipEnvValidation()) {
  throw new Error("Missing POSTGRES_URL");
}

const globalForDb = globalThis as typeof globalThis & {
  __turboDbClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.__turboDbClient ??
  postgres(
    connectionString ?? "postgres://postgres:postgres@localhost:5432/postgres",
    {
      prepare: false,
    },
  );

if (process.env.NODE_ENV !== "production") {
  globalForDb.__turboDbClient = client;
}

export const db = drizzle({
  client,
  schema,
  casing: "snake_case",
});
