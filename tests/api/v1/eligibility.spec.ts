import { test, expect } from "@playwright/test";

/**
 * Eligibility Engine Tests
 *
 * Tests for GET /api/v1/events/:id/tickets/eligibility
 * Validates ticket eligibility based on membership status, committee membership,
 * and eligibility overrides.
 */

const BASE_URL = process.env.PW_BASE_URL || "http://localhost:3000";

test.describe("GET /api/v1/events/:id/tickets/eligibility", () => {
  // We'll get IDs from the database during test setup
  let welcomeCoffeeId: string;
  let hikeId: string;
  let aliceId: string;
  let carolId: string;
  let daveId: string;

  test.beforeAll(async ({ request }) => {
    // Fetch event IDs by querying the events list (as admin)
    const eventsResponse = await request.get(`${BASE_URL}/api/v1/events`, {
      headers: { Authorization: "Bearer test-admin-token" },
    });
    const eventsData = await eventsResponse.json();
    const events = eventsData.items || [];

    const welcomeCoffee = events.find(
      (e: { title: string }) => e.title === "Welcome Coffee"
    );
    const hike = events.find(
      (e: { title: string }) => e.title === "Morning Hike at Rattlesnake Canyon"
    );

    welcomeCoffeeId = welcomeCoffee?.id;
    hikeId = hike?.id;

    // Fetch member IDs
    const membersResponse = await request.get(
      `${BASE_URL}/api/v1/admin/members`,
      {
        headers: { Authorization: "Bearer test-admin-token" },
      }
    );
    const membersData = await membersResponse.json();
    const members = membersData.items || [];

    const alice = members.find(
      (m: { email: string }) => m.email === "alice@example.com"
    );
    const carol = members.find(
      (m: { email: string }) => m.email === "carol@example.com"
    );
    const dave = members.find(
      (m: { email: string }) => m.email === "dave@example.com"
    );

    aliceId = alice?.id;
    carolId = carol?.id;
    daveId = dave?.id;
  });

  test.describe("Authentication", () => {
    test("returns 401 when not authenticated", async ({ request }) => {
      // Skip if we don't have event ID
      test.skip(!welcomeCoffeeId, "Event ID not available");

      const response = await request.get(
        `${BASE_URL}/api/v1/events/${welcomeCoffeeId}/tickets/eligibility`
      );

      expect(response.status()).toBe(401);
    });

    test("returns eligibility when authenticated", async ({ request }) => {
      test.skip(!welcomeCoffeeId || !aliceId, "IDs not available");

      const response = await request.get(
        `${BASE_URL}/api/v1/events/${welcomeCoffeeId}/tickets/eligibility`,
        {
          headers: { Authorization: `Bearer test-member-${aliceId}` },
        }
      );

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.eventId).toBe(welcomeCoffeeId);
      expect(body.memberId).toBe(aliceId);
      expect(Array.isArray(body.ticketTypes)).toBe(true);
    });
  });

  test.describe("Member Standard Ticket Eligibility", () => {
    test("active member (Alice/EXTENDED) is allowed MEMBER_STANDARD", async ({
      request,
    }) => {
      test.skip(!welcomeCoffeeId || !aliceId, "IDs not available");

      const response = await request.get(
        `${BASE_URL}/api/v1/events/${welcomeCoffeeId}/tickets/eligibility`,
        {
          headers: { Authorization: `Bearer test-member-${aliceId}` },
        }
      );

      expect(response.status()).toBe(200);
      const body = await response.json();

      const memberStandard = body.ticketTypes.find(
        (tt: { code: string }) => tt.code === "MEMBER_STANDARD"
      );
      expect(memberStandard).toBeDefined();
      expect(memberStandard.eligibility.allowed).toBe(true);
      expect(memberStandard.eligibility.reasonCode).toBe("ALLOWED");
    });

    test("lapsed member (Dave) is NOT allowed MEMBER_STANDARD without override", async ({
      request,
    }) => {
      test.skip(!hikeId || !daveId, "IDs not available");

      // Test against hike event which has no override for Dave
      const response = await request.get(
        `${BASE_URL}/api/v1/events/${hikeId}/tickets/eligibility`,
        {
          headers: { Authorization: `Bearer test-member-${daveId}` },
        }
      );

      expect(response.status()).toBe(200);
      const body = await response.json();

      const memberStandard = body.ticketTypes.find(
        (tt: { code: string }) => tt.code === "MEMBER_STANDARD"
      );
      expect(memberStandard).toBeDefined();
      expect(memberStandard.eligibility.allowed).toBe(false);
      expect(memberStandard.eligibility.reasonCode).toBe(
        "NOT_MEMBER_ON_EVENT_DATE"
      );
    });
  });

  test.describe("Sponsor Committee Ticket Eligibility", () => {
    test("Alice (in Activities committee) is allowed SPONSOR_COMMITTEE for Welcome Coffee", async ({
      request,
    }) => {
      test.skip(!welcomeCoffeeId || !aliceId, "IDs not available");

      const response = await request.get(
        `${BASE_URL}/api/v1/events/${welcomeCoffeeId}/tickets/eligibility`,
        {
          headers: { Authorization: `Bearer test-member-${aliceId}` },
        }
      );

      expect(response.status()).toBe(200);
      const body = await response.json();

      const sponsorTicket = body.ticketTypes.find(
        (tt: { code: string }) => tt.code === "SPONSOR_COMMITTEE"
      );
      expect(sponsorTicket).toBeDefined();
      expect(sponsorTicket.eligibility.allowed).toBe(true);
    });

    test("Carol (in Outdoor committee, co-sponsor) is allowed SPONSOR_COMMITTEE for Welcome Coffee", async ({
      request,
    }) => {
      test.skip(!welcomeCoffeeId || !carolId, "IDs not available");

      const response = await request.get(
        `${BASE_URL}/api/v1/events/${welcomeCoffeeId}/tickets/eligibility`,
        {
          headers: { Authorization: `Bearer test-member-${carolId}` },
        }
      );

      expect(response.status()).toBe(200);
      const body = await response.json();

      const sponsorTicket = body.ticketTypes.find(
        (tt: { code: string }) => tt.code === "SPONSOR_COMMITTEE"
      );
      expect(sponsorTicket).toBeDefined();
      // Carol is in Outdoor Adventures which is a co-sponsor
      expect(sponsorTicket.eligibility.allowed).toBe(true);
    });

    test("Dave (not in any committee) is NOT allowed SPONSOR_COMMITTEE", async ({
      request,
    }) => {
      test.skip(!welcomeCoffeeId || !daveId, "IDs not available");

      const response = await request.get(
        `${BASE_URL}/api/v1/events/${welcomeCoffeeId}/tickets/eligibility`,
        {
          headers: { Authorization: `Bearer test-member-${daveId}` },
        }
      );

      expect(response.status()).toBe(200);
      const body = await response.json();

      const sponsorTicket = body.ticketTypes.find(
        (tt: { code: string }) => tt.code === "SPONSOR_COMMITTEE"
      );
      // Dave fails membership check first, so might get NOT_MEMBER_ON_EVENT_DATE
      // But there's also an override for member ticket. Let's check what we get.
      expect(sponsorTicket).toBeDefined();
      expect(sponsorTicket.eligibility.allowed).toBe(false);
    });
  });

  test.describe("Working Committee Ticket Eligibility", () => {
    test("Alice (in any committee) is allowed WORKING_COMMITTEE", async ({
      request,
    }) => {
      test.skip(!welcomeCoffeeId || !aliceId, "IDs not available");

      const response = await request.get(
        `${BASE_URL}/api/v1/events/${welcomeCoffeeId}/tickets/eligibility`,
        {
          headers: { Authorization: `Bearer test-member-${aliceId}` },
        }
      );

      expect(response.status()).toBe(200);
      const body = await response.json();

      const workingTicket = body.ticketTypes.find(
        (tt: { code: string }) => tt.code === "WORKING_COMMITTEE"
      );
      expect(workingTicket).toBeDefined();
      expect(workingTicket.eligibility.allowed).toBe(true);
    });

    test("Carol is DENIED WORKING_COMMITTEE due to override", async ({
      request,
    }) => {
      test.skip(!welcomeCoffeeId || !carolId, "IDs not available");

      const response = await request.get(
        `${BASE_URL}/api/v1/events/${welcomeCoffeeId}/tickets/eligibility`,
        {
          headers: { Authorization: `Bearer test-member-${carolId}` },
        }
      );

      expect(response.status()).toBe(200);
      const body = await response.json();

      const workingTicket = body.ticketTypes.find(
        (tt: { code: string }) => tt.code === "WORKING_COMMITTEE"
      );
      expect(workingTicket).toBeDefined();
      expect(workingTicket.eligibility.allowed).toBe(false);
      expect(workingTicket.eligibility.reasonCode).toBe("OVERRIDE_DENIED");
    });
  });

  test.describe("Eligibility Overrides", () => {
    test("Dave gets OVERRIDE_ALLOWED for MEMBER_STANDARD on Welcome Coffee", async ({
      request,
    }) => {
      test.skip(!welcomeCoffeeId || !daveId, "IDs not available");

      const response = await request.get(
        `${BASE_URL}/api/v1/events/${welcomeCoffeeId}/tickets/eligibility`,
        {
          headers: { Authorization: `Bearer test-member-${daveId}` },
        }
      );

      expect(response.status()).toBe(200);
      const body = await response.json();

      const memberTicket = body.ticketTypes.find(
        (tt: { code: string }) => tt.code === "MEMBER_STANDARD"
      );
      expect(memberTicket).toBeDefined();
      expect(memberTicket.eligibility.allowed).toBe(true);
      expect(memberTicket.eligibility.reasonCode).toBe("OVERRIDE_ALLOWED");
    });
  });

  test.describe("Event Not Found", () => {
    test("returns empty ticket types for non-existent event", async ({
      request,
    }) => {
      test.skip(!aliceId, "Member ID not available");

      const fakeEventId = "00000000-0000-0000-0000-000000000000";
      const response = await request.get(
        `${BASE_URL}/api/v1/events/${fakeEventId}/tickets/eligibility`,
        {
          headers: { Authorization: `Bearer test-member-${aliceId}` },
        }
      );

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.ticketTypes).toEqual([]);
    });
  });
});
