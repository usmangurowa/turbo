import { Alert, ScrollView, View } from "react-native";
import { Link, router } from "expo-router";
import { authClient } from "@/auth/client";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { zodResolver } from "@hookform/resolvers/zod";
import { TimeScheduleIcon } from "@hugeicons/core-free-icons";
import { useForm } from "react-hook-form";

import type { CreateAccountFormData } from "@turbo/validators";
import { createAccountSchema } from "@turbo/validators";

export default function CreateAccountScreen() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CreateAccountFormData>({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: CreateAccountFormData) => {
    // Step 1: Create the account
    const { error: signUpError } = await authClient.signUp.email({
      email: data.email,
      password: data.password,
      name: data.email.split("@")[0] ?? data.email, // Use email prefix as initial name
    });

    if (signUpError) {
      Alert.alert("Error", signUpError.message ?? "Failed to create account");
      return;
    }

    // Step 2: Send verification OTP
    const { error: otpError } = await authClient.emailOtp.sendVerificationOtp({
      email: data.email,
      type: "email-verification",
    });

    if (otpError) {
      Alert.alert(
        "Error",
        otpError.message ?? "Failed to send verification code",
      );
      return;
    }

    // Navigate to verify-email with email param
    router.push(
      `/(auth)/verify-email?email=${encodeURIComponent(data.email)}`,
    );
  };

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="flex-grow justify-center p-6"
      keyboardShouldPersistTaps="handled"
    >
      <View className="gap-6">
        <View className="items-center gap-2">
          <View className="size-12 items-center justify-center rounded-lg">
            <Icon icon={TimeScheduleIcon} className="text-foreground size-8" />
          </View>
          <Text className="text-xl font-bold">Create your account</Text>
          <Text className="text-muted-foreground text-center text-sm">
            Already have an account?{" "}
            <Link href={"/(auth)/login"} asChild>
              <Text className="text-primary underline">Sign in</Text>
            </Link>
          </Text>
        </View>

        <View className="gap-4">
          <FormField
            control={control}
            name="email"
            label="Email"
            placeholder="m@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <FormField
            control={control}
            name="password"
            label="Password"
            placeholder="••••••••"
            secureTextEntry
          />

          <FormField
            control={control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="••••••••"
            secureTextEntry
          />

          <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </View>

        <View className="items-center gap-4">
          <View className="flex-row items-center gap-4">
            <View className="bg-border h-px flex-1" />
            <Text className="text-muted-foreground text-sm">Or</Text>
            <View className="bg-border h-px flex-1" />
          </View>

          <View className="w-full flex-row gap-4">
            <Button variant="outline" className="flex-1">
              Apple
            </Button>
            <Button variant="outline" className="flex-1">
              Google
            </Button>
          </View>
        </View>

        <Text className="text-muted-foreground text-center text-xs">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </ScrollView>
  );
}
