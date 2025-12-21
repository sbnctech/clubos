import { NextRequest } from "next/server";
import { errors, apiSuccess } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  getEventRegistrationState,
  formatRegistrationOpensMessage,
} from "@/lib/events";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Validate UUID format
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * EventDetail - full event information for detail page
 */
interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  startTime: string;
  endTime: string | null;
  capacity: number | null;
  isPublished: boolean;
  registeredCount: number;
  spotsRemaining: number | null;
  isWaitlistOpen: boolean;
  eventChair: {
    id: string;
    name: string;
  } | null;
  // Registration scheduling (SBNC policy: Sunday announce, Tuesday open)
  requiresRegistration: boolean;
  registrationOpensAt: string | null;
  registrationState: "NOT_REQUIRED" | "SCHEDULED" | "OPEN" | "CLOSED";
  registrationOpensMessage: string | null;
}

/**
 * GET /api/v1/events/:id
 *
 * Public endpoint to get event details.
 * Returns only published events (unless authenticated with admin).
 * No authentication required for published events.
 *
 * Response: { event: EventDetail }
 *
 * Charter: P2 (public access for published events), P9 (fail closed)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // Suppress unused variable warning
  void request;

  // Validate UUID format
  if (!uuidRegex.test(id)) {
    return errors.notFound("Event", id);
  }

  try {
    // Fetch event with chair and registration counts
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        eventChair: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            registrations: {
              where: {
                status: { in: ["CONFIRMED", "PENDING", "PENDING_PAYMENT"] },
              },
            },
          },
        },
      },
    });

    // Return 404 if event not found or not published
    if (!event || !event.isPublished) {
      return errors.notFound("Event", id);
    }

    const registeredCount = event._count.registrations;
    const hasCapacity = event.capacity !== null;
    const isFull = hasCapacity && registeredCount >= (event.capacity ?? 0);
    const spotsRemaining = hasCapacity
      ? Math.max(0, (event.capacity ?? 0) - registeredCount)
      : null;

    // Derive registration state using SBNC scheduling rules
    const now = new Date();
    const registrationState = getEventRegistrationState(
      {
        status: event.status,
        requiresRegistration: event.requiresRegistration,
        registrationOpensAt: event.registrationOpensAt,
        registrationDeadline: event.registrationDeadline,
        startTime: event.startTime,
      },
      now
    );

    // Generate human-readable message for when registration opens
    const registrationOpensMessage = formatRegistrationOpensMessage({
      requiresRegistration: event.requiresRegistration,
      registrationOpensAt: event.registrationOpensAt,
      status: event.status,
      startTime: event.startTime,
    });

    const eventDetail: EventDetail = {
      id: event.id,
      title: event.title,
      description: event.description,
      category: event.category,
      location: event.location,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime?.toISOString() ?? null,
      capacity: event.capacity,
      isPublished: event.isPublished,
      registeredCount,
      spotsRemaining,
      isWaitlistOpen: isFull,
      eventChair: event.eventChair
        ? {
            id: event.eventChair.id,
            name: `${event.eventChair.firstName} ${event.eventChair.lastName}`,
          }
        : null,
      // Registration scheduling
      requiresRegistration: event.requiresRegistration,
      registrationOpensAt: event.registrationOpensAt?.toISOString() ?? null,
      registrationState,
      registrationOpensMessage,
    };

    return apiSuccess({ event: eventDetail });
  } catch (error) {
    console.error("Error fetching event:", error);
    return errors.internal("Failed to fetch event");
  }
}
