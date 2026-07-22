import { View } from "react-native";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { StyledSafeAreaView } from "@/components/ui/safe-area-view";
import { Text } from "@/components/ui/text";
import { FlashIcon } from "@hugeicons/core-free-icons";

const App = () => {
  return (
    <StyledSafeAreaView className="flex-1">
      <View className="flex-1 justify-between px-6 py-8">
        {/* Brand */}
        <View className="flex-row items-center gap-2">
          <View className="bg-primary size-8 items-center justify-center rounded-lg">
            <Icon icon={FlashIcon} className="text-primary-foreground size-4" />
          </View>
          <Text className="font-inter-semibold text-base">Turbo</Text>
        </View>

        {/* Hero */}
        <View className="gap-4">
          <View className="bg-secondary self-start rounded-full px-3 py-1.5">
            <Text className="text-muted-foreground text-xs">
              Template ready — clone and ship
            </Text>
          </View>
          <Text className="font-inter-semibold text-4xl leading-tight tracking-tight">
            Ship your next product on a foundation that scales
          </Text>
          <Text className="text-muted-foreground font-inter text-base leading-relaxed">
            One theme, one codebase — Expo and Next.js sharing the same design
            system, auth, and API.
          </Text>
        </View>

        {/* Actions */}
        <View className="gap-4">
          <View className="gap-3">
            <Link href="/(auth)/create-account" asChild>
              <Button size="lg" className="w-full">
                <Text>Get started</Text>
              </Button>
            </Link>
            <Link href="/(auth)/login" asChild>
              <Button size="lg" variant="outline" className="w-full">
                <Text>Sign in</Text>
              </Button>
            </Link>
          </View>
          <ThemeSwitcher />
        </View>

        <StatusBar style="auto" />
      </View>
    </StyledSafeAreaView>
  );
};

export default App;
