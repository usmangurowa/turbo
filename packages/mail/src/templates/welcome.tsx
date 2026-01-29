import { Heading, Hr, Section, Text } from "@react-email/components";

import { EmailButton } from "../components/email-button";
import { EmailLayout } from "../components/email-layout";

export interface WelcomeEmailProps {
  /** User's display name */
  name: string;
  /** URL to the dashboard or action page */
  actionUrl?: string;
  /** Text for the action button */
  actionText?: string;
}

/**
 * Welcome email template for new users.
 *
 * @example
 * ```tsx
 * import { sendEmail } from "@turbo/mail/client";
 * import { WelcomeEmail } from "@turbo/mail";
 *
 * await sendEmail({
 *   to: "user@example.com",
 *   subject: "Welcome to Turbo!",
 *   template: <WelcomeEmail name="John" dashboardUrl="https://turbo.app/dashboard" />,
 * });
 * ```
 */
export const WelcomeEmail = ({
  name,
  actionUrl = "https://turbo.app/dashboard",
  actionText = "Go to Dashboard",
}: WelcomeEmailProps) => (
  <EmailLayout preview={`Welcome to Turbo, ${name}!`}>
    <Section className="rounded-lg bg-white p-8">
      <Heading className="text-foreground m-0 mb-4 text-2xl font-bold">
        Welcome to Turbo, {name}! 🎉
      </Heading>

      <Text className="text-muted-foreground mb-6 text-base">
        We&apos;re excited to have you on board. Get started by exploring your
        dashboard.
      </Text>

      <Section className="mb-6">
        <EmailButton href={actionUrl}>{actionText}</EmailButton>
      </Section>

      <Hr className="border-border my-6" />

      <Text className="text-muted-foreground m-0 text-sm">
        If you have any questions, feel free to reach out to our support team.
      </Text>
    </Section>
  </EmailLayout>
);

export default WelcomeEmail;
