import { readFile } from "node:fs/promises";
import path from "node:path";

import {
  collectValidatedVariables,
  extractEnvExampleGroups,
  extractEnvExampleNames,
  isPublicVariable,
  RUNTIME_ORDER,
  sortRuntimes,
  unique,
} from "./_env.mjs";
import {
  formatTable,
  fromRoot,
  markdownList,
  readJson,
  walkFiles,
  writeGenerated,
} from "./_lib.mjs";

const strict = process.argv.includes("--strict");

const extractEnvModuleNames = (content) =>
  unique(
    [
      ...content.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g),
      ...content.matchAll(/\b([A-Z][A-Z0-9_]*)\s*:/g),
    ].map((match) => match[1]),
  );

/** Packages/apps that read `process.env.NAME` directly (outside env modules). */
const collectDirectReaders = async (names) => {
  const files = [
    ...(await walkFiles("apps", (file) => /\.(ts|tsx|mjs|js)$/.test(file))),
    ...(await walkFiles("packages", (file) => /\.(ts|tsx|mjs|js)$/.test(file))),
  ].filter(
    (file) =>
      !file.endsWith("env.ts") &&
      !file.includes("__tests__") &&
      !file.endsWith(".test.ts") &&
      !file.endsWith(".d.ts"),
  );
  const readers = new Map(names.map((name) => [name, new Set()]));
  for (const file of files) {
    const content = await readFile(fromRoot(file), "utf8");
    for (const match of content.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g)) {
      const owner = file.split(path.sep).slice(0, 2).join("/");
      readers.get(match[1])?.add(owner);
    }
  }
  return readers;
};

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

const validated = await collectValidatedVariables();
const directReaders = await collectDirectReaders(envExample);
const groups = extractEnvExampleGroups(envExampleContent);

const contractRows = envExample.map((name) => {
  const entry = validated.get(name);
  const readers = [...(directReaders.get(name) ?? [])].sort();
  if (entry) {
    return [
      `\`${name}\``,
      entry.required ? "**required**" : "optional",
      sortRuntimes(entry.runtimes).join(", "),
      entry.exposure,
      [...entry.notes].join("; "),
    ];
  }
  return [
    `\`${name}\``,
    "optional",
    readers.length > 0
      ? readers.map((reader) => `\`${reader}\``).join(", ")
      : "—",
    isPublicVariable(name) ? "public" : "server",
    readers.length > 0
      ? "read directly; unset disables the feature"
      : "not read by any module or package",
  ];
});

const requiredByRuntime = RUNTIME_ORDER.map((runtime) => [
  runtime,
  [...validated.entries()]
    .filter(([, entry]) => entry.required && entry.runtimes.has(runtime))
    .map(([name]) => `\`${name}\``)
    .sort()
    .join(", ") || "None",
]);

/** Variables EAS sets per build profile; they never live in .env.example. */
const easProfileEnv = await readJson("apps/mobile/eas.json")
  .then((eas) =>
    unique(
      Object.values(eas.build ?? {}).flatMap((profile) =>
        Object.keys(profile.env ?? {}),
      ),
    ),
  )
  .catch(() => []);

const validatedNotInExample = [...validated.keys()]
  .filter(
    (name) =>
      !envExample.includes(name) &&
      !passThroughEnv.includes(name) &&
      !easProfileEnv.includes(name),
  )
  .sort();

const infisicalConfig = await readJson(".infisical.json").catch(() => null);

const groupedByHeading = [...groups.entries()].reduce(
  (acc, [name, heading]) => {
    (acc[heading] ??= []).push(name);
    return acc;
  },
  {},
);

await writeGenerated(
  ".ai/contracts/env.generated.md",
  "Environment Contract Snapshot",
  [
    "## Variable contract",
    "",
    "Every variable in `.env.example`, classified from the zod schemas in the",
    "env modules (`apps/*/src/env.ts`, `packages/auth/env.ts`) and the mobile",
    "type declarations. **required** means the process refuses to boot without",
    "it (validation is skipped only under `SKIP_ENV_VALIDATION`, `CI`, `lint`,",
    "and `build` — see `packages/shared/src/env.ts`). Variables with no env",
    "module entry are read straight from `process.env` by the listed packages",
    "and are optional by construction: unset means the feature is off.",
    "",
    formatTable(
      ["Variable", "Required", "Runtime / reader", "Exposure", "Notes"],
      contractRows,
    ),
    "",
    "### Required per runtime",
    "",
    "The minimum a deployment of each process needs. Everything else in the",
    "table above is optional for that process.",
    "",
    formatTable(["Runtime", "Required variables"], requiredByRuntime),
    "",
    easProfileEnv.length > 0
      ? [
          "Mobile build identity is set per EAS profile in `apps/mobile/eas.json`,",
          `not in \`.env\`: ${easProfileEnv.map((name) => `\`${name}\``).join(", ")}.`,
          "",
        ].join("\n")
      : "",
    "### Groups (from .env.example)",
    "",
    Object.entries(groupedByHeading)
      .map(
        ([heading, names]) =>
          `- **${heading}** — ${names.map((n) => `\`${n}\``).join(", ")}`,
      )
      .join("\n"),
    "",
    "## Infisical",
    "",
    infisicalConfig?.workspaceId
      ? [
          `Project: \`${infisicalConfig.workspaceId}\` (from \`.infisical.json\`),`,
          `default environment \`${infisicalConfig.defaultEnvironment ?? "dev"}\`.`,
          "Each Infisical environment should hold the required variables for the",
          "runtimes it serves (table above) plus whichever optional features that",
          "environment enables. `pnpm with-secrets <cmd>` and the Docker images",
          "inject them at boot (`scripts/infisical-run.sh`).",
        ].join("\n")
      : [
          "No `.infisical.json` in the repository: this checkout is not linked to",
          "an Infisical project. Run `pnpm exec infisical init` and commit the file",
          "(it holds only the project id). Until then `pnpm with-secrets` and the",
          "Docker images run on `.env` / platform variables alone.",
        ].join("\n"),
    "",
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
    "",
    "### Declared in a schema but missing from .env.example",
    "",
    markdownList(validatedNotInExample),
  ].join("\n"),
);

const hasDrift =
  missingFromExample.length > 0 ||
  extraInExample.length > 0 ||
  validatedButNotExample.length > 0 ||
  validatedNotInExample.length > 0;

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
