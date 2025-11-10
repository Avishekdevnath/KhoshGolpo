import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import sharedConfig from "../config/eslint/shared.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...sharedConfig,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Additional project-specific ignores:
    "guide/**",
  ]),
]);

export default eslintConfig;
