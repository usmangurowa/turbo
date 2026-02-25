import { z } from "zod/v4";

// ============================================================================
// Base Schemas
// ============================================================================

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters");

export const confirmPasswordSchema = z
  .string()
  .min(1, "Please confirm your password");

export const otpSchema = z
  .string()
  .length(6, "Verification code must be 6 digits")
  .regex(/^\d+$/, "Verification code must only contain numbers");

export const usernameSchema = z
  .string()
  .min(1, "Username is required")
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores",
  );

// ============================================================================
// Auth Form Schemas
// ============================================================================

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormData = z.infer<typeof loginSchema>;

/**
 * Create account form validation schema
 */
export const createAccountSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CreateAccountFormData = z.infer<typeof createAccountSchema>;

/**
 * Forgot password form validation schema
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

/**
 * Reset password form validation schema
 */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: confirmPasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

/**
 * OTP verification form validation schema
 */
export const verifyEmailSchema = z.object({
  otp: otpSchema,
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

/**
 * Onboarding profile form validation schema
 */
export const onboardingSchema = z.object({
  username: usernameSchema,
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  avatarUrl: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

