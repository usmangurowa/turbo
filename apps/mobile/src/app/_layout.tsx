import "../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/auth/provider";
import { queryClient } from "@/utils/api";
import { PortalHost } from "@rn-primitives/portal";
import * as Sentry from "@sentry/react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { PostHogProvider } from "posthog-react-native";
import { useCSSVariable } from "uniwind";

import { SENTRY_CONFIG } from "@turbo/analytics";
import { POSTHOG_HOST } from "@turbo/shared/constants";

// Initialize Sentry for error tracking
if (process.env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: SENTRY_CONFIG.tracesSampleRate,
  });
}

const posthogKey = process.env.EXPO_PUBLIC_POSTHOG_KEY;
const posthogHost = POSTHOG_HOST;

const Layout = () => {
  const bg = useCSSVariable("--background") as string;

  const content = (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
            animationDuration: 300,
            animationMatchesGesture: true,
            animationTypeForReplace: "pop",
            contentStyle: {
              backgroundColor: bg,
            },
          }}
        />
        <StatusBar style={"auto"} />
        <PortalHost />
      </AuthProvider>
    </QueryClientProvider>
  );

  return posthogKey ? (
    <PostHogProvider apiKey={posthogKey} options={{ host: posthogHost }}>
      {content}
    </PostHogProvider>
  ) : (
    content
  );
};

export default Sentry.wrap(Layout);
