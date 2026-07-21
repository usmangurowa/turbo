import { defineConfig } from "eslint/config";

import { baseConfig, restrictEnvAccess } from "@turbo/eslint-config/base";

export default defineConfig(
  {
    ignores: ["script/**"],
  },
  baseConfig,
  restrictEnvAccess,
  {
    files: ["src/__tests__/**/*.ts"],
    rules: {
      "no-restricted-properties": "off",
      "no-restricted-imports": "off",
    },
  },
);
