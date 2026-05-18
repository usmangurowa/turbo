import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import {
  formatTable,
  fromRoot,
  markdownList,
  readText,
  writeGenerated,
} from "./_lib.mjs";

const methodNames = ["get", "post", "put", "patch", "delete", "options", "all"];

const joinRoute = (base, route) => {
  const joined = `${base}/${route}`.replaceAll(/\/+/g, "/");
  return joined === "/" ? "/" : joined.replace(/\/$/, "");
};

const generateApiSnapshot = async () => {
  const indexContent = await readText("packages/api/src/index.ts");
  const importMap = new Map();
  const routeRows = [];

  for (const match of indexContent.matchAll(
    /import\s+(\w+)\s+from\s+["']\.\/router\/([^"']+)["']/g,
  )) {
    importMap.set(match[1], `packages/api/src/router/${match[2]}.ts`);
  }

  for (const match of indexContent.matchAll(
    /\.route\(\s*["']([^"']+)["']\s*,\s*(\w+)\s*\)/g,
  )) {
    const [, basePath, routerName] = match;
    const routerFile = importMap.get(routerName);
    if (!routerFile) continue;

    const routerContent = await readFile(fromRoot(routerFile), "utf8");
    const usesAuth = routerContent.includes("authMiddleware");
    const methodRegex = new RegExp(
      `(?:^|[\\n\\r]\\s*)\\.(${methodNames.join("|")})\\(\\s*["']([^"']+)["']`,
      "g",
    );

    for (const routeMatch of routerContent.matchAll(methodRegex)) {
      const [, method, routePath] = routeMatch;
      routeRows.push([
        method.toUpperCase(),
        `\`${joinRoute(basePath, routePath)}\``,
        `\`${routerFile}\``,
        usesAuth ? "yes" : "no",
      ]);
    }
  }

  if (
    indexContent.includes('.get("/health"') ||
    indexContent.includes(".get('/health'")
  ) {
    routeRows.push(["GET", "`/health`", "`packages/api/src/index.ts`", "no"]);
  }

  await writeGenerated(
    ".ai/contracts/api-routes.generated.md",
    "API Routes Snapshot",
    [
      "## Routes",
      "",
      formatTable(["Method", "Path", "Source", "Auth middleware"], routeRows),
      "",
      "## Typed client source",
      "",
      "- `packages/api/src/index.ts` exports `AppType` and `hcWithType`.",
      "- Web and mobile clients should infer from `AppType` instead of hand-written route types.",
    ].join("\n"),
  );

  console.log("Wrote .ai/contracts/api-routes.generated.md");
};

const generateDbSnapshot = async () => {
  const schemaDir = fromRoot("packages/db/src");
  const entries = await readdir(schemaDir, { withFileTypes: true });
  const schemaFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith("schema.ts"))
    .map((entry) => `packages/db/src/${entry.name}`)
    .sort();
  const tableRows = [];
  const relationRows = [];

  for (const file of schemaFiles) {
    const content = await readFile(fromRoot(file), "utf8");

    for (const match of content.matchAll(
      /export\s+const\s+(\w+)\s*=\s*pgTable\(\s*["']([^"']+)["']/g,
    )) {
      tableRows.push([`\`${match[1]}\``, `\`${match[2]}\``, `\`${file}\``]);
    }

    for (const match of content.matchAll(
      /export\s+const\s+(\w+)\s*=\s*relations\(\s*(\w+)/g,
    )) {
      relationRows.push([`\`${match[1]}\``, `\`${match[2]}\``, `\`${file}\``]);
    }
  }

  await writeGenerated(
    ".ai/contracts/db-schema.generated.md",
    "Database Schema Snapshot",
    [
      "## Schema files",
      "",
      markdownList(schemaFiles),
      "",
      "## Tables",
      "",
      formatTable(["Export", "DB table", "Source"], tableRows),
      "",
      "## Relations",
      "",
      formatTable(["Export", "Table export", "Source"], relationRows),
    ].join("\n"),
  );

  console.log("Wrote .ai/contracts/db-schema.generated.md");
};

const runNodeScript = (scriptPath) => {
  const result = spawnSync(process.execPath, [fromRoot(scriptPath)], {
    cwd: fromRoot(),
    encoding: "utf8",
    stdio: "inherit",
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

await generateApiSnapshot();
await generateDbSnapshot();
runNodeScript("scripts/ai/check-env-contract.mjs");
runNodeScript("scripts/ai/package-graph.mjs");

console.log("AI contract snapshots are up to date.");
