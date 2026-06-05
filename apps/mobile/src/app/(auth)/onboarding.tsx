import type { Href } from "expo-router";
import { Alert, ScrollView, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { authClient } from "@/auth/client";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { TimeScheduleIcon } from "@hugeicons/core-free-icons";
import { useForm, useWatch } from "react-hook-form";

import type { OnboardingFormData } from "@turbo/validators";
import { onboardingSchema } from "@turbo/validators";

export default function OnboardingScreen() {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      username: "",
      firstName: "",
      lastName: "",
      avatarUrl: "",
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
    });

    if (error) {
      Alert.alert("Error", error.message ?? "Failed to update profile");
      return;
    }

    Alert.alert("Success", "Profile updated successfully!");
    router.replace("/(tabs)" as Href);
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
          <Text className="text-xl font-bold">Complete your profile</Text>
          <Text className="text-muted-foreground text-center text-sm">
            Tell us a bit about yourself to get started
          </Text>
        </View>

        <View className="items-center">
          <View
            className={cn(
              "bg-muted size-20 items-center justify-center overflow-hidden rounded-full",
            )}
          >
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                className="size-20"
                contentFit="cover"
              />
            ) : (
              <Text className="text-muted-foreground text-2xl font-medium">
                {initials || "?"}
              </Text>
            )}
          </View>
        </View>

        <View className="gap-4">
          <FormField
            control={control}
            name="username"
            label="Username"
            placeholder="johndoe"
            autoCapitalize="none"
          />

          <View className="flex-row gap-4">
            <View className="flex-1">
              <FormField
                control={control}
                name="firstName"
                label="First Name"
                placeholder="John"
              />
            </View>
            <View className="flex-1">
              <FormField
                control={control}
                name="lastName"
                label="Last Name"
                placeholder="Doe"
              />
            </View>
          </View>

          <FormField
            control={control}
            name="avatarUrl"
            label="Avatar URL (optional)"
            placeholder="https://example.com/avatar.jpg"
            autoCapitalize="none"
            keyboardType="default"
          />

          <Button onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Complete Setup"}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
