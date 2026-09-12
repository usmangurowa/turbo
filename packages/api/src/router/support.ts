import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { enqueue, isJobQueueConfigured } from "@turbo/jobs/client";
import { sendSupportEmail } from "@turbo/jobs/tasks/send-support-email";

import type { AppContext } from "../context";
import { authMiddleware } from "../middleware/auth";

const supportSchema = z.object({
  type: z.enum(["bug", "feature", "feedback", "other"]),
  message: z.string().min(10).max(5000),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const app = new Hono<AppContext>()
  /**
   * POST /support - Submit feedback or support request
   *
   * Enqueues the send-support-email job when JOBS_POSTGRES_URL is set;
   * otherwise runs the same handler in-process (which mock-logs without
   * RESEND_API_KEY).
   */
  .post("/", authMiddleware, zValidator("json", supportSchema), async (c) => {
    const session = c.get("session");
    const body = c.req.valid("json");

    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const payload = {
      userEmail: session.user.email,
      userId: session.user.id,
      type: body.type,
      message: body.message,
      metadata: body.metadata,
    };

    if (isJobQueueConfigured()) {
      await enqueue("send-support-email", payload);
    } else {
      await sendSupportEmail(payload);
    }

    return c.json({ success: true, message: "Support request received" });
  });

export default app;
