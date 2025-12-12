import { NextRequest } from "next/server";
import { errors } from "@/lib/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/admin/registrations/:id/promote
 *
 * Promotes a waitlisted registration to confirmed status.
 * V1: MANUAL promotion only - no automatic promotion.
 *
 * Request body: PromoteRegistrationRequest
 * {
 *   "notify": true,
 *   "notes": "Promoted due to member seniority",
 *   "overrideCapacity": false
 * }
 *
 * Response: PromoteRegistrationResponse (see docs/api/dtos/registration.md)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // TODO: Wire - Implement waitlist promotion
  // 1. Validate access token and require globalRole === 'admin'
  // 2. Query registration by ID
  // 3. Validate registration status === 'WAITLISTED'
  //    - If not WAITLISTED: return VALIDATION_ERROR
  // 4. Check event capacity:
  //    - If at capacity and !overrideCapacity: return CAPACITY_EXCEEDED
  //    - If overrideCapacity: proceed with warning
  // 5. Update registration:
  //    - status: 'REGISTERED'
  //    - promotedAt: now
  //    - waitlistPosition: null
  // 6. Record in history
  // 7. If notify: send notification to member
  // 8. Recalculate waitlist positions for remaining
  // 9. Return PromoteRegistrationResponse

  void request; // Suppress unused variable warning

  return errors.internal(`POST /api/v1/admin/registrations/${id}/promote not implemented`);
}
