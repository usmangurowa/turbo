"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/auth/client";
import { AuthHeader } from "@/components/auth/auth-header";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { ResetPasswordFormData } from "@turbo/validators";
import { Button } from "@turbo/ui/components/button";
import { Checkbox } from "@turbo/ui/components/checkbox";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@turbo/ui/components/field";
import { Input } from "@turbo/ui/components/input";
import { Spinner } from "@turbo/ui/components/spinner";
import { cn } from "@turbo/ui/lib/utils";
import { resetPasswordSchema } from "@turbo/validators";

export const ResetPasswordForm = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const otp = searchParams.get("otp") ?? "";
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!email || !otp) {
      toast.error("Missing email or verification code. Please start over.");
      return;
    }

    const { error } = await authClient.emailOtp.resetPassword({
      email,
      otp,
      password: data.password,
    });

    if (error) {
      toast.error(error.message ?? "Failed to reset password");
      return;
    }

    toast.success("Password reset successfully!");
    router.push("/login");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <AuthHeader title="Set a new password">
            Choose a strong password for your account.
          </AuthHeader>

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password" className="sr-only">
              New Password
            </FieldLabel>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="New password"
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
              type={showPassword ? "text" : "password"}
              placeholder="Confirm new password"
              className="h-11"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            <FieldError>{errors.confirmPassword?.message}</FieldError>
          </Field>

          <Field orientation="horizontal">
            <Checkbox
              id="show-password"
              checked={showPassword}
              onCheckedChange={(checked) => setShowPassword(checked === true)}
            />
            <FieldLabel htmlFor="show-password" className="font-normal">
              Show password
            </FieldLabel>
          </Field>

          <Field>
            <Button type="submit" className="h-11" disabled={isSubmitting}>
              {isSubmitting && <Spinner data-icon="inline-start" />}
              Reset password
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
};
