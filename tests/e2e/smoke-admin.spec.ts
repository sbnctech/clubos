import { test, expect } from "@playwright/test";

const adminRoutes = [
  "/admin",
  "/admin/members",
  "/admin/events",
  "/admin/events/create",
  "/admin/committees",
  "/admin/reports",
  "/admin/audit",
  "/admin/settings",
  "/admin/themes/editor",
  "/admin/themes/preview",
  "/admin/brands/compare",
  "/admin/demo",
  "/admin/demo/parity",
  "/admin/demo/transition",
  "/admin/demo/workflow-comparison",
];

test.describe("Admin Routes Smoke Tests", () => {
  test.use({
    extraHTTPHeaders: {
      "x-admin-test-token": process.env.ADMIN_E2E_TOKEN || "dev-admin-token",
    },
  });

  for (const route of adminRoutes) {
    test(`${route} loads without error`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBeLessThan(500);
      await expect(page.locator("body")).toBeVisible();
    });
  }
});
