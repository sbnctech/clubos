import { test, expect } from "@playwright/test";

/**
 * Events List Endpoint Tests
 *
 * Tests for GET /api/v1/events (member-facing)
 * See: docs/api/dtos/event.md
 */

const BASE_URL = process.env.PW_BASE_URL || "http://localhost:3000";

test.describe("GET /api/v1/events", () => {
  // TODO: Tester - Add auth helper to generate valid JWT

  test.skip("returns 401 without auth token", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/events`);

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.code).toBe("UNAUTHORIZED");
  });

  test.skip("returns event list with valid token", async ({ request }) => {
    // TODO: Tester - Generate member JWT
    const memberToken = "MEMBER_JWT_HERE";

    const response = await request.get(`${BASE_URL}/api/v1/events`, {
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.events).toBeDefined();
    expect(Array.isArray(body.events)).toBe(true);
    expect(body.pagination).toBeDefined();
  });

  test.skip("returns EventSummary shape for each event", async ({ request }) => {
    // TODO: Tester - Generate member JWT
    const memberToken = "MEMBER_JWT_HERE";

    const response = await request.get(`${BASE_URL}/api/v1/events`, {
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    if (body.events.length > 0) {
      const event = body.events[0];
      expect(event.id).toBeDefined();
      expect(event.title).toBeDefined();
      expect(event.category).toBeDefined();
      expect(event.startTime).toBeDefined();
      expect(typeof event.isWaitlistOpen).toBe("boolean");
    }
  });

  test.skip("filters by category", async ({ request }) => {
    // TODO: Tester - Generate member JWT and seed test data
    const memberToken = "MEMBER_JWT_HERE";

    const response = await request.get(
      `${BASE_URL}/api/v1/events?category=Outdoors`,
      {
        headers: {
          Authorization: `Bearer ${memberToken}`,
        },
      }
    );

    expect(response.status()).toBe(200);

    const body = await response.json();
    for (const event of body.events) {
      expect(event.category).toBe("Outdoors");
    }
  });

  test.skip("filters by date range", async ({ request }) => {
    // TODO: Tester - Generate member JWT
    const memberToken = "MEMBER_JWT_HERE";
    const from = "2025-06-01T00:00:00Z";
    const to = "2025-06-30T23:59:59Z";

    const response = await request.get(
      `${BASE_URL}/api/v1/events?from=${from}&to=${to}`,
      {
        headers: {
          Authorization: `Bearer ${memberToken}`,
        },
      }
    );

    expect(response.status()).toBe(200);

    const body = await response.json();
    for (const event of body.events) {
      const startTime = new Date(event.startTime);
      expect(startTime >= new Date(from)).toBe(true);
      expect(startTime <= new Date(to)).toBe(true);
    }
  });

  test.skip("returns only PUBLISHED events for members", async ({ request }) => {
    // TODO: Tester - Generate member JWT
    // Members should only see PUBLISHED events, not DRAFT or CANCELLED
    const memberToken = "MEMBER_JWT_HERE";

    const response = await request.get(`${BASE_URL}/api/v1/events`, {
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    // Note: EventSummary doesn't include status, but we verify by checking
    // that DRAFT events are not visible
    // This requires seeded test data with known DRAFT events
  });

  test.skip("returns pagination metadata", async ({ request }) => {
    // TODO: Tester - Generate member JWT
    const memberToken = "MEMBER_JWT_HERE";

    const response = await request.get(
      `${BASE_URL}/api/v1/events?page=1&limit=5`,
      {
        headers: {
          Authorization: `Bearer ${memberToken}`,
        },
      }
    );

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.pagination.page).toBe(1);
    expect(body.pagination.limit).toBe(5);
    expect(typeof body.pagination.totalItems).toBe("number");
    expect(typeof body.pagination.totalPages).toBe("number");
    expect(typeof body.pagination.hasNext).toBe("boolean");
    expect(typeof body.pagination.hasPrev).toBe("boolean");
  });
});
