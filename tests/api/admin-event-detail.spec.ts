import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("GET /api/admin/events/[id]", () => {
  test("returns event details and registrations for valid id", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/events/e1`);

    expect(response.status()).toBe(200);

    const data = await response.json();

    // Assert event fields
    expect(data.event).toBeDefined();
    expect(data.event.id).toBe("e1");
    expect(data.event.title).toBe("Welcome Hike");

    // Assert registrations array
    expect(Array.isArray(data.registrations)).toBe(true);
    expect(data.registrations.length).toBeGreaterThanOrEqual(1);

    // Assert first registration fields
    const reg = data.registrations[0];
    expect(reg.memberName).toContain("Alice");
    expect(reg.status).toBe("REGISTERED");
    expect(typeof reg.registeredAt).toBe("string");
    expect(reg.registeredAt.length).toBeGreaterThan(0);
  });

  test("returns event detail for e2 with waitlisted registration", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/events/e2`);

    expect(response.status()).toBe(200);

    const data = await response.json();

    // Assert event
    expect(data.event.title).toBe("Wine Mixer");

    // Assert at least one waitlisted registration from Bob
    expect(data.registrations.length).toBeGreaterThanOrEqual(1);

    const waitlistedReg = data.registrations.find(
      (r: { status: string }) => r.status === "WAITLISTED"
    );
    expect(waitlistedReg).toBeDefined();
    expect(waitlistedReg.memberName).toContain("Bob");
  });

  test("returns 404 for unknown id", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/events/unknown`);

    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data.error).toBe("Not found");
  });
});
