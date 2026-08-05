import { withSentryConfig } from "@sentry/nextjs";
import { createJiti } from "jiti";

const jiti = createJiti(import.meta.url);

// Import env files to validate at build time. Use jiti so we can load .ts files in here.
await jiti.import("./src/env");

/** @type {import("next").NextConfig} */
const config = {
  /** Enables hot reloading for local packages without a build step */
  transpilePackages: [
    "@turbo/api",
    "@turbo/auth",
    "@turbo/db",
    "@turbo/ui",
    "@turbo/validators",
  ],

  /** We already do linting and typechecking as separate tasks in CI */
  typescript: { ignoreBuildErrors: true },

  /**
   * Instant Navigations (Next.js 16.3): explicit `use cache` caching plus
   * partial prefetching of loading shells for SPA-like navigations.
   */
  cacheComponents: true,
  partialPrefetching: true,

  /** React Compiler: build-time memoization, run natively in Turbopack */
  reactCompiler: true,

  experimental: {
    /** Rust port of the React Compiler (faster than the Babel path) */
    turbopackRustReactCompiler: true,

    /** Keep navigations/actions pending and retry when the network returns */
    useOffline: true,
  },
};

export default withSentryConfig(config, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/nextjs

  // Only upload source maps in production CI builds
  // Prevents accidental uploads in local development
  silent: process.env.NODE_ENV !== "production" || !process.env.CI,
});
