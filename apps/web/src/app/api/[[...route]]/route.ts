import { auth } from "@/auth/server";
import { env } from "@/env";
import { Hono } from "hono";
import { handle } from "hono/vercel";

import { createApp } from "@turbo/api";
import { resolveTrustedOrigins } from "@turbo/auth/trusted-origins";

// Create a parent app with basePath /api
const app = new Hono().basePath("/api");

// Mount the API routes with security configuration
// Note: Better Auth routes are handled by /api/auth/[...all]/route.ts
const apiApp = createApp(auth, {
  security: {
    // Allow requests from the web app and mobile app (expo)
    allowedOrigins: resolveTrustedOrigins(env.NEXT_PUBLIC_APP_URL, "expo://"),
    // Rate limiting: 100 requests per minute
    rateLimit: 100,
    rateLimitWindow: 60 * 1000,
  },
});
app.route("/", apiApp);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
