import "server-only";

import { cache } from "react";
import { headers } from "next/headers";
import { env } from "@/env";
import { nextCookies } from "better-auth/next-js";

import { createAppAuth } from "@turbo/auth";

const baseUrl =
  env.VERCEL_ENV === "production"
    ? env.NEXT_PUBLIC_APP_URL
    : env.VERCEL_ENV === "preview"
      ? `https://${env.VERCEL_URL}`
      : "http://localhost:3000";

export const auth = createAppAuth({
  baseUrl,
  productionUrl: env.NEXT_PUBLIC_APP_URL,
  extraPlugins: [nextCookies()],
});

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);
