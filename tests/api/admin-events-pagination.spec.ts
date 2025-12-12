import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("GET /api/admin/events pagination", () => {
  test("returns default pagination metadata", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/events`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.page).toBe(1);
    expect(data.pageSize).toBe(20);
    expect(typeof data.totalItems).toBe("number");
    expect(data.totalItems).toBeGreaterThanOrEqual(1);
    expect(typeof data.totalPages).toBe("number");
  });

  test("respects custom page and pageSize params", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/events?page=1&pageSize=1`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.page).toBe(1);
    expect(data.pageSize).toBe(1);
    expect(data.items.length).toBe(1);
    expect(data.totalPages).toBe(data.totalItems); // pageSize=1 means totalPages=totalItems
  });

  test("returns empty items for page beyond total", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/events?page=1000&pageSize=20`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.page).toBe(1000);
    expect(data.items.length).toBe(0);
  });

  test("caps pageSize at 100", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/events?pageSize=200`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.pageSize).toBe(100);
  });

  test("ignores invalid page values", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/events?page=abc`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.page).toBe(1);
  });

  test("ignores zero or negative page values", async ({ request }) => {
    const response1 = await request.get(`${BASE}/api/admin/events?page=0`);
    const data1 = await response1.json();
    expect(data1.page).toBe(1);

    const response2 = await request.get(`${BASE}/api/admin/events?page=-5`);
    const data2 = await response2.json();
    expect(data2.page).toBe(1);
  });
});
