import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import type { AppContext } from "../context";
import { authMiddleware } from "../middleware/auth";

const createApiKeySchema = z.object({
  name: z.string().min(1).max(64),
  expiresIn: z.number().int().positive().optional(),
});

/**
 * Statuses Better Auth's apiKey plugin is known to raise that we pass
 * through to the client; anything else becomes a 500.
 */
const KNOWN_ERROR_STATUSES = [400, 401, 403, 404, 429] as const;
type KnownErrorStatus = (typeof KNOWN_ERROR_STATUSES)[number];

/**
 * Better Auth server methods throw better-call `APIError`s. @turbo/api does
 * not depend on better-call directly, so narrow the thrown value by shape
 * (`statusCode` number + optional `body.message`) instead of `instanceof`.
 */
const errorStatus = (error: unknown): KnownErrorStatus | 500 => {
  if (
    error instanceof Error &&
    "statusCode" in error &&
    typeof error.statusCode === "number" &&
    (KNOWN_ERROR_STATUSES as readonly number[]).includes(error.statusCode)
  ) {
    return error.statusCode as KnownErrorStatus;
  }
  return 500;
};

const errorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error && "body" in error) {
    const body = (error as { body?: { message?: string } }).body;
    if (body?.message) return body.message;
  }
  return fallback;
};

/**
 * API Keys router.
 *
 * All key material handling is delegated to Better Auth's apiKey plugin
 * (`auth.createApiKey` / `auth.listApiKeys` / `auth.deleteApiKey`). The
 * session headers are forwarded on every call so ownership is enforced by
 * Better Auth, never by trusting the request.
 */
const app = new Hono<AppContext>()
  /**
   * GET /apikeys - List the current user's API keys.
   *
   * Maps the plugin response to a safe DTO. The hashed `key` column is
   * never returned; the plaintext key exists only in the create response.
   */
  .get("/", authMiddleware, async (c) => {
    const auth = c.get("auth");

    try {
      const { apiKeys } = await auth.listApiKeys({
        headers: c.req.raw.headers,
      });

      return c.json({
        apiKeys: apiKeys.map((apiKey) => ({
          id: apiKey.id,
          name: apiKey.name,
          start: apiKey.start,
          prefix: apiKey.prefix,
          enabled: apiKey.enabled,
          createdAt: apiKey.createdAt,
          expiresAt: apiKey.expiresAt,
          lastRequest: apiKey.lastRequest,
        })),
      });
    } catch (error) {
      return c.json(
        { error: errorMessage(error, "Failed to list API keys") },
        errorStatus(error),
      );
    }
  })
  /**
   * POST /apikeys - Create an API key for the current user.
   *
   * The response is the only place the plaintext `key` ever appears —
   * Better Auth returns it once at creation and stores only a hash.
   */
  .post(
    "/",
    authMiddleware,
    zValidator("json", createApiKeySchema),
    async (c) => {
      const auth = c.get("auth");
      const { name, expiresIn } = c.req.valid("json");

      try {
        const apiKey = await auth.createApiKey({
          body: { name, expiresIn },
          headers: c.req.raw.headers,
        });

        return c.json({ apiKey }, 201);
      } catch (error) {
        return c.json(
          { error: errorMessage(error, "Failed to create API key") },
          errorStatus(error),
        );
      }
    },
  )
  /**
   * DELETE /apikeys/:id - Revoke an API key.
   *
   * Session headers are forwarded so Better Auth rejects attempts to
   * delete keys the current user does not own.
   */
  .delete("/:id", authMiddleware, async (c) => {
    const auth = c.get("auth");
    const { id } = c.req.param();

    try {
      const { success } = await auth.deleteApiKey({
        body: { keyId: id },
        headers: c.req.raw.headers,
      });

      return c.json({ success });
    } catch (error) {
      return c.json(
        { error: errorMessage(error, "Failed to revoke API key") },
        errorStatus(error),
      );
    }
  });

export default app;
