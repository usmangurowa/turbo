import { readdir, realpath, stat } from "node:fs/promises";
import path from "node:path";

import { formatTable, fromRoot } from "./_lib.mjs";

// `--strict` is accepted for symmetry with the sibling scripts (see
// check-env-contract.mjs), but this check has no advisory mode: any mirror
// drift fails the run with or without the flag.
const strict = process.argv.includes("--strict");

// Full mirrors must contain every canonical skill; subset mirrors are
// intentionally partial and only need their entries to be valid.
const FULL_MIRRORS = [".claude/skills", ".github/skills"];
const SUBSET_MIRRORS = [".cursor/skills", ".codex/skills", ".gemini/skills"];

const canonicalDir = ".agents/skills";
const canonicalRoot = await realpath(fromRoot(canonicalDir));

const readCanonicalSkills = async () => {
  const entries = await readdir(canonicalRoot, { withFileTypes: true });
  const names = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    try {
      await stat(path.join(canonicalRoot, entry.name, "SKILL.md"));
      names.push(entry.name);
    } catch {
      // Directories without a SKILL.md are not canonical skills.
    }
  }

  return names.sort();
};

const isInsideCanonicalRoot = (resolvedPath) => {
  const relative = path.relative(canonicalRoot, resolvedPath);

  return (
    relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative)
  );
};

const checkMirror = async (mirrorDir, canonicalSkills, { full }) => {
  const mirrorRoot = fromRoot(mirrorDir);
  let dirents;

  try {
    dirents = await readdir(mirrorRoot, { withFileTypes: true });
  } catch {
    // Missing mirror directories are skipped silently.
    return null;
  }

  const seen = [];
  const dangling = [];
  const unknown = [];

  for (const dirent of dirents) {
    // Only directories and symlinks-to-directories count as skill entries;
    // plain files such as .DS_Store are ignored.
    if (dirent.isFile()) continue;

    const entryPath = path.join(mirrorRoot, dirent.name);
    let resolved;

    try {
      resolved = await realpath(entryPath);
    } catch {
      seen.push(dirent.name);
      dangling.push(dirent.name);
      continue;
    }

    const stats = await stat(resolved);
    if (!stats.isDirectory()) continue;

    seen.push(dirent.name);

    if (
      !canonicalSkills.includes(dirent.name) ||
      !isInsideCanonicalRoot(resolved)
    ) {
      unknown.push(dirent.name);
    }
  }

  const missing = full
    ? canonicalSkills.filter((name) => !seen.includes(name))
    : [];

  return {
    dir: mirrorDir,
    entries: seen.length,
    missing: missing.sort(),
    dangling: dangling.sort(),
    unknown: unknown.sort(),
  };
};

const canonicalSkills = await readCanonicalSkills();
const reports = [];

for (const [mirrors, options] of [
  [FULL_MIRRORS, { full: true }],
  [SUBSET_MIRRORS, { full: false }],
]) {
  for (const mirrorDir of mirrors) {
    const report = await checkMirror(mirrorDir, canonicalSkills, options);
    if (report) reports.push(report);
  }
}

console.log(`Canonical skills in ${canonicalDir}: ${canonicalSkills.length}`);
console.log("");
console.log(
  formatTable(
    ["Mirror", "Entries", "Missing", "Dangling", "Unknown"],
    reports.map((report) => [
      report.dir,
      String(report.entries),
      String(report.missing.length),
      String(report.dangling.length),
      String(report.unknown.length),
    ]),
  ),
);

const problems = reports.flatMap((report) => [
  ...report.missing.map((name) => `${report.dir}: missing \`${name}\``),
  ...report.dangling.map(
    (name) => `${report.dir}: dangling symlink \`${name}\``,
  ),
  ...report.unknown.map((name) => `${report.dir}: unknown entry \`${name}\``),
]);

if (problems.length > 0) {
  console.log("");
  console.log("Skills bundle drift detected:");
  for (const problem of problems) {
    console.log(`- ${problem}`);
  }
  process.exit(1);
}

console.log("");
console.log(`All skill mirrors are in sync${strict ? " (strict)" : ""}.`);
