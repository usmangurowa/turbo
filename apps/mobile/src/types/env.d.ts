declare namespace NodeJS {
  interface ProcessEnv {
    readonly EXPO_PUBLIC_API_URL?: string;
    readonly EXPO_PUBLIC_SUPABASE_URL?: string;
    readonly EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
    // Per-profile overrides set by eas.json build profiles
    readonly EXPO_PUBLIC_APP_NAME?: string;
    readonly EXPO_PUBLIC_PACKAGE_NAME?: string;
    readonly EXPO_PUBLIC_SENTRY_DSN?: string;
    readonly EXPO_PUBLIC_POSTHOG_KEY?: string;
  }
}
