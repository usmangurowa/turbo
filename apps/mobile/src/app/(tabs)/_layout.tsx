import { Tabs } from "expo-router";
import { Icon } from "@/components/ui/icon";
import {
  Home01Icon,
  Settings01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { useCSSVariable } from "uniwind";

const TabsLayout = () => {
  const [primary, background, card, border, mutedForeground] = useCSSVariable([
    "--primary",
    "--background",
    "--card",
    "--border",
    "--muted-foreground",
  ]) as string[];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: primary,
        tabBarInactiveTintColor: mutedForeground,
        tabBarStyle: {
          backgroundColor: card,
          borderTopColor: border,
        },
        sceneStyle: {
          backgroundColor: background,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Icon icon={Home01Icon} className="size-6" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Icon icon={UserIcon} className="size-6" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <Icon icon={Settings01Icon} className="size-6" color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
