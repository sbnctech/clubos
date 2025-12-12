import { NextRequest } from "next/server";
import { errors, apiSuccess } from "@/lib/api";

/**
 * GET /api/v1/members
 *
 * Member-facing endpoint to list members (limited view).
 * For v1, this may be restricted or return minimal data.
 *
 * Query params: page, limit
 *
 * Response: { members: MemberSummary[], pagination: PaginationMeta }
 */
export async function GET(request: NextRequest) {
  // TODO: Wire - Implement member list (member-facing)
  // 1. Validate access token from Authorization header
  // 2. Parse pagination params
  // 3. Query members with limited fields
  // 4. Return paginated response

  void request; // Suppress unused variable warning

  return errors.internal("GET /api/v1/members not implemented");
}
