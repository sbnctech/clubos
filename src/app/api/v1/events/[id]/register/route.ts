/**
 * Event Self-Registration API
 *
 * POST /api/v1/events/:id/register - Register authenticated member for event
 * DELETE /api/v1/events/:id/register - Cancel member's registration
 *
 * Charter compliance:
 * - P1: Identity provable via session
 * - P2: Default deny (auth required)
 * - P7: Audit logging for registration actions
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/passkey";
import { prisma } from "@/lib/prisma";
import { errors } from "@/lib/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/events/:id/register
 *
 * Registers the authenticated member for an event.
 * If event is at capacity, adds to waitlist (if open).
 *
 * Response: Registration object with status (CONFIRMED or WAITLISTED)
 */
export async function POST(_request: NextRequest, { params }: RouteParams) {
  const { id: eventId } = await params;

  // P1/P2: Authenticate
  const session = await getCurrentSession();
  if (!session) {
    return errors.unauthorized("Not authenticated");
  }
  const { memberId } = session;

  // Fetch event with registration count
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      _count: {
        select: {
          registrations: {
            where: { status: { in: ["CONFIRMED", "PENDING", "PENDING_PAYMENT"] } },
          },
        },
      },
    },
  });

  if (!event) {
    return errors.notFound("Event", eventId);
  }

  if (!event.isPublished) {
    return errors.forbidden("Event is not open for registration");
  }

  // Check for existing registration
  const existing = await prisma.eventRegistration.findFirst({
    where: {
      eventId,
      memberId,
      status: { notIn: ["CANCELLED"] },
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "ALREADY_REGISTERED", message: "You are already registered for this event" },
      { status: 409 }
    );
  }

  // Determine registration status based on capacity
  const registeredCount = event._count.registrations;
  const hasCapacity = event.capacity !== null;
  const isFull = hasCapacity && registeredCount >= (event.capacity ?? 0);

  let status: "CONFIRMED" | "WAITLISTED";
  let waitlistPosition: number | null = null;

  if (isFull) {
    // Get current max waitlist position
    const maxPosition = await prisma.eventRegistration.aggregate({
      where: { eventId, status: "WAITLISTED" },
      _max: { waitlistPosition: true },
    });
    waitlistPosition = (maxPosition._max.waitlistPosition ?? 0) + 1;
    status = "WAITLISTED";
  } else {
    status = "CONFIRMED";
  }

  // Create registration
  const registration = await prisma.eventRegistration.create({
    data: {
      eventId,
      memberId,
      status,
      waitlistPosition,
      registeredAt: new Date(),
    },
    include: {
      event: {
        select: { id: true, title: true, startTime: true },
      },
    },
  });

  // P7: Audit log
  await prisma.auditLog.create({
    data: {
      action: status === "WAITLISTED" ? "EVENT_WAITLIST_JOIN" : "EVENT_REGISTER",
      resourceType: "EventRegistration",
      resourceId: registration.id,
      memberId,
      metadata: {
        eventId,
        eventTitle: registration.event.title,
        status,
        waitlistPosition,
      },
    },
  });

  return NextResponse.json({
    id: registration.id,
    eventId: registration.eventId,
    status: registration.status,
    waitlistPosition: registration.waitlistPosition,
    registeredAt: registration.registeredAt.toISOString(),
    event: {
      id: registration.event.id,
      title: registration.event.title,
      startTime: registration.event.startTime.toISOString(),
    },
  }, { status: 201 });
}

/**
 * DELETE /api/v1/events/:id/register
 *
 * Cancels the authenticated member's registration for an event.
 *
 * Response: 204 No Content
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { id: eventId } = await params;

  // P1/P2: Authenticate
  const session = await getCurrentSession();
  if (!session) {
    return errors.unauthorized("Not authenticated");
  }
  const { memberId } = session;

  // Find active registration
  const registration = await prisma.eventRegistration.findFirst({
    where: {
      eventId,
      memberId,
      status: { notIn: ["CANCELLED"] },
    },
    include: {
      event: { select: { title: true } },
    },
  });

  if (!registration) {
    return errors.notFound("Registration", `member=${memberId},event=${eventId}`);
  }

  const wasWaitlisted = registration.status === "WAITLISTED";

  // Cancel registration
  await prisma.eventRegistration.update({
    where: { id: registration.id },
    data: { status: "CANCELLED" },
  });

  // P7: Audit log
  await prisma.auditLog.create({
    data: {
      action: "EVENT_CANCEL_REGISTRATION",
      resourceType: "EventRegistration",
      resourceId: registration.id,
      memberId,
      metadata: {
        eventId,
        eventTitle: registration.event.title,
        previousStatus: registration.status,
      },
    },
  });

  // If cancelled from waitlist, no promotion needed
  // If cancelled from confirmed, could promote waitlisted member (future enhancement)
  void wasWaitlisted;

  return new NextResponse(null, { status: 204 });
}
