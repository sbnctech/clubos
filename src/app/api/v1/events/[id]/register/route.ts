/**
 * Event Registration API
 *
 * POST /api/v1/events/:id/register - Register for an event
 * DELETE /api/v1/events/:id/register - Cancel registration
 *
 * Charter Principles:
 * - P1: Requires authenticated member
 * - P7: Logs mentorship co-registration signals
 * - N5: No data mutation without observability
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { detectRegistrationOverlap } from "@/lib/mentorship/logging";

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
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: eventId } = await params;

  // Require authenticated member
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const memberId = auth.context.memberId;

  try {
    // Check if event exists and is published
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            registrations: {
              where: { status: { in: ["CONFIRMED", "PENDING"] } },
            },
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.isPublished) {
      return NextResponse.json(
        { error: "Event is not available for registration" },
        { status: 400 }
      );
    }

    // Check if member is already registered
    const existingRegistration = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        memberId,
        status: { notIn: ["CANCELLED", "REFUNDED"] },
      },
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: "Already registered for this event" },
        { status: 409 }
      );
    }

    // Determine registration status based on capacity
    const currentCount = event._count.registrations;
    const hasCapacity =
      event.capacity === null || currentCount < event.capacity;

    let status: "CONFIRMED" | "WAITLISTED";
    let waitlistPosition: number | null = null;

    if (hasCapacity) {
      status = "CONFIRMED";
    } else {
      // Add to waitlist
      status = "WAITLISTED";
      // Calculate waitlist position
      const waitlistCount = await prisma.eventRegistration.count({
        where: { eventId, status: "WAITLISTED" },
      });
      waitlistPosition = waitlistCount + 1;
    }

    // Create registration
    const registration = await prisma.eventRegistration.create({
      data: {
        eventId,
        memberId,
        status,
        waitlistPosition,
        registeredAt: new Date(),
        confirmedAt: status === "CONFIRMED" ? new Date() : null,
      },
    });

    // Charter P7: Detect mentor-newbie registration overlap for action log
    // This fires async and doesn't block the response
    detectRegistrationOverlap(memberId, eventId).catch((err) => {
      console.error("[Registration] Mentorship detection failed:", err);
    });

    return NextResponse.json(
      {
        registration: {
          id: registration.id,
          eventId: registration.eventId,
          status: registration.status,
          waitlistPosition: registration.waitlistPosition,
          registeredAt: registration.registeredAt.toISOString(),
        },
        message:
          status === "CONFIRMED"
            ? "Successfully registered for event"
            : `Added to waitlist at position ${waitlistPosition}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Registration] Error:", error);
    return NextResponse.json(
      { error: "Failed to register for event" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/v1/events/:id/register
 *
 * Cancels the authenticated member's registration for an event.
 *
 * Response: 204 No Content
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id: eventId } = await params;

  // Require authenticated member
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  const memberId = auth.context.memberId;

  try {
    // Find member's active registration
    const registration = await prisma.eventRegistration.findFirst({
      where: {
        eventId,
        memberId,
        status: { notIn: ["CANCELLED", "REFUNDED"] },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "No active registration found" },
        { status: 404 }
      );
    }

    // Cancel the registration
    await prisma.eventRegistration.update({
      where: { id: registration.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    // If this was a confirmed registration, promote from waitlist
    if (registration.status === "CONFIRMED") {
      const nextWaitlisted = await prisma.eventRegistration.findFirst({
        where: { eventId, status: "WAITLISTED" },
        orderBy: { waitlistPosition: "asc" },
      });

      if (nextWaitlisted) {
        await prisma.eventRegistration.update({
          where: { id: nextWaitlisted.id },
          data: {
            status: "CONFIRMED",
            waitlistPosition: null,
            confirmedAt: new Date(),
          },
        });

        // Detect mentor-newbie overlap for the promoted registration
        detectRegistrationOverlap(nextWaitlisted.memberId, eventId).catch(
          (err) => {
            console.error("[Registration] Mentorship detection failed:", err);
          }
        );
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[Registration] Error:", error);
    return NextResponse.json(
      { error: "Failed to cancel registration" },
      { status: 500 }
    );
  }
}
