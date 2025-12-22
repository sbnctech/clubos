import { test, expect } from "@playwright/test";
const BASE_URL = process.env.PW_BASE_URL || "http://localhost:3000";

test.describe("GET /api/v1/admin/kpis", () => {
  test("returns 401 without auth", async ({ request }) => {
    const r = await request.get(BASE_URL + "/api/v1/admin/kpis?view=president");
    expect(r.status()).toBe(401);
  });
  test("returns 400 without view", async ({ request }) => {
    const r = await request.get(BASE_URL + "/api/v1/admin/kpis", { headers: { Authorization: "Bearer test-admin-token" } });
    expect(r.status()).toBe(400);
  });
  test("returns 200 with valid view", async ({ request }) => {
    const r = await request.get(BASE_URL + "/api/v1/admin/kpis?view=president", { headers: { Authorization: "Bearer test-admin-token" } });
    expect(r.status()).toBe(200);
    const body = await r.json();
    expect(body).toHaveProperty("view", "president");
    expect(body).toHaveProperty("kpis");
    expect(body).toHaveProperty("generatedAt");
  });
});
