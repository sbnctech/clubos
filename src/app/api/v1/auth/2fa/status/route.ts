/**
 * GET /api/v1/auth/2fa/status
 *
 * Get the current user's 2FA status and enforcement requirements.
 *
 * Response includes:
 * - Whether 2FA is enabled
 * - Whether 2FA is required for their role
 * - Last verification timestamp
 * - Number of backup codes remaining
 *
 * Charter Principles:
 * - P4: No hidden rules - shows enforcement requirements clearly
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { get2FAStatus } from "@/lib/auth/2fa";

export async function GET(request: NextRequest) {
  // Require authentication
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  // Get user account
  const userAccount = await prisma.userAccount.findFirst({
    where: { memberId: auth.context.memberId },
    select: { id: true },
  });

  if (!userAccount) {
    return NextResponse.json(
      { error: "User account not found" },
      { status: 404 }
    );
  }

  // Get 2FA status
  const status = await get2FAStatus(userAccount.id, auth.context.globalRole);

  if (!status) {
    return NextResponse.json(
      { error: "Could not retrieve 2FA status" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    twoFactorEnabled: status.enabled,
    enrolledAt: status.enrolledAt?.toISOString() ?? null,
    lastVerifiedAt: status.lastVerifiedAt?.toISOString() ?? null,
    backupCodesRemaining: status.backupCodesRemaining,
    enforcement: {
      required: status.enforcementStatus.required,
      ...(status.enforcementStatus.required && {
        enrolled: status.enforcementStatus.enrolled,
        verified: status.enforcementStatus.verified,
        action: status.enforcementStatus.action,
        reason: status.enforcementStatus.reason,
      }),
    },
  });
}
