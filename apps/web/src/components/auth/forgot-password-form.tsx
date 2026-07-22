"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/auth/client";
import { AuthHeader } from "@/components/auth/auth-header";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { ForgotPasswordFormData } from "@turbo/validators";
import { Button } from "@turbo/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@turbo/ui/components/field";
import { Input } from "@turbo/ui/components/input";
import { Spinner } from "@turbo/ui/components/spinner";
import { cn } from "@turbo/ui/lib/utils";
import { forgotPasswordSchema } from "@turbo/validators";

export const ForgotPasswordForm = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const { error } = await authClient.forgetPassword.emailOtp({
      email: data.email,
    });

    if (error) {
      toast.error(error.message ?? "Failed to send reset code");
      return;
    }

    // Navigate to verify-email page with email and reset type
    router.push(
      `/verify-email?email=${encodeURIComponent(data.email)}&type=forget-password`,
    );
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <AuthHeader title="Forgot your password?">
            Enter your email and we&apos;ll send you a verification code to
            reset it.
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

          <Field>
            <Button type="submit" className="h-11" disabled={isSubmitting}>
              {isSubmitting && <Spinner data-icon="inline-start" />}
              {isSubmitting ? "Sending..." : "Send reset code"}
            </Button>
          </Field>

          <FieldDescription className="text-center">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-foreground font-medium hover:underline"
            >
              Sign in
            </Link>
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  );
};
