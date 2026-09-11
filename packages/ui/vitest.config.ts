import { defineConfig } from "vitest/config";

export default defineConfig({
  // The package tsconfig keeps `"jsx": "preserve"` for consumers' bundlers;
  // component tests need JSX compiled. Files opt into jsdom per test.
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    passWithNoTests: true,
  },
});
