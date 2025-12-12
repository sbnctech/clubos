import { NextRequest } from "next/server";
import { errors, apiSuccess } from "@/lib/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/admin/registrations/:id
 *
 * Retrieves detailed information about a specific registration.
 *
 * Response: RegistrationDetailResponse (see docs/api/dtos/registration.md)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // TODO: Wire - Implement registration detail
  // 1. Validate access token and require globalRole === 'admin'
  // 2. Query registration by ID with member and event details
  // 3. Query registration history
  // 4. Return RegistrationDetailResponse

  void request; // Suppress unused variable warning

  return errors.internal(`GET /api/v1/admin/registrations/${id} not implemented`);
}

/**
 * DELETE /api/v1/admin/registrations/:id
 *
 * Cancels a registration.
 *
 * Request body: CancelRegistrationRequest
 * {
 *   "reason": "Member requested cancellation",
 *   "notify": true,
 *   "refund": false
 * }
 *
 * Response: CancelRegistrationResponse (see docs/api/dtos/registration.md)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // TODO: Wire - Implement registration cancellation
  // 1. Validate access token and require globalRole === 'admin'
  // 2. Query registration by ID
  // 3. Validate registration is not already CANCELLED
  // 4. Update registration status to CANCELLED
  // 5. If was REGISTERED: increment event spotsAvailable
  // 6. If notify: send notification to member
  // 7. If refund and paymentStatus === 'paid': initiate refund
  // 8. NO automatic waitlist promotion (v1 manual only)
  // 9. Return CancelRegistrationResponse

  void request; // Suppress unused variable warning

  return errors.internal(`DELETE /api/v1/admin/registrations/${id} not implemented`);
}
