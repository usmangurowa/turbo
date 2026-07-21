// Theme exports
export { emailTheme, emailThemeDark } from "./theme";

// Component exports
export { EmailLayout } from "./components/email-layout";
export type { EmailLayoutProps } from "./components/email-layout";

export { EmailButton } from "./components/email-button";
export type { EmailButtonProps } from "./components/email-button";

// Template exports
export { WelcomeEmail } from "./templates/welcome";
export type { WelcomeEmailProps } from "./templates/welcome";

export { OTPEmail } from "./templates/otp";
export type { OTPEmailProps } from "./templates/otp";

// Re-export useful react-email components for convenience
export {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "react-email";
