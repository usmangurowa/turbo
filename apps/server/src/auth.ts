import { initAuth } from "@turbo/auth";
import { sendOTPEmail } from "@turbo/mail/client";

import { env } from "./env.js";

export const auth = initAuth({
  baseUrl: env.SERVER_URL,
  productionUrl: env.SERVER_URL,
  secret: env.AUTH_SECRET ?? "development-secret-change-in-production",
  supabaseJwtSecret:
    env.SUPABASE_JWT_SECRET ?? "development-secret-change-in-production",
  socialProviders: {
    github:
      env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
        ? {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
          }
        : undefined,
  },
  sendOTPEmail: async ({ email, otp, type }) => {
    await sendOTPEmail({ to: email, otp, type });
  },
});
