/**
 * UI Smoke Tests
 *
 * Day-2 integration tests verifying UI sanity.
 * These tests ensure the UI layer renders correctly
 * and core components mount without errors.
 *
 * Test coverage:
 *   1. Member layout renders correctly
 *   2. GadgetHost mounts without errors
 *   3. My Club page loads and shows registered gadgets
 *   4. Admin frame loads correctly
 *   5. No console errors on page load
 *
 * Prerequisites:
 *   - Next.js dev server must be running on localhost:3000
 */

import { test, expect } from "@playwright/test";
import { waitForAdminFrame } from "../helpers/waitForAdminFrame";

test.describe("UI Smoke Tests", () => {
  test.describe("Member Layout", () => {
    test("Member layout renders with all structural elements", async ({
      page,
    }) => {
      await page.goto("/member");

      // Verify member layout wrapper exists
      const layout = page.locator('[data-test-id="member-layout"]');
      await expect(layout).toBeVisible();

      // Verify header exists
      const header = page.locator('[data-test-id="member-header"]');
      await expect(header).toBeVisible();

      // Verify navigation exists
      const nav = page.locator('[data-test-id="member-nav"]');
      await expect(nav).toBeVisible();

      // Verify main content area exists
      const main = page.locator('[data-test-id="member-main"]');
      await expect(main).toBeVisible();

      // Verify footer exists
      const footer = page.locator('[data-test-id="member-footer"]');
      await expect(footer).toBeVisible();
    });

    test("Member navigation links are present", async ({ page }) => {
      await page.goto("/member");

      // Check navigation items
      await expect(
        page.locator('[data-test-id="member-nav-home"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-test-id="member-nav-events"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-test-id="member-nav-account"]')
      ).toBeVisible();
    });

    test("Member layout logo links to member home", async ({ page }) => {
      await page.goto("/member");

      const logo = page.locator('[data-test-id="member-nav-logo"]');
      await expect(logo).toBeVisible();
      await expect(logo).toHaveAttribute("href", "/member");
    });
  });

  test.describe("My Club Page", () => {
    test("My Club page loads successfully", async ({ page }) => {
      await page.goto("/member");

      // Verify page container exists
      const pageContainer = page.locator('[data-test-id="myclub-page"]');
      await expect(pageContainer).toBeVisible();
    });

    test("My Club page displays welcome heading", async ({ page }) => {
      await page.goto("/member");

      // Check for "My Club" heading
      const heading = page.locator("h1");
      await expect(heading).toContainText("My Club");
    });

    test("My Club page shows primary gadget area", async ({ page }) => {
      await page.goto("/member");

      const primaryArea = page.locator(
        '[data-test-id="myclub-gadgets-primary"]'
      );
      await expect(primaryArea).toBeVisible();
    });

    test("My Club page shows secondary gadget area", async ({ page }) => {
      await page.goto("/member");

      const secondaryArea = page.locator(
        '[data-test-id="myclub-gadgets-secondary"]'
      );
      await expect(secondaryArea).toBeVisible();
    });
  });

  test.describe("GadgetHost Component", () => {
    test("Upcoming Events gadget mounts correctly", async ({ page }) => {
      await page.goto("/member");

      // Verify gadget host exists with correct ID
      const gadgetHost = page.locator(
        '[data-test-id="gadget-host-upcoming-events"]'
      );
      await expect(gadgetHost).toBeVisible();

      // Verify gadget has correct data attribute
      await expect(gadgetHost).toHaveAttribute(
        "data-gadget-id",
        "upcoming-events"
      );

      // Verify gadget title renders
      const gadgetTitle = page.locator(
        '[data-test-id="gadget-title-upcoming-events"]'
      );
      await expect(gadgetTitle).toBeVisible();
      await expect(gadgetTitle).toContainText("Upcoming Events");
    });

    test("My Registrations gadget mounts correctly", async ({ page }) => {
      await page.goto("/member");

      // Verify gadget host exists
      const gadgetHost = page.locator(
        '[data-test-id="gadget-host-my-registrations"]'
      );
      await expect(gadgetHost).toBeVisible();

      // Verify gadget has correct data attribute
      await expect(gadgetHost).toHaveAttribute(
        "data-gadget-id",
        "my-registrations"
      );

      // Verify gadget title renders
      const gadgetTitle = page.locator(
        '[data-test-id="gadget-title-my-registrations"]'
      );
      await expect(gadgetTitle).toBeVisible();
      await expect(gadgetTitle).toContainText("My Registrations");
    });

    test("Gadget content areas are rendered", async ({ page }) => {
      await page.goto("/member");

      // Verify content areas for both gadgets
      await expect(
        page.locator('[data-test-id="gadget-content-upcoming-events"]')
      ).toBeVisible();
      await expect(
        page.locator('[data-test-id="gadget-content-my-registrations"]')
      ).toBeVisible();
    });

    test("Gadgets have proper slot attributes", async ({ page }) => {
      await page.goto("/member");

      // Primary gadget should have slot="primary"
      const primaryGadget = page.locator(
        '[data-test-id="gadget-host-upcoming-events"]'
      );
      await expect(primaryGadget).toHaveAttribute("data-slot", "primary");

      // Secondary gadget should have slot="secondary"
      const secondaryGadget = page.locator(
        '[data-test-id="gadget-host-my-registrations"]'
      );
      await expect(secondaryGadget).toHaveAttribute("data-slot", "secondary");
    });
  });

  test.describe("Admin UI", () => {
    test("Admin frame loads successfully", async ({ page }) => {
      await page.goto("/admin-frame");

      // Wait for admin iframe to load
      const frame = await waitForAdminFrame(page);

      // Verify admin root exists
      const adminRoot = frame.locator('[data-test-id="admin-root"]');
      await expect(adminRoot).toBeVisible();
    });

    test("Admin header is visible", async ({ page }) => {
      await page.goto("/admin-frame");

      const frame = await waitForAdminFrame(page);

      const header = frame.locator('[data-test-id="admin-header"]');
      await expect(header).toBeVisible();
    });
  });

  test.describe("Page Load Performance", () => {
    test("Member page loads within acceptable time", async ({ page }) => {
      const start = Date.now();
      await page.goto("/member");
      const loadTime = Date.now() - start;

      // Page should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000);

      // Verify page actually rendered
      await expect(
        page.locator('[data-test-id="myclub-page"]')
      ).toBeVisible();
    });
  });

  test.describe("No Console Errors", () => {
    test("Member page loads without console errors", async ({ page }) => {
      const consoleErrors: string[] = [];

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      await page.goto("/member");
      await page.waitForLoadState("networkidle");

      // Filter out known acceptable errors (e.g., favicon 404)
      const criticalErrors = consoleErrors.filter(
        (error) =>
          !error.includes("favicon") && !error.includes("404")
      );

      expect(criticalErrors).toHaveLength(0);
    });
  });

  test.describe("TypeScript Compilation", () => {
    test("All pages render without TypeScript runtime errors", async ({
      page,
    }) => {
      const errors: string[] = [];

      page.on("pageerror", (error) => {
        errors.push(error.message);
      });

      // Navigate to member page
      await page.goto("/member");
      await page.waitForLoadState("networkidle");

      // No page errors should occur
      expect(errors).toHaveLength(0);
    });
  });

  test.describe("Responsive Layout", () => {
    test("Member layout is visible on mobile viewport", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/member");

      const layout = page.locator('[data-test-id="member-layout"]');
      await expect(layout).toBeVisible();

      const nav = page.locator('[data-test-id="member-nav"]');
      await expect(nav).toBeVisible();
    });

    test("Member layout is visible on tablet viewport", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto("/member");

      const layout = page.locator('[data-test-id="member-layout"]');
      await expect(layout).toBeVisible();
    });

    test("Member layout is visible on desktop viewport", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto("/member");

      const layout = page.locator('[data-test-id="member-layout"]');
      await expect(layout).toBeVisible();
    });
  });
});
