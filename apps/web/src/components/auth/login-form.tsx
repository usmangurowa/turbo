"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/auth/client";
import { AuthHeader } from "@/components/auth/auth-header";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import type { LoginFormData } from "@turbo/validators";
import { Button } from "@turbo/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@turbo/ui/components/field";
import { Input } from "@turbo/ui/components/input";
import { Spinner } from "@turbo/ui/components/spinner";
import { cn } from "@turbo/ui/lib/utils";
import { loginSchema } from "@turbo/validators";

import { GithubIcon } from "./github-icon";

export const LoginForm = ({
  className,
  ...props
}: React.ComponentProps<"div">) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const { error } = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (error) {
      // Check if email not verified - redirect to verification
      if (error.code === "EMAIL_NOT_VERIFIED") {
        await authClient.emailOtp.sendVerificationOtp({
          email: data.email,
          type: "email-verification",
        });
        router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
        return;
      }
      toast.error(error.message ?? "Invalid email or password");
      return;
    }

    // Navigate to dashboard after login
    router.push("/dashboard");
  };

  const handleGithubAuth = async () => {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/dashboard",
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <AuthHeader title="Welcome back">
            First time here?{" "}
            <Link
              href="/create-account"
              className="text-foreground font-medium hover:underline"
            >
              Sign up for free
            </Link>
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

          <Field data-invalid={!!errors.password}>
            <FieldLabel htmlFor="password" className="sr-only">
              Password
            </FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="Your password"
              className="h-11"
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            <FieldError>{errors.password?.message}</FieldError>
          </Field>

          <Field>
            <Button type="submit" className="h-11" disabled={isSubmitting}>
              {isSubmitting && <Spinner data-icon="inline-start" />}
              Sign in
            </Button>
            <FieldDescription className="text-center">
              <Link
                href="/forgot-password"
                className="text-foreground font-medium hover:underline"
              >
                Forgot your password?
              </Link>
            </FieldDescription>
          </Field>

          <FieldSeparator>or</FieldSeparator>

          <Field>
            <Button
              variant="secondary"
              type="button"
              className="h-11"
              onClick={handleGithubAuth}
            >
              <GithubIcon />
              Continue with GitHub
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        You acknowledge that you read, and agree, to our{" "}
        <Link href="/terms" className="underline underline-offset-2">
          Terms of Service
        </Link>{" "}
        and our{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </FieldDescription>
    </div>
  );
};
