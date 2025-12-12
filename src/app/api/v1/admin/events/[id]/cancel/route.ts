import { NextRequest } from "next/server";
import { errors, apiSuccess } from "@/lib/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/admin/events/:id/cancel
 *
 * Cancels an event and optionally notifies registrants.
 *
 * Request body: EventCancelRequest
 * {
 *   "reason": "Inclement weather forecast",
 *   "notifyRegistrants": true
 * }
 *
 * Response: EventCancelResponse (see docs/api/dtos/event.md)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // TODO: Wire - Implement event cancellation
  // 1. Validate access token and require globalRole === 'admin'
  // 2. Query event by ID
  // 3. Validate event is not already CANCELLED or COMPLETED
  // 4. Update event status to CANCELLED, store cancelReason
  // 5. Update all active registrations to CANCELLED
  // 6. If notifyRegistrants: send notifications to all affected members
  // 7. Return EventCancelResponse

  void request; // Suppress unused variable warning

  return errors.internal(`PATCH /api/v1/admin/events/${id}/cancel not implemented`);
}
