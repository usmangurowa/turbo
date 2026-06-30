import { serve } from "@hono/node-server";

import { resolveTrustedOrigins } from "@turbo/auth/trusted-origins";

import { createServerApp } from "./app";
import { auth } from "./auth";
import { env } from "./env";

const app = createServerApp(auth, {
  allowedOrigins: resolveTrustedOrigins(env.SERVER_URL, env.APP_URL, "expo://"),
});

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`Turbo API server running on port ${info.port}`);
});
