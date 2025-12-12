import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("GET /api/admin/export/members", () => {
  test("returns CSV with correct headers", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/export/members`);

    expect(response.status()).toBe(200);

    const contentType = response.headers()["content-type"];
    expect(contentType).toMatch(/^text\/csv/);

    const contentDisposition = response.headers()["content-disposition"];
    expect(contentDisposition).toContain('filename="members.csv"');

    const body = await response.text();
    const firstLine = body.split("\n")[0];
    expect(firstLine).toBe("id,name,email,status,joinedAt,phone");
  });

  test("includes Alice and Bob", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/export/members`);
    const body = await response.text();

    expect(body).toContain("Alice Johnson");
    expect(body).toContain("Bob Smith");
  });
});
