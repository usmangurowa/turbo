import { defineConfig } from "eslint/config";

import { baseConfig } from "@turbo/eslint-config/base";
import { reactConfig } from "@turbo/eslint-config/react";

export default defineConfig(
  {
    ignores: ["dist/**"],
  },
  baseConfig,
  reactConfig,
  {
    // Registry-managed files (overwritten by `pnpm ui-add`): keep correctness
    // rules, relax type-strictness that fights upstream shadcn/recharts code.
    files: ["src/components/**", "src/hooks/**"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
);
