import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const [command, ...args] = process.argv.slice(2);

if (!command) {
  console.error("Missing drizzle-kit command");
  process.exit(1);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(scriptDir, "..");
const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const forwardedArgs = args[0] === "--" ? args.slice(1) : args;
const drizzleArgs =
  process.env.POSTGRES_URL && process.env.TURBO_DB_SKIP_DOTENV === "1"
    ? ["drizzle-kit", command, ...forwardedArgs]
    : ["with-env", "drizzle-kit", command, ...forwardedArgs];

const result = spawnSync(pnpmCommand, drizzleArgs, {
  cwd: packageDir,
  stdio: "inherit",
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
