import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  formatTable,
  fromRoot,
  markdownList,
  readJson,
  walkFiles,
  writeGenerated,
} from "./_lib.mjs";

const strict = process.argv.includes("--strict");

const unique = (items) => [...new Set(items)].sort();

const extractEnvExampleNames = (content) =>
  unique(
    content
      .split("\n")
      .map((line) => line.match(/^([A-Z][A-Z0-9_]*)=/)?.[1])
      .filter(Boolean),
  );

const extractEnvModuleNames = (content) =>
  unique(
    [
      ...content.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g),
      ...content.matchAll(/\b([A-Z][A-Z0-9_]*)\s*:/g),
    ].map((match) => match[1]),
  );

const turbo = await readJson("turbo.json");
const turboEnv = unique(turbo.globalEnv ?? []);
const passThroughEnv = unique(turbo.globalPassThroughEnv ?? []);
const envExampleContent = await readFile(fromRoot(".env.example"), "utf8");
const envExample = extractEnvExampleNames(envExampleContent);
const envFiles = [
  ...(await walkFiles("apps", (file) => file.endsWith("env.ts"))),
  ...(await walkFiles("packages", (file) => file.endsWith("env.ts"))),
];

const envModuleRows = [];
const envModuleNames = [];

for (const file of envFiles) {
  const content = (await readFile(fromRoot(file), "utf8"))
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");
  const names = extractEnvModuleNames(content);
  envModuleNames.push(...names);
  envModuleRows.push([
    file,
    names.map((name) => `\`${name}\``).join(", ") || "None",
  ]);
}

const allModuleNames = unique(envModuleNames);
const missingFromExample = turboEnv.filter(
  (name) => !envExample.includes(name),
);
const extraInExample = envExample.filter((name) => !turboEnv.includes(name));
const validatedButNotExample = allModuleNames.filter(
  (name) => !envExample.includes(name) && !passThroughEnv.includes(name),
);

await writeGenerated(
  ".ai/contracts/env.generated.md",
  "Environment Contract Snapshot",
  [
    "## turbo.json globalEnv",
    "",
    markdownList(turboEnv),
    "",
    "## .env.example variables",
    "",
    markdownList(envExample),
    "",
    "## Env validation modules",
    "",
    formatTable(["File", "Variables"], envModuleRows),
    "",
    "## Drift Report",
    "",
    "### In turbo.json but missing from .env.example",
    "",
    markdownList(missingFromExample),
    "",
    "### In .env.example but missing from turbo.json globalEnv",
    "",
    markdownList(extraInExample),
    "",
    "### Validated in env modules but missing from .env.example",
    "",
    markdownList(validatedButNotExample),
  ].join("\n"),
);

const hasDrift =
  missingFromExample.length > 0 ||
  extraInExample.length > 0 ||
  validatedButNotExample.length > 0;

console.log(
  `Wrote ${path.relative(process.cwd(), fromRoot(".ai/contracts/env.generated.md"))}`,
);

if (hasDrift) {
  console.log(
    "Environment contract drift detected. Use --strict to fail on drift.",
  );
}

if (strict && hasDrift) {
  process.exit(1);
}
