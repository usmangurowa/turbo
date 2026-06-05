import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useRef } from "react";
import { router, useSegments } from "expo-router";
import { authClient } from "@/auth/client";
import * as Sentry from "@sentry/react-native";
import { usePostHog } from "posthog-react-native";

import type { PostHogIdentifier } from "@turbo/analytics";
import { syncUserIdentity } from "@turbo/analytics";

interface AuthContextType {
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { data: session, isPending } = authClient.useSession();
  const segments = useSegments();
  const posthog = usePostHog();
  const identifiedRef = useRef<string | null>(null);

  // Identify user with Sentry and PostHog when session changes
  useEffect(() => {
    const newId = syncUserIdentity(
      session?.user,
      identifiedRef.current,
      Sentry,
      posthog as PostHogIdentifier,
    );

    if (newId !== identifiedRef.current) {
      identifiedRef.current = newId;
    }
  }, [session?.user, posthog]);

  useEffect(() => {
    if (isPending) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";
    const isAuthenticated = !!session?.user;

    if (!isAuthenticated && inTabsGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, isPending, segments]);

  return (
    <AuthContext.Provider
      value={{
        isLoading: isPending,
        isAuthenticated: !!session?.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
