import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import { authClient } from "@/auth/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Icon } from "@/components/ui/icon";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { zodResolver } from "@hookform/resolvers/zod";
import { TimeScheduleIcon } from "@hugeicons/core-free-icons";
import { useForm } from "react-hook-form";

import type { ResetPasswordFormData } from "@turbo/validators";
import { resetPasswordSchema } from "@turbo/validators";

export default function ResetPasswordScreen() {
  const { email, otp } = useLocalSearchParams<{
    email?: string;
    otp?: string;
  }>();
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!email || !otp) {
      Alert.alert(
        "Error",
        "Missing email or verification code. Please start over.",
      );
      return;
    }

    const { error } = await authClient.emailOtp.resetPassword({
      email,
      otp,
      password: data.password,
    });

    if (error) {
      Alert.alert("Error", error.message ?? "Failed to reset password");
      return;
    }

    Alert.alert("Success", "Password reset successfully!");
    router.replace("/(auth)/login");
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
          <Text className="text-xl font-bold">Set new password</Text>
          <Text className="text-muted-foreground text-center text-sm">
            Enter your new password below.
          </Text>
        </View>

        <View className="gap-4">
          <FormField
            control={control}
            name="password"
            label="New Password"
            placeholder="••••••••"
            secureTextEntry={!showPassword}
          />

          <FormField
            control={control}
            name="confirmPassword"
            label="Confirm Password"
            placeholder="••••••••"
            secureTextEntry={!showPassword}
          />

          <View className="flex-row items-center gap-2">
            <Checkbox
              checked={showPassword}
              onCheckedChange={setShowPassword}
            />
            <Label
              nativeID="show-password"
              onPress={() => setShowPassword(!showPassword)}
            >
              Show passwords
            </Label>
          </View>

          <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Resetting..." : "Reset Password"}
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
