import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

export const fromRoot = (...segments) => path.join(repoRoot, ...segments);

export const readText = async (...segments) =>
  readFile(fromRoot(...segments), "utf8");

export const readJson = async (...segments) =>
  JSON.parse(await readText(...segments));

export const ensureDir = async (...segments) => {
  await mkdir(fromRoot(...segments), { recursive: true });
};

export const writeGenerated = async (relativePath, title, body) => {
  const outputPath = fromRoot(relativePath);

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(
    outputPath,
    [
      `# ${title}`,
      "",
      "> Generated file. Do not edit by hand.",
      "> Run `pnpm ai:contracts` to refresh all contract snapshots.",
      "",
      body.trim(),
      "",
    ].join("\n"),
  );
};

export const listDirectories = async (...segments) => {
  const absolutePath = fromRoot(...segments);
  const entries = await readdir(absolutePath, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(...segments, entry.name))
    .sort();
};

export const listWorkspacePackageDirs = async () => {
  const dirs = ["apps/web", "apps/mobile"];

  for (const base of ["packages", "tooling"]) {
    dirs.push(...(await listDirectories(base)));
  }

  return dirs;
};

export const readWorkspacePackages = async () => {
  const dirs = await listWorkspacePackageDirs();
  const packages = [];

  for (const dir of dirs) {
    try {
      const manifest = await readJson(dir, "package.json");
      packages.push({ dir, manifest });
    } catch {
      // Ignore workspace directories without a package manifest.
    }
  }

  return packages.sort((left, right) => left.dir.localeCompare(right.dir));
};

export const walkFiles = async (relativeDir, predicate) => {
  const results = [];

  const walk = async (dir) => {
    const entries = await readdir(fromRoot(dir), { withFileTypes: true });

    for (const entry of entries) {
      const child = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (
          ["node_modules", ".next", ".turbo", "dist", "build"].includes(
            entry.name,
          )
        ) {
          continue;
        }
        await walk(child);
        continue;
      }

      if (!predicate || predicate(child)) {
        results.push(child);
      }
    }
  };

  await walk(relativeDir);
  return results.sort();
};

export const markdownList = (items) => {
  if (items.length === 0) return "- None";
  return items.map((item) => `- \`${item}\``).join("\n");
};

export const formatTable = (headers, rows) => {
  const header = `| ${headers.join(" | ")} |`;
  const divider = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.join(" | ")} |`).join("\n");

  return [
    header,
    divider,
    body || `| ${headers.map(() => "").join(" | ")} |`,
  ].join("\n");
};
