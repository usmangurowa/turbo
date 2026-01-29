import { Hono } from "hono";
import { hc } from "hono/client";

import type { Auth } from "@turbo/auth";

import type { AppContext } from "./context";
import type { SecurityConfig } from "./middleware/security";
import { contextMiddleware } from "./middleware/context";
import {
  corsMiddleware,
  rateLimitMiddleware,
  secureHeadersMiddleware,
} from "./middleware/security";
import { timingMiddleware } from "./middleware/timing";
import authRouter from "./router/auth";

/**
 * Options for creating the API app
 */
export interface CreateAppOptions {
  /** Security configuration options */
  security?: SecurityConfig;
}

/**
 * Create the main Hono app with context, security, and routes
 * @param auth - Auth instance from @turbo/auth
 * @param options - Optional configuration for the app
 */
export const createApp = (auth: Auth, options: CreateAppOptions = {}) => {
  const { security = {} } = options;

  const app = new Hono<AppContext>()
    // Security middleware (applied first)
    .use("*", secureHeadersMiddleware())
    .use("*", corsMiddleware(security))
    .use("*", rateLimitMiddleware(security))
    // App middleware
    .use("*", contextMiddleware(auth))
    .use("*", timingMiddleware)
    // Routes
    .route("/auth", authRouter)
    // Health check (not rate limited in security config)
    .get("/health", (c) => c.text("OK"));

  return app;
};

// Export app type for client type inference
export type AppType = ReturnType<typeof createApp>;

// Type helper for creating a typed client
export type Client = ReturnType<typeof hc<AppType>>;

/**
 * Create a typed Hono client
 * Usage: const client = hcWithType("http://localhost:3000/api")
 */
export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<AppType>(...args);

// Export context type for use in other packages
export type { AppContext } from "./context";

// Export security types for configuration
export type { SecurityConfig } from "./middleware/security";
