import { NextRequest } from "next/server";
import { errors, apiSuccess, parsePaginationParams, createPagination } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
  spotsRemaining: number | null;
  isWaitlistOpen: boolean;
}

/**
 * GET /api/v1/events
 *
 * Public endpoint to list events (member-facing).
 * Returns only published events by default.
 * No authentication required.
 *
 * Query params:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 20, max: 100)
 *   - category: Filter by category (optional)
 *   - from: Filter events starting on or after this ISO date (optional)
 *   - to: Filter events starting on or before this ISO date (optional)
 *   - search: Search in title and description (optional)
 *   - past: If "true", show past events; otherwise upcoming only (optional)
 *
 * Response: { events: EventSummary[], pagination: PaginationMeta, categories: string[] }
 *
 * Charter: P2 (public access allowed for published events)
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
    const search = searchParams.get("search");
    const showPast = searchParams.get("past") === "true";

    // Build where clause - only published events for member-facing endpoint
    const where: Prisma.EventWhereInput = {
      isPublished: true,
    };

    // By default, show only upcoming events (startTime >= now)
    if (!showPast && !from) {
      where.startTime = {
        gte: new Date(),
      };
    }

    if (category) {
      where.category = category;
    }

    // Date range filter (overrides default upcoming filter if specified)
    if (from || to) {
      where.startTime = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count for pagination
    const totalItems = await prisma.event.count({ where });

    // Get events with registration counts
    const events = await prisma.event.findMany({
      where,
      orderBy: { startTime: showPast ? "desc" : "asc" },
      skip,
      take: limit,
      include: {
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

    // Get distinct categories for filter UI
    const categoriesResult = await prisma.event.findMany({
      where: { isPublished: true, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });
    const categories = categoriesResult
      .map((c) => c.category)
      .filter((c): c is string => c !== null);

    // Transform to EventSummary shape
    const eventSummaries: EventSummary[] = events.map((event) => {
      const registeredCount = event._count.registrations;
      const hasCapacity = event.capacity !== null;
      const isFull = hasCapacity && registeredCount >= (event.capacity ?? 0);
      const spotsRemaining = hasCapacity
        ? Math.max(0, (event.capacity ?? 0) - registeredCount)
        : null;

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
        spotsRemaining,
        isWaitlistOpen: isFull,
      };
    });

    // Build pagination metadata
    const pagination = createPagination(page, limit, totalItems);

    return apiSuccess({
      events: eventSummaries,
      pagination,
      categories,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return errors.internal("Failed to fetch events");
  }
}
