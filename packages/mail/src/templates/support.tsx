import { Heading, Hr, Section, Text } from "@react-email/components";

import { EmailLayout } from "../components/email-layout";

export interface SupportEmailProps {
  /** User's email address */
  userEmail: string;
  /** User's ID */
  userId?: string;
  /** The type of support request */
  type: string;
  /** The support message content */
  message: string;
  /** Optional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Support request email template (sent to support team).
 *
 * @example
 * ```tsx
 * import { sendEmail } from "@turbo/mail/client";
 * import { SupportEmail } from "@turbo/mail";
 *
 * await sendEmail({
 *   to: "support@turbo.app",
 *   subject: "Support Request from John",
 *   template: (
 *     <SupportEmail
 *       userEmail="john@example.com"
 *       userName="John"
 *       message="I need help with..."
 *       category="general"
 *     />
 *   ),
 * });
 * ```
 */
export const SupportEmail = ({
  userEmail,
  userId,
  type,
  message,
  metadata,
}: SupportEmailProps) => (
  <EmailLayout preview={`Support request from ${userEmail}`}>
    <Section className="rounded-lg bg-white p-8">
      <Heading className="text-foreground m-0 mb-4 text-2xl font-bold">
        New Support Request
      </Heading>

      <Text className="text-muted-foreground mb-2 text-sm">
        <strong>From:</strong> {userEmail}
        {userId && <> (ID: {userId})</>}
      </Text>

      <Text className="text-muted-foreground mb-4 text-sm">
        <strong>Type:</strong> {type}
      </Text>

      <Hr className="border-border my-4" />

      <Text className="text-foreground mb-6 text-base whitespace-pre-wrap">
        {message}
      </Text>

      {metadata && Object.keys(metadata).length > 0 && (
        <>
          <Hr className="border-border my-4" />
          <Text className="text-muted-foreground mb-2 text-sm">
            <strong>Metadata:</strong>
          </Text>
          <Text className="text-muted-foreground mb-4 text-xs font-mono">
            {JSON.stringify(metadata, null, 2)}
          </Text>
        </>
      )}

      <Hr className="border-border my-6" />

      <Text className="text-muted-foreground m-0 text-sm">
        Reply to this email to respond directly to the user.
      </Text>
    </Section>
  </EmailLayout>
);

export default SupportEmail;
