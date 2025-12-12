import { NextRequest } from "next/server";
import { errors, apiSuccess } from "@/lib/api";

/**
 * GET /api/v1/admin/members
 *
 * Admin endpoint to list all members with full details and metrics.
 *
 * Query params: page, limit, status, search, sort, order
 *
 * Response: MemberListResponse (see docs/api/dtos/member.md)
 */
export async function GET(request: NextRequest) {
  // TODO: Wire - Implement admin member list
  // 1. Validate access token and require globalRole === 'admin'
  // 2. Parse query params (page, limit, status, search, sort, order)
  // 3. Query members with aggregated metrics (registrationCount, waitlistedCount)
  // 4. Return MemberListResponse with pagination

  void request; // Suppress unused variable warning

  return errors.internal("GET /api/v1/admin/members not implemented");
}
