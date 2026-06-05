import type { Auth } from "@turbo/auth";
import type { db } from "@turbo/db/client";

export type AuthWithApi = Pick<Auth, "api">;

/**
 * Context Variables available in all Hono route handlers
 */
export interface AppContext {
  Variables: {
    auth: Auth["api"];
    session: Awaited<ReturnType<Auth["api"]["getSession"]>> | null;
    db: typeof db;
    /** User ID from verified API key (set by apiKeyMiddleware) */
    apiKeyUserId?: string;
    /** API Key ID from verified API key (set by apiKeyMiddleware) */
    apiKeyId?: string;
  };
}
