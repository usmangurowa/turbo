import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: process.env.EXPO_PUBLIC_APP_NAME || "Turbo",
  slug: process.env.EXPO_PUBLIC_APP_SLUG || "turbo",
  owner: process.env.EXPO_OWNER || "usmangurowa",
  scheme: process.env.EXPO_PUBLIC_APP_SCHEME || "turbo",
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  assetBundlePatterns: ["**/*"],

  ios: {
    supportsTablet: true,
    bundleIdentifier: process.env.EXPO_PUBLIC_PACKAGE_NAME || "com.turbo.app",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
    icon: {
      dark: "./src/assets/icon-dark.png",
      light: "./src/assets/icon-light.png",
    },
  },

  android: {
    package: process.env.EXPO_PUBLIC_PACKAGE_NAME || "com.turbo.app",
    adaptiveIcon: {
      foregroundImage: "./src/assets/icon-light.png",
      monochromeImage: "./src/assets/icon-dark.png",
      backgroundColor: "#3976E8",
    },
  },

  web: {
    bundler: "metro",
    output: "static",
  },

  runtimeVersion: {
    policy: "appVersion",
  },

  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
    reactCompiler: true,
  },

  plugins: [
    "expo-router",
    "expo-secure-store",
    [
      "expo-build-properties",
      {
        android: {
          userCleartextTraffic: true,
        },
      },
    ],
    [
      "expo-font",
      {
        fonts: [
          "./src/assets/fonts/PlusJakartaSans-Light.ttf",
          "./src/assets/fonts/PlusJakartaSans-Regular.ttf",
          "./src/assets/fonts/PlusJakartaSans-Medium.ttf",
          "./src/assets/fonts/PlusJakartaSans-SemiBold.ttf",
          "./src/assets/fonts/PlusJakartaSans-Bold.ttf",
          "./src/assets/fonts/PlusJakartaSans-ExtraBold.ttf",
        ],
      },
    ],
    "expo-web-browser",
    "expo-notifications",
    "@sentry/react-native",
    [
      "expo-updates",
      {
        username: process.env.EXPO_OWNER || "usmangurowa",
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#3976E8",
        resizeMode: "contain",
        image: "./src/assets/icon-light.png",
        imageWidth: 200,
        dark: {
          image: "./src/assets/icon-dark.png",
          backgroundColor: "#000000",
        },
      },
    ],
  ],

  updates: {
    url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID}`,
  },

  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID,
      enableFastRefresh: true,
    },
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_APP_NAME: process.env.EXPO_PUBLIC_APP_NAME,
    EXPO_PUBLIC_APP_SLUG: process.env.EXPO_PUBLIC_APP_SLUG,
    EXPO_PUBLIC_APP_SCHEME: process.env.EXPO_PUBLIC_APP_SCHEME,
    EXPO_PUBLIC_PACKAGE_NAME: process.env.EXPO_PUBLIC_PACKAGE_NAME,
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  },
});
