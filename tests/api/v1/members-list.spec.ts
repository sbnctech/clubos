import { test, expect } from "@playwright/test";

/**
 * Members List Endpoint Tests
 *
 * Tests for GET /api/v1/admin/members
 * See: docs/api/dtos/member.md
 */

const BASE_URL = process.env.PW_BASE_URL || "http://localhost:3000";

test.describe("GET /api/v1/admin/members", () => {
  // TODO: Tester - Add auth helper to generate valid admin JWT

  test.skip("returns 401 without auth token", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/admin/members`);

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.code).toBe("UNAUTHORIZED");
    expect(body.message).toBeDefined();
    expect(body.details?.requestId).toBeDefined();
  });

  test.skip("returns 403 with member token (non-admin)", async ({ request }) => {
    // TODO: Tester - Generate member JWT
    const memberToken = "MEMBER_JWT_HERE";

    const response = await request.get(`${BASE_URL}/api/v1/admin/members`, {
      headers: {
        Authorization: `Bearer ${memberToken}`,
      },
    });

    expect(response.status()).toBe(403);

    const body = await response.json();
    expect(body.code).toBe("FORBIDDEN");
  });

  test.skip("returns member list with admin token", async ({ request }) => {
    // TODO: Tester - Generate admin JWT
    const adminToken = "ADMIN_JWT_HERE";

    const response = await request.get(`${BASE_URL}/api/v1/admin/members`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.members).toBeDefined();
    expect(Array.isArray(body.members)).toBe(true);
    expect(body.pagination).toBeDefined();
    expect(body.pagination.page).toBe(1);
  });

  test.skip("returns paginated results", async ({ request }) => {
    // TODO: Tester - Generate admin JWT
    const adminToken = "ADMIN_JWT_HERE";

    const response = await request.get(
      `${BASE_URL}/api/v1/admin/members?page=1&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.pagination.limit).toBe(10);
    expect(body.members.length).toBeLessThanOrEqual(10);
  });

  test.skip("filters by status", async ({ request }) => {
    // TODO: Tester - Generate admin JWT
    const adminToken = "ADMIN_JWT_HERE";

    const response = await request.get(
      `${BASE_URL}/api/v1/admin/members?status=ACTIVE`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    expect(response.status()).toBe(200);

    const body = await response.json();
    for (const member of body.members) {
      expect(member.status).toBe("ACTIVE");
    }
  });

  test.skip("searches by name or email", async ({ request }) => {
    // TODO: Tester - Generate admin JWT and seed test data
    const adminToken = "ADMIN_JWT_HERE";

    const response = await request.get(
      `${BASE_URL}/api/v1/admin/members?search=alice`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      }
    );

    expect(response.status()).toBe(200);

    const body = await response.json();
    // All results should match search term
    for (const member of body.members) {
      const matchesName = member.name.toLowerCase().includes("alice");
      const matchesEmail = member.email.toLowerCase().includes("alice");
      expect(matchesName || matchesEmail).toBe(true);
    }
  });
});
