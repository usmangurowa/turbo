import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

/**
 * Programmatic equivalent of `drizzle-kit migrate` with drizzle.config.ts:
 * same `drizzle/` folder and drizzle-kit's default bookkeeping table
 * (`drizzle.__drizzle_migrations`), so databases migrated by either path
 * stay in sync. Used by the server image, which ships neither drizzle-kit
 * nor pnpm.
 *
 * The folder resolves relative to this module: `packages/db/drizzle` from
 * source, and `<bundle dir>/../drizzle` once bundled (the server image puts
 * the bundle in /app/dist and the migrations in /app/drizzle).
 */
export const migrationsConfig = {
  migrationsFolder: fileURLToPath(new URL("../drizzle", import.meta.url)),
  migrationsTable: "__drizzle_migrations",
  migrationsSchema: "drizzle",
};

export const runMigrations = async (connectionString: string) => {
  // Mirror drizzle.config.ts: migrate over the non-pooling port.
  const client = postgres(connectionString.replace(":6543", ":5432"), {
    max: 1,
    onnotice: () => undefined,
  });

  try {
    await migrate(drizzle({ client }), migrationsConfig);
  } finally {
    await client.end();
  }
};
