import {
  formatTable,
  markdownList,
  readWorkspacePackages,
  writeGenerated,
} from "./_lib.mjs";

const packages = await readWorkspacePackages();
const workspaceNames = new Set(packages.map(({ manifest }) => manifest.name));

const exportRows = packages.map(({ dir, manifest }) => {
  const exportsField = manifest.exports;
  const exports = exportsField
    ? Object.keys(exportsField)
        .map((name) => `\`${name}\``)
        .join(", ")
    : "None";

  return [`\`${manifest.name ?? dir}\``, `\`${dir}\``, exports];
});

const dependencyRows = packages.map(({ dir, manifest }) => {
  const dependencyNames = [
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.devDependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
  ];
  const internalDeps = dependencyNames
    .filter((name) => workspaceNames.has(name))
    .sort()
    .map((name) => `\`${name}\``);

  return [
    `\`${manifest.name ?? dir}\``,
    `\`${dir}\``,
    internalDeps.join(", ") || "None",
  ];
});

await writeGenerated(
  ".ai/contracts/package-exports.generated.md",
  "Package Exports Snapshot",
  formatTable(["Package", "Path", "Exports"], exportRows),
);

await writeGenerated(
  ".ai/contracts/dependency-graph.generated.md",
  "Workspace Dependency Graph Snapshot",
  [
    "## Workspace packages",
    "",
    markdownList(packages.map(({ manifest }) => manifest.name).filter(Boolean)),
    "",
    "## Internal dependencies",
    "",
    formatTable(["Package", "Path", "Internal dependencies"], dependencyRows),
  ].join("\n"),
);

console.log("Wrote .ai/contracts/package-exports.generated.md");
console.log("Wrote .ai/contracts/dependency-graph.generated.md");
