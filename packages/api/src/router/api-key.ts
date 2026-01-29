import { Hono } from "hono";

import type { AppContext } from "../context";
import { authMiddleware } from "../middleware/auth";

/**
 * API Keys router stub.
 *
 * These endpoints manage API keys for programmatic access.
 * The actual implementation uses Better Auth's apiKey plugin.
 */
const app = new Hono<AppContext>()
  .use("*", authMiddleware)
  /**
   * GET /apikeys - List all API keys for the current user
   */
  .get("/", (c) => {
    const session = c.get("session");

    if (!session?.user.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // TODO: Implement using Better Auth's apiKey plugin
    // For now, return empty list
    return c.json({ keys: [] });
  })
  /**
   * POST /apikeys - Create a new API key
   */
  .post("/", (c) => {
    const session = c.get("session");

    if (!session?.user.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // TODO: Implement using Better Auth's apiKey plugin
    return c.json(
      { error: "Not implemented - use Better Auth client directly" },
      501,
    );
  })
  /**
   * DELETE /apikeys/:id - Revoke an API key
   */
  .delete("/:id", (c) => {
    const session = c.get("session");

    if (!session?.user.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // TODO: Implement using Better Auth's apiKey plugin
    return c.json(
      { error: "Not implemented - use Better Auth client directly" },
      501,
    );
  });

export default app;
