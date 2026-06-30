import { createApp } from "@turbo/api";

type ApiAuth = Parameters<typeof createApp>[0];

interface CreateServerAppOptions {
  allowedOrigins: string[];
  rateLimit?: number;
  rateLimitWindow?: number;
}

export const createServerApp = (
  auth: ApiAuth,
  {
    allowedOrigins,
    rateLimit = 100,
    rateLimitWindow = 60 * 1000,
  }: CreateServerAppOptions,
) =>
  createApp(auth, {
    security: {
      allowedOrigins,
      rateLimit,
      rateLimitWindow,
    },
  });
