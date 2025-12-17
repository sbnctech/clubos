/**
 * 2FA Enforcement Guard
 *
 * Middleware-style functions for enforcing 2FA on API routes.
 *
 * Charter Principles:
 * - P2: Default deny - blocks access when 2FA is required but not verified
 * - P9: Security must fail closed - missing verification = denied
 */

import { NextRequest, NextResponse } from "next/server";
import { AuthContext, AuthResult, requireAuth, requireCapability, Capability } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  check2FAEnforcement,
  capabilityRequires2FA,
  roleRequires2FA,
} from "./enforcement";
import { log2FABlock } from "./service";

/**
 * Extended auth result that includes 2FA status.
 */
export type TwoFactorAuthResult =
  | { ok: true; context: AuthContext; twoFactorVerified: boolean }
  | { ok: false; response: NextResponse };

/**
 * Require authentication and check 2FA enforcement.
 *
 * If the user's role requires 2FA:
 * - Returns 403 with `action: "enroll"` if 2FA not enabled
 * - Returns 403 with `action: "verify"` if 2FA enabled but session expired
 * - Returns success if 2FA verified and current
 *
 * Usage:
 * ```typescript
 * const auth = await require2FA(request);
 * if (!auth.ok) return auth.response;
 * // auth.context and auth.twoFactorVerified are available
 * ```
 */
export async function require2FA(req: NextRequest): Promise<TwoFactorAuthResult> {
  // First, require basic authentication
  const authResult = await requireAuth(req);
  if (!authResult.ok) {
    return authResult;
  }

  const { context } = authResult;

  // Check if role requires 2FA
  if (!roleRequires2FA(context.globalRole)) {
    return { ok: true, context, twoFactorVerified: false };
  }

  // Get user account with 2FA status
  const userAccount = await prisma.userAccount.findFirst({
    where: { memberId: context.memberId },
    select: {
      id: true,
      twoFactorEnabled: true,
      twoFactorVerifiedAt: true,
    },
  });

  if (!userAccount) {
    // User account not found - this shouldn't happen but fail closed
    return {
      ok: false,
      response: NextResponse.json(
        { error: "User account not found" },
        { status: 403 }
      ),
    };
  }

  // Check enforcement status
  const enforcement = check2FAEnforcement(
    context.globalRole,
    userAccount.twoFactorEnabled,
    userAccount.twoFactorVerifiedAt
  );

  if (!enforcement.required) {
    return { ok: true, context, twoFactorVerified: false };
  }

  // 2FA is required - check if action needed
  if (enforcement.action === "enroll") {
    // Log the block
    await log2FABlock(
      userAccount.id,
      context.memberId,
      "2FA enrollment required"
    );

    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Two-factor authentication required",
          code: "2FA_ENROLLMENT_REQUIRED",
          action: "enroll",
          message: enforcement.reason,
          enrollmentUrl: "/api/v1/auth/2fa/enroll",
        },
        { status: 403 }
      ),
    };
  }

  if (enforcement.action === "verify") {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Two-factor verification required",
          code: "2FA_VERIFICATION_REQUIRED",
          action: "verify",
          message: enforcement.reason,
          verificationUrl: "/api/v1/auth/2fa/verify",
        },
        { status: 403 }
      ),
    };
  }

  // 2FA verified and current
  return { ok: true, context, twoFactorVerified: true };
}

/**
 * Require authentication with capability check and 2FA enforcement.
 *
 * Combines requireCapability with 2FA enforcement. If the capability
 * requires 2FA, enforces 2FA verification.
 *
 * Usage:
 * ```typescript
 * const auth = await requireCapabilityWith2FA(request, "finance:view");
 * if (!auth.ok) return auth.response;
 * ```
 */
export async function requireCapabilityWith2FA(
  req: NextRequest,
  capability: Capability
): Promise<TwoFactorAuthResult> {
  // First, check capability
  const capResult = await requireCapability(req, capability);
  if (!capResult.ok) {
    return capResult;
  }

  const { context } = capResult;

  // Check if this specific capability requires 2FA
  if (!capabilityRequires2FA(capability)) {
    return { ok: true, context, twoFactorVerified: false };
  }

  // Capability requires 2FA - check enforcement
  const userAccount = await prisma.userAccount.findFirst({
    where: { memberId: context.memberId },
    select: {
      id: true,
      twoFactorEnabled: true,
      twoFactorVerifiedAt: true,
    },
  });

  if (!userAccount) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "User account not found" },
        { status: 403 }
      ),
    };
  }

  const enforcement = check2FAEnforcement(
    context.globalRole,
    userAccount.twoFactorEnabled,
    userAccount.twoFactorVerifiedAt
  );

  if (!enforcement.required) {
    return { ok: true, context, twoFactorVerified: false };
  }

  if (enforcement.action === "enroll") {
    await log2FABlock(
      userAccount.id,
      context.memberId,
      `2FA enrollment required for ${capability}`,
      capability
    );

    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Two-factor authentication required",
          code: "2FA_ENROLLMENT_REQUIRED",
          action: "enroll",
          capability,
          message: `The capability "${capability}" requires two-factor authentication. Please enroll in 2FA to continue.`,
          enrollmentUrl: "/api/v1/auth/2fa/enroll",
        },
        { status: 403 }
      ),
    };
  }

  if (enforcement.action === "verify") {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Two-factor verification required",
          code: "2FA_VERIFICATION_REQUIRED",
          action: "verify",
          capability,
          message: enforcement.reason,
          verificationUrl: "/api/v1/auth/2fa/verify",
        },
        { status: 403 }
      ),
    };
  }

  return { ok: true, context, twoFactorVerified: true };
}
