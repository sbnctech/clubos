import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("Admin Member Detail Page", () => {
  test("Loads member detail page for m1 with correct info", async ({ page }) => {
    await page.goto(`${BASE}/admin/members/m1`);

    // Assert name is displayed
    const name = page.locator('[data-test-id="member-detail-name"]');
    await expect(name).toBeVisible();
    await expect(name).toContainText("Alice Johnson");

    // Assert email is displayed
    const email = page.locator('[data-test-id="member-detail-email"]');
    await expect(email).toBeVisible();
    await expect(email).toContainText("alice@example.com");

    // Assert status is displayed
    const status = page.locator('[data-test-id="member-detail-status"]');
    await expect(status).toBeVisible();
    await expect(status).toContainText("ACTIVE");
  });

  test("Displays registrations table with at least 1 row", async ({ page }) => {
    await page.goto(`${BASE}/admin/members/m1`);

    // Assert registrations table exists
    const table = page.locator('[data-test-id="member-detail-registrations-table"]');
    await expect(table).toBeVisible();

    // Assert at least 1 registration row
    const rows = page.locator('[data-test-id="member-detail-registration-row"]');
    await expect(rows).toHaveCount(1);

    // Verify the registration shows the correct event
    await expect(rows.first()).toContainText("Welcome Hike");
    await expect(rows.first()).toContainText("REGISTERED");
  });

  test("Returns 404 for non-existent member", async ({ page }) => {
    const response = await page.goto(`${BASE}/admin/members/nonexistent`);
    expect(response?.status()).toBe(404);
  });
});
