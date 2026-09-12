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

/**
 * Which process each env module configures. A module listed for several
 * runtimes (apps/server/src/env.ts) is imported by every entrypoint named.
 * `extends: [authEnv()]` folds packages/auth/env.ts into the extending
 * module's runtimes, so those variables are not listed here twice.
 */
const ENV_MODULE_RUNTIMES = {
  "apps/server/src/env.ts": ["server", "worker"],
  "apps/web/src/env.ts": ["web"],
};

/** Mobile has no env module; its public variables are declared here. */
const MOBILE_ENV_TYPES = "apps/mobile/src/types/env.d.ts";

/** `KEY: expr,` entries inside a `server: {`, `client: {`, or `shared: {` block. */
const extractSchemaEntries = (content, blockName) => {
  const start = content.search(new RegExp(`^\\s*${blockName}:\\s*\\{`, "m"));
  if (start === -1) return [];

  let depth = 0;
  let index = content.indexOf("{", start);
  const bodyStart = index + 1;
  for (; index < content.length; index += 1) {
    if (content[index] === "{") depth += 1;
    if (content[index] === "}") depth -= 1;
    if (depth === 0) break;
  }
  const body = content.slice(bodyStart, index);

  const entries = [];
  const keyPattern = /^\s*([A-Z][A-Z0-9_]*):\s*/gm;
  let match;
  const positions = [];
  while ((match = keyPattern.exec(body)) !== null) {
    positions.push({ key: match[1], from: match.index + match[0].length });
  }
  positions.forEach((position, order) => {
    const to = positions[order + 1]?.from ?? body.length;
    const expr = body
      .slice(position.from, to)
      .replace(/^\s*[A-Z][A-Z0-9_]*:\s*$/m, "")
      .replace(/,\s*$/, "")
      .replace(/\s+/g, " ")
      .trim();
    entries.push({ key: position.key, expr });
  });
  return entries;
};

/** Local `const optionalX = z...optional()` helpers, so entries can reference them. */
const extractOptionalHelpers = (content) =>
  new Set(
    [...content.matchAll(/const\s+([a-zA-Z]+)\s*=\s*z[\s\S]*?;\n/g)]
      .filter((match) => /\.optional\(\)/.test(match[0]))
      .map((match) => match[1]),
  );

const classifyEntry = (expr, helpers) => {
  const defaultMatch = expr.match(/\.default\(([^)]*)\)/);
  if (defaultMatch) {
    return { required: false, note: `defaults to ${defaultMatch[1].trim()}` };
  }
  const usesHelper = [...helpers].some((helper) =>
    new RegExp(`\\b${helper}\\b`).test(expr),
  );
  const ternary = expr.match(/^\w+\s*\?\s*(\w+)\s*:\s*(.+)$/);
  if (ternary) {
    // `skipStrict ? optionalX : z.string().min(1)` — optional only while
    // validation is skipped (lint, build, CI); required at runtime.
    return { required: true, note: "required at runtime" };
  }
  if (usesHelper || /\.optional\(\)/.test(expr)) {
    const emptyOk = usesHelper ? "; empty string counts as unset" : "";
    return { required: false, note: `optional${emptyOk}` };
  }
  return { required: true, note: "required" };
};

const collectValidatedVariables = async () => {
  const variables = new Map();
  const record = (name, runtimes, required, note, source, exposure) => {
    const existing = variables.get(name) ?? {
      runtimes: new Set(),
      required: false,
      notes: new Set(),
      sources: new Set(),
      exposure,
    };
    runtimes.forEach((runtime) => existing.runtimes.add(runtime));
    existing.required = existing.required || required;
    existing.notes.add(note);
    existing.sources.add(source);
    variables.set(name, existing);
  };

  const authContent = await readFile(fromRoot("packages/auth/env.ts"), "utf8");
  const authHelpers = extractOptionalHelpers(authContent);
  const authEntries = extractSchemaEntries(authContent, "server");

  for (const [file, runtimes] of Object.entries(ENV_MODULE_RUNTIMES)) {
    const content = await readFile(fromRoot(file), "utf8");
    const helpers = extractOptionalHelpers(content);
    for (const block of ["server", "shared"]) {
      for (const { key, expr } of extractSchemaEntries(content, block)) {
        const { required, note } = classifyEntry(expr, helpers);
        record(key, runtimes, required, note, file, "server");
      }
    }
    for (const { key, expr } of extractSchemaEntries(content, "client")) {
      const { required, note } = classifyEntry(expr, helpers);
      record(key, runtimes, required, note, file, "public (client bundle)");
    }
    if (/extends:\s*\[[^\]]*authEnv\(\)/.test(content)) {
      for (const { key, expr } of authEntries) {
        const { required, note } = classifyEntry(expr, authHelpers);
        record(key, runtimes, required, note, "packages/auth/env.ts", "server");
      }
    }
  }

  try {
    const mobileTypes = await readFile(fromRoot(MOBILE_ENV_TYPES), "utf8");
    for (const match of mobileTypes.matchAll(
      /readonly\s+(EXPO_PUBLIC_[A-Z0-9_]+)(\??):/g,
    )) {
      record(
        match[1],
        ["mobile"],
        match[2] !== "?",
        match[2] === "?" ? "optional" : "required",
        MOBILE_ENV_TYPES,
        "public (app bundle)",
      );
    }
  } catch {
    // Mobile env declarations are optional for this report.
  }

  return variables;
};

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

/** The `# Section` comment that heads each group in .env.example. */
const extractEnvExampleGroups = (content) => {
  const groups = new Map();
  let heading = "";
  let previousBlank = true;
  for (const line of content.split("\n")) {
    const comment = line.match(/^#\s*([^#].*)$/);
    const name = line.match(/^([A-Z][A-Z0-9_]*)=/)?.[1];
    // The first comment line after a blank line starts a new group; later
    // comment lines in the same run are descriptions, not headings.
    if (comment && !name && previousBlank) heading = comment[1].trim();
    if (name) groups.set(name, heading);
    previousBlank = line.trim() === "";
  }
  return groups;
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

const RUNTIME_ORDER = ["web", "server", "worker", "mobile"];
const sortRuntimes = (runtimes) =>
  [...runtimes].sort(
    (left, right) => RUNTIME_ORDER.indexOf(left) - RUNTIME_ORDER.indexOf(right),
  );

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
    name.startsWith("NEXT_PUBLIC_") || name.startsWith("EXPO_PUBLIC_")
      ? "public"
      : "server",
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
