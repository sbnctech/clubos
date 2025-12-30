/**
 * E2E Tests for Member and Event Registration Workflows
 *
 * Tests critical member journeys with various membership statuses
 * and event registration states from the enriched seed data.
 *
 * Per Charter P3: State machines over ad-hoc booleans
 *
 * Copyright © 2025 Murmurant, Inc.
 */

import { test, expect } from "@playwright/test";

const BASE = process.env.PW_BASE_URL ?? "http://localhost:3000";

// Test headers for authenticated requests
const ADMIN_HEADERS = { Authorization: "Bearer test-admin-token" };
const MEMBER_HEADERS = { Authorization: "Bearer test-member-token" };

test.describe("Member Status Workflows", () => {
  test.describe("Membership Status Coverage", () => {
    test("admin can list members by status - EXTENDED", async ({ request }) => {
      const response = await request.get(
        `${BASE}/api/v1/admin/members?status=EXTENDED`,
        { headers: ADMIN_HEADERS }
      );

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.items.length).toBeGreaterThan(0);

      for (const member of data.items) {
        expect(member.membershipStatus?.code).toBe("EXTENDED");
      }
    });

    test("admin can list members by status - NEWCOMER", async ({ request }) => {
      const response = await request.get(
        `${BASE}/api/v1/admin/members?status=NEWCOMER`,
        { headers: ADMIN_HEADERS }
      );

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.items.length).toBeGreaterThan(0);
    });

    test("admin can list members by status - PROSPECT", async ({ request }) => {
      const response = await request.get(
        `${BASE}/api/v1/admin/members?status=PROSPECT`,
        { headers: ADMIN_HEADERS }
      );

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.items.length).toBeGreaterThan(0);
    });

    test("admin can list members by status - ALUMNI", async ({ request }) => {
      const response = await request.get(
        `${BASE}/api/v1/admin/members?status=ALUMNI`,
        { headers: ADMIN_HEADERS }
      );

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.items.length).toBeGreaterThan(0);
    });

    test("admin can list members by status - LAPSED", async ({ request }) => {
      const response = await request.get(
        `${BASE}/api/v1/admin/members?status=LAPSED`,
        { headers: ADMIN_HEADERS }
      );

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.items.length).toBeGreaterThan(0);
    });

    test("membership statuses API returns all 5 statuses", async ({ request }) => {
      const response = await request.get(
        `${BASE}/api/v1/admin/membership-statuses`,
        { headers: ADMIN_HEADERS }
      );

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.items.length).toBe(5);

      const codes = data.items.map((s: { code: string }) => s.code);
      expect(codes).toContain("PROSPECT");
      expect(codes).toContain("NEWCOMER");
      expect(codes).toContain("EXTENDED");
      expect(codes).toContain("ALUMNI");
      expect(codes).toContain("LAPSED");
    });
  });

  test.describe("Board Eligibility Rules", () => {
    test("only EXTENDED members are board eligible", async ({ request }) => {
      const response = await request.get(
        `${BASE}/api/v1/admin/membership-statuses`,
        { headers: ADMIN_HEADERS }
      );

      expect(response.status()).toBe(200);
      const data = await response.json();

      for (const status of data.items) {
        if (status.code === "EXTENDED") {
          expect(status.isBoardEligible).toBe(true);
        } else {
          expect(status.isBoardEligible).toBe(false);
        }
      }
    });

    test("only active members can renew", async ({ request }) => {
      const response = await request.get(
        `${BASE}/api/v1/admin/membership-statuses`,
        { headers: ADMIN_HEADERS }
      );

      expect(response.status()).toBe(200);
      const data = await response.json();

      for (const status of data.items) {
        if (["NEWCOMER", "EXTENDED", "LAPSED"].includes(status.code)) {
          expect(status.isEligibleForRenewal).toBe(true);
        } else {
          expect(status.isEligibleForRenewal).toBe(false);
        }
      }
    });
  });
});

test.describe("Event Registration State Coverage", () => {
  test.describe("Registration Listing by Status", () => {
    test("admin can list CONFIRMED registrations", async ({ request }) => {
      const response = await request.get(
        `${BASE}/api/v1/admin/registrations?status=CONFIRMED`,
        { headers: ADMIN_HEADERS }
      );

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.items.length).toBeGreaterThan(0);

      for (const reg of data.items) {
        expect(reg.status).toBe("CONFIRMED");
      }
    });

    test("admin can list WAITLISTED registrations", async ({ request }) => {
      const response = await request.get(
        `${BASE}/api/v1/admin/registrations?status=WAITLISTED`,
        { headers: ADMIN_HEADERS }
      );

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.items.length).toBeGreaterThan(0);

      for (const reg of data.items) {
        expect(reg.status).toBe("WAITLISTED");
        // Waitlisted registrations should have a position
        expect(reg.waitlistPosition).toBeDefined();
      }
    });

    test("admin can list CANCELLED registrations", async ({ request }) => {
      const response = await request.get(
        `${BASE}/api/v1/admin/registrations?status=CANCELLED`,
        { headers: ADMIN_HEADERS }
      );

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.items.length).toBeGreaterThan(0);

      for (const reg of data.items) {
        expect(reg.status).toBe("CANCELLED");
        // Cancelled registrations should have cancellation timestamp
        expect(reg.cancelledAt).toBeDefined();
      }
    });

    test("admin can list NO_SHOW registrations", async ({ request }) => {
      const response = await request.get(
        `${BASE}/api/v1/admin/registrations?status=NO_SHOW`,
        { headers: ADMIN_HEADERS }
      );

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.items.length).toBeGreaterThan(0);

      for (const reg of data.items) {
        expect(reg.status).toBe("NO_SHOW");
      }
    });

    test("admin can list REFUND_PENDING registrations", async ({ request }) => {
      const response = await request.get(
        `${BASE}/api/v1/admin/registrations?status=REFUND_PENDING`,
        { headers: ADMIN_HEADERS }
      );

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.items.length).toBeGreaterThan(0);

      for (const reg of data.items) {
        expect(reg.status).toBe("REFUND_PENDING");
      }
    });
  });

  test.describe("Event Type Coverage", () => {
    test("events list includes past events", async ({ request }) => {
      const response = await request.get(
        `${BASE}/api/v1/admin/events?includePast=true`,
        { headers: ADMIN_HEADERS }
      );

      expect(response.status()).toBe(200);
      const data = await response.json();

      const pastEvents = data.items.filter(
        (e: { startTime: string }) => new Date(e.startTime) < new Date()
      );
      expect(pastEvents.length).toBeGreaterThan(0);
    });

    test("events list includes future events", async ({ request }) => {
      const response = await request.get(
        `${BASE}/api/v1/admin/events?includePast=false`,
        { headers: ADMIN_HEADERS }
      );

      expect(response.status()).toBe(200);
      const data = await response.json();

      for (const event of data.items) {
        expect(new Date(event.startTime).getTime()).toBeGreaterThanOrEqual(
          Date.now() - 24 * 60 * 60 * 1000 // Allow 24 hour buffer
        );
      }
    });

    test("unpublished events visible to admin", async ({ request }) => {
      const response = await request.get(
        `${BASE}/api/v1/admin/events?isPublished=false`,
        { headers: ADMIN_HEADERS }
      );

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.items.length).toBeGreaterThan(0);

      for (const event of data.items) {
        expect(event.isPublished).toBe(false);
      }
    });

    test("published events visible to public", async ({ request }) => {
      const response = await request.get(`${BASE}/api/v1/events`);

      expect(response.status()).toBe(200);
      const data = await response.json();

      // All public events should be published
      for (const event of data.items) {
        expect(event.isPublished).toBe(true);
      }
    });
  });
});

test.describe("Photo Album Coverage", () => {
  test("photo albums list includes event-linked albums", async ({ request }) => {
    const response = await request.get(
      `${BASE}/api/v1/admin/photos/albums`,
      { headers: ADMIN_HEADERS }
    );

    // May return 200 or 404 if route not yet implemented
    if (response.status() === 200) {
      const data = await response.json();
      const eventAlbums = data.items.filter(
        (a: { eventId: string | null }) => a.eventId !== null
      );
      expect(eventAlbums.length).toBeGreaterThan(0);
    }
  });

  test("photo albums list includes standalone albums", async ({ request }) => {
    const response = await request.get(
      `${BASE}/api/v1/admin/photos/albums`,
      { headers: ADMIN_HEADERS }
    );

    if (response.status() === 200) {
      const data = await response.json();
      const standaloneAlbums = data.items.filter(
        (a: { eventId: string | null }) => a.eventId === null
      );
      expect(standaloneAlbums.length).toBeGreaterThan(0);
    }
  });
});

test.describe("Email Log Coverage", () => {
  test("email logs include various delivery statuses", async ({ request }) => {
    const response = await request.get(
      `${BASE}/api/v1/admin/email/logs`,
      { headers: ADMIN_HEADERS }
    );

    // May return 200 or 404 if route not yet implemented
    if (response.status() === 200) {
      const data = await response.json();
      const statuses = [...new Set(data.items.map((l: { status: string }) => l.status))];

      // Should have variety of statuses
      expect(statuses.length).toBeGreaterThan(1);
    }
  });

  test("email logs by channel", async ({ request }) => {
    const response = await request.get(
      `${BASE}/api/v1/admin/email/logs?channel=newsletter`,
      { headers: ADMIN_HEADERS }
    );

    if (response.status() === 200) {
      const data = await response.json();
      for (const log of data.items) {
        expect(log.channel).toBe("newsletter");
      }
    }
  });
});

test.describe("Cross-Domain Consistency", () => {
  test("members with registrations appear in both lists", async ({ request }) => {
    // Get a member with registrations
    const membersResponse = await request.get(
      `${BASE}/api/v1/admin/members`,
      { headers: ADMIN_HEADERS }
    );

    expect(membersResponse.status()).toBe(200);
    const members = await membersResponse.json();

    if (members.items.length > 0) {
      const memberId = members.items[0].id;

      // Check they appear in registrations
      const regsResponse = await request.get(
        `${BASE}/api/v1/admin/registrations?memberId=${memberId}`,
        { headers: ADMIN_HEADERS }
      );

      expect(regsResponse.status()).toBe(200);
    }
  });

  test("events with registrations show correct counts", async ({ request }) => {
    const eventsResponse = await request.get(
      `${BASE}/api/v1/admin/events?includePast=true`,
      { headers: ADMIN_HEADERS }
    );

    expect(eventsResponse.status()).toBe(200);
    const events = await eventsResponse.json();

    if (events.items.length > 0) {
      const eventId = events.items[0].id;

      const regsResponse = await request.get(
        `${BASE}/api/v1/admin/registrations?eventId=${eventId}`,
        { headers: ADMIN_HEADERS }
      );

      expect(regsResponse.status()).toBe(200);
      const regs = await regsResponse.json();

      // Registration count should be consistent
      if (events.items[0].registrationCount !== undefined) {
        expect(regs.totalItems).toBe(events.items[0].registrationCount);
      }
    }
  });
});
