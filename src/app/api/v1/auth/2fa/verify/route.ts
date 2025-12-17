/**
 * POST /api/v1/auth/2fa/verify
 *
 * Verify a 2FA code (TOTP or backup code).
 *
 * Used for:
 * - Step-up authentication when 2FA session has expired
 * - Initial login verification (if 2FA is required)
 *
 * Request body:
 * {
 *   "code": "123456" // 6-digit TOTP code or 8-character backup code
 * }
 *
 * Charter Principles:
 * - P1: Identity provable - verifies second factor
 * - P7: Observability - backup code usage is logged
 * - P9: Fail closed - invalid code rejects verification
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verify2FA } from "@/lib/auth/2fa";
import { z } from "zod";

const VerifySchema = z.object({
  code: z.string().min(6).max(8),
});

export async function POST(request: NextRequest) {
  // Require authentication
  const auth = await requireAuth(request);
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

  const parseResult = VerifySchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid request", details: parseResult.error.flatten() },
      { status: 400 }
    );
  }

  const { code } = parseResult.data;

  // Get user account
  const userAccount = await prisma.userAccount.findFirst({
    where: { memberId: auth.context.memberId },
    select: { id: true, twoFactorEnabled: true },
  });

  if (!userAccount) {
    return NextResponse.json(
      { error: "User account not found" },
      { status: 404 }
    );
  }

  if (!userAccount.twoFactorEnabled) {
    return NextResponse.json(
      { error: "2FA is not enabled for this account" },
      { status: 400 }
    );
  }

  // Verify 2FA
  const result = await verify2FA(
    userAccount.id,
    code,
    auth.context.memberId
  );

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 401 }
    );
  }

  // Return success with warning if backup code was used
  const response: Record<string, unknown> = {
    message: "2FA verification successful",
    verified: true,
  };

  if (result.usedBackupCode) {
    response.warning = "You used a backup code. Please regenerate your backup codes soon.";
    response.usedBackupCode = true;
  }

  return NextResponse.json(response);
}
