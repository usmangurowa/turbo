import { createAppAuth } from "@turbo/auth";

import { env } from "./env.js";

export const auth = createAppAuth({
  baseUrl: env.SERVER_URL,
  productionUrl: env.SERVER_URL,
});
