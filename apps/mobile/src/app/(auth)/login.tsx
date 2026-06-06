import { Alert, Pressable, ScrollView, View } from "react-native";
import { Link, router } from "expo-router";
import { authClient } from "@/auth/client";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { FormField } from "@/components/ui/form-field";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft01Icon, TimeScheduleIcon } from "@hugeicons/core-free-icons";
import { useForm } from "react-hook-form";

import type { LoginFormData } from "@turbo/validators";
import { loginSchema } from "@turbo/validators";

export default function LoginScreen() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
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
        router.push(
          `/(auth)/verify-email?email=${encodeURIComponent(data.email)}`,
        );
        return;
      }
      Alert.alert("Error", error.message ?? "Invalid email or password");
      return;
    }

    // Navigate to main app after login
    router.replace("/(tabs)");
  };

  return (
    <Container>
      <ScrollView keyboardShouldPersistTaps="handled">
        <View className="gap-6">
          <Button size={"icon"} variant={"ghost"} onPress={() => router.back()}>
            <Icon icon={ArrowLeft01Icon} className="text-white" />
          </Button>
          <View className="items-center gap-2">
            <View className="size-12 items-center justify-center rounded-lg">
              <Icon icon={TimeScheduleIcon} className="text-primary size-10" />
            </View>

            <Text className="text-xl font-bold">Welcome back</Text>
            <Text className="text-muted-foreground text-center text-sm">
              Don't have an account?{" "}
              <Link href={"/(auth)/create-account"} asChild>
                <Text className="text-primary underline">Sign up</Text>
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

            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm font-medium">Password</Text>
                <Link href={"/(auth)/forgot-password"} asChild>
                  <Pressable>
                    <Text className="text-muted-foreground text-sm underline">
                      Forgot password?
                    </Text>
                  </Pressable>
                </Link>
              </View>
              <FormField
                control={control}
                name="password"
                placeholder="••••••••"
                secureTextEntry
              />
            </View>

            <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
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
    </Container>
  );
}
