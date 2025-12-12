import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("Admin Registrations Export UI", () => {
  test("Export button renders on the registrations page", async ({ page }) => {
    await page.goto(`${BASE}/admin/registrations`);

    const exportWrapper = page.locator('[data-test-id="admin-registrations-export"]');
    await expect(exportWrapper).toBeVisible();

    const exportButton = page.locator('[data-test-id="admin-registrations-export-button"]');
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toContainText("Download registrations.csv");
  });

  test("Export button has correct href", async ({ page }) => {
    await page.goto(`${BASE}/admin/registrations`);

    const exportButton = page.locator('[data-test-id="admin-registrations-export-button"]');
    await expect(exportButton).toHaveAttribute("href", "/api/admin/export/registrations");
  });

  test("Export button data-test-id exists", async ({ page }) => {
    await page.goto(`${BASE}/admin/registrations`);

    const exportButton = page.locator('[data-test-id="admin-registrations-export-button"]');
    await expect(exportButton).toHaveCount(1);
  });
});
