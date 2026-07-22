import type { Metadata } from "next";
import { getSession } from "@/auth/server";
import { OnboardingForm } from "@/components/auth/onboarding-form";

export const metadata: Metadata = {
  title: "Onboarding",
  description: "Complete your profile",
};

export default async function OnboardingPage() {
  const session = await getSession();

  const [firstName = "", lastName = ""] = (session?.user.name ?? "").split(
    " ",
  );

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
