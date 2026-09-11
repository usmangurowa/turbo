import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const componentsDir = join(__dirname, "..", "components");
const read = (name: string) => readFileSync(join(componentsDir, name), "utf8");

/**
 * Guards the documented registry patches on shadcn-managed primitives (see
 * .ai/context/design-system.md → Component Rules). Re-running `pnpm ui-add`
 * overwrites these files; the tests fail loudly instead of silently dropping
 * the house variants.
 */
describe("registry component patches", () => {
  it("card.tsx exposes the dashed frame variant and keeps the ring default", () => {
    const source = read("card.tsx");
    expect(source).toContain('dashed: "border-border border border-dashed"');
    expect(source).toContain('default: "ring-foreground/10 ring-1"');
    expect(source).toContain("data-variant={variant}");
  });

  it("badge.tsx carries the success and warning status variants", () => {
    const source = read("badge.tsx");
    expect(source).toContain('success: "bg-success/10 text-success');
    expect(source).toContain('warning: "bg-warning/10 text-warning');
  });

  it("badge.tsx exposes the xs | sm size axis defaulting to xs", () => {
    const source = read("badge.tsx");
    expect(source).toContain('xs: "h-5 min-w-0 px-2 text-xs"');
    expect(source).toContain('sm: "h-7 min-w-0 px-2.5 text-xs"');
    expect(source).toContain('size: "xs"');
    expect(source).toContain("badgeVariants({ variant, size })");
  });

  it("theme.tsx ThemeToggle flips the resolved theme only once mounted", () => {
    const source = read("theme.tsx");
    expect(source).toContain("useSyncExternalStore");
    expect(source).toContain("mounted && resolvedTheme");
    expect(source).toContain('"Toggle theme"');
    expect(source).toContain("if (next) setTheme(next);");
    expect(source).not.toContain("DropdownMenu");
  });
});
