import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

test.describe("GET /api/admin/search", () => {
  test("returns members when query matches a name", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/search?q=alice`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.results).toBeDefined();
    expect(data.results.members.length).toBeGreaterThan(0);
    expect(data.results.members[0].firstName).toBe("Alice");
  });

  test("returns members when query matches email", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/search?q=bob@example`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.results.members.length).toBeGreaterThan(0);
    expect(data.results.members[0].firstName).toBe("Bob");
  });

  test("returns events when query matches a title", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/search?q=hike`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.results).toBeDefined();
    expect(data.results.events.length).toBeGreaterThan(0);
    expect(data.results.events[0].title).toBe("Welcome Hike");
  });

  test("returns registrations when query matches member name", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/search?q=alice`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.results.registrations.length).toBeGreaterThan(0);
    expect(data.results.registrations[0].memberName).toContain("Alice");
  });

  test("returns registrations when query matches event title", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/search?q=mixer`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.results.registrations.length).toBeGreaterThan(0);
    expect(data.results.registrations[0].eventTitle).toBe("Wine Mixer");
  });

  test("returns empty arrays when no match", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/search?q=zzzznotfound`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.results.members).toEqual([]);
    expect(data.results.events).toEqual([]);
    expect(data.results.registrations).toEqual([]);
  });

  test("returns empty arrays when query is empty", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/search?q=`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.results.members).toEqual([]);
    expect(data.results.events).toEqual([]);
    expect(data.results.registrations).toEqual([]);
  });

  test("search is case-insensitive", async ({ request }) => {
    const response = await request.get(`${BASE}/api/admin/search?q=ALICE`);

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.results.members.length).toBeGreaterThan(0);
    expect(data.results.members[0].firstName).toBe("Alice");
  });
});
