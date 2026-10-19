/**
 * Bundles the server for the Docker image (`pnpm -F @turbo/server build`).
 *
 * Every dependency, workspace packages included, is inlined, so the runner
 * needs only `node` plus `dist/` (and the drizzle migrations folder) — no
 * node_modules, pnpm, tsx, or drizzle-kit. Local dev keeps running from
 * `src/` with tsx; nothing imports dist/.
 *
 * If a dependency cannot be bundled (native addon, or it reads its own files
 * at runtime), add it to `external` and install just that package in the
 * runner stage of apps/server/Dockerfile.
 */
import { rm } from "node:fs/promises";
import { build } from "esbuild";

await rm("dist", { recursive: true, force: true });

await build({
  entryPoints: ["src/index.ts", "src/migrate.ts"],
  outdir: "dist",
  outExtension: { ".js": ".mjs" },
  bundle: true,
  splitting: true,
  platform: "node",
  format: "esm",
  target: "node22",
  jsx: "automatic",
  // File/line mappings only: stack traces point at src/ without shipping it.
  sourcemap: true,
  sourcesContent: false,
  legalComments: "none",
  external: [],
  // Bundled CommonJS dependencies still call require() for Node built-ins.
  banner: {
    js: 'import { createRequire as __createRequire } from "node:module"; const require = __createRequire(import.meta.url);',
  },
  logLevel: "info",
});
