/**
 * API Response Schema Contract Tests
 *
 * Charter Principles:
 * - P8: Schema and APIs are stable contracts
 *
 * STABILITY GUARANTEE:
 * These tests enforce that API response fields cannot be removed.
 * Adding new fields is allowed (append-only), but removing fields
 * listed here constitutes a BREAKING CHANGE requiring:
 * 1. Major version bump (v1 -> v2)
 * 2. 6-month deprecation period
 * 3. Merge captain approval
 *
 * To add a new stable field:
 * 1. Add the field to the appropriate STABLE_FIELDS array
 * 2. The field becomes part of the API contract
 * 3. It cannot be removed without the deprecation process
 *
 * Copyright 2025 Murmurant, Inc.
 */

import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

// Test tokens recognized by dev auth
const TOKENS = {
  admin: "test-admin-token",
  member: "test-member-token",
} as const;

const adminHeaders = () => ({ Authorization: `Bearer ${TOKENS.admin}` });
const memberHeaders = () => ({ Authorization: `Bearer ${TOKENS.member}` });

// ============================================================================
// STABLE FIELD DEFINITIONS
// These fields are part of the API contract and CANNOT be removed.
// ============================================================================

/**
 * Pagination envelope - standard structure for all list endpoints
 */
const PAGINATION_FIELDS = ["page", "pageSize", "totalItems", "totalPages", "items"] as const;

/**
 * GET /api/v1/admin/members response item fields
 */
const MEMBER_LIST_ITEM_FIELDS = [
  "id",
  "name",
  "email",
  "status",
  "joinedAt",
] as const;

/**
 * GET /api/v1/admin/members/:id response fields
 */
const MEMBER_DETAIL_FIELDS = [
  "id",
  "firstName",
  "lastName",
  "email",
] as const;

/**
 * GET /api/v1/committees response fields
 */
const COMMITTEE_LIST_FIELDS = ["committees"] as const;
const COMMITTEE_ITEM_FIELDS = ["id", "name", "slug"] as const;

/**
 * GET /api/v1/events (public) response fields
 */
const EVENT_LIST_FIELDS = ["events"] as const;
const EVENT_ITEM_FIELDS = ["id", "title", "slug"] as const;

/**
 * Error response fields - all errors must have this structure
 */
const ERROR_RESPONSE_FIELDS = ["error"] as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Assert that an object has all required fields.
 * Fields can have null/undefined values but must exist as keys.
 */
function assertHasFields(obj: Record<string, unknown>, fields: readonly string[], context: string) {
  for (const field of fields) {
    expect(obj, `${context}: missing required field '${field}'`).toHaveProperty(field);
  }
}

/**
 * Assert that all items in an array have required fields.
 */
function assertArrayItemsHaveFields(
  items: Record<string, unknown>[],
  fields: readonly string[],
  context: string
) {
  // Test at least first item if array is non-empty
  if (items.length > 0) {
    assertHasFields(items[0], fields, `${context}[0]`);
  }
  // Spot check a few more if there are multiple items
  if (items.length > 5) {
    assertHasFields(items[Math.floor(items.length / 2)], fields, `${context}[mid]`);
  }
}

// ============================================================================
// A) PAGINATION ENVELOPE CONTRACTS
// ============================================================================

test.describe("API Schema Contract: Pagination Envelope", () => {
  test("GET /api/v1/admin/members returns standard pagination envelope", async ({ request }) => {
    const response = await request.get(`${BASE}/api/v1/admin/members`, {
      headers: adminHeaders(),
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    assertHasFields(body, PAGINATION_FIELDS, "members list");
    expect(Array.isArray(body.items)).toBe(true);
    expect(typeof body.page).toBe("number");
    expect(typeof body.pageSize).toBe("number");
    expect(typeof body.totalItems).toBe("number");
    expect(typeof body.totalPages).toBe("number");
  });
});

// ============================================================================
// B) MEMBER API CONTRACTS
// ============================================================================

test.describe("API Schema Contract: Members API", () => {
  test("GET /api/v1/admin/members items have stable fields", async ({ request }) => {
    const response = await request.get(`${BASE}/api/v1/admin/members`, {
      headers: adminHeaders(),
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    assertArrayItemsHaveFields(body.items, MEMBER_LIST_ITEM_FIELDS, "member item");
  });

  test("GET /api/v1/admin/members/:id returns stable member detail fields", async ({ request }) => {
    // First get a valid member ID
    const listResponse = await request.get(`${BASE}/api/v1/admin/members`, {
      headers: adminHeaders(),
    });
    const listBody = await listResponse.json();

    if (listBody.items.length === 0) {
      test.skip();
      return;
    }

    const memberId = listBody.items[0].id;
    const response = await request.get(`${BASE}/api/v1/admin/members/${memberId}`, {
      headers: adminHeaders(),
    });

    expect(response.status()).toBe(200);
    const body = await response.json();

    // The detail endpoint wraps in { member: {...} }
    expect(body).toHaveProperty("member");
    assertHasFields(body.member, MEMBER_DETAIL_FIELDS, "member detail");
  });
});

// ============================================================================
// C) COMMITTEE API CONTRACTS
// ============================================================================

test.describe("API Schema Contract: Committees API", () => {
  test("GET /api/v1/committees returns stable envelope", async ({ request }) => {
    const response = await request.get(`${BASE}/api/v1/committees`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    assertHasFields(body, COMMITTEE_LIST_FIELDS, "committees response");
    expect(Array.isArray(body.committees)).toBe(true);
  });

  test("GET /api/v1/committees items have stable fields", async ({ request }) => {
    const response = await request.get(`${BASE}/api/v1/committees`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    assertArrayItemsHaveFields(body.committees, COMMITTEE_ITEM_FIELDS, "committee item");
  });
});

// ============================================================================
// D) EVENT API CONTRACTS
// ============================================================================

test.describe("API Schema Contract: Events API", () => {
  test("GET /api/v1/events returns stable envelope", async ({ request }) => {
    const response = await request.get(`${BASE}/api/v1/events`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    assertHasFields(body, EVENT_LIST_FIELDS, "events response");
    expect(Array.isArray(body.events)).toBe(true);
  });

  test("GET /api/v1/events items have stable fields", async ({ request }) => {
    const response = await request.get(`${BASE}/api/v1/events`);
    const body = await response.json();

    if (body.events.length > 0) {
      assertArrayItemsHaveFields(body.events, EVENT_ITEM_FIELDS, "event item");
    }
  });
});

// ============================================================================
// E) ERROR RESPONSE CONTRACTS
// ============================================================================

test.describe("API Schema Contract: Error Responses", () => {
  test("401 Unauthorized has error field", async ({ request }) => {
    const response = await request.get(`${BASE}/api/v1/admin/members`);
    // No auth header = 401

    expect(response.status()).toBe(401);
    const body = await response.json();

    assertHasFields(body, ERROR_RESPONSE_FIELDS, "401 response");
  });

  test("404 Not Found has error field", async ({ request }) => {
    const response = await request.get(
      `${BASE}/api/v1/admin/members/00000000-0000-0000-0000-000000000000`,
      { headers: adminHeaders() }
    );

    expect(response.status()).toBe(404);
    const body = await response.json();

    assertHasFields(body, ERROR_RESPONSE_FIELDS, "404 response");
  });

  test("403 Forbidden has error field", async ({ request }) => {
    // Member token trying to access admin endpoint
    const response = await request.get(`${BASE}/api/v1/admin/members`, {
      headers: memberHeaders(),
    });

    expect(response.status()).toBe(403);
    const body = await response.json();

    assertHasFields(body, ERROR_RESPONSE_FIELDS, "403 response");
  });
});

// ============================================================================
// F) HEALTH CHECK CONTRACTS (Public Endpoints)
// ============================================================================

test.describe("API Schema Contract: Health Endpoints", () => {
  test("GET /api/v1/health returns stable fields", async ({ request }) => {
    const response = await request.get(`${BASE}/api/v1/health`);

    expect(response.status()).toBe(200);
    const body = await response.json();

    // Health endpoint must always have status
    expect(body).toHaveProperty("status");
    expect(body.status).toBe("ok");
  });
});
