import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("Admin Events Pagination", () => {
  test("pagination controls are visible", async ({ page }) => {
    await page.goto(`${BASE}/admin/events`);

    const pagination = page.locator('[data-test-id="admin-events-pagination"]');
    await expect(pagination).toBeVisible();

    const prevButton = page.locator('[data-test-id="admin-events-pagination-prev"]');
    await expect(prevButton).toBeVisible();

    const nextButton = page.locator('[data-test-id="admin-events-pagination-next"]');
    await expect(nextButton).toBeVisible();

    const label = page.locator('[data-test-id="admin-events-pagination-label"]');
    await expect(label).toBeVisible();
    await expect(label).toContainText("Page");
  });

  test("prev button is disabled on first page", async ({ page }) => {
    await page.goto(`${BASE}/admin/events`);

    const prevButton = page.locator('[data-test-id="admin-events-pagination-prev"]');
    await expect(prevButton).toBeDisabled();
  });

  test("pagination label shows page info", async ({ page }) => {
    await page.goto(`${BASE}/admin/events`);

    const label = page.locator('[data-test-id="admin-events-pagination-label"]');
    await expect(label).toContainText(/Page \d+ of \d+/);
  });
});
