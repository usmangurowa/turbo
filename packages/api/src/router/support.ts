import { zValidator } from "@hono/zod-validator";
import { tasks } from "@trigger.dev/sdk";
import { Hono } from "hono";
import { z } from "zod";

import type { sendSupportEmailTask } from "@turbo/jobs/tasks/send-support-email";
import { DEFAULT_FROM, sendEmail } from "@turbo/mail/client";
import { SupportEmail } from "@turbo/mail/templates/support";

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
   * Enqueues the send-support-email Trigger.dev task when
   * TRIGGER_SECRET_KEY is set; otherwise sends in-process via
   * @turbo/mail (which mock-logs without RESEND_API_KEY).
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

    if (process.env.TRIGGER_SECRET_KEY) {
      await tasks.trigger<typeof sendSupportEmailTask>(
        "send-support-email",
        payload,
      );
    } else {
      await sendEmail({
        to: process.env.SUPPORT_INBOX_EMAIL ?? DEFAULT_FROM,
        subject: `[Support] ${body.type}`,
        template: SupportEmail(payload),
        replyTo: payload.userEmail,
      });
    }

    return c.json({ success: true, message: "Support request received" });
  });

export default app;
