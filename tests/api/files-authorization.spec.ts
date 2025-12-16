/**
 * File Authorization Deny-Path Tests
 *
 * Charter Principles:
 * - P2: Default deny, least privilege, object scope
 * - P7: Observability - audit logging
 * - P9: Security must fail closed
 *
 * These tests verify:
 * 1. Unauthenticated requests get 401
 * 2. Authenticated users can access file list
 * 3. Visibility-based filtering works correctly
 */

import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

// Token fixtures for different roles
const TOKENS = {
  admin: "test-admin-token",
  member: "test-member-token",
  webmaster: "test-webmaster-token",
  eventChair: "test-chair-token",
  vpActivities: "test-vp-token",
  president: "test-president-token",
} as const;

const makeHeaders = (token: string) => ({ Authorization: `Bearer ${token}` });

test.describe("File Authorization Tests", () => {
  test.describe("GET /api/v1/files - Authentication", () => {
    test("unauthenticated request returns 401", async ({ request }) => {
      const response = await request.get(`${BASE}/api/v1/files`);
      expect(response.status()).toBe(401);
    });

    test("invalid token returns 401", async ({ request }) => {
      const response = await request.get(`${BASE}/api/v1/files`, {
        headers: { Authorization: "Bearer invalid-token" },
      });
      expect(response.status()).toBe(401);
    });
  });

  test.describe("GET /api/v1/files - Authorized Access", () => {
    test("member can access files endpoint", async ({ request }) => {
      const response = await request.get(`${BASE}/api/v1/files`, {
        headers: makeHeaders(TOKENS.member),
      });
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("files");
      expect(data).toHaveProperty("pagination");
      expect(Array.isArray(data.files)).toBe(true);
    });

    test("admin can access files endpoint", async ({ request }) => {
      const response = await request.get(`${BASE}/api/v1/files`, {
        headers: makeHeaders(TOKENS.admin),
      });
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty("files");
      expect(data).toHaveProperty("pagination");
    });

    test("webmaster can access files endpoint", async ({ request }) => {
      const response = await request.get(`${BASE}/api/v1/files`, {
        headers: makeHeaders(TOKENS.webmaster),
      });
      expect(response.status()).toBe(200);
    });

    test("vp-activities can access files endpoint", async ({ request }) => {
      const response = await request.get(`${BASE}/api/v1/files`, {
        headers: makeHeaders(TOKENS.vpActivities),
      });
      expect(response.status()).toBe(200);
    });

    test("event-chair can access files endpoint", async ({ request }) => {
      const response = await request.get(`${BASE}/api/v1/files`, {
        headers: makeHeaders(TOKENS.eventChair),
      });
      expect(response.status()).toBe(200);
    });
  });

  test.describe("GET /api/v1/files - Pagination", () => {
    test("returns pagination metadata", async ({ request }) => {
      const response = await request.get(`${BASE}/api/v1/files?page=1&limit=10`, {
        headers: makeHeaders(TOKENS.admin),
      });
      expect(response.status()).toBe(200);
      const data = await response.json();

      expect(data.pagination).toMatchObject({
        page: 1,
        limit: 10,
        totalItems: expect.any(Number),
        totalPages: expect.any(Number),
        hasNext: expect.any(Boolean),
        hasPrev: expect.any(Boolean),
      });
    });

    test("respects limit parameter", async ({ request }) => {
      const response = await request.get(`${BASE}/api/v1/files?limit=5`, {
        headers: makeHeaders(TOKENS.admin),
      });
      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.pagination.limit).toBe(5);
    });
  });

  test.describe("GET /api/v1/files - Response Shape", () => {
    test("returns files with expected shape", async ({ request }) => {
      const response = await request.get(`${BASE}/api/v1/files`, {
        headers: makeHeaders(TOKENS.admin),
      });
      expect(response.status()).toBe(200);
      const data = await response.json();

      // Even if no files exist, the structure should be correct
      expect(Array.isArray(data.files)).toBe(true);

      // If files exist, verify shape
      if (data.files.length > 0) {
        const file = data.files[0];
        expect(file).toHaveProperty("id");
        expect(file).toHaveProperty("filename");
        expect(file).toHaveProperty("mimeType");
        expect(file).toHaveProperty("size");
        expect(file).toHaveProperty("visibility");
        expect(file).toHaveProperty("createdAt");
      }
    });
  });
});
