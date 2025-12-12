import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("GET /api/admin/members", () => {
  test("returns 200 and paginated response structure", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/members`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.items).toBeDefined();
    expect(Array.isArray(data.items)).toBe(true);
    expect(typeof data.page).toBe("number");
    expect(typeof data.pageSize).toBe("number");
    expect(typeof data.totalItems).toBe("number");
    expect(typeof data.totalPages).toBe("number");
  });

  test("respects pagination parameters", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/members?page=1&pageSize=5`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.page).toBe(1);
    expect(data.pageSize).toBe(5);
  });

  test("enforces max pageSize of 100", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/members?pageSize=200`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.pageSize).toBe(100);
  });

  test("member items have correct shape when data exists", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/members`);
    const data = await response.json();

    for (const member of data.items) {
      expect(typeof member.id).toBe("string");
      expect(typeof member.name).toBe("string");
      expect(typeof member.email).toBe("string");
      expect(typeof member.status).toBe("string");
      expect(member.phone === null || typeof member.phone === "string").toBe(true);
      expect(typeof member.joinedAt).toBe("string");
      expect(typeof member.registrationCount).toBe("number");
      expect(typeof member.waitlistedCount).toBe("number");
    }
  });
});
