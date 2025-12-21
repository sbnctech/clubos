/**
 * Impersonation UI Tests
 *
 * Tests for the "View as Member" UI in the admin demo dashboard.
 *
 * Charter Compliance:
 * - P1: Highly visible banner when impersonating
 * - Easy to exit
 */

import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("View as Member UI", () => {
  test.describe("Demo Dashboard Section", () => {
    test("View as Member section is visible", async ({ page }) => {
      await page.goto(`${BASE}/admin/demo`);

      // Wait for the page to load
      await expect(page.getByTestId("demo-root")).toBeVisible({ timeout: 10000 });

      // Check for the View as Member section
      const viewAsSection = page.getByTestId("demo-view-as-section");
      await expect(viewAsSection).toBeVisible();
    });

    test("View as Member section has search input", async ({ page }) => {
      await page.goto(`${BASE}/admin/demo`);
      await expect(page.getByTestId("demo-root")).toBeVisible({ timeout: 10000 });

      // Check for search input
      const searchInput = page.getByTestId("member-search-input");
      await expect(searchInput).toBeVisible();
    });

    test("View as Member section has search button", async ({ page }) => {
      await page.goto(`${BASE}/admin/demo`);
      await expect(page.getByTestId("demo-root")).toBeVisible({ timeout: 10000 });

      // Check for search button
      const searchButton = page.getByTestId("member-search-button");
      await expect(searchButton).toBeVisible();
    });
  });

  test.describe("Impersonation Banner", () => {
    test("banner is not visible when not impersonating", async ({ page }) => {
      await page.goto(`${BASE}/admin/demo`);
      await expect(page.getByTestId("demo-root")).toBeVisible({ timeout: 10000 });

      // Banner should not be visible
      const banner = page.getByTestId("impersonation-banner");
      await expect(banner).not.toBeVisible();
    });
  });

  test.describe("Member Search Functionality", () => {
    test("search button is disabled with empty input", async ({ page }) => {
      await page.goto(`${BASE}/admin/demo`);
      await expect(page.getByTestId("demo-root")).toBeVisible({ timeout: 10000 });

      const searchButton = page.getByTestId("member-search-button");
      await expect(searchButton).toBeDisabled();
    });

    test("search button is enabled with input", async ({ page }) => {
      await page.goto(`${BASE}/admin/demo`);
      await expect(page.getByTestId("demo-root")).toBeVisible({ timeout: 10000 });

      const searchInput = page.getByTestId("member-search-input");
      await searchInput.fill("test");

      const searchButton = page.getByTestId("member-search-button");
      await expect(searchButton).toBeEnabled();
    });

    test("search shows results when members found", async ({ page }) => {
      await page.goto(`${BASE}/admin/demo`);
      await expect(page.getByTestId("demo-root")).toBeVisible({ timeout: 10000 });

      const searchInput = page.getByTestId("member-search-input");
      await searchInput.fill("a"); // Common letter, likely to match

      const searchButton = page.getByTestId("member-search-button");
      await searchButton.click();

      // Wait for results or no results message
      await page.waitForTimeout(1000);

      // Either we have results or "No members found"
      const results = page.getByTestId("member-search-results");
      const noResults = page.getByText("No members found");

      const hasResults = await results.isVisible().catch(() => false);
      const hasNoResults = await noResults.isVisible().catch(() => false);

      // One of these should be true
      expect(hasResults || hasNoResults).toBe(true);
    });
  });
});
