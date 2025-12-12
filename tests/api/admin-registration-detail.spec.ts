import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("GET /api/admin/registrations/[id]", () => {
  test("returns registration details for r1", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/registrations/r1`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.registration).toBeDefined();
    expect(data.registration.id).toBe("r1");
    expect(data.registration.memberId).toBe("m1");
    expect(data.registration.memberName).toBe("Alice Johnson");
    expect(data.registration.eventId).toBe("e1");
    expect(data.registration.eventTitle).toBe("Welcome Hike");
    expect(data.registration.status).toBe("REGISTERED");
    expect(typeof data.registration.registeredAt).toBe("string");
    expect(data.registration.registeredAt.length).toBeGreaterThan(0);
  });

  test("returns registration details for r2", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/registrations/r2`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.registration).toBeDefined();
    expect(data.registration.id).toBe("r2");
    expect(data.registration.memberId).toBe("m2");
    expect(data.registration.memberName).toBe("Bob Smith");
    expect(data.registration.eventId).toBe("e2");
    expect(data.registration.eventTitle).toBe("Wine Mixer");
    expect(data.registration.status).toBe("WAITLISTED");
    expect(typeof data.registration.registeredAt).toBe("string");
    expect(data.registration.registeredAt.length).toBeGreaterThan(0);
  });

  test("returns 404 for unknown id", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/registrations/unknown`);

    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data.error).toBe("Not found");
  });
});
