import { redirect } from "next/navigation";
import { getSession } from "@/auth/server";
import { OnboardingForm } from "@/components/onboarding-form";

export default async function OnboardingPage() {
  const session = await getSession();

  // If not logged in, redirect to login
  if (!session?.user) {
    redirect("/login");
  }

  // If user has already completed onboarding (has username), go to dashboard
  if (session.user.username) {
    redirect("/dashboard");
  }

  // Pass user data to pre-fill the form (especially for OAuth users)
  const nameParts = session.user.name.split(" ");

  return (
    <OnboardingForm
      defaultValues={{
        username: "",
        firstName: nameParts[0] ?? "",
        lastName: nameParts.slice(1).join(" "),
        avatarUrl: session.user.image ?? "",
      }}
    />
  );
}
