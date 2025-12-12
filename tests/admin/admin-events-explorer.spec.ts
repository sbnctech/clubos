import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("Admin Events Explorer", () => {
  test("shows events list page", async ({ page }) => {
    await page.goto(`${BASE}/admin/events`);

    const root = page.locator('[data-test-id="admin-events-list-root"]');
    await expect(root).toBeVisible();
  });

  test("displays both mock events", async ({ page }) => {
    await page.goto(`${BASE}/admin/events`);

    const rows = page.locator('[data-test-id="admin-events-list-row"]');
    await expect(rows).toHaveCount(2);

    const rowTexts = await rows.allTextContents();
    const allText = rowTexts.join(" ");
    expect(allText).toContain("Welcome Hike");
    expect(allText).toContain("Wine Mixer");
  });

  test("title links navigate to event detail page", async ({ page }) => {
    await page.goto(`${BASE}/admin/events`);

    // Find the link for Welcome Hike
    const titleLinks = page.locator('[data-test-id="admin-events-list-title-link"]');
    const welcomeHikeLink = titleLinks.filter({ hasText: "Welcome Hike" });
    await expect(welcomeHikeLink).toBeVisible();

    await welcomeHikeLink.click();

    await expect(page).toHaveURL(/\/admin\/events\/e1/);

    const detailRoot = page.locator('[data-test-id="admin-event-detail-root"]');
    await expect(detailRoot).toBeVisible();
  });

  test("nav link from main admin page works", async ({ page }) => {
    await page.goto(`${BASE}/admin`);

    const navLink = page.locator('[data-test-id="admin-nav-events-explorer"]');
    await expect(navLink).toBeVisible();

    await navLink.click();

    await expect(page).toHaveURL(`${BASE}/admin/events`);

    const root = page.locator('[data-test-id="admin-events-list-root"]');
    await expect(root).toBeVisible();
  });
});
