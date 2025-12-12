import { NextRequest } from "next/server";
import { errors } from "@/lib/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/admin/events/:id
 *
 * Admin endpoint to retrieve full event details with registration list.
 *
 * Response: AdminEventDetailResponse (see docs/api/dtos/event.md)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // TODO: Wire - Implement admin event detail
  // 1. Validate access token and require globalRole === 'admin'
  // 2. Query event by ID with all registrations
  // 3. Calculate stats (totalRegistrations, confirmedCount, etc.)
  // 4. Return AdminEventDetailResponse

  void request; // Suppress unused variable warning

  return errors.internal(`GET /api/v1/admin/events/${id} not implemented`);
}

/**
 * PATCH /api/v1/admin/events/:id
 *
 * Admin endpoint to update event information.
 *
 * Request body: Partial event fields
 * Response: Updated EventDetail
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // TODO: Wire - Implement event update
  // 1. Validate access token and require globalRole === 'admin'
  // 2. Parse and validate request body
  // 3. Update event record
  // 4. Return updated event

  void request; // Suppress unused variable warning

  return errors.internal(`PATCH /api/v1/admin/events/${id} not implemented`);
}

/**
 * DELETE /api/v1/admin/events/:id
 *
 * Admin endpoint to delete an event (soft delete via status change).
 *
 * Response: 204 No Content
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // TODO: Wire - Implement event deletion
  // 1. Validate access token and require globalRole === 'admin'
  // 2. Check event exists
  // 3. Soft delete (set status to CANCELLED or mark deleted)
  // 4. Return 204 No Content

  void request; // Suppress unused variable warning

  return errors.internal(`DELETE /api/v1/admin/events/${id} not implemented`);
}
