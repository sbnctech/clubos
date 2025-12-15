import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireVPOrAdmin } from "@/lib/eventAuth";
import { evaluateAllTicketEligibility } from "@/server/eligibility/eligibility";

/**
 * Feature flag for admin eligibility visibility.
 * Set FEATURE_ELIGIBILITY_ADMIN=1 in environment to enable.
 */
function isEligibilityAdminEnabled(): boolean {
  return process.env.FEATURE_ELIGIBILITY_ADMIN === "1";
}

/**
 * GET /api/admin/eligibility
 *
 * Admin read-only endpoint to view eligibility status.
 * Query params:
 *   - eventId (required): The event to check eligibility for
 *   - memberId (optional): Specific member to check, otherwise returns all members
 *
 * Returns eligibility decisions for all ticket types.
 * Requires VP or Admin role.
 */
export async function GET(req: NextRequest) {
  // Check feature flag
  if (!isEligibilityAdminEnabled()) {
    return NextResponse.json(
      {
        error: "Feature Disabled",
        message: "Admin eligibility view is not enabled",
      },
      { status: 404 }
    );
  }

  // Require VP or Admin
  const auth = await requireVPOrAdmin(req);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  const memberId = searchParams.get("memberId");

  if (!eventId) {
    return NextResponse.json(
      { error: "Bad Request", message: "eventId is required" },
      { status: 400 }
    );
  }

  // Verify event exists
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      id: true,
      title: true,
      startTime: true,
      ticketTypes: {
        where: { isActive: true },
        select: { code: true, name: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!event) {
    return NextResponse.json(
      { error: "Not Found", message: "Event not found" },
      { status: 404 }
    );
  }

  // If specific member requested, return just their eligibility
  if (memberId) {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Not Found", message: "Member not found" },
        { status: 404 }
      );
    }

    const eligibility = await evaluateAllTicketEligibility(memberId, eventId);

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        startTime: event.startTime.toISOString(),
      },
      members: [
        {
          id: member.id,
          name: `${member.firstName} ${member.lastName}`,
          email: member.email,
          ticketTypes: eligibility.ticketTypes,
        },
      ],
    });
  }

  // Return eligibility for first 50 members (paginated view for admin)
  const members = await prisma.member.findMany({
    take: 50,
    select: { id: true, firstName: true, lastName: true, email: true },
    orderBy: { lastName: "asc" },
  });

  const results = await Promise.all(
    members.map(async (m) => {
      const eligibility = await evaluateAllTicketEligibility(m.id, eventId);
      return {
        id: m.id,
        name: `${m.firstName} ${m.lastName}`,
        email: m.email,
        ticketTypes: eligibility.ticketTypes,
      };
    })
  );

  return NextResponse.json({
    event: {
      id: event.id,
      title: event.title,
      startTime: event.startTime.toISOString(),
    },
    members: results,
  });
}
