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

import type { ForgotPasswordFormData } from "@turbo/validators";
import { forgotPasswordSchema } from "@turbo/validators";

export default function ForgotPasswordScreen() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    const { error } = await authClient.forgetPassword.emailOtp({
      email: data.email,
    });

    if (error) {
      Alert.alert("Error", error.message ?? "Failed to send reset code");
      return;
    }

    // Navigate to verify-email page with email and reset type
    router.push(
      `/(auth)/verify-email?email=${encodeURIComponent(data.email)}&type=forget-password`,
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
          <Text className="text-xl font-bold">Reset your password</Text>
          <Text className="text-muted-foreground text-center text-sm">
            Enter your email address and we'll send you a verification code to
            reset your password.
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

          <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send Reset Code"}
          </Button>
        </View>

        <View className="items-center">
          <Text className="text-muted-foreground text-sm">
            Remember your password?{" "}
            <Link href={"/(auth)/login"} asChild>
              <Text className="text-primary underline">Back to login</Text>
            </Link>
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
