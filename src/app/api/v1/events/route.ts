import { NextRequest } from "next/server";
import { errors, apiSuccess, parsePaginationParams, createPagination } from "@/lib/api";
import { prisma } from "@/lib/prisma";

/**
 * EventSummary - the shape returned for each event in the list
 */
interface EventSummary {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  startTime: string;
  endTime: string | null;
  capacity: number | null;
  registeredCount: number;
  isWaitlistOpen: boolean;
}

/**
 * GET /api/v1/events
 *
 * Public endpoint to list events (member-facing).
 * Returns only published events by default.
 *
 * Query params:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 20, max: 100)
 *   - category: Filter by category (optional)
 *   - from: Filter events starting on or after this ISO date (optional)
 *   - to: Filter events starting on or before this ISO date (optional)
 *
 * Response: { events: EventSummary[], pagination: PaginationMeta }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse pagination
    const { page, limit } = parsePaginationParams(searchParams);
    const skip = (page - 1) * limit;

    // Parse optional filters
    const category = searchParams.get("category");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // Build where clause - only published events for member-facing endpoint
    const where: {
      isPublished: boolean;
      category?: string;
      startTime?: { gte?: Date; lte?: Date };
    } = {
      isPublished: true,
    };

    if (category) {
      where.category = category;
    }

    if (from || to) {
      where.startTime = {};
      if (from) {
        where.startTime.gte = new Date(from);
      }
      if (to) {
        where.startTime.lte = new Date(to);
      }
    }

    // Get total count for pagination
    const totalItems = await prisma.event.count({ where });

    // Get events with registration counts
    const events = await prisma.event.findMany({
      where,
      orderBy: { startTime: "asc" },
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            registrations: {
              where: {
                status: { in: ["CONFIRMED", "PENDING"] },
              },
            },
          },
        },
      },
    });

    // Transform to EventSummary shape
    const eventSummaries: EventSummary[] = events.map((event) => {
      const registeredCount = event._count.registrations;
      const hasCapacity = event.capacity !== null;
      const isFull = hasCapacity && registeredCount >= (event.capacity ?? 0);

      return {
        id: event.id,
        title: event.title,
        description: event.description,
        category: event.category,
        location: event.location,
        startTime: event.startTime.toISOString(),
        endTime: event.endTime?.toISOString() ?? null,
        capacity: event.capacity,
        registeredCount,
        isWaitlistOpen: isFull,
      };
    });

    // Build pagination metadata
    const pagination = createPagination(page, limit, totalItems);

    return apiSuccess({
      events: eventSummaries,
      pagination,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return errors.internal("Failed to fetch events");
  }
}
