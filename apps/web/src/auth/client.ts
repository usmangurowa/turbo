import {
  apiKeyClient,
  emailOTPClient,
  inferAdditionalFields,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [
    emailOTPClient(),
    apiKeyClient(),
    inferAdditionalFields({
      user: {
        username: { type: "string", required: false },
      },
    }),
  ],
});
