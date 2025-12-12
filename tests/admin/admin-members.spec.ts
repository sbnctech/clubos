import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test("GET /api/members returns active members with expected fields", async ({ request }) => {
  const response = await request.get(`${BASE}/api/members`);

  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(Array.isArray(data.members)).toBe(true);

  for (const member of data.members) {
    expect(typeof member.id).toBe("string");
    expect(typeof member.firstName).toBe("string");
    expect(typeof member.lastName).toBe("string");
    expect(typeof member.email).toBe("string");
    expect(member.status).toBe("ACTIVE");
  }
});
