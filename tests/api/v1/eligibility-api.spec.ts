import { test, expect } from "@playwright/test";

/**
 * Eligibility API Contract Tests
 *
 * Tests for:
 * - GET /api/v1/events/:id/eligibility
 * - GET /api/v1/tickets/:id/eligibility
 *
 * These tests validate the API contract (response shape) using the stub service.
 */

const BASE_URL = process.env.PW_BASE_URL || "http://localhost:3000";

test.describe("GET /api/v1/events/:id/eligibility", () => {
  test("returns 401 when not authenticated", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/v1/events/test-event-id/eligibility`
    );

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty("error");
    expect(body).toHaveProperty("message");
  });

  test("returns eligibility response when authenticated", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/v1/events/test-event-id/eligibility`,
      {
        headers: { Authorization: "Bearer test-member-token" },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Validate response structure
    expect(body).toHaveProperty("eventId");
    expect(body).toHaveProperty("memberId");
    expect(body).toHaveProperty("ticketTypes");

    expect(typeof body.eventId).toBe("string");
    expect(Array.isArray(body.ticketTypes)).toBe(true);
  });

  test("ticket types have correct structure", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/v1/events/test-event-id/eligibility`,
      {
        headers: { Authorization: "Bearer test-member-token" },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Stub returns mock ticket types
    expect(body.ticketTypes.length).toBeGreaterThan(0);

    const ticketType = body.ticketTypes[0];
    expect(ticketType).toHaveProperty("id");
    expect(ticketType).toHaveProperty("code");
    expect(ticketType).toHaveProperty("name");
    expect(ticketType).toHaveProperty("eligibility");

    expect(typeof ticketType.id).toBe("string");
    expect(typeof ticketType.code).toBe("string");
    expect(typeof ticketType.name).toBe("string");
  });

  test("eligibility object has correct structure", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/v1/events/test-event-id/eligibility`,
      {
        headers: { Authorization: "Bearer test-member-token" },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();

    const eligibility = body.ticketTypes[0].eligibility;
    expect(eligibility).toHaveProperty("allowed");
    expect(eligibility).toHaveProperty("reasonCode");

    expect(typeof eligibility.allowed).toBe("boolean");
    expect(typeof eligibility.reasonCode).toBe("string");

    // reasonDetail is optional
    if (eligibility.reasonDetail !== undefined) {
      expect(typeof eligibility.reasonDetail).toBe("string");
    }
  });

  test("stub returns STUB_ALLOWED for authenticated users", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/v1/events/test-event-id/eligibility`,
      {
        headers: { Authorization: "Bearer test-member-token" },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();

    const eligibility = body.ticketTypes[0].eligibility;
    expect(eligibility.allowed).toBe(true);
    expect(eligibility.reasonCode).toBe("STUB_ALLOWED");
  });
});

test.describe("GET /api/v1/tickets/:id/eligibility", () => {
  test("returns 401 when not authenticated", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/v1/tickets/test-ticket-id/eligibility`
    );

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toHaveProperty("error");
    expect(body).toHaveProperty("message");
  });

  test("returns eligibility response when authenticated", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/v1/tickets/test-ticket-id/eligibility`,
      {
        headers: { Authorization: "Bearer test-member-token" },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Validate response structure
    expect(body).toHaveProperty("ticketTypeId");
    expect(body).toHaveProperty("memberId");
    expect(body).toHaveProperty("eligibility");

    expect(typeof body.ticketTypeId).toBe("string");
    expect(body.ticketTypeId).toBe("test-ticket-id");
  });

  test("eligibility object has correct structure", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/v1/tickets/test-ticket-id/eligibility`,
      {
        headers: { Authorization: "Bearer test-member-token" },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();

    const eligibility = body.eligibility;
    expect(eligibility).toHaveProperty("allowed");
    expect(eligibility).toHaveProperty("reasonCode");

    expect(typeof eligibility.allowed).toBe("boolean");
    expect(typeof eligibility.reasonCode).toBe("string");
  });

  test("stub returns STUB_ALLOWED for authenticated users", async ({ request }) => {
    const response = await request.get(
      `${BASE_URL}/api/v1/tickets/test-ticket-id/eligibility`,
      {
        headers: { Authorization: "Bearer test-member-token" },
      }
    );

    expect(response.status()).toBe(200);
    const body = await response.json();

    expect(body.eligibility.allowed).toBe(true);
    expect(body.eligibility.reasonCode).toBe("STUB_ALLOWED");
  });
});
