/**
 * API Smoke Tests
 *
 * Day-2 integration tests verifying API contract sanity.
 * These tests ensure the API layer is correctly wired up
 * and endpoints respond according to specification.
 *
 * Test coverage:
 *   1. Health endpoint returns expected response
 *   2. Core API endpoints are discoverable and respond
 *   3. Error responses follow standard format
 *   4. Admin endpoints require proper structure
 *
 * Prerequisites:
 *   - Next.js dev server must be running on localhost:3000
 */

import { test, expect } from "@playwright/test";

test.describe("API Smoke Tests", () => {
  test.describe("Health Endpoint", () => {
    test("GET /api/health returns healthy status", async ({ request }) => {
      const response = await request.get("/api/health");

      expect(response.ok()).toBeTruthy();
      expect(response.status()).toBe(200);

      const data = await response.json();
      expect(data.status).toBe("healthy");
      expect(typeof data.timestamp).toBe("string");

      // Verify timestamp is valid ISO date
      const timestamp = new Date(data.timestamp);
      expect(timestamp.getTime()).not.toBeNaN();
    });

    test("Health endpoint responds within acceptable time", async ({
      request,
    }) => {
      const start = Date.now();
      const response = await request.get("/api/health");
      const duration = Date.now() - start;

      expect(response.ok()).toBeTruthy();
      // Health check should respond in under 500ms
      expect(duration).toBeLessThan(500);
    });
  });

  test.describe("Admin API Endpoints", () => {
    test("GET /api/admin/members returns paginated items", async ({ request }) => {
      const response = await request.get("/api/admin/members");

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      // API returns { items: [...], page, pageSize, totalItems, totalPages }
      expect(Array.isArray(data.items)).toBeTruthy();
      expect(typeof data.page).toBe("number");
      expect(typeof data.totalItems).toBe("number");
    });

    test("GET /api/admin/events returns paginated items", async ({ request }) => {
      const response = await request.get("/api/admin/events");

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(Array.isArray(data.items)).toBeTruthy();
      expect(typeof data.page).toBe("number");
    });

    test("GET /api/admin/registrations returns paginated items", async ({ request }) => {
      const response = await request.get("/api/admin/registrations");

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(Array.isArray(data.items)).toBeTruthy();
    });

    test("GET /api/admin/summary returns summary object", async ({
      request,
    }) => {
      const response = await request.get("/api/admin/summary");

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(typeof data).toBe("object");
      expect(data).not.toBeNull();
    });

    test("GET /api/admin/dashboard returns dashboard data", async ({
      request,
    }) => {
      const response = await request.get("/api/admin/dashboard");

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(typeof data).toBe("object");
    });

    test("GET /api/admin/activity returns activity data", async ({
      request,
    }) => {
      const response = await request.get("/api/admin/activity");

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      // Activity endpoint returns { activity: [...], items: [...], page, ... }
      expect(Array.isArray(data.activity) || Array.isArray(data.items)).toBeTruthy();
    });
  });

  test.describe("Admin Search Endpoint", () => {
    test("GET /api/admin/search with query returns results", async ({
      request,
    }) => {
      const response = await request.get("/api/admin/search?q=test");

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(typeof data).toBe("object");
    });
  });

  test.describe("Admin Export Endpoints", () => {
    test("GET /api/admin/export/members returns data", async ({ request }) => {
      const response = await request.get("/api/admin/export/members");

      expect(response.ok()).toBeTruthy();
    });

    test("GET /api/admin/export/events returns data", async ({ request }) => {
      const response = await request.get("/api/admin/export/events");

      expect(response.ok()).toBeTruthy();
    });

    test("GET /api/admin/export/registrations returns data", async ({
      request,
    }) => {
      const response = await request.get("/api/admin/export/registrations");

      expect(response.ok()).toBeTruthy();
    });
  });

  test.describe("Public API Endpoints", () => {
    test("GET /api/members returns member list", async ({ request }) => {
      const response = await request.get("/api/members");

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      // Public API returns { members: [...] }
      expect(Array.isArray(data.members)).toBeTruthy();
    });

    test("GET /api/events returns event list", async ({ request }) => {
      const response = await request.get("/api/events");

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      // Public API returns { events: [...] }
      expect(Array.isArray(data.events)).toBeTruthy();
    });
  });

  test.describe("API Response Format Consistency", () => {
    test("Admin members endpoint supports pagination params", async ({
      request,
    }) => {
      const response = await request.get(
        "/api/admin/members?page=1&pageSize=10"
      );

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      // Should return paginated structure with items array
      expect(Array.isArray(data.items)).toBeTruthy();
      expect(data.page).toBe(1);
      expect(data.pageSize).toBe(10);
    });

    test("Admin events endpoint supports pagination params", async ({
      request,
    }) => {
      const response = await request.get(
        "/api/admin/events?page=1&pageSize=10"
      );

      expect(response.ok()).toBeTruthy();

      const data = await response.json();
      expect(Array.isArray(data.items)).toBeTruthy();
      expect(data.page).toBe(1);
    });
  });

  test.describe("Invalid Route Handling", () => {
    test("Non-existent API route returns 404", async ({ request }) => {
      const response = await request.get("/api/nonexistent-endpoint-12345");

      expect(response.status()).toBe(404);
    });
  });

  test.describe("HTTP Method Validation", () => {
    test("Health endpoint only accepts GET", async ({ request }) => {
      // POST to health should return 405 or appropriate error
      const response = await request.post("/api/health");

      // Next.js API routes return 405 for unsupported methods
      expect([405, 404].includes(response.status())).toBeTruthy();
    });
  });
});
