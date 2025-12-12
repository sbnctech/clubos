import { NextRequest } from "next/server";
import { errors, apiSuccess } from "@/lib/api";

/**
 * GET /api/v1/events
 *
 * Public endpoint to list events (member-facing).
 *
 * Query params: page, limit, category, from, to, status
 *
 * Response: EventListResponse (see docs/api/dtos/event.md)
 */
export async function GET(request: NextRequest) {
  // TODO: Wire - Implement event list
  // 1. Validate access token from Authorization header
  // 2. Parse query params (page, limit, category, from, to, status)
  // 3. Query events with filters (only PUBLISHED by default for members)
  // 4. Return EventListResponse with pagination

  void request; // Suppress unused variable warning

  return errors.internal("GET /api/v1/events not implemented");
}
