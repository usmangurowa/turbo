import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const componentsDir = join(__dirname, "..", "components");
const read = (name: string) => readFileSync(join(componentsDir, name), "utf8");

/**
 * Guards the documented patches on shadcn-managed primitives (see
 * .ai/context/design-system.md → Component Rules). Re-running `pnpm ui-add`
 * overwrites `card.tsx` and `badge.tsx`; these assertions are structural so
 * they fail on an overwrite but survive a spacing or wording tweak.
 * `theme.tsx` is a custom wrapper (not registry output); its guard only pins
 * the hydration-safety mechanism — behaviour is covered by theme.test.tsx.
 */
describe("registry component patches", () => {
  it("card.tsx exposes the dashed frame variant and keeps the ring default", () => {
    const source = read("card.tsx");
    expect(source).toMatch(/variant:\s*\{[^}]*dashed:\s*"[^"]*border-dashed/);
    expect(source).toMatch(/default:\s*"[^"]*ring-1/);
    expect(source).toContain("data-variant={variant}");
  });

  it("badge.tsx carries the success and warning status variants", () => {
    const source = read("badge.tsx");
    expect(source).toMatch(/success:\s*"[^"]*bg-success\/10 text-success/);
    expect(source).toMatch(/warning:\s*"[^"]*bg-warning\/10 text-warning/);
  });

  it("badge.tsx exposes a size axis defaulting to xs", () => {
    const source = read("badge.tsx");
    expect(source).toMatch(/size:\s*\{\s*xs:/);
    expect(source).toMatch(/size:\s*\{[^}]*\bsm:/);
    expect(source).toMatch(/defaultVariants:\s*\{[^}]*size:\s*"xs"/);
    expect(source).toContain("badgeVariants({ variant, size })");
  });

  it("theme.tsx decides the toggle direction only after mount", () => {
    const source = read("theme.tsx");
    expect(source).toContain("useSyncExternalStore");
    expect(source).toContain("resolvedTheme");
    expect(source).toMatch(/aria-label=\{/);
  });
});
