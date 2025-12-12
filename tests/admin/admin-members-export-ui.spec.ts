import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("Admin Members Export UI", () => {
  test("Export button renders on the members page", async ({ page }) => {
    await page.goto(`${BASE}/admin/members`);

    const exportWrapper = page.locator('[data-test-id="admin-members-export"]');
    await expect(exportWrapper).toBeVisible();

    const exportButton = page.locator('[data-test-id="admin-members-export-button"]');
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toContainText("Download members.csv");
  });

  test("Export button has correct href", async ({ page }) => {
    await page.goto(`${BASE}/admin/members`);

    const exportButton = page.locator('[data-test-id="admin-members-export-button"]');
    await expect(exportButton).toHaveAttribute("href", "/api/admin/export/members");
  });

  test("Export button data-test-id exists", async ({ page }) => {
    await page.goto(`${BASE}/admin/members`);

    const exportButton = page.locator('[data-test-id="admin-members-export-button"]');
    await expect(exportButton).toHaveCount(1);
  });
});
