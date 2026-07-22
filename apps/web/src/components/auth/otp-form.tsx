"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/auth/client";
import { AuthHeader } from "@/components/auth/auth-header";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import type { VerifyEmailFormData } from "@turbo/validators";
import { Button } from "@turbo/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@turbo/ui/components/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@turbo/ui/components/input-otp";
import { Spinner } from "@turbo/ui/components/spinner";
import { cn } from "@turbo/ui/lib/utils";
import { verifyEmailSchema } from "@turbo/validators";

const RESEND_COOLDOWN_SECONDS = 30;

export const OTPForm = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const type = (searchParams.get("type") ?? "email-verification") as
    "email-verification" | "forget-password";
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResend = useCallback(async () => {
    if (!email || resendCooldown > 0) return;

    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type,
    });

    if (!error) {
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      reset();
      toast.success("Verification code resent!");
    } else {
      toast.error("Failed to resend code");
    }
  }, [email, resendCooldown, type, reset]);

  const onSubmit = async (data: VerifyEmailFormData) => {
    if (!email) {
      toast.error("Email not found. Please start over.");
      return;
    }

    // For password reset, redirect to reset password page with OTP
    if (type === "forget-password") {
      router.push(
        `/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(data.otp)}`,
      );
      return;
    }

    // For email verification - use emailOtp.verifyEmail which verifies AND creates session
    const { error } = await authClient.emailOtp.verifyEmail({
      email,
      otp: data.otp,
    });

    if (error) {
      toast.error(error.message ?? "Invalid verification code");
      return;
    }

    // Email verified and user signed in - redirect to onboarding
    toast.success("Email verified successfully!");
    router.replace("/onboarding");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <AuthHeader title="Check your inbox">
            We sent a 6-digit code to{" "}
            {email ? (
              <span className="text-foreground font-medium">{email}</span>
            ) : (
              "your email address"
            )}
            .
          </AuthHeader>

          <Field data-invalid={!!errors.otp}>
            <FieldLabel htmlFor="otp" className="sr-only">
              Verification code
            </FieldLabel>
            <Controller
              name="otp"
              control={control}
              render={({ field }) => (
                <InputOTP
                  maxLength={6}
                  id="otp"
                  value={field.value}
                  onChange={field.onChange}
                  containerClassName="justify-center gap-4"
                >
                  <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-lg *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-lg *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              )}
            />
            <FieldError className="text-center">
              {errors.otp?.message}
            </FieldError>
            <FieldDescription className="text-center">
              Didn&apos;t receive the code?{" "}
              <button
                type="button"
                className="text-foreground font-medium hover:underline disabled:opacity-50"
                onClick={handleResend}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
              </button>
            </FieldDescription>
          </Field>

          <Field>
            <Button type="submit" className="h-11" disabled={isSubmitting}>
              {isSubmitting && <Spinner data-icon="inline-start" />}
              Verify
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        Entered the wrong email?{" "}
        <button
          type="button"
          className="text-foreground font-medium hover:underline"
          onClick={() => router.back()}
        >
          Go back
        </button>
      </FieldDescription>
    </div>
  );
};
