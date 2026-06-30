import { serve } from "@hono/node-server";

import { resolveTrustedOrigins } from "@turbo/auth/trusted-origins";

import { createServerApp } from "./app.js";
import { auth } from "./auth.js";
import { env } from "./env.js";

const app = createServerApp(auth, {
  allowedOrigins: resolveTrustedOrigins(env.SERVER_URL, env.APP_URL, "expo://"),
});

serve({ fetch: app.fetch, port: env.SERVER_PORT }, (info) => {
  console.log(`Turbo API server running on port ${info.port}`);
});
