import { test, expect } from "@playwright/test";

test.describe("Admin Events Explorer", () => {
  test("clicking first title navigates to event detail page", async ({ page }) => {
    // Go directly to the Events Explorer page
    await page.goto("/admin/events");
    await page.waitForLoadState("domcontentloaded");

    // Wait for the client-side data to load - look for actual data rows with links
    // The EventsTable uses admin-events-list-row for data rows
    const firstRow = page.locator('[data-test-id="admin-events-list-row"]').first();
    await expect(firstRow).toBeVisible({ timeout: 15000 });

    // Click the link inside the row
    const firstLink = firstRow.locator('[data-test-id="admin-events-list-title-link"]').first();
    await expect(firstLink).toBeVisible({ timeout: 5000 });
    await firstLink.click();

    // Wait for navigation to the detail page
    await expect(page).toHaveURL(/\/admin\/events\/[a-f0-9-]+/i, { timeout: 10000 });

    // Verify the detail page renders
    const detailRoot = page.locator('[data-test-id="admin-event-detail-root"]');
    await expect(detailRoot).toBeVisible({ timeout: 10000 });
  });
});
