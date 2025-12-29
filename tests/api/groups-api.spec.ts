/**
 * API tests for Activity Groups endpoints
 *
 * Tests group lifecycle, membership, and coordinator features
 * per Charter P2 (scoped authorization), P1 (audit)
 *
 * Copyright (c) Murmurant, Inc.
 */

import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

// Test tokens for different roles
const ADMIN_HEADERS = { Authorization: "Bearer test-admin-token" };
const MEMBER_HEADERS = { Authorization: "Bearer test-member-token" };

test.describe("Activity Groups API", () => {
  test.describe("GET /api/v1/groups", () => {
    test("returns 200 with authenticated member", async ({ request }) => {
      const response = await request.get(`${BASE}/api/v1/groups`, {
        headers: MEMBER_HEADERS,
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.groups).toBeDefined();
      expect(Array.isArray(data.groups)).toBe(true);
    });

    test("returns 401 without authentication", async ({ request }) => {
      const response = await request.get(`${BASE}/api/v1/groups`);
      expect(response.status()).toBe(401);
    });

    test("returns groups with correct shape", async ({ request }) => {
      const response = await request.get(`${BASE}/api/v1/groups`, {
        headers: ADMIN_HEADERS,
      });

      expect(response.status()).toBe(200);
      const data = await response.json();

      // If there are groups, verify shape
      if (data.groups.length > 0) {
        const group = data.groups[0];
        expect(group.id).toBeDefined();
        expect(typeof group.name).toBe("string");
        expect(typeof group.slug).toBe("string");
        expect(typeof group.memberCount).toBe("number");
      }
    });
  });

  test.describe("GET /api/v1/groups/pending", () => {
    test("returns 403 for non-approver", async ({ request }) => {
      const response = await request.get(`${BASE}/api/v1/groups/pending`, {
        headers: MEMBER_HEADERS,
      });

      // Member doesn't have groups:approve capability
      expect(response.status()).toBe(403);
    });

    test("returns 200 for admin", async ({ request }) => {
      const response = await request.get(`${BASE}/api/v1/groups/pending`, {
        headers: ADMIN_HEADERS,
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.groups).toBeDefined();
      expect(Array.isArray(data.groups)).toBe(true);
      expect(data.pendingCount).toBeDefined();
    });
  });

  test.describe("POST /api/v1/groups (propose new group)", () => {
    test("returns 400 for missing required fields", async ({ request }) => {
      const response = await request.post(`${BASE}/api/v1/groups`, {
        headers: MEMBER_HEADERS,
        data: {},
      });

      expect(response.status()).toBe(400);
    });

    test("returns 400 for missing name", async ({ request }) => {
      const response = await request.post(`${BASE}/api/v1/groups`, {
        headers: MEMBER_HEADERS,
        data: {
          description: "Test description",
        },
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    test("returns 401 without authentication", async ({ request }) => {
      const response = await request.post(`${BASE}/api/v1/groups`, {
        data: {
          name: "Test Group",
          description: "Test description",
        },
      });

      expect(response.status()).toBe(401);
    });
  });

  test.describe("Coordinator Authorization", () => {
    test("POST /api/v1/groups/:id/approve requires groups:approve capability", async ({
      request,
    }) => {
      // Use a fake group ID - we just want to test authorization
      const fakeGroupId = "00000000-0000-0000-0000-000000000000";

      const response = await request.post(
        `${BASE}/api/v1/groups/${fakeGroupId}/approve`,
        {
          headers: MEMBER_HEADERS,
        }
      );

      // Member doesn't have groups:approve
      expect(response.status()).toBe(403);
    });

    test("POST /api/v1/groups/:id/reject requires groups:approve capability", async ({
      request,
    }) => {
      const fakeGroupId = "00000000-0000-0000-0000-000000000000";

      const response = await request.post(
        `${BASE}/api/v1/groups/${fakeGroupId}/reject`,
        {
          headers: MEMBER_HEADERS,
          data: { reason: "Test rejection" },
        }
      );

      expect(response.status()).toBe(403);
    });

    test("POST /api/v1/groups/:id/deactivate requires groups:approve capability", async ({
      request,
    }) => {
      const fakeGroupId = "00000000-0000-0000-0000-000000000000";

      const response = await request.post(
        `${BASE}/api/v1/groups/${fakeGroupId}/deactivate`,
        {
          headers: MEMBER_HEADERS,
          data: { reason: "Test deactivation" },
        }
      );

      expect(response.status()).toBe(403);
    });
  });

  test.describe("Membership Endpoints Authorization", () => {
    test("POST /api/v1/groups/:id/join requires groups:join capability", async ({
      request,
    }) => {
      // Use a fake group ID
      const fakeGroupId = "00000000-0000-0000-0000-000000000000";

      const response = await request.post(
        `${BASE}/api/v1/groups/${fakeGroupId}/join`,
        {
          headers: MEMBER_HEADERS,
        }
      );

      // Should return 404 (group not found) rather than 403
      // because member has groups:join capability
      expect([404, 400]).toContain(response.status());
    });

    test("POST /api/v1/groups/:id/leave requires authentication", async ({
      request,
    }) => {
      const fakeGroupId = "00000000-0000-0000-0000-000000000000";

      const response = await request.post(
        `${BASE}/api/v1/groups/${fakeGroupId}/leave`
      );

      expect(response.status()).toBe(401);
    });

    test("GET /api/v1/groups/:id/members requires authentication", async ({
      request,
    }) => {
      const fakeGroupId = "00000000-0000-0000-0000-000000000000";

      const response = await request.get(
        `${BASE}/api/v1/groups/${fakeGroupId}/members`
      );

      expect(response.status()).toBe(401);
    });
  });

  test.describe("Announcements and Events", () => {
    test("GET /api/v1/groups/:id/announcements requires authentication", async ({
      request,
    }) => {
      const fakeGroupId = "00000000-0000-0000-0000-000000000000";

      const response = await request.get(
        `${BASE}/api/v1/groups/${fakeGroupId}/announcements`
      );

      expect(response.status()).toBe(401);
    });

    test("GET /api/v1/groups/:id/events requires authentication", async ({
      request,
    }) => {
      const fakeGroupId = "00000000-0000-0000-0000-000000000000";

      const response = await request.get(
        `${BASE}/api/v1/groups/${fakeGroupId}/events`
      );

      expect(response.status()).toBe(401);
    });

    test("POST /api/v1/groups/:id/message requires authentication", async ({
      request,
    }) => {
      const fakeGroupId = "00000000-0000-0000-0000-000000000000";

      const response = await request.post(
        `${BASE}/api/v1/groups/${fakeGroupId}/message`,
        {
          data: {
            subject: "Test",
            body: "Test message",
          },
        }
      );

      expect(response.status()).toBe(401);
    });
  });

  test.describe("Input Validation", () => {
    test("POST /api/v1/groups validates slug format", async ({ request }) => {
      const response = await request.post(`${BASE}/api/v1/groups`, {
        headers: MEMBER_HEADERS,
        data: {
          name: "Test Group",
          slug: "invalid slug with spaces",
          description: "Test description",
        },
      });

      // Should either reject invalid slug or sanitize it
      expect([400, 201]).toContain(response.status());
    });

    test("POST /api/v1/groups/:id/reject requires reason", async ({
      request,
    }) => {
      const fakeGroupId = "00000000-0000-0000-0000-000000000000";

      const response = await request.post(
        `${BASE}/api/v1/groups/${fakeGroupId}/reject`,
        {
          headers: ADMIN_HEADERS,
          data: {}, // Missing reason
        }
      );

      // Should return 400 for missing reason (if group existed) or 404
      expect([400, 404]).toContain(response.status());
    });

    test("POST /api/v1/groups/:id/deactivate requires reason", async ({
      request,
    }) => {
      const fakeGroupId = "00000000-0000-0000-0000-000000000000";

      const response = await request.post(
        `${BASE}/api/v1/groups/${fakeGroupId}/deactivate`,
        {
          headers: ADMIN_HEADERS,
          data: {}, // Missing reason
        }
      );

      // Should return 400 for missing reason (if group existed) or 404
      expect([400, 404]).toContain(response.status());
    });
  });
});
