import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { apiKey } from "@better-auth/api-key";
import { expo } from "@better-auth/expo";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { emailOTP } from "better-auth/plugins/email-otp";
import { oAuthProxy } from "better-auth/plugins/oauth-proxy";

import { db } from "@turbo/db/client";

interface SocialProviderConfig {
  clientId: string;
  clientSecret: string;
}

type OTPType =
  | "sign-in"
  | "email-verification"
  | "forget-password"
  | "change-email";

interface SendOTPEmailParams {
  email: string;
  otp: string;
  type: OTPType;
}

interface InitAuthOptions<TExtraPlugins extends BetterAuthPlugin[] = []> {
  baseUrl: string;
  productionUrl: string;
  secret: string | undefined;
  supabaseJwtSecret: string;
  /**
   * Optional social providers configuration.
   * If provided, the corresponding OAuth provider will be enabled.
   */
  socialProviders?: {
    discord?: SocialProviderConfig;
    google?: SocialProviderConfig;
    github?: SocialProviderConfig;
  };
  /**
   * Callback to send OTP emails for verification, password reset, etc.
   */
  sendOTPEmail?: (params: SendOTPEmailParams) => Promise<void>;
  extraPlugins?: TExtraPlugins;
}

export const initAuth = <TExtraPlugins extends BetterAuthPlugin[] = []>(
  options: InitAuthOptions<TExtraPlugins>,
) => {
  // Define supported social providers - add new providers here
  const supportedProviders = ["discord", "google", "github"] as const;
  type SupportedProvider = (typeof supportedProviders)[number];

  const socialProviders: BetterAuthOptions["socialProviders"] = {};

  // Initialize configured social providers dynamically
  for (const provider of supportedProviders) {
    const config = options.socialProviders?.[provider];
    if (config) {
      const baseConfig = {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
        redirectURI: `${options.productionUrl}/api/auth/callback/${provider}`,
      };

      // Add GitHub-specific profile mapping
      if (provider === "github") {
        (socialProviders as Record<SupportedProvider, unknown>)[provider] = {
          ...baseConfig,
          scope: ["repo", "user"],
          mapProfileToUser: (profile: {
            login?: string;
            avatar_url?: string;
            name?: string;
            html_url?: string;
          }) => ({
            githubUsername: profile.login,
            githubProfileUrl: profile.html_url,
            image: profile.avatar_url,
            name: profile.name ?? profile.login,
          }),
        };
      } else {
        (socialProviders as Record<SupportedProvider, unknown>)[provider] =
          baseConfig;
      }
    }
  }

  const config = {
    database: drizzleAdapter(db, {
      provider: "pg",
    }),
    baseURL: options.baseUrl,
    secret: options.secret,
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60, // 5 minutes - cache session in cookie to prevent refetches
      },
    },
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
    },
    user: {
      additionalFields: {
        username: {
          type: "string",
          unique: true,
          required: false,
        },
        githubUsername: {
          type: "string",
          required: false,
        },
        githubProfileUrl: {
          type: "string",
          required: false,
        },
      },
    },
    plugins: [
      oAuthProxy({
        productionURL: options.productionUrl,
      }),
      expo(),
      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          if (options.sendOTPEmail) {
            await options.sendOTPEmail({ email, otp, type });
          }
        },
      }),
      apiKey({
        defaultPrefix: "turbo",
        rateLimit: {
          enabled: true,
          timeWindow: 60 * 1000, // 1 minute (matches Hono middleware)
          maxRequests: 100, // 100 requests per minute
        },
      }),
      ...(options.extraPlugins ?? []),
    ],
    socialProviders,
    trustedOrigins: [
      "expo://",
      "http://localhost:3000",
      "https://turbo.app",
      "https://www.turbo.app",
      options.baseUrl,
      options.productionUrl,
    ],
    onAPIError: {
      onError(error, ctx) {
        console.error("BETTER AUTH API ERROR", error, ctx);
      },
    },
  } satisfies BetterAuthOptions;

  return betterAuth(config);
};

export type Auth = ReturnType<typeof initAuth>;
export type Session = Auth["$Infer"]["Session"];
