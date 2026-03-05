declare namespace NodeJS {
  interface ProcessEnv {
    readonly EXPO_PUBLIC_API_URL?: string;
    readonly EXPO_PUBLIC_SUPABASE_URL?: string;
    readonly EXPO_PUBLIC_SUPABASE_ANON_KEY?: string;
    readonly EXPO_PUBLIC_APP_NAME?: string;
    readonly EXPO_PUBLIC_APP_SLUG?: string;
    readonly EXPO_PUBLIC_APP_SCHEME?: string;
    readonly EXPO_PUBLIC_PACKAGE_NAME?: string;
    readonly EXPO_PUBLIC_SENTRY_DSN?: string;
    readonly EXPO_PUBLIC_POSTHOG_KEY?: string;
    readonly EXPO_PUBLIC_POSTHOG_HOST?: string;
  }
}
