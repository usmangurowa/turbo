import type { Metadata } from "next";
import { Suspense } from "react";
import { getSession } from "@/auth/server";
import { OnboardingForm } from "@/components/auth/onboarding-form";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Complete your profile",
};

// Reads the session (cookies) at request time, so it streams inside the
// page's Suspense boundary to keep the route prerenderable.
async function OnboardingFormWithSession() {
  const session = await getSession();

  const [firstName = "", lastName = ""] = (session?.user.name ?? "").split(" ");

  return (
    <OnboardingForm
      defaultValues={{
        firstName,
        lastName,
        avatarUrl: session?.user.image ?? "",
      }}
    />
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingFormWithSession />
    </Suspense>
  );
}
