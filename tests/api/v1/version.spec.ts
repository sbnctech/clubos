import { test, expect } from "@playwright/test";

/**
 * Version Endpoint Tests
 *
 * Tests for GET /api/v1/version
 * See: docs/api/jwt-and-error-spec.md
 */

const BASE_URL = process.env.PW_BASE_URL || "http://localhost:3000";

test.describe("GET /api/v1/version", () => {
  test("returns version info with 200 OK", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/version`);

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.version).toBeDefined();
    expect(body.apiVersion).toBe("v1");
    expect(body.environment).toBeDefined();
  });

  test("returns valid version format", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/version`);
    const body = await response.json();

    // Version should be semver-like (e.g., "0.1.0")
    expect(body.version).toMatch(/^\d+\.\d+\.\d+/);
  });

  test("returns environment field", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/version`);
    const body = await response.json();

    expect(["development", "test", "production"]).toContain(body.environment);
  });

  test("returns apiVersion as v1", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/v1/version`);
    const body = await response.json();

    expect(body.apiVersion).toBe("v1");
  });
});
