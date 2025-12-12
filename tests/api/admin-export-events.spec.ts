import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("GET /api/admin/export/events", () => {
  test("returns CSV with correct headers", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/export/events`);

    expect(response.status()).toBe(200);

    const contentType = response.headers()["content-type"];
    expect(contentType).toMatch(/^text\/csv/);

    const contentDisposition = response.headers()["content-disposition"];
    expect(contentDisposition).toContain('filename="events.csv"');

    const body = await response.text();
    const firstLine = body.split("\n")[0];
    expect(firstLine).toBe("id,title,category,startTime,registrationCount,waitlistedCount");
  });

  test("includes Welcome Hike event with registration counts", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/export/events`);
    const body = await response.text();

    expect(body).toContain("Welcome Hike");
    expect(body).toContain("Outdoors");
    // e1 has 1 registration (r1 with status REGISTERED)
    expect(body).toContain("e1,Welcome Hike,Outdoors,2025-06-01T09:00:00Z,1,0");
  });

  test("includes Wine Mixer event with waitlisted count", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/export/events`);
    const body = await response.text();

    expect(body).toContain("Wine Mixer");
    expect(body).toContain("Social");
    // e2 has 1 registration (r2 with status WAITLISTED)
    expect(body).toContain("e2,Wine Mixer,Social,2025-06-05T18:00:00Z,1,1");
  });
});
