import type { Metadata } from "next";
import { Suspense } from "react";
import { OTPForm } from "@/components/auth/otp-form";

export const metadata: Metadata = {
  title: "Verify Email",
  description: "Verify your email address",
};

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <OTPForm />
    </Suspense>
  );
}
