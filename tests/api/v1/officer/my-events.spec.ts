import { test, expect } from "@playwright/test";

/**
 * Committee Chair Dashboard API Tests
 *
 * Tests for GET /api/v1/officer/events/my-events
 * See: docs/events/EVENT_POSTMORTEM.md for postmortem completion criteria
 *
 * Copyright (c) Santa Barbara Newcomers Club
 */

const BASE_URL = process.env.PW_BASE_URL || "http://localhost:3000";

test.describe("GET /api/v1/officer/events/my-events", () => {
  test.describe("Authorization", () => {
    test("returns 401 without authentication", async ({ request }) => {
      const response = await request.get(
        `${BASE_URL}/api/v1/officer/events/my-events`
      );

      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body.error).toBe("Unauthorized");
    });

    test("returns 200 with valid authentication", async ({ request }) => {
      const response = await request.get(
        `${BASE_URL}/api/v1/officer/events/my-events`,
        {
          headers: {
            Authorization: "Bearer test-chair-test-id",
          },
        }
      );

      expect(response.status()).toBe(200);
    });

    test("allows member role access (returns own events only)", async ({
      request,
    }) => {
      const response = await request.get(
        `${BASE_URL}/api/v1/officer/events/my-events`,
        {
          headers: {
            Authorization: "Bearer test-member-test-id",
          },
        }
      );

      // Members can access but will see empty results if no chair assignments
      expect(response.status()).toBe(200);
    });

    test("allows event-chair role access", async ({ request }) => {
      const response = await request.get(
        `${BASE_URL}/api/v1/officer/events/my-events`,
        {
          headers: {
            Authorization: "Bearer test-chair-test-id",
          },
        }
      );

      expect(response.status()).toBe(200);
    });

    test("allows vp-activities role access", async ({ request }) => {
      const response = await request.get(
        `${BASE_URL}/api/v1/officer/events/my-events`,
        {
          headers: {
            Authorization: "Bearer test-vp-test-id",
          },
        }
      );

      expect(response.status()).toBe(200);
    });

    test("allows admin role access", async ({ request }) => {
      const response = await request.get(
        `${BASE_URL}/api/v1/officer/events/my-events`,
        {
          headers: {
            Authorization: "Bearer test-admin-test-id",
          },
        }
      );

      expect(response.status()).toBe(200);
    });
  });

  test.describe("Response Shape", () => {
    test("returns correct top-level structure", async ({ request }) => {
      const response = await request.get(
        `${BASE_URL}/api/v1/officer/events/my-events`,
        {
          headers: {
            Authorization: "Bearer test-admin-test-id",
          },
        }
      );

      expect(response.status()).toBe(200);

      const body = await response.json();

      // Check required top-level fields
      expect(body.myChairEvents).toBeDefined();
      expect(Array.isArray(body.myChairEvents)).toBe(true);

      expect(body.committeeEvents).toBeDefined();
      expect(Array.isArray(body.committeeEvents)).toBe(true);

      expect(body.needingWrapUp).toBeDefined();
      expect(Array.isArray(body.needingWrapUp)).toBe(true);

      expect(body.myCommittees).toBeDefined();
      expect(Array.isArray(body.myCommittees)).toBe(true);

      expect(body.stats).toBeDefined();
      expect(typeof body.stats.totalChairingUpcoming).toBe("number");
      expect(typeof body.stats.pendingApproval).toBe("number");
      expect(typeof body.stats.postmortemsNeedingAttention).toBe("number");
    });

    test("returns correct event summary shape with postmortem fields", async ({
      request,
    }) => {
      const response = await request.get(
        `${BASE_URL}/api/v1/officer/events/my-events`,
        {
          headers: {
            Authorization: "Bearer test-admin-test-id",
          },
        }
      );

      expect(response.status()).toBe(200);

      const body = await response.json();

      // If there are any events, verify the shape
      const allEvents = [
        ...body.myChairEvents,
        ...body.committeeEvents,
        ...body.needingWrapUp,
      ];

      if (allEvents.length > 0) {
        const event = allEvents[0];

        // Basic event fields
        expect(event.id).toBeDefined();
        expect(event.title).toBeDefined();
        expect(event.startTime).toBeDefined();
        expect(event.status).toBeDefined();

        // Postmortem tracking fields (server-derived)
        expect(event.postmortemCompletionStatus).toBeDefined();
        expect(["NOT_STARTED", "IN_PROGRESS", "COMPLETE"]).toContain(
          event.postmortemCompletionStatus
        );

        expect(event.postmortemStatusLabel).toBeDefined();
        expect(typeof event.postmortemStatusLabel).toBe("string");

        expect(event.postmortemCTAText).toBeDefined();
        expect(typeof event.postmortemCTAText).toBe("string");

        // postmortemDbStatus can be null or a PostmortemStatus enum value
        expect(
          event.postmortemDbStatus === null ||
            ["DRAFT", "SUBMITTED", "APPROVED", "UNLOCKED"].includes(
              event.postmortemDbStatus
            )
        ).toBe(true);

        // isMyEvent should be boolean
        expect(typeof event.isMyEvent).toBe("boolean");
      }
    });

    test("returns committee info in myCommittees array", async ({ request }) => {
      const response = await request.get(
        `${BASE_URL}/api/v1/officer/events/my-events`,
        {
          headers: {
            Authorization: "Bearer test-admin-test-id",
          },
        }
      );

      expect(response.status()).toBe(200);

      const body = await response.json();

      // If there are committees, verify the shape
      if (body.myCommittees.length > 0) {
        const committee = body.myCommittees[0];
        expect(committee.id).toBeDefined();
        expect(typeof committee.name).toBe("string");
        expect(typeof committee.roleName).toBe("string");
      }
    });
  });

  test.describe("Filter Parameter", () => {
    test("accepts filter=incomplete_postmortem parameter", async ({
      request,
    }) => {
      const response = await request.get(
        `${BASE_URL}/api/v1/officer/events/my-events?filter=incomplete_postmortem`,
        {
          headers: {
            Authorization: "Bearer test-admin-test-id",
          },
        }
      );

      expect(response.status()).toBe(200);

      const body = await response.json();

      // All events in myChairEvents should have incomplete postmortems
      for (const event of body.myChairEvents) {
        expect(event.postmortemCompletionStatus).not.toBe("COMPLETE");
      }
    });
  });

  test.describe("Postmortem Status Derivation", () => {
    test("postmortemCompletionStatus is derived server-side, not client-side", async ({
      request,
    }) => {
      // This test verifies that the API returns a derived status, not raw postmortem data
      const response = await request.get(
        `${BASE_URL}/api/v1/officer/events/my-events`,
        {
          headers: {
            Authorization: "Bearer test-admin-test-id",
          },
        }
      );

      expect(response.status()).toBe(200);

      const body = await response.json();

      const allEvents = [
        ...body.myChairEvents,
        ...body.committeeEvents,
        ...body.needingWrapUp,
      ];

      if (allEvents.length > 0) {
        const event = allEvents[0];

        // The API should return derived status, NOT raw postmortem fields
        // (We expose postmortemDbStatus for workflow state, but completion is derived)
        expect(event.postmortemCompletionStatus).toBeDefined();
        expect([
          "NOT_STARTED",
          "IN_PROGRESS",
          "COMPLETE",
        ]).toContain(event.postmortemCompletionStatus);

        // postmortemCTAText should match the completion status
        if (event.postmortemCompletionStatus === "NOT_STARTED") {
          expect(event.postmortemCTAText).toBe("Start post-mortem");
        } else if (event.postmortemCompletionStatus === "IN_PROGRESS") {
          expect(event.postmortemCTAText).toBe("Complete post-mortem");
        } else if (event.postmortemCompletionStatus === "COMPLETE") {
          expect(event.postmortemCTAText).toBe("View post-mortem");
        }
      }
    });
  });

  test.describe("Security", () => {
    test("does not expose postmortem content to regular members", async ({
      request,
    }) => {
      const response = await request.get(
        `${BASE_URL}/api/v1/officer/events/my-events`,
        {
          headers: {
            Authorization: "Bearer test-member-test-id",
          },
        }
      );

      expect(response.status()).toBe(200);

      const body = await response.json();

      // Regular members should only see their own events
      // Postmortem content (whatWorked, whatDidNot, etc.) should NOT be in response
      const allEvents = [
        ...body.myChairEvents,
        ...body.committeeEvents,
        ...body.needingWrapUp,
      ];

      for (const event of allEvents) {
        // These raw content fields should NOT be exposed in the API response
        expect(event.whatWorked).toBeUndefined();
        expect(event.whatDidNot).toBeUndefined();
        expect(event.whatToChangeNextTime).toBeUndefined();
        expect(event.setupNotes).toBeUndefined();
        expect(event.contactsUsed).toBeUndefined();

        // Only derived status should be exposed
        expect(event.postmortemCompletionStatus).toBeDefined();
      }
    });
  });
});
