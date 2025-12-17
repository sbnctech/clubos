/**
 * POST /api/v1/auth/2fa/enroll/confirm
 *
 * Complete 2FA enrollment by verifying the first code.
 *
 * Request body:
 * {
 *   "code": "123456" // 6-digit TOTP code from authenticator app
 * }
 *
 * Charter Principles:
 * - P1: Identity provable - verifies authenticator is correctly configured
 * - P9: Fail closed - invalid code rejects enrollment
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { completeEnrollment } from "@/lib/auth/2fa";
import { z } from "zod";

const ConfirmEnrollmentSchema = z.object({
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

  const parseResult = ConfirmEnrollmentSchema.safeParse(body);
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
    select: { id: true },
  });

  if (!userAccount) {
    return NextResponse.json(
      { error: "User account not found" },
      { status: 404 }
    );
  }

  // Complete enrollment
  const result = await completeEnrollment(
    userAccount.id,
    code,
    auth.context.memberId
  );

  if (!result.success) {
    return NextResponse.json(
      { error: result.error },
      { status: 400 }
    );
  }

  return NextResponse.json({
    message: "2FA enrollment complete. Your account is now protected with two-factor authentication.",
    twoFactorEnabled: true,
  });
}
