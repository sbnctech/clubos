import { test, expect } from "@playwright/test";

/**
 * Health Endpoint Tests
 *
 * Tests for GET /api/v1/health
 * See: docs/api/jwt-and-error-spec.md
 */

const BASE_URL = process.env.PW_BASE_URL || "http://localhost:3000";

test.describe("GET /api/v1/health", () => {
  test("returns healthy status with 200 OK", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/health`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.status).toBe("healthy");
    expect(body.timestamp).toBeDefined();
    expect(body.version).toBeDefined();
    expect(body.checks).toBeDefined();
    expect(body.checks.database).toBeDefined();
    expect(body.checks.database.status).toBe("ok");
  });

  test("returns valid ISO 8601 timestamp", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/health`);
    const body = await response.json();

    const timestamp = new Date(body.timestamp);
    expect(timestamp.toISOString()).toBe(body.timestamp);
  });

  test("returns version string", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/health`);
    const body = await response.json();

    expect(typeof body.version).toBe("string");
    expect(body.version.length).toBeGreaterThan(0);
  });

  test.skip("returns 503 when database is unavailable", async ({ request }) => {
    // TODO: Tester - Implement with database mocking
    // This test requires ability to simulate database failure
  });
});
