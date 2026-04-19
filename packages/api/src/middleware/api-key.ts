import { createMiddleware } from "hono/factory";

import type { AppContext } from "../context";

/**
 * API Key middleware for extension authentication.
 * Validates API key from x-api-key or Authorization header using Better Auth's verifyApiKey.
 * Sets apiKeyUserId in context for use in route handlers.
 */
export const apiKeyMiddleware = createMiddleware<AppContext>(
  async (c, next) => {
    const auth = c.get("auth");

    // Extract API key from headers
    const apiKey =
      c.req.header("x-api-key") ??
      c.req.header("authorization")?.replace("Bearer ", "");

    if (!apiKey) {
      return c.json({ error: "API key required" }, 401);
    }

    // Verify API key using Better Auth
    const result = await auth.verifyApiKey({ body: { key: apiKey } });

    if (!result.valid || !result.key) {
      return c.json({ error: result.error?.message ?? "Invalid API key" }, 401);
    }

    // Set user ID and key ID in context for route handlers
    c.set("apiKeyUserId", result.key.referenceId);
    c.set("apiKeyId", result.key.id);

    await next();
  },
);
