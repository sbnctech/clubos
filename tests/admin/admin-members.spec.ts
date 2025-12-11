import { test, expect } from "@playwright/test";
import { waitForAdminFrame } from "../helpers/waitForAdminFrame";

test("Admin members table renders mock members", async ({ page }) => {
  await page.goto("/admin-frame");

  const frame = await waitForAdminFrame(page);

  const rows = frame.locator('[data-test-id="admin-members-row"]');
  await expect(rows).toHaveCount(2);

  await expect(rows.nth(0)).toContainText("Alice Johnson");
  await expect(rows.nth(1)).toContainText("Bob Smith");
});
