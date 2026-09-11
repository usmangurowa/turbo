import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/__tests__/**/*.test.ts"],
    // `turbo run test` runs every package's Vitest at once; importing the
    // server app graph cold on a shared hosted runner can take several
    // seconds, which is scheduling contention, not slow code.
    hookTimeout: 30_000,
    testTimeout: 30_000,
  },
});
