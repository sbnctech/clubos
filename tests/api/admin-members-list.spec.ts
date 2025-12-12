import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("GET /api/admin/members", () => {
  test("returns 200 and items array with length 2", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/members`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.items).toBeDefined();
    expect(Array.isArray(data.items)).toBe(true);
    expect(data.items.length).toBe(2);
  });

  test("member m1 (Alice) has registrationCount=1 and waitlistedCount=0", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/members`);
    const data = await response.json();

    const alice = data.items.find((m: { id: string }) => m.id === "m1");
    expect(alice).toBeDefined();
    expect(alice.name).toBe("Alice Johnson");
    expect(alice.registrationCount).toBe(1);
    expect(alice.waitlistedCount).toBe(0);
  });

  test("member m2 (Bob) has registrationCount=1 and waitlistedCount=1", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/members`);
    const data = await response.json();

    const bob = data.items.find((m: { id: string }) => m.id === "m2");
    expect(bob).toBeDefined();
    expect(bob.name).toBe("Bob Smith");
    expect(bob.registrationCount).toBe(1);
    expect(bob.waitlistedCount).toBe(1);
  });

  test("each member has phone and joinedAt fields", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/members`);
    const data = await response.json();

    for (const member of data.items) {
      expect(typeof member.phone).toBe("string");
      expect(member.phone.length).toBeGreaterThan(0);
      expect(typeof member.joinedAt).toBe("string");
      expect(member.joinedAt.length).toBeGreaterThan(0);
    }
  });
});
