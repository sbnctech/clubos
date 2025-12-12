import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("GET /api/admin/export/activity", () => {
  test("returns CSV with correct headers", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/export/activity`);

    expect(response.status()).toBe(200);

    const contentType = response.headers()["content-type"];
    expect(contentType).toMatch(/^text\/csv/);

    const contentDisposition = response.headers()["content-disposition"];
    expect(contentDisposition).toContain('filename="activity.csv"');

    const body = await response.text();
    const firstLine = body.split("\n")[0];
    expect(firstLine).toBe("id,type,memberId,memberName,eventId,eventTitle,status,registeredAt");
  });

  test("includes activity items with enriched names", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/export/activity`);
    const body = await response.text();

    expect(body).toContain("Alice Johnson");
    expect(body).toContain("Bob Smith");
    expect(body).toContain("Welcome Hike");
    expect(body).toContain("Wine Mixer");
    expect(body).toContain("REGISTRATION");
  });

  test("activity sorted by registeredAt descending (newest first)", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/export/activity`);
    const body = await response.text();
    const lines = body.split("\n").filter((line) => line.length > 0);

    // Skip header row
    const dataLines = lines.slice(1);

    // r2 (2025-05-28) should come before r1 (2025-05-20)
    expect(dataLines.length).toBeGreaterThanOrEqual(2);

    const firstDataLine = dataLines[0];
    const secondDataLine = dataLines[1];

    // r2 is Bob Smith registering for Wine Mixer (WAITLISTED) on 2025-05-28
    expect(firstDataLine).toContain("r2");
    expect(firstDataLine).toContain("Bob Smith");
    expect(firstDataLine).toContain("2025-05-28");

    // r1 is Alice Johnson registering for Welcome Hike (REGISTERED) on 2025-05-20
    expect(secondDataLine).toContain("r1");
    expect(secondDataLine).toContain("Alice Johnson");
    expect(secondDataLine).toContain("2025-05-20");
  });
});
