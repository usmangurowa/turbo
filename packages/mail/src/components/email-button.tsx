import type { ComponentProps } from "react";
import { Button as ReactEmailButton } from "@react-email/components";

type ButtonVariant = "primary" | "secondary" | "destructive" | "outline";
type ButtonSize = "sm" | "md" | "lg";

export interface EmailButtonProps extends Omit<
  ComponentProps<typeof ReactEmailButton>,
  "className"
> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  outline: "bg-transparent text-foreground border border-border",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

/**
 * Styled button component for email templates.
 * Matches the visual style of @turbo/ui buttons.
 *
 * @example
 * ```tsx
 * <EmailButton href="https://example.com" variant="primary">
 *   Click Me
 * </EmailButton>
 * ```
 */
export const EmailButton = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  ...props
}: EmailButtonProps) => {
  const className = [
    "inline-block rounded-md font-medium no-underline text-center",
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? "w-full" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ReactEmailButton className={className} {...props}>
      {children}
    </ReactEmailButton>
  );
};
