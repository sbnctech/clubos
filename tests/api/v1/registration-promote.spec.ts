import { test, expect } from "@playwright/test";

/**
 * Registration Promotion Endpoint Tests
 *
 * Tests for POST /api/v1/admin/registrations/:id/promote
 * See: docs/api/dtos/registration.md
 *
 * V1: MANUAL promotion only - no automatic waitlist promotion
 */

const BASE_URL = process.env.PW_BASE_URL || "http://localhost:3000";

test.describe("POST /api/v1/admin/registrations/:id/promote", () => {
  // TODO: Tester - Add auth helper and test data seeding

  test.skip("returns 401 without auth token", async ({ request }) => {
    const response = await request.post(
      `${BASE_URL}/api/v1/admin/registrations/r-test-001/promote`
    );

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.code).toBe("UNAUTHORIZED");
  });

  test.skip("returns 403 with member token (non-admin)", async ({ request }) => {
    // TODO: Tester - Generate member JWT
    const memberToken = "MEMBER_JWT_HERE";

    const response = await request.post(
      `${BASE_URL}/api/v1/admin/registrations/r-test-001/promote`,
      {
        headers: {
          Authorization: `Bearer ${memberToken}`,
        },
      }
    );

    expect(response.status()).toBe(403);

    const body = await response.json();
    expect(body.code).toBe("FORBIDDEN");
  });

  test.skip("returns 404 for non-existent registration", async ({ request }) => {
    // TODO: Tester - Generate admin JWT
    const adminToken = "ADMIN_JWT_HERE";

    const response = await request.post(
      `${BASE_URL}/api/v1/admin/registrations/r-nonexistent/promote`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    expect(response.status()).toBe(404);

    const body = await response.json();
    expect(body.code).toBe("RESOURCE_NOT_FOUND");
  });

  test.skip("returns 400 if registration is not WAITLISTED", async ({ request }) => {
    // TODO: Tester - Generate admin JWT and seed REGISTERED registration
    const adminToken = "ADMIN_JWT_HERE";

    const response = await request.post(
      `${BASE_URL}/api/v1/admin/registrations/r-already-registered/promote`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  test.skip("promotes waitlisted registration successfully", async ({ request }) => {
    // TODO: Tester - Generate admin JWT and seed WAITLISTED registration
    const adminToken = "ADMIN_JWT_HERE";

    const response = await request.post(
      `${BASE_URL}/api/v1/admin/registrations/r-waitlisted-001/promote`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        data: {
          notify: true,
          notes: "Promoted for testing",
        },
      }
    );

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.registration).toBeDefined();
    expect(body.registration.status).toBe("REGISTERED");
    expect(body.registration.previousStatus).toBe("WAITLISTED");
    expect(body.registration.promotedAt).toBeDefined();
    expect(body.registration.waitlistPosition).toBeNull();
    expect(typeof body.notificationSent).toBe("boolean");
    expect(typeof body.remainingWaitlist).toBe("number");
    expect(typeof body.spotsAvailable).toBe("number");
  });

  test.skip("returns 422 if event at capacity without override", async ({ request }) => {
    // TODO: Tester - Generate admin JWT and seed event at capacity with waitlist
    const adminToken = "ADMIN_JWT_HERE";

    const response = await request.post(
      `${BASE_URL}/api/v1/admin/registrations/r-waitlisted-full/promote`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        data: {
          overrideCapacity: false,
        },
      }
    );

    expect(response.status()).toBe(422);

    const body = await response.json();
    expect(body.code).toBe("CAPACITY_EXCEEDED");
  });

  test.skip("allows promotion with overrideCapacity flag", async ({ request }) => {
    // TODO: Tester - Generate admin JWT and seed event at capacity with waitlist
    const adminToken = "ADMIN_JWT_HERE";

    const response = await request.post(
      `${BASE_URL}/api/v1/admin/registrations/r-waitlisted-full/promote`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        data: {
          overrideCapacity: true,
        },
      }
    );

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.registration.status).toBe("REGISTERED");
    expect(body.spotsAvailable).toBeLessThan(0); // Over capacity
    expect(body.warning).toBeDefined();
  });

  test.skip("records promotion in registration history", async ({ request }) => {
    // TODO: Tester - Verify history entry after promotion
    // 1. Promote a registration
    // 2. GET /api/v1/admin/registrations/:id to check history
    // 3. Verify PROMOTED action in history
  });

  test.skip("recalculates waitlist positions after promotion", async ({ request }) => {
    // TODO: Tester - Verify remaining waitlist positions are updated
    // 1. Seed event with 3 waitlisted registrations (positions 1, 2, 3)
    // 2. Promote position 1
    // 3. Verify remaining registrations now have positions 1, 2
  });
});
