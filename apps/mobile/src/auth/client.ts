import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { expoClient } from "@better-auth/expo/client";
import { emailOTPClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const getAuthBaseUrl = (): string => {
  const devURL = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  const prodURL = process.env.EXPO_PUBLIC_API_URL;

  return prodURL ?? devURL ?? "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getAuthBaseUrl(),
  plugins: [
    emailOTPClient(),
    expoClient({
      scheme: "turbo",
      storagePrefix: "turbo",
      storage: SecureStore,
    }),
  ],
});

// Export typed hooks
export const { useSession, signIn, signUp, signOut } = authClient;
