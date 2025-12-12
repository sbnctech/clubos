import { NextRequest } from "next/server";
import { errors, apiNoContent } from "@/lib/api";

/**
 * POST /api/v1/auth/logout
 *
 * Invalidates all tokens for the current session.
 * Requires valid access token in Authorization header.
 *
 * Response: 204 No Content
 */
export async function POST(request: NextRequest) {
  // TODO: Wire - Implement logout logic
  // 1. Extract and validate access token from Authorization header
  // 2. Get sessionId from token claims
  // 3. Revoke all refresh tokens for this session
  // 4. Return 204 No Content

  void request; // Suppress unused variable warning

  return errors.internal("POST /api/v1/auth/logout not implemented");
}
