import { Heading, Hr, Section, Text } from "@react-email/components";

import { EmailLayout } from "../components/email-layout";

export interface OTPEmailProps {
  /** The one-time password code */
  otp: string;
  /** The type of OTP being sent */
  type: "sign-in" | "email-verification" | "forget-password" | "change-email";
}

const titles: Record<OTPEmailProps["type"], string> = {
  "sign-in": "Sign in to your account",
  "email-verification": "Verify your email",
  "forget-password": "Reset your password",
  "change-email": "Confirm your new email address",
};

const descriptions: Record<OTPEmailProps["type"], string> = {
  "sign-in": "Use this code to sign in to your account:",
  "email-verification": "Use this code to verify your email address:",
  "forget-password": "Use this code to reset your password:",
  "change-email": "Use this code to confirm your new email address:",
};

/**
 * OTP verification email template.
 *
 * @example
 * ```tsx
 * import { sendEmail } from "@turbo/mail/client";
 * import { OTPEmail } from "@turbo/mail";
 *
 * await sendEmail({
 *   to: "user@example.com",
 *   subject: "Your verification code",
 *   template: <OTPEmail otp="123456" type="email-verification" />,
 * });
 * ```
 */
export const OTPEmail = ({ otp, type }: OTPEmailProps) => (
  <EmailLayout preview={`Your verification code: ${otp}`}>
    <Section className="rounded-lg bg-white p-8">
      <Heading className="text-foreground m-0 mb-4 text-2xl font-bold">
        {titles[type]}
      </Heading>

      <Text className="text-muted-foreground mb-6 text-base">
        {descriptions[type]}
      </Text>

      <Section className="bg-muted mb-6 rounded-lg py-6 text-center">
        <Text className="text-foreground m-0 font-mono text-4xl font-bold tracking-[0.5em]">
          {otp}
        </Text>
      </Section>

      <Text className="text-muted-foreground mb-4 text-base">
        This code expires in 10 minutes.
      </Text>

      <Hr className="border-border my-6" />

      <Text className="text-muted-foreground m-0 text-sm">
        If you didn&apos;t request this code, you can safely ignore this email.
      </Text>
    </Section>
  </EmailLayout>
);

export default OTPEmail;
