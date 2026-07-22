"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/auth/client";
import { AuthHeader } from "@/components/auth/auth-header";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { CreateAccountFormData } from "@turbo/validators";
import { Button } from "@turbo/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@turbo/ui/components/field";
import { Input } from "@turbo/ui/components/input";
import { Spinner } from "@turbo/ui/components/spinner";
import { cn } from "@turbo/ui/lib/utils";
import { createAccountSchema } from "@turbo/validators";

import { GithubIcon } from "./github-icon";

export const SignupForm = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
  });

  const onSubmit = async (data: CreateAccountFormData) => {
    // Step 1: Create the account
    const { error: signUpError } = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.email.split("@")[0] ?? "User", // Use email prefix as initial name
    });

    if (signUpError) {
      toast.error(signUpError.message ?? "Failed to create account");
      return;
    }

    // Step 2: Send email verification OTP
    const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
      email: data.email,
      type: "email-verification",
    });

    if (otpError) {
      toast.error(otpError.message ?? "Failed to send verification code");
      return;
    }

    // Step 3: Redirect to verify-email page with email
    router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
  };

  const handleGithubAuth = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/onboarding",
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <AuthHeader title="Create your account">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-foreground font-medium hover:underline"
            >
              Sign in
            </Link>
          </AuthHeader>

          <Field data-invalid={!!errors.email}>
            <FieldLabel htmlFor="email" className="sr-only">
              Email
            </FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="Your email"
              className="h-11"
              aria-invalid={!!errors.email}
              {...register("email")}
            />
            <FieldError>{errors.email?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password" className="sr-only">
              Password
            </FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              className="h-11"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <FieldError>{errors.password?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.confirmPassword}>
            <FieldLabel htmlFor="confirmPassword" className="sr-only">
              Confirm Password
            </FieldLabel>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              className="h-11"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            <FieldError>{errors.confirmPassword?.message}</FieldError>
          </Field>

          <Field>
            <Button type="submit" className="h-11" disabled={isSubmitting}>
              {isSubmitting && <Spinner data-icon="inline-start" />}
              Create account
            </Button>
          </Field>

          <FieldSeparator>or</FieldSeparator>

          <Field>
            <Button
              variant="secondary"
              type="button"
              className="h-11"
              onClick={handleGithubAuth}
            >
              <GithubIcon />
              Continue with GitHub
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        You acknowledge that you read, and agree, to our{" "}
        <Link href="/terms" className="underline underline-offset-2">
          Terms of Service
        </Link>{" "}
        and our{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </FieldDescription>
    </div>
  );
};
