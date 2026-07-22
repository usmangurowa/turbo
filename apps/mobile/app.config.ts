import type { ConfigContext, ExpoConfig } from "expo/config";

// App identity constants. Not secrets — edit them here directly.
// APP_NAME and PACKAGE_NAME accept env overrides because eas.json sets
// per-profile variants (dev/preview/production).
const APP_NAME = process.env.EXPO_PUBLIC_APP_NAME ?? "Turbo";
const PACKAGE_NAME = process.env.EXPO_PUBLIC_PACKAGE_NAME ?? "com.turbo.app";
const APP_SLUG = "turbo";
const APP_SCHEME = "turbo";
const OWNER = "usmangurowa";
// Get your project ID from https://expo.dev/accounts/[owner]/projects/[project]
const EAS_PROJECT_ID = "your-eas-project-id";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: APP_NAME,
  slug: APP_SLUG,
  owner: OWNER,
  scheme: APP_SCHEME,
  version: "1.0.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  assetBundlePatterns: ["**/*"],

  ios: {
    supportsTablet: true,
    bundleIdentifier: PACKAGE_NAME,
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
    icon: {
      dark: "./src/assets/icon-dark.png",
      light: "./src/assets/icon-light.png",
    },
  },

  android: {
    package: PACKAGE_NAME,
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
          "../../packages/assets/fonts/InterDisplay-Regular.ttf",
          "../../packages/assets/fonts/InterDisplay-Medium.ttf",
          "../../packages/assets/fonts/InterDisplay-SemiBold.ttf",
          "../../packages/assets/fonts/InterDisplay-Bold.ttf",
        ],
      },
    ],
    "expo-web-browser",
    "expo-notifications",
    "@sentry/react-native",
    [
      "expo-updates",
      {
        username: OWNER,
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
    url: `https://u.expo.dev/${EAS_PROJECT_ID}`,
  },

  extra: {
    eas: {
      projectId: EAS_PROJECT_ID,
      enableFastRefresh: true,
    },
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_APP_NAME: APP_NAME,
    EXPO_PUBLIC_APP_SLUG: APP_SLUG,
    EXPO_PUBLIC_APP_SCHEME: APP_SCHEME,
    EXPO_PUBLIC_PACKAGE_NAME: PACKAGE_NAME,
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
  },
});
