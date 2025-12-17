/**
 * POST /api/v1/admin/2fa/disable
 *
 * Admin endpoint to disable 2FA for a user who has lost access.
 *
 * This is a privileged operation that should only be used when:
 * - User has lost their phone/authenticator
 * - User has used all backup codes
 * - Identity has been verified through other means
 *
 * Request body:
 * {
 *   "userAccountId": "uuid",
 *   "reason": "User lost phone, verified via email and ID"
 * }
 *
 * Charter Principles:
 * - P1: Identity provable - requires admin capability
 * - P5: Every important action undoable - can be re-enrolled
 * - P7: Observability - action is fully logged with reason
 */

import { NextRequest, NextResponse } from "next/server";
import { requireCapability } from "@/lib/auth";
import { disable2FA } from "@/lib/auth/2fa";
import { z } from "zod";

const DisableSchema = z.object({
  userAccountId: z.string().uuid(),
  reason: z.string().min(10).max(500),
});

export async function POST(request: NextRequest) {
  // Require admin capability
  const auth = await requireCapability(request, "users:manage");
  if (!auth.ok) return auth.response;

  // Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parseResult = DisableSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const { userAccountId, reason } = parseResult.data;

  // Disable 2FA
  const result = await disable2FA(
    userAccountId,
    auth.context.memberId,
    reason
  );

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message: "2FA disabled successfully. User will need to re-enroll.",
    userAccountId,
  });
}
