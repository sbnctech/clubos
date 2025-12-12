import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("GET /api/admin/dashboard", () => {
  test("returns HTTP 200", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/dashboard`);
    expect(response.status()).toBe(200);
  });

  test("returns object with summary key", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/dashboard`);
    const data = await response.json();

    expect(data.summary).toBeDefined();
    expect(typeof data.summary).toBe("object");
  });

  test("all numeric fields are present", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/dashboard`);
    const data = await response.json();

    const { summary } = data;
    expect(typeof summary.totalMembers).toBe("number");
    expect(typeof summary.activeMembers).toBe("number");
    expect(typeof summary.totalEvents).toBe("number");
    expect(typeof summary.upcomingEvents).toBe("number");
    expect(typeof summary.totalRegistrations).toBe("number");
    expect(typeof summary.waitlistedRegistrations).toBe("number");
  });

  test("values match mock data exactly", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/dashboard`);
    const data = await response.json();

    const { summary } = data;

    // Based on current mock data:
    // - 2 members, both ACTIVE
    // - 2 events
    // - 2 registrations, 1 WAITLISTED
    expect(summary.totalMembers).toBe(2);
    expect(summary.activeMembers).toBe(2);
    expect(summary.totalEvents).toBe(2);
    expect(summary.totalRegistrations).toBe(2);
    expect(summary.waitlistedRegistrations).toBe(1);
  });

  test("upcomingEvents uses fixed reference date (2025-05-01)", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/dashboard`);
    const data = await response.json();

    const { summary } = data;

    // Both events are in June 2025:
    // - e1: "2025-06-01T09:00:00Z" (Welcome Hike)
    // - e2: "2025-06-05T18:00:00Z" (Wine Mixer)
    // With reference date 2025-05-01, both are upcoming
    expect(summary.upcomingEvents).toBe(2);
  });
});
