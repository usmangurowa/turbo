import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Node-only harness: components render through `react-dom/server`, so tests
// assert on markup and need neither jsdom nor a browser.
export default defineConfig({
  // Next's tsconfig keeps `"jsx": "preserve"`; tests need it compiled.
  oxc: { jsx: { runtime: "automatic" } },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/__tests__/**/*.test.{ts,tsx}"],
  },
});
