import { NextRequest } from "next/server";
import { errors } from "@/lib/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/admin/members/:id/status
 *
 * Updates a member's status (ACTIVE, INACTIVE, SUSPENDED, PENDING).
 *
 * Request body: MemberStatusUpdateRequest
 * {
 *   "status": "INACTIVE",
 *   "reason": "Membership lapsed",
 *   "notify": true
 * }
 *
 * Response: MemberStatusUpdateResponse (see docs/api/dtos/member.md)
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // TODO: Wire - Implement member status update
  // 1. Validate access token and require globalRole === 'admin'
  // 2. Parse and validate request body (status, reason, notify)
  // 3. Check for CONFLICT if member already has requested status
  // 4. Update member status
  // 5. Record in history
  // 6. Send notification if notify === true
  // 7. Return MemberStatusUpdateResponse

  void request; // Suppress unused variable warning

  return errors.internal(`PATCH /api/v1/admin/members/${id}/status not implemented`);
}
