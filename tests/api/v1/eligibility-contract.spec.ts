import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PW_BASE_URL || "http://localhost:3000";

async function getTestIds(request: {
  get: (url: string, options?: { headers?: Record<string, string> }) => Promise<{ json: () => Promise<unknown> }>;
}) {
  const eventsResponse = await request.get(`${BASE_URL}/api/v1/events`, {
    headers: { Authorization: "Bearer test-admin-token" },
  });
  const eventsData = (await eventsResponse.json()) as { items?: Array<{ title: string; id: string }> };
  const events = eventsData.items || [];
  const welcomeCoffee = events.find((e) => e.title === "Welcome Coffee");

  const membersResponse = await request.get(`${BASE_URL}/api/v1/admin/members`, {
    headers: { Authorization: "Bearer test-admin-token" },
  });
  const membersData = (await membersResponse.json()) as { items?: Array<{ email: string; id: string }> };
  const members = membersData.items || [];
  const alice = members.find((m) => m.email === "alice@example.com");

  return { eventId: welcomeCoffee?.id, memberId: alice?.id };
}

test.describe("GET /api/v1/events/:id/tickets/eligibility - Contract", () => {
  test("response schema matches contract", async ({ request }) => {
    const { eventId, memberId } = await getTestIds(request);
    test.skip(!eventId || !memberId, "Test data not available");

    const response = await request.get(
      `${BASE_URL}/api/v1/events/${eventId}/tickets/eligibility`,
      { headers: { Authorization: `Bearer test-member-${memberId}` } }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body).toHaveProperty("eventId");
    expect(body).toHaveProperty("memberId");
    expect(body).toHaveProperty("ticketTypes");
    expect(Array.isArray(body.ticketTypes)).toBe(true);
  });

  test("401 error matches contract", async ({ request }) => {
    const { eventId } = await getTestIds(request);
    test.skip(!eventId, "Test data not available");

    const response = await request.get(
      `${BASE_URL}/api/v1/events/${eventId}/tickets/eligibility`
    );
    expect(response.status()).toBe(401);
  });
});

test.describe("GET /api/v1/events/:id/ticket-types - Contract", () => {
  test("response schema matches contract", async ({ request }) => {
    const { eventId, memberId } = await getTestIds(request);
    test.skip(!eventId || !memberId, "Test data not available");

    const response = await request.get(
      `${BASE_URL}/api/v1/events/${eventId}/ticket-types`,
      { headers: { Authorization: `Bearer test-member-${memberId}` } }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body).toHaveProperty("eventId");
    expect(body).toHaveProperty("ticketTypes");
    expect(Array.isArray(body.ticketTypes)).toBe(true);
  });

  test("returns 404 for non-existent event", async ({ request }) => {
    const { memberId } = await getTestIds(request);
    test.skip(!memberId, "Test data not available");

    const fakeEventId = "00000000-0000-0000-0000-000000000000";
    const response = await request.get(
      `${BASE_URL}/api/v1/events/${fakeEventId}/ticket-types`,
      { headers: { Authorization: `Bearer test-member-${memberId}` } }
    );
    expect(response.status()).toBe(404);
  });

  test("returns 401 when not authenticated", async ({ request }) => {
    const { eventId } = await getTestIds(request);
    test.skip(!eventId, "Test data not available");

    const response = await request.get(`${BASE_URL}/api/v1/events/${eventId}/ticket-types`);
    expect(response.status()).toBe(401);
  });
});

test.describe("GET /api/v1/committees - Contract", () => {
  test("response schema matches contract", async ({ request }) => {
    const { memberId } = await getTestIds(request);
    test.skip(!memberId, "Test data not available");

    const response = await request.get(`${BASE_URL}/api/v1/committees`, {
      headers: { Authorization: `Bearer test-member-${memberId}` },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body).toHaveProperty("committees");
    expect(Array.isArray(body.committees)).toBe(true);
  });

  test("returns 401 when not authenticated", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/committees`);
    expect(response.status()).toBe(401);
  });
});

test.describe("GET /api/v1/me/committee-memberships - Contract", () => {
  test("response schema matches contract", async ({ request }) => {
    const { memberId } = await getTestIds(request);
    test.skip(!memberId, "Test data not available");

    const response = await request.get(
      `${BASE_URL}/api/v1/me/committee-memberships`,
      { headers: { Authorization: `Bearer test-member-${memberId}` } }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body).toHaveProperty("memberId");
    expect(body).toHaveProperty("memberships");
    expect(Array.isArray(body.memberships)).toBe(true);
  });

  test("returns 401 when not authenticated", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/me/committee-memberships`);
    expect(response.status()).toBe(401);
  });
});
