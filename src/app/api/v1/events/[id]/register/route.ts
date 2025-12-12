import { NextRequest } from "next/server";
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
 * Response: Registration object with status (REGISTERED or WAITLISTED)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // TODO: Wire - Implement event registration
  // 1. Validate access token and extract memberId
  // 2. Check if member is already registered (CONFLICT if so)
  // 3. Check event capacity
  //    - If spots available: create REGISTERED registration
  //    - If at capacity and waitlist open: create WAITLISTED registration
  //    - If at capacity and waitlist closed: return CAPACITY_EXCEEDED
  // 4. Return created registration

  void request; // Suppress unused variable warning

  return errors.internal(`POST /api/v1/events/${id}/register not implemented`);
}

/**
 * DELETE /api/v1/events/:id/register
 *
 * Cancels the authenticated member's registration for an event.
 *
 * Response: 204 No Content
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // TODO: Wire - Implement registration cancellation
  // 1. Validate access token and extract memberId
  // 2. Find member's registration for this event
  // 3. If not found: return RESOURCE_NOT_FOUND
  // 4. Update registration status to CANCELLED
  // 5. Return 204 No Content

  void request; // Suppress unused variable warning

  return errors.internal(`DELETE /api/v1/events/${id}/register not implemented`);
}
