import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

import type { AppContext } from "../context";

const supportSchema = z.object({
  type: z.enum(["bug", "feature", "feedback", "other"]),
  message: z.string().min(1).max(5000),
});

const app = new Hono<AppContext>()
  /**
   * POST /support - Submit feedback or support request
   */
  .post("/", zValidator("json", supportSchema), (c) => {
    const session = c.get("session");
    const { type, message } = c.req.valid("json");

    // Log the support request (implement email sending or ticket creation as needed)
    console.log("[Support Request]", {
      type,
      message,
      userId: session?.user.id ?? "anonymous",
      userEmail: session?.user.email ?? "anonymous",
      timestamp: new Date().toISOString(),
    });

    // TODO: Implement email sending or ticket creation
    // For now, just acknowledge the request

    return c.json({ success: true });
  });

export default app;
