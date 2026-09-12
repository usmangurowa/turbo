import { DEFAULT_FROM, sendEmail } from "@turbo/mail/client";
import { SupportEmail } from "@turbo/mail/templates/support";

/**
 * Payload for the send-support-email job.
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
 * Runs on the jobs worker when the API enqueued it, or in-process from
 * POST /support when no queue is configured. The recipient defaults to
 * SUPPORT_INBOX_EMAIL, falling back to the mail package's DEFAULT_FROM.
 * Replies go straight to the user. Throws on failure so pg-boss retries
 * per the queue policy.
 */
export const sendSupportEmail = async (payload: SendSupportEmailPayload) => {
  const result = await sendEmail({
    to: process.env.SUPPORT_INBOX_EMAIL ?? DEFAULT_FROM,
    subject: `[Support] ${payload.type}`,
    template: SupportEmail(payload),
    replyTo: payload.userEmail,
  });

  if (!result.success) {
    throw result.error ?? new Error("Failed to send support email");
  }

  return { emailId: result.id };
};
