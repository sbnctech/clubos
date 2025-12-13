import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // REGRESSION GUARD: Server components must not fetch from /api/admin/*
  // Auth headers do not propagate from server components to internal API routes.
  // Use Prisma queries directly or import from src/server/admin/*.
  //
  // This rule targets server component files (page.tsx, layout.tsx) only.
  // Client components ("use client") CAN safely fetch /api/admin/* because
  // the browser includes auth cookies/headers in the request.
  {
    files: [
      "src/app/**/page.tsx",
      "src/app/**/page.ts",
      "src/app/**/layout.tsx",
      "src/app/**/layout.ts",
    ],
    ignores: [
      "src/app/api/**",
      // TODO: These pages have the same bug (fetching /api/admin/*) and need to be
      // migrated to use Prisma queries directly. Tracked for later cleanup.
      "src/app/admin/page.tsx",
      "src/app/admin/members/*/page.tsx",
      "src/app/admin/registrations/*/page.tsx",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          // Match fetch() calls where the first argument is a string containing api/admin
          selector:
            'CallExpression[callee.name="fetch"] Literal[value=/api.*admin/]',
          message:
            "Server components must not fetch from /api/admin/*. " +
            "Auth headers do not propagate. Use Prisma queries directly " +
            "or import from src/server/admin/*.",
        },
        {
          // Match fetch() calls with template literal containing api/admin
          selector:
            'CallExpression[callee.name="fetch"] TemplateElement[value.raw=/api.*admin/]',
          message:
            "Server components must not fetch from /api/admin/*. " +
            "Auth headers do not propagate. Use Prisma queries directly " +
            "or import from src/server/admin/*.",
        },
      ],
    },
  },
]);

export default eslintConfig;
