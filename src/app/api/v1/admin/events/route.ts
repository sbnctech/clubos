import { NextRequest } from "next/server";
import { errors } from "@/lib/api";

/**
 * GET /api/v1/admin/events
 *
 * Admin endpoint to list all events with full details.
 *
 * Query params: page, limit, status, category, from, to
 *
 * Response: { events: EventSummary[], pagination: PaginationMeta }
 */
export async function GET(request: NextRequest) {
  // TODO: Wire - Implement admin event list
  // 1. Validate access token and require globalRole === 'admin'
  // 2. Parse query params
  // 3. Query all events (including DRAFT, CANCELLED)
  // 4. Return paginated response

  void request; // Suppress unused variable warning

  return errors.internal("GET /api/v1/admin/events not implemented");
}

/**
 * POST /api/v1/admin/events
 *
 * Admin endpoint to create a new event.
 *
 * Request body: CreateEventRequest
 * Response: EventDetail (201 Created)
 */
export async function POST(request: NextRequest) {
  // TODO: Wire - Implement event creation
  // 1. Validate access token and require globalRole === 'admin'
  // 2. Parse and validate request body
  // 3. Create event record
  // 4. Return created event with 201 status

  void request; // Suppress unused variable warning

  return errors.internal("POST /api/v1/admin/events not implemented");
}
