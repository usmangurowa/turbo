import { authClient } from "@/auth/client";

import {
  createAuthenticatedSupabaseClient,
  createSupabaseClient,
} from "@turbo/supabase";

// Expo uses EXPO_PUBLIC_ prefix for public environment variables
function getSupabaseConfig() {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY environment variables",
    );
  }

  return { url, anonKey };
}

const config = getSupabaseConfig();

/**
 * Supabase client for anonymous access in the mobile app.
 */
export const supabase = createSupabaseClient(config.url, config.anonKey);

/**
 * Creates an authenticated Supabase client using the current BetterAuth session.
 *
 * @returns An authenticated Supabase client or null if no session exists
 *
 * @example
 * ```tsx
 * const supabase = await getAuthenticatedSupabase();
 * if (supabase) {
 *   const { data } = await supabase.from('posts').select('*');
 * }
 * ```
 */
export async function getAuthenticatedSupabase() {
  const { data: session } = await authClient.getSession();

  if (!session?.session.token) {
    return null;
  }

  return createAuthenticatedSupabaseClient(
    config.url,
    config.anonKey,
    session.session.token,
  );
}
