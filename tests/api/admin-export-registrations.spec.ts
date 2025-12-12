import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("GET /api/admin/export/registrations", () => {
  test("returns CSV with correct headers", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/export/registrations`);

    expect(response.status()).toBe(200);

    const contentType = response.headers()["content-type"];
    expect(contentType).toMatch(/^text\/csv/);

    const contentDisposition = response.headers()["content-disposition"];
    expect(contentDisposition).toContain('filename="registrations.csv"');

    const body = await response.text();
    const firstLine = body.split("\n")[0];
    expect(firstLine).toBe("id,memberId,memberName,eventId,eventTitle,status,registeredAt");
  });

  test("includes both registrations with enriched names and titles", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/export/registrations`);
    const body = await response.text();

    expect(body).toContain("Alice Johnson");
    expect(body).toContain("Welcome Hike");
    expect(body).toContain("Bob Smith");
    expect(body).toContain("Wine Mixer");
  });
});
