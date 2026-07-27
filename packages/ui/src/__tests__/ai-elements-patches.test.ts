import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const aiElementsDir = join(__dirname, "..", "components", "ai-elements");
const read = (name: string) => readFileSync(join(aiElementsDir, name), "utf8");

/**
 * Guards the local patches applied to the vendored AI Elements components
 * (see .ai/context/conventions.md). If a shadcn CLI re-install overwrites
 * a patched file, these tests fail loudly instead of silently regressing.
 */
describe("ai-elements vendored patches", () => {
  it("context.tsx reads AI SDK v7 nested usage fields", () => {
    const source = read("context.tsx");
    expect(source).toContain("outputTokenDetails?.reasoningTokens");
    expect(source).toContain("inputTokenDetails?.cacheReadTokens");
    expect(source).not.toContain("usage?.cachedInputTokens");
  });

  it("reasoning.tsx does not spread props onto Streamdown", () => {
    const source = read("reasoning.tsx");
    const streamdownUsage = source.slice(source.indexOf("<Streamdown"));
    expect(streamdownUsage.slice(0, 200)).not.toContain("{...props}");
  });

  it("prompt-input.tsx null-guards result.isFinal", () => {
    expect(read("prompt-input.tsx")).toContain("result?.isFinal");
  });

  it("confirmation.tsx and tool.tsx carry no stale v6 ts-expect-error", () => {
    for (const file of ["confirmation.tsx", "tool.tsx"]) {
      expect(read(file)).not.toContain("state only available in AI SDK v6");
    }
  });

  it("web-preview.tsx default sandbox omits allow-same-origin", () => {
    const source = read("web-preview.tsx");
    expect(source).toContain(
      'sandbox="allow-scripts allow-forms allow-popups allow-presentation"',
    );
    expect(source).not.toContain("allow-same-origin");
  });

  it("ai-elements exported icon props are not typed as lucide", () => {
    for (const file of ["artifact.tsx", "chain-of-thought.tsx"]) {
      expect(read(file)).not.toContain("icon?: LucideIcon");
    }
  });

  it("code-block.tsx imports the shiki web bundle, not the full bundle", () => {
    const source = read("code-block.tsx");
    expect(source).toContain('from "shiki/bundle/web"');
    expect(source).not.toMatch(/import \{[^}]*codeToHtml[^}]*\} from "shiki";/);
  });
});
