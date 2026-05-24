import { readFile } from "node:fs/promises";

import { fromRoot, writeGenerated } from "./_lib.mjs";

const files = [
  "AGENTS.md",
  "ARCHITECTURE.md",
  "ROADMAP_AI.md",
  "system_prompt.md",
  ".ai/context/tech-stack.md",
  ".ai/context/conventions.md",
  ".ai/context/architecture.md",
  ".ai/context/data-contracts.md",
  ".ai/context/design-system.md",
  ".ai/context/routing.md",
  ".ai/contracts/api-routes.generated.md",
  ".ai/contracts/db-schema.generated.md",
  ".ai/contracts/env.generated.md",
  ".ai/contracts/package-exports.generated.md",
  ".ai/contracts/dependency-graph.generated.md",
];

const sections = [];

const getFence = (content) => {
  const runs = content.match(/`+/g) ?? [];
  const longestRun = runs.reduce((max, run) => Math.max(max, run.length), 0);
  return "`".repeat(Math.max(4, longestRun + 1));
};

for (const file of files) {
  try {
    const content = await readFile(fromRoot(file), "utf8");
    const fence = getFence(content);
    sections.push(
      [`## ${file}`, "", `${fence}md`, content.trim(), fence].join("\n"),
    );
  } catch {
    sections.push(
      [
        `## ${file}`,
        "",
        "Missing. Run `pnpm ai:contracts` if this is a generated contract.",
      ].join("\n"),
    );
  }
}

await writeGenerated(
  ".ai/contracts/context-pack.generated.md",
  "AI Context Pack",
  sections.join("\n\n"),
  { regenerateCommand: "pnpm ai:context" },
);

console.log("Wrote .ai/contracts/context-pack.generated.md");
