import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("Admin Registrations Pagination", () => {
  test("pagination controls are visible", async ({ page }) => {
    await page.goto(`${BASE}/admin/registrations`);

    const pagination = page.locator('[data-test-id="admin-registrations-pagination"]');
    await expect(pagination).toBeVisible();

    const prevButton = page.locator('[data-test-id="admin-registrations-pagination-prev"]');
    await expect(prevButton).toBeVisible();

    const nextButton = page.locator('[data-test-id="admin-registrations-pagination-next"]');
    await expect(nextButton).toBeVisible();

    const label = page.locator('[data-test-id="admin-registrations-pagination-label"]');
    await expect(label).toBeVisible();
    await expect(label).toContainText("Page");
  });

  test("prev button is disabled on first page", async ({ page }) => {
    await page.goto(`${BASE}/admin/registrations`);

    const prevButton = page.locator('[data-test-id="admin-registrations-pagination-prev"]');
    await expect(prevButton).toBeDisabled();
  });

  test("pagination label shows page info", async ({ page }) => {
    await page.goto(`${BASE}/admin/registrations`);

    const label = page.locator('[data-test-id="admin-registrations-pagination-label"]');
    await expect(label).toContainText(/Page \d+ of \d+/);
  });
});
