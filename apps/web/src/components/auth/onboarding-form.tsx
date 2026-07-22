"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/auth/client";
import { AuthHeader } from "@/components/auth/auth-header";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import type { OnboardingFormData } from "@turbo/validators";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@turbo/ui/components/avatar";
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
import { onboardingSchema } from "@turbo/validators";

interface OnboardingFormProps extends React.ComponentProps<"div"> {
  defaultValues?: Partial<OnboardingFormData>;
}

export const OnboardingForm = ({
  className,
  defaultValues,
  ...props
}: OnboardingFormProps) => {
  const router = useRouter();

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: defaultValues?.username ?? "",
      firstName: defaultValues?.firstName ?? "",
      lastName: defaultValues?.lastName ?? "",
      avatarUrl: defaultValues?.avatarUrl ?? "",
    },
  });

  const firstName = useWatch({ control, name: "firstName", defaultValue: "" });
  const lastName = useWatch({ control, name: "lastName", defaultValue: "" });
  const avatarUrl = useWatch({
    control,
    name: "avatarUrl",
    defaultValue: "",
  });

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const onSubmit = async (data: OnboardingFormData) => {
    const fullName = `${data.firstName} ${data.lastName}`.trim();

    const { error } = await authClient.updateUser({
      name: fullName,
      image: data.avatarUrl ?? undefined,
      username: data.username,
    });

    if (error) {
      toast.error(error.message ?? "Failed to update profile");
      return;
    }

    toast.success("Profile updated successfully!");

    // Navigate to dashboard
    router.push("/dashboard");
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <AuthHeader title="Complete your profile">
            Tell us a bit about yourself to get started.
          </AuthHeader>

          <div className="flex justify-center">
            <Avatar className="size-20">
              <AvatarImage src={avatarUrl} alt="Profile" />
              <AvatarFallback className="text-lg">
                {initials || "?"}
              </AvatarFallback>
            </Avatar>
          </div>

          <Field data-invalid={!!errors.username}>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              aria-invalid={!!errors.username}
              {...register("username")}
            />
            <FieldError>{errors.username?.message}</FieldError>
            <FieldDescription>
              This is your public display name
            </FieldDescription>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.firstName}>
              <FieldLabel htmlFor="firstName">First Name</FieldLabel>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                aria-invalid={!!errors.firstName}
                {...register("firstName")}
              />
              <FieldError>{errors.firstName?.message}</FieldError>
            </Field>

            <Field data-invalid={!!errors.lastName}>
              <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                aria-invalid={!!errors.lastName}
                {...register("lastName")}
              />
              <FieldError>{errors.lastName?.message}</FieldError>
            </Field>
          </div>

          <Field data-invalid={!!errors.avatarUrl}>
            <FieldLabel htmlFor="avatarUrl">Avatar URL (optional)</FieldLabel>
            <Input
              id="avatarUrl"
              type="url"
              placeholder="https://example.com/avatar.jpg"
              aria-invalid={!!errors.avatarUrl}
              {...register("avatarUrl")}
            />
            <FieldError>{errors.avatarUrl?.message}</FieldError>
          </Field>

          <Field>
            <Button type="submit" className="h-11" disabled={isSubmitting}>
              {isSubmitting && <Spinner data-icon="inline-start" />}
              Complete setup
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
};
