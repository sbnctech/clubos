import { NextRequest } from "next/server";
import { errors } from "@/lib/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/admin/members/:id
 *
 * Admin endpoint to retrieve full member details.
 *
 * Response: MemberDetailResponse (see docs/api/dtos/member.md)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // TODO: Wire - Implement admin member detail
  // 1. Validate access token and require globalRole === 'admin'
  // 2. Query member by ID with full details and registrations
  // 3. Return MemberDetailResponse

  void request; // Suppress unused variable warning

  return errors.internal(`GET /api/v1/admin/members/${id} not implemented`);
}

/**
 * PATCH /api/v1/admin/members/:id
 *
 * Admin endpoint to update member information.
 *
 * Request body: Partial member fields
 * Response: Updated MemberDetail
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // TODO: Wire - Implement member update
  // 1. Validate access token and require globalRole === 'admin'
  // 2. Parse and validate request body
  // 3. Update member record
  // 4. Return updated member

  void request; // Suppress unused variable warning

  return errors.internal(`PATCH /api/v1/admin/members/${id} not implemented`);
}
