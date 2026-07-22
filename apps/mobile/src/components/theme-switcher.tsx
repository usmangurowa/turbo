import type { IconSvgElement } from "@hugeicons/react-native";
import { Pressable, View } from "react-native";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import {
  ComputerIcon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons";
import { Uniwind, useUniwind } from "uniwind";

const themes: {
  name: "light" | "dark" | "system";
  label: string;
  icon: IconSvgElement;
}[] = [
  { name: "light", label: "Light", icon: Sun03Icon },
  { name: "dark", label: "Dark", icon: Moon02Icon },
  { name: "system", label: "System", icon: ComputerIcon },
];

/**
 * Theme switcher — segmented control with light/dark/system options.
 * Uses Uniwind's setTheme + useUniwind for theme management, mirroring
 * the web ThemeToggle (next-themes) behavior.
 */
export const ThemeSwitcher = () => {
  const { theme, hasAdaptiveThemes } = useUniwind();
  const activeTheme = hasAdaptiveThemes ? "system" : theme;

  return (
    <View className="bg-secondary flex-row rounded-xl p-1">
      {themes.map((t) => {
        const isActive = activeTheme === t.name;
        return (
          <Pressable
            key={t.name}
            onPress={() => Uniwind.setTheme(t.name)}
            className={cn(
              "flex-1 flex-row items-center justify-center gap-1.5 rounded-lg px-3 py-2",
              isActive && "bg-background",
            )}
          >
            <Icon
              icon={t.icon}
              className={cn(
                "size-4",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            />
            <Text
              className={cn(
                "text-xs font-medium",
                isActive ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};
