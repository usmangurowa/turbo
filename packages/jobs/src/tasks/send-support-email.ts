import { task } from "@trigger.dev/sdk";

import { DEFAULT_FROM, sendEmail } from "@turbo/mail/client";
import { SupportEmail } from "@turbo/mail/templates/support";

/**
 * Payload for the send-support-email task.
 * Mirrors SupportEmailProps from @turbo/mail/templates/support.
 */
export interface SendSupportEmailPayload {
  /** Email address of the user who filed the request */
  userEmail: string;
  /** ID of the user who filed the request */
  userId?: string;
  /** The type of support request (bug, feature, feedback, ...) */
  type: string;
  /** The support message content */
  message: string;
  /** Optional metadata captured with the request */
  metadata?: Record<string, unknown>;
}

/**
 * Send a support request email to the support inbox.
 *
 * Triggered by the API's POST /support route when TRIGGER_SECRET_KEY is
 * configured. The recipient defaults to SUPPORT_INBOX_EMAIL, falling back
 * to the mail package's DEFAULT_FROM. Replies go straight to the user.
 */
export const sendSupportEmailTask = task({
  id: "send-support-email",
  run: async (payload: SendSupportEmailPayload) => {
    const result = await sendEmail({
      to: process.env.SUPPORT_INBOX_EMAIL ?? DEFAULT_FROM,
      subject: `[Support] ${payload.type}`,
      template: SupportEmail(payload),
      replyTo: payload.userEmail,
    });

    if (!result.success) {
      // Throw so Trigger.dev retries per trigger.config.ts defaults
      throw result.error ?? new Error("Failed to send support email");
    }

    return { emailId: result.id };
  },
});
