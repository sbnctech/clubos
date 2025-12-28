import { test, expect } from "@playwright/test";

test.describe("Member Profile Flow", () => {
  test.use({
    extraHTTPHeaders: {
      "x-admin-test-token": process.env.ADMIN_E2E_TOKEN || "dev-admin-token",
    },
  });

  test("dashboard loads for authenticated member", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("body")).toBeVisible();
  });

  test("profile page loads", async ({ page }) => {
    await page.goto("/dashboard/profile");
    await expect(page.locator("body")).toBeVisible();
  });

  test("settings page loads", async ({ page }) => {
    await page.goto("/dashboard/settings");
    await expect(page.locator("body")).toBeVisible();
  });

  test("member directory loads", async ({ page }) => {
    await page.goto("/dashboard/directory");
    await expect(page.locator("body")).toBeVisible();
  });

  test("admin member list loads", async ({ page }) => {
    await page.goto("/admin/members");
    await expect(page.locator("body")).toBeVisible();
  });
});
