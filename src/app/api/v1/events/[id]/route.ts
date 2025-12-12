import { NextRequest } from "next/server";
import { errors } from "@/lib/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/events/:id
 *
 * Retrieves detailed information about a specific event.
 * Includes current user's registration status if authenticated.
 *
 * Response: EventDetailResponse (see docs/api/dtos/event.md)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // TODO: Wire - Implement event detail
  // 1. Validate access token from Authorization header
  // 2. Query event by ID
  // 3. If authenticated, include user's registration status
  // 4. Return EventDetailResponse

  void request; // Suppress unused variable warning

  return errors.internal(`GET /api/v1/events/${id} not implemented`);
}
