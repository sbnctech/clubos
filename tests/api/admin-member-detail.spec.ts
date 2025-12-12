import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("GET /api/admin/members/[id]", () => {
  test("returns 404 for unknown member id", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/members/00000000-0000-0000-0000-000000000000`);

    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data.error).toBe("Not found");
  });

  test("returns 404 for invalid UUID format", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/members/INVALID`);

    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data.error).toBe("Not found");
  });
});
