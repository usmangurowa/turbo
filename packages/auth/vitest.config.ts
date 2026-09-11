import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/__tests__/**/*.test.ts"],
    // Cold imports run in beforeAll; give them room for scheduling
    // contention when `turbo run test` shares a hosted runner.
    hookTimeout: 30_000,
    testTimeout: 30_000,
  },
});
