import { createMiddleware } from "hono/factory";

import type { AppContext } from "../context";

/**
 * Timing middleware for development - measures and logs request duration
 * Adds artificial delay in development to simulate network latency
 */
export const timingMiddleware = createMiddleware<AppContext>(
  async (c, next) => {
    const start = Date.now();

    // Artificial delay in dev (100-500ms) to catch unwanted waterfalls
    if (process.env.NODE_ENV === "development") {
      const waitMs = Math.floor(Math.random() * 400) + 100;
      await new Promise<void>((resolve) => setTimeout(resolve, waitMs));
    }

    await next();

    const end = Date.now();
    const path = c.req.path;
    console.log(`[API] ${c.req.method} ${path} took ${end - start}ms`);
  },
);
