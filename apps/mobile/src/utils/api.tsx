import { QueryClient } from "@tanstack/react-query";
import { hc } from "hono/client";

import type { AppType } from "@turbo/api";

import { authClient, getAuthBaseUrl } from "@/auth/client";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ...
    },
  },
});

/**
 * Typed Hono client for Expo app
 * Includes cookie authentication via authClient
 */
const createApiClient = () => {
  const client = hc<AppType>(getAuthBaseUrl() + "/api", {
    headers: (): Record<string, string> => {
      const cookies = authClient.getCookie();
      if (cookies) {
        return { Cookie: cookies };
      }
      return {};
    },
  });
  return client;
};

export const api = createApiClient();
