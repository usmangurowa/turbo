import { runMigrations } from "@turbo/db/migrate";

/**
 * Apply pending migrations, then exit. The server image runs this bundled
 * (`node dist/migrate.mjs`) before the API starts, in place of
 * `pnpm db:migrate` (drizzle-kit), which the image does not ship.
 */

const connectionString = process.env.POSTGRES_URL;

if (!connectionString) {
  console.error("Missing POSTGRES_URL");
  process.exit(1);
}

await runMigrations(connectionString);

console.log("Migrations applied");
