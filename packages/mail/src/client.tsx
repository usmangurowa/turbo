import type { ReactElement } from "react";
import { render } from "react-email";
import { Resend } from "resend";

import type { OTPEmailProps } from "./templates/otp";
import type { SupportEmailProps } from "./templates/support";
import type { WelcomeEmailProps } from "./templates/welcome";
import { OTPEmail } from "./templates/otp";
import { SupportEmail } from "./templates/support";
import { WelcomeEmail } from "./templates/welcome";

/**
 * Resend client instance.
 * Requires RESEND_API_KEY environment variable in production.
 */
const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Only require RESEND_API_KEY in production runtime (not during build or test)
const isProduction =
  process.env.NODE_ENV === "production" && !process.env.SKIP_ENV_VALIDATION;

const requireResendConfig = isProduction && !process.env.SKIP_ENV_VALIDATION;
if (!RESEND_API_KEY && requireResendConfig) {
  throw new Error("RESEND_API_KEY environment variable is required");
}

export const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;
/**
 * Default sender email address.
 * Override this in your application or per-email.
 */
export const DEFAULT_FROM = "no-reply@turbo.app";

export interface SendEmailOptions {
  /** Recipient email address(es) */
  to: string | string[];
  /** Email subject line */
  subject: string;
  /** React Email template component */
  template: ReactElement;
  /** Optional sender email (defaults to DEFAULT_FROM) */
  from?: string;
  /** Optional reply-to address */
  replyTo?: string;
  /** Optional CC recipients */
  cc?: string | string[];
  /** Optional BCC recipients */
  bcc?: string | string[];
  /** Optional custom headers */
  headers?: Record<string, string>;
  /** Optional tags for tracking */
  tags?: { name: string; value: string }[];
}

export interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: Error;
}

/**
 * Send an email using a React Email template.
 *
 * @example
 * ```ts
 * import { sendEmail } from "@turbo/mail/client";
 * import { WelcomeEmail } from "@turbo/mail/templates/welcome";
 *
 * await sendEmail({
 *   to: "user@example.com",
 *   subject: "Welcome to Turbo!",
 *   template: <WelcomeEmail name="John" />,
 * });
 * ```
 */
export const sendEmail = async ({
  to,
  subject,
  template,
  from = DEFAULT_FROM,
  replyTo,
  cc,
  bcc,
  headers,
  tags,
}: SendEmailOptions): Promise<SendEmailResult> => {
  try {
    const html = await render(template);

    let data, error;

    if (resend) {
      const res = await resend.emails.send({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        replyTo,
        cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
        bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
        headers,
        tags,
      });
      data = res.data;
      error = res.error;
    } else {
      console.warn(
        `[Mail] Mocking email send to ${Array.isArray(to) ? to.join(", ") : to} (Subject: "${subject}")`,
      );
      data = { id: `mock_email_${Date.now()}` };
      error = null;
    }

    if (error || !data) {
      return {
        success: false,
        error: error
          ? new Error(error.message)
          : new Error("Failed to send email"),
      };
    }

    return {
      success: true,
      id: data.id,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
};

/**
 * Render an email template to HTML string.
 * Useful for previewing emails or using with other email providers.
 */
export const renderEmail = async (template: ReactElement): Promise<string> =>
  render(template);

/**
 * Render an email template to plain text.
 * Some email clients prefer plain text versions.
 */
export const renderEmailText = async (
  template: ReactElement,
): Promise<string> => render(template, { plainText: true });

// ============================================================================
// Convenience functions for sending emails without JSX
// ============================================================================

const OTP_SUBJECTS = {
  "sign-in": "Your sign-in code",
  "email-verification": "Verify your email",
  "forget-password": "Reset your password",
  "change-email": "Confirm your new email address",
} as const;

/**
 * Send an OTP verification email.
 *
 * @example
 * ```ts
 * import { sendOTPEmail } from "@turbo/mail/client";
 *
 * await sendOTPEmail({
 *   to: "user@example.com",
 *   otp: "123456",
 *   type: "email-verification",
 * });
 * ```
 */
export const sendOTPEmail = async ({
  to,
  otp,
  type,
  from,
}: OTPEmailProps & { to: string; from?: string }): Promise<SendEmailResult> =>
  sendEmail({
    to,
    subject: OTP_SUBJECTS[type],
    template: OTPEmail({ otp, type }),
    from,
  });

/**
 * Send a welcome email to a new user.
 *
 * @example
 * ```ts
 * import { sendWelcomeEmail } from "@turbo/mail/client";
 *
 * await sendWelcomeEmail({
 *   to: "user@example.com",
 *   name: "John",
 *   actionUrl: "https://app.example.com/dashboard",
 * });
 * ```
 */
export const sendWelcomeEmail = async ({
  to,
  name,
  actionUrl,
  actionText,
  from,
}: WelcomeEmailProps & {
  to: string;
  from?: string;
}): Promise<SendEmailResult> =>
  sendEmail({
    to,
    subject: `Welcome to Turbo, ${name}!`,
    template: WelcomeEmail({ name, actionUrl, actionText }),
    from,
  });

/**
 * Send a support/feedback email to the team.
 */
export const sendSupportEmail = async ({
  userEmail,
  userId,
  type,
  message,
  metadata,
  to = "support@turbo.app", // Default support email
}: SupportEmailProps & { to?: string }): Promise<SendEmailResult> =>
  sendEmail({
    to,
    subject: `[Turbo] New ${type} from ${userEmail}`,
    template: SupportEmail({ userEmail, userId, type, message, metadata }),
    replyTo: userEmail,
  });
