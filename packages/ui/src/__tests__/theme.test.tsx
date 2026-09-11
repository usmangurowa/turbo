// @vitest-environment jsdom
import type { Root } from "react-dom/client";
import { act } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ThemeProvider, ThemeToggle } from "@turbo/ui/components/theme";

declare global {
  var IS_REACT_ACT_ENVIRONMENT: boolean | undefined;
}

const tree = (
  <ThemeProvider defaultTheme="dark" enableSystem={false}>
    <ThemeToggle />
  </ThemeProvider>
);

let container: HTMLDivElement;
let root: Root | undefined;

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  // jsdom has no matchMedia; next-themes reads it on mount even with
  // enableSystem={false}. Report a light OS so "dark" is an explicit choice.
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  }));
  window.localStorage.clear();
  document.documentElement.className = "";
  container = document.createElement("div");
  document.body.append(container);
});

afterEach(() => {
  act(() => root?.unmount());
  root = undefined;
  container.remove();
  vi.unstubAllGlobals();
});

const button = () => {
  const element = container.querySelector("button");
  if (!element) throw new Error("ThemeToggle did not render a button");
  return element;
};

// React recommends the async form of `act`; the awaited microtask lets the
// post-hydration re-render and next-themes' mount effect settle.
const hydrate = (options?: Parameters<typeof hydrateRoot>[2]) =>
  act(async () => {
    root = hydrateRoot(container, tree, options);
    await Promise.resolve();
  });

const click = () =>
  act(async () => {
    button().click();
    await Promise.resolve();
  });

/**
 * `next-themes` returns `resolvedTheme` as `undefined` on the server, so a
 * label derived from it before mount either lies ("Switch to dark mode" on a
 * dark screen) or mismatches the client's hydration render. The toggle must
 * render a neutral label on the server, hydrate without a recoverable error,
 * and only then announce the real direction.
 */
describe("ThemeToggle", () => {
  it("renders a neutral label on the server", () => {
    expect(renderToString(tree)).toContain('aria-label="Toggle theme"');
  });

  it("hydrates cleanly and announces the direction once mounted", async () => {
    container.innerHTML = renderToString(tree);
    const onRecoverableError = vi.fn();

    await hydrate({ onRecoverableError });

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(button().getAttribute("aria-label")).toBe("Switch to light mode");
  });

  it("flips the resolved theme on click, both ways", async () => {
    container.innerHTML = renderToString(tree);
    await hydrate();

    await click();
    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(button().getAttribute("aria-label")).toBe("Switch to dark mode");

    await click();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(button().getAttribute("aria-label")).toBe("Switch to light mode");
  });
});
