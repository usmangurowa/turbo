import type { ReactNode } from "react";
import { Body, Container, Head, Html, Preview, Tailwind } from "react-email";

import { emailTheme } from "../theme";

export interface EmailLayoutProps {
  /** Preview text shown in email client list view */
  preview?: string;
  /** Email content */
  children: ReactNode;
}

/**
 * Base layout component for all email templates.
 * Provides consistent styling and structure.
 *
 * @example
 * ```tsx
 * <EmailLayout preview="Welcome to our platform!">
 *   <Text>Hello world!</Text>
 * </EmailLayout>
 * ```
 */
export const EmailLayout = ({ preview, children }: EmailLayoutProps) => (
  <Tailwind config={emailTheme}>
    <Html>
      <Head />
      {preview && <Preview>{preview}</Preview>}
      <Body className="bg-background font-sans">
        <Container className="mx-auto max-w-[600px] px-4 py-8">
          {children}
        </Container>
      </Body>
    </Html>
  </Tailwind>
);
