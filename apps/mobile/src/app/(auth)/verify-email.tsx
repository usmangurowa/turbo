import type { Href } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, TextInput, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { authClient } from "@/auth/client";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { TimeScheduleIcon } from "@hugeicons/core-free-icons";
import { Controller, useForm, useWatch } from "react-hook-form";

import type { VerifyEmailFormData } from "@turbo/validators";
import { verifyEmailSchema } from "@turbo/validators";

const RESEND_COOLDOWN_SECONDS = 30;

export default function VerifyEmailScreen() {
  const { email, type } = useLocalSearchParams<{
    email?: string;
    type?: "email-verification" | "forget-password";
  }>();
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: {
      otp: "",
    },
  });

  const otp = useWatch({ control, name: "otp", defaultValue: "" });
  const otpType = type ?? "email-verification";

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResend = useCallback(async () => {
    if (!email || resendCooldown > 0) return;

    const { error } = await authClient.emailOtp.sendVerificationOtp({
      email,
      type: otpType,
    });

    if (!error) {
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      Alert.alert("Success", "Verification code resent!");
    } else {
      Alert.alert("Error", "Failed to resend code");
    }
  }, [email, resendCooldown, otpType]);

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = otp.split("");
    newOtp[index] = text;
    setValue("otp", newOtp.join(""));
  };

  const onSubmit = async (data: VerifyEmailFormData) => {
    if (!email) {
      Alert.alert("Error", "Email not found. Please start over.");
      return;
    }

    // For password reset, redirect to reset password page with OTP
    if (otpType === "forget-password") {
      router.push(
        `/(auth)/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(data.otp)}` as Href,
      );
      return;
    }

    // For email verification
    const { error } = await authClient.emailOtp.verifyEmail({
      email,
      otp: data.otp,
    });

    if (error) {
      Alert.alert("Error", error.message ?? "Invalid verification code");
      return;
    }

    Alert.alert("Success", "Email verified successfully!");

    // Navigate to onboarding page after verification
    router.push("/(auth)/onboarding" as Href);
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
          <Text className="text-xl font-bold">Enter verification code</Text>
          <Text className="text-muted-foreground text-center text-sm">
            We sent a 6-digit code to your email address
          </Text>
        </View>

        <Controller
          control={control}
          name="otp"
          render={() => (
            <View className="gap-4">
              <View className="flex-row justify-center gap-3">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <TextInput
                    key={index}
                    className={cn(
                      "border-input bg-background text-foreground size-14 rounded-lg border text-center text-2xl font-medium",
                      focusedIndex === index && "border-primary border-2",
                      errors.otp && "border-destructive",
                    )}
                    maxLength={1}
                    keyboardType="number-pad"
                    value={otp[index] ?? ""}
                    onChangeText={(text) => handleOtpChange(text, index)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(null)}
                  />
                ))}
              </View>
              {errors.otp?.message && (
                <Text className="text-destructive text-center text-sm">
                  {errors.otp.message}
                </Text>
              )}
            </View>
          )}
        />

        <View className="items-center">
          <Text className="text-muted-foreground text-sm">
            Didn't receive the code?{" "}
            <Pressable onPress={handleResend} disabled={resendCooldown > 0}>
              <Text
                className={cn(
                  "text-primary underline",
                  resendCooldown > 0 && "text-muted-foreground",
                )}
              >
                {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : "Resend"}
              </Text>
            </Pressable>
          </Text>
        </View>

        <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? "Verifying..." : "Verify"}
        </Button>

        <Text className="text-muted-foreground text-center text-xs">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </Text>
      </View>
    </ScrollView>
  );
}
