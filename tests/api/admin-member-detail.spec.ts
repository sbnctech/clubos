import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("GET /api/admin/members/[id]", () => {
  test("returns member details and registrations for valid id", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/members/m1`);

    expect(response.status()).toBe(200);

    const data = await response.json();

    // Assert member fields
    expect(data.member).toBeDefined();
    expect(data.member.id).toBe("m1");
    expect(data.member.name).toBe("Alice Johnson");
    expect(data.member.email).toBe("alice@example.com");
    expect(data.member.status).toBe("ACTIVE");

    // Assert registrations array exists and has at least one entry
    expect(Array.isArray(data.registrations)).toBe(true);
    expect(data.registrations.length).toBeGreaterThan(0);

    // Assert registration fields are enriched
    const reg = data.registrations[0];
    expect(reg.id).toBeDefined();
    expect(reg.eventId).toBeDefined();
    expect(reg.eventTitle).toBe("Welcome Hike");
    expect(reg.status).toBe("REGISTERED");
  });

  test("returns 404 for unknown member id", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/members/UNKNOWN`);

    expect(response.status()).toBe(404);

    const data = await response.json();
    expect(data.error).toBe("Not found");
  });

  test("returns member with registrations for m2", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/members/m2`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.member.id).toBe("m2");
    expect(data.member.name).toBe("Bob Smith");
    expect(Array.isArray(data.registrations)).toBe(true);
    // m2 has one registration (Wine Mixer, WAITLISTED)
    expect(data.registrations.length).toBe(1);
    expect(data.registrations[0].eventTitle).toBe("Wine Mixer");
    expect(data.registrations[0].status).toBe("WAITLISTED");
  });

  test("member includes phone and joinedAt fields", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/members/m1`);

    expect(response.status()).toBe(200);

    const data = await response.json();

    // Assert phone and joinedAt are present and are strings
    expect(typeof data.member.phone).toBe("string");
    expect(data.member.phone.length).toBeGreaterThan(0);
    expect(typeof data.member.joinedAt).toBe("string");
    expect(data.member.joinedAt.length).toBeGreaterThan(0);
  });

  test("each registration includes registeredAt field", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/members/m1`);

    expect(response.status()).toBe(200);

    const data = await response.json();

    for (const reg of data.registrations) {
      expect(typeof reg.registeredAt).toBe("string");
      expect(reg.registeredAt.length).toBeGreaterThan(0);
    }
  });
});
