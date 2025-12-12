import { NextRequest } from "next/server";
import { errors, apiSuccess } from "@/lib/api";

/**
 * GET /api/v1/admin/registrations/pending
 *
 * Retrieves all registrations awaiting action (waitlisted or pending approval).
 *
 * Query params: eventId, sort, limit
 *
 * Response: PendingRegistrationsResponse (see docs/api/dtos/registration.md)
 */
export async function GET(request: NextRequest) {
  // TODO: Wire - Implement pending registrations list
  // 1. Validate access token and require globalRole === 'admin'
  // 2. Parse query params (eventId, sort, limit)
  // 3. Query registrations where status IN ('WAITLISTED', 'PENDING')
  // 4. Calculate daysWaiting for each
  // 5. Return PendingRegistrationsResponse

  void request; // Suppress unused variable warning

  return errors.internal("GET /api/v1/admin/registrations/pending not implemented");
}
