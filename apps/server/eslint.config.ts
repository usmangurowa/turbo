import { defineConfig } from "eslint/config";

import { baseConfig } from "@turbo/eslint-config/base";

export default defineConfig(
  {
    ignores: ["dist/**"],
  },
  baseConfig,
);
