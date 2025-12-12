import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("Admin Members Pagination", () => {
  test("pagination controls are visible", async ({ page }) => {
    await page.goto(`${BASE}/admin/members`);

    const pagination = page.locator('[data-test-id="admin-members-pagination"]');
    await expect(pagination).toBeVisible();

    const prevButton = page.locator('[data-test-id="admin-members-pagination-prev"]');
    await expect(prevButton).toBeVisible();

    const nextButton = page.locator('[data-test-id="admin-members-pagination-next"]');
    await expect(nextButton).toBeVisible();

    const label = page.locator('[data-test-id="admin-members-pagination-label"]');
    await expect(label).toBeVisible();
    await expect(label).toContainText("Page");
  });

  test("prev button is disabled on first page", async ({ page }) => {
    await page.goto(`${BASE}/admin/members`);

    const prevButton = page.locator('[data-test-id="admin-members-pagination-prev"]');
    await expect(prevButton).toBeDisabled();
  });

  test("pagination label shows page info", async ({ page }) => {
    await page.goto(`${BASE}/admin/members`);

    const label = page.locator('[data-test-id="admin-members-pagination-label"]');
    await expect(label).toContainText(/Page \d+ of \d+/);
  });
});
