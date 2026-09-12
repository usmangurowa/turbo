import { readFile } from "node:fs/promises";

import { fromRoot, readJson } from "./_lib.mjs";

/**
 * Env-contract parsing shared by check-env-contract.mjs (which writes
 * .ai/contracts/env.generated.md) and check-infisical-env.mjs (which compares
 * that contract against a live Infisical environment).
 */

export const unique = (items) => [...new Set(items)].sort();

export const extractEnvExampleNames = (content) =>
  unique(
    content
      .split("\n")
      .map((line) => line.match(/^([A-Z][A-Z0-9_]*)=/)?.[1])
      .filter(Boolean),
  );

/** The `# Section` comment that heads each group in .env.example. */
export const extractEnvExampleGroups = (content) => {
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

/**
 * Which process each env module configures. A module listed for several
 * runtimes (apps/server/src/env.ts) is imported by every entrypoint named.
 * `extends: [authEnv()]` folds packages/auth/env.ts into the extending
 * module's runtimes, so those variables are not listed here twice.
 */
export const ENV_MODULE_RUNTIMES = {
  "apps/server/src/env.ts": ["server", "worker"],
  "apps/web/src/env.ts": ["web"],
};

/** Mobile has no env module; its public variables are declared here. */
export const MOBILE_ENV_TYPES = "apps/mobile/src/types/env.d.ts";

export const RUNTIME_ORDER = ["web", "server", "worker", "mobile"];

export const sortRuntimes = (runtimes) =>
  [...runtimes].sort(
    (left, right) => RUNTIME_ORDER.indexOf(left) - RUNTIME_ORDER.indexOf(right),
  );

/** `KEY: expr,` entries inside a `server: {`, `client: {`, or `shared: {` block. */
export const extractSchemaEntries = (content, blockName) => {
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
export const extractOptionalHelpers = (content) =>
  new Set(
    [...content.matchAll(/const\s+([a-zA-Z]+)\s*=\s*z[\s\S]*?;\n/g)]
      .filter((match) => /\.optional\(\)/.test(match[0]))
      .map((match) => match[1]),
  );

export const classifyEntry = (expr, helpers) => {
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

/**
 * Every variable declared in an env module or the mobile type declarations,
 * keyed by name: `{ runtimes, required, notes, sources, exposure }`.
 */
export const collectValidatedVariables = async () => {
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

export const isPublicVariable = (name) =>
  name.startsWith("NEXT_PUBLIC_") || name.startsWith("EXPO_PUBLIC_");

/**
 * The repo's env contract in one object: what .env.example declares (with
 * its `# Group` headings), what turbo.json passes through, and how the zod
 * schemas classify each variable.
 */
export const loadEnvContract = async () => {
  const turbo = await readJson("turbo.json");
  const envExampleContent = await readFile(fromRoot(".env.example"), "utf8");

  return {
    envExample: extractEnvExampleNames(envExampleContent),
    groups: extractEnvExampleGroups(envExampleContent),
    turboEnv: unique(turbo.globalEnv ?? []),
    passThroughEnv: unique(turbo.globalPassThroughEnv ?? []),
    validated: await collectValidatedVariables(),
    infisicalConfig: await readJson(".infisical.json").catch(() => null),
  };
};
