import { Hono } from "hono";

import type { Auth } from "@turbo/auth";
import { createApp } from "@turbo/api";
import { db } from "@turbo/db/client";

type ServerAuth = Parameters<typeof createApp>[0] & Pick<Auth, "handler">;

interface CreateServerAppOptions {
  allowedOrigins: string[];
  rateLimit?: number;
  rateLimitWindow?: number;
}

export const createServerApp = (
  auth: ServerAuth,
  {
    allowedOrigins,
    rateLimit = 100,
    rateLimitWindow = 60 * 1000,
  }: CreateServerAppOptions,
) => {
  const apiApp = createApp(auth, db, {
    security: {
      allowedOrigins,
      rateLimit,
      rateLimitWindow,
    },
  });

  const app = new Hono()
    .get("/health", (c) => c.text("OK"))
    .on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw))
    .route("/api", apiApp);

  return app;
};
