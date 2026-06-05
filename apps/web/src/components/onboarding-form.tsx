"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/auth/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { TimeScheduleIcon } from "@hugeicons/core-free-icons";
import { useForm, useWatch } from "react-hook-form";

import type { OnboardingFormData } from "@turbo/validators";
import { cn } from "@turbo/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@turbo/ui/avatar";
import { Button } from "@turbo/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@turbo/ui/field";
import { Icon } from "@turbo/ui/icon";
import { Input } from "@turbo/ui/input";
import { toast } from "@turbo/ui/toast";
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
          <div className="flex flex-col items-center gap-2 text-center">
            <Link
              href="/"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <Icon icon={TimeScheduleIcon} className="size-6" />
              </div>
              <span className="sr-only">Turbo</span>
            </Link>
            <h1 className="text-xl font-bold">Complete your profile</h1>
            <FieldDescription>
              Tell us a bit about yourself to get started
            </FieldDescription>
          </div>

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
            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              Complete Setup
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
};
