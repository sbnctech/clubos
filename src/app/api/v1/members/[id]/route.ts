import { NextRequest } from "next/server";
import { errors, apiSuccess } from "@/lib/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/members/:id
 *
 * Retrieves detailed information about a specific member.
 * Members can view their own profile; admins can view any member.
 *
 * Response: MemberDetailResponse (see docs/api/dtos/member.md)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // TODO: Wire - Implement member detail fetch
  // 1. Validate access token from Authorization header
  // 2. Check permission: memberId matches token.memberId OR token.globalRole === 'admin'
  // 3. Query member from database with registrations
  // 4. Return MemberDetailResponse

  void request; // Suppress unused variable warning

  return errors.internal(`GET /api/v1/members/${id} not implemented`);
}
