import { createMiddleware } from "hono/factory";

import type { AppContext, AuthWithApi, Db } from "../context";

/**
 * Context middleware that sets up auth, session, and database for all routes
 */
export const contextMiddleware = (auth: AuthWithApi, db: Db) =>
  createMiddleware<AppContext>(async (c, next) => {
    const authApi = auth.api;
    const session = await authApi.getSession({
      headers: c.req.raw.headers,
    });

    c.set("auth", authApi);
    c.set("session", session);
    c.set("db", db);

    await next();
  });
