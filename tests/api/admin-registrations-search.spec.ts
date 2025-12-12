import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("GET /api/admin/registrations/search", () => {
  test("returns all registrations when no filters are provided", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/registrations/search`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.registrations).toBeDefined();
    expect(Array.isArray(data.registrations)).toBe(true);
    expect(data.registrations.length).toBe(2);

    // Confirm both r1 and r2 are present
    const ids = data.registrations.map((r: { id: string }) => r.id);
    expect(ids).toContain("r1");
    expect(ids).toContain("r2");
  });

  test("filters by status", async ({ request }) => {
    const response = await request.get(
      `${BASE}/api/admin/registrations/search?status=WAITLISTED`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.registrations.length).toBe(1);
    expect(data.registrations[0].status).toBe("WAITLISTED");
    expect(data.registrations[0].id).toBe("r2");
  });

  test("filters by eventId", async ({ request }) => {
    const response = await request.get(
      `${BASE}/api/admin/registrations/search?eventId=e1`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.registrations.length).toBe(1);
    expect(data.registrations[0].eventId).toBe("e1");
    expect(data.registrations[0].eventTitle).toBe("Welcome Hike");
  });

  test("filters by memberId AND status together", async ({ request }) => {
    const response = await request.get(
      `${BASE}/api/admin/registrations/search?memberId=m2&status=WAITLISTED`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.registrations.length).toBe(1);
    expect(data.registrations[0].memberId).toBe("m2");
    expect(data.registrations[0].memberName).toBe("Bob Smith");
    expect(data.registrations[0].status).toBe("WAITLISTED");
  });

  test("returns empty array when no registrations match", async ({ request }) => {
    const response = await request.get(
      `${BASE}/api/admin/registrations/search?memberId=unknown`
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.registrations).toEqual([]);
  });
});
