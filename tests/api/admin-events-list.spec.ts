import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("GET /api/admin/events", () => {
  test("returns 200 and items array with length 2", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/events`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.items).toBeDefined();
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBe(2);
  });

  test("returns correct counts for Welcome Hike (e1)", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/events`);
    const data = await response.json();

    const welcomeHike = data.items.find((e: { id: string }) => e.id === "e1");
    expect(welcomeHike).toBeDefined();
    expect(welcomeHike.title).toBe("Welcome Hike");
    expect(welcomeHike.registrationCount).toBe(1);
    expect(welcomeHike.waitlistedCount).toBe(0);
  });

  test("returns correct counts for Wine Mixer (e2)", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/events`);
    const data = await response.json();

    const wineMixer = data.items.find((e: { id: string }) => e.id === "e2");
    expect(wineMixer).toBeDefined();
    expect(wineMixer.title).toBe("Wine Mixer");
    expect(wineMixer.registrationCount).toBe(1);
    expect(wineMixer.waitlistedCount).toBe(1);
  });
});
