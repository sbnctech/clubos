import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("Admin Events Export UI", () => {
  test("Export button renders on the events page", async ({ page }) => {
    await page.goto(`${BASE}/admin/events`);

    const exportWrapper = page.locator('[data-test-id="admin-events-export"]');
    await expect(exportWrapper).toBeVisible();

    const exportButton = page.locator('[data-test-id="admin-events-export-button"]');
    await expect(exportButton).toBeVisible();
    await expect(exportButton).toContainText("Download events.csv");
  });

  test("Export button has correct href", async ({ page }) => {
    await page.goto(`${BASE}/admin/events`);

    const exportButton = page.locator('[data-test-id="admin-events-export-button"]');
    await expect(exportButton).toHaveAttribute("href", "/api/admin/export/events");
  });

  test("Export button data-test-id exists", async ({ page }) => {
    await page.goto(`${BASE}/admin/events`);

    const exportButton = page.locator('[data-test-id="admin-events-export-button"]');
    await expect(exportButton).toHaveCount(1);
  });
});
