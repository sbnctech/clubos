/**
 * POST /api/v1/auth/2fa/enroll
 *
 * Begin 2FA enrollment for the authenticated user.
 *
 * Returns a TOTP secret and QR code URI for the authenticator app,
 * plus backup codes that the user should save securely.
 *
 * Charter Principles:
 * - P1: Identity provable - requires authentication
 * - P9: Fail closed - enrollment must be confirmed with a valid code
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { beginEnrollment } from "@/lib/auth/2fa";
import { formatBackupCodesForDisplay } from "@/lib/auth/2fa/totp";

export async function POST(request: NextRequest) {
  // Require authentication
  const auth = await requireAuth(request);
  if (!auth.ok) return auth.response;

  // Get user account
  const userAccount = await prisma.userAccount.findFirst({
    where: { memberId: auth.context.memberId },
    select: { id: true, email: true, twoFactorEnabled: true },
  });

  if (!userAccount) {
    return NextResponse.json(
      { error: "User account not found" },
      { status: 404 }
    );
  }

  if (userAccount.twoFactorEnabled) {
    return NextResponse.json(
      { error: "2FA is already enabled for this account" },
      { status: 409 }
    );
  }

  // Begin enrollment
  const result = await beginEnrollment(userAccount.id, userAccount.email);

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message: "2FA enrollment started. Scan the QR code with your authenticator app.",
    qrCodeUri: result.qrCodeUri,
    secret: result.secret, // For manual entry if QR code fails
    backupCodes: result.backupCodes,
    backupCodesFormatted: formatBackupCodesForDisplay(result.backupCodes),
    nextStep: "POST /api/v1/auth/2fa/enroll/confirm with a code from your authenticator app",
  });
}
