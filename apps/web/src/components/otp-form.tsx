"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/auth/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Controller, useForm } from "react-hook-form";

import type { VerifyEmailFormData } from "@turbo/validators";
import { cn } from "@turbo/ui";
import { Button } from "@turbo/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@turbo/ui/field";
import { Icon } from "@turbo/ui/icon";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@turbo/ui/input-otp";
import { toast } from "@turbo/ui/toast";
import { verifyEmailSchema } from "@turbo/validators";

import { TurboLogo } from "./turbo-logo";

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
    <div className={cn("relative flex flex-col gap-6", className)} {...props}>
      <Button
        size={"icon"}
        variant={"secondary"}
        className="absolute top-0 left-0"
        onClick={() => router.back()}
      >
        <Icon icon={ArrowLeft01Icon} />
      </Button>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              href="/"
              className="mb-5 flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <TurboLogo />
              </div>
              <span className="sr-only">Turbo</span>
            </Link>
            <h1 className="text-xl font-bold">Enter verification code</h1>
            <FieldDescription>
              We sent a 6-digit code to your email address
            </FieldDescription>
          </div>

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
                  <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
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
                className="text-primary underline disabled:opacity-50"
                onClick={handleResend}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend"}
              </button>
            </FieldDescription>
          </Field>

          <Field>
            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Verify
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{" "}
        <Link href="/terms" className="text-primary underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-primary underline">
          Privacy Policy
        </Link>
        .
      </FieldDescription>
    </div>
  );
};
