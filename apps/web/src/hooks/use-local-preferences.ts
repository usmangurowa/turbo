"use client";

import { useCallback, useState } from "react";

// Must match the cookie name in proxy.ts
const REDIRECT_PREFERENCE_COOKIE = "turbo-redirect-to-dashboard";

/**
 * Local preferences that are NOT synced to the server.
 * These are stored in cookies and are browser-specific.
 */
export interface LocalPreferences {
  /** Whether to redirect authenticated users from landing page to dashboard */
  redirectToDashboard: boolean;
}

/**
 * Get a cookie value by name (client-side only)
 */
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const match = new RegExp(`(^| )${name}=([^;]+)`).exec(document.cookie);
  return match?.[2] ? decodeURIComponent(match[2]) : null;
};

/**
 * Set a cookie value (client-side only)
 * Sets a long expiry (1 year) for persistent preferences
 */
const setCookie = (name: string, value: string) => {
  if (typeof document === "undefined") return;
  const maxAge = 365 * 24 * 60 * 60; // 1 year in seconds
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

/**
 * Hook for managing local preferences stored in cookies.
 * Unlike user settings, these are NOT synced to the server.
 * Cookies are used instead of localStorage so middleware can access them.
 *
 * @example
 * ```tsx
 * const { preferences, setPreference } = useLocalPreferences();
 *
 * return (
 *   <Switch
 *     checked={preferences.redirectToDashboard}
 *     onCheckedChange={(v) => setPreference("redirectToDashboard", v)}
 *   />
 * );
 * ```
 */
export const useLocalPreferences = () => {
  // Lazy initialization - reads from cookie only once on mount
  const [preferences, setPreferences] = useState<LocalPreferences>(() => {
    const redirectCookie = getCookie(REDIRECT_PREFERENCE_COOKIE);
    return {
      redirectToDashboard: redirectCookie !== "false", // default to true
    };
  });

  // Set a single preference value and sync to cookie
  const setPreference = useCallback(
    <K extends keyof LocalPreferences>(key: K, value: LocalPreferences[K]) => {
      setPreferences((prev) => {
        const updated = { ...prev, [key]: value };

        // Sync to cookie - currently only one preference, but extensible
        setCookie(
          REDIRECT_PREFERENCE_COOKIE,
          String(updated.redirectToDashboard),
        );

        return updated;
      });
    },
    [],
  );

  return {
    preferences,
    setPreference,
  };
};
