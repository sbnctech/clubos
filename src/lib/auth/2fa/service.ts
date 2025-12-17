/**
 * 2FA Service Layer
 *
 * Handles 2FA enrollment, verification, and management with database operations.
 *
 * Charter Principles:
 * - P1: Identity provable - all 2FA actions are audited
 * - P5: Every important action undoable - 2FA can be disabled by admin
 * - P7: Observability - all actions logged
 */

import { prisma } from "@/lib/prisma";
import { AuditAction, Prisma } from "@prisma/client";
import {
  generateTotpSecret,
  generateTotpUri,
  verifyTotpCode,
  generateBackupCodes,
  verifyBackupCode,
} from "./totp";
import { check2FAEnforcement, TwoFactorEnforcementResult } from "./enforcement";
import { GlobalRole } from "@/lib/auth";

// ============================================================================
// TYPES
// ============================================================================

export interface EnrollmentSetupResult {
  success: true;
  secret: string;
  qrCodeUri: string;
  backupCodes: string[];
}

export interface EnrollmentSetupError {
  success: false;
  error: string;
}

export interface VerificationResult {
  success: boolean;
  error?: string;
  usedBackupCode?: boolean;
}

export interface TwoFactorStatus {
  enabled: boolean;
  enrolledAt: Date | null;
  lastVerifiedAt: Date | null;
  backupCodesRemaining: number;
  enforcementStatus: TwoFactorEnforcementResult;
}

// ============================================================================
// ENROLLMENT
// ============================================================================

/**
 * Begin 2FA enrollment for a user.
 *
 * Generates a new TOTP secret and backup codes. The secret is stored
 * but 2FA is not yet enabled until the user verifies a code.
 *
 * @param userAccountId - The user account ID
 * @param email - User's email for the authenticator app label
 * @returns Setup result with QR code URI and backup codes
 */
export async function beginEnrollment(
  userAccountId: string,
  email: string
): Promise<EnrollmentSetupResult | EnrollmentSetupError> {
  const userAccount = await prisma.userAccount.findUnique({
    where: { id: userAccountId },
    select: { twoFactorEnabled: true },
  });

  if (!userAccount) {
    return { success: false, error: "User account not found" };
  }

  if (userAccount.twoFactorEnabled) {
    return { success: false, error: "2FA is already enabled" };
  }

  // Generate new secret and backup codes
  const secret = generateTotpSecret();
  const { plainCodes, hashedCodes } = generateBackupCodes();
  const qrCodeUri = generateTotpUri(secret, email);

  // Store the secret (but don't enable 2FA yet - requires verification)
  await prisma.userAccount.update({
    where: { id: userAccountId },
    data: {
      twoFactorSecret: secret,
      twoFactorBackupCodes: hashedCodes,
    },
  });

  return {
    success: true,
    secret,
    qrCodeUri,
    backupCodes: plainCodes,
  };
}

/**
 * Complete 2FA enrollment by verifying the first code.
 *
 * This confirms the user has successfully set up their authenticator app.
 *
 * @param userAccountId - The user account ID
 * @param code - TOTP code from authenticator app
 * @param actorMemberId - ID of member performing the action (for audit)
 * @returns Verification result
 */
export async function completeEnrollment(
  userAccountId: string,
  code: string,
  actorMemberId?: string
): Promise<VerificationResult> {
  const userAccount = await prisma.userAccount.findUnique({
    where: { id: userAccountId },
    select: {
      twoFactorSecret: true,
      twoFactorEnabled: true,
      memberId: true,
      email: true,
    },
  });

  if (!userAccount) {
    return { success: false, error: "User account not found" };
  }

  if (userAccount.twoFactorEnabled) {
    return { success: false, error: "2FA is already enabled" };
  }

  if (!userAccount.twoFactorSecret) {
    return { success: false, error: "2FA enrollment not started" };
  }

  // Verify the code
  if (!verifyTotpCode(userAccount.twoFactorSecret, code)) {
    return { success: false, error: "Invalid verification code" };
  }

  // Enable 2FA
  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.userAccount.update({
      where: { id: userAccountId },
      data: {
        twoFactorEnabled: true,
        twoFactorEnrolledAt: now,
        twoFactorVerifiedAt: now,
      },
    });

    // Audit log
    await tx.auditLog.create({
      data: {
        action: AuditAction.TWO_FACTOR_ENROLLED,
        resourceType: "UserAccount",
        resourceId: userAccountId,
        memberId: actorMemberId ?? userAccount.memberId,
        before: Prisma.JsonNull,
        after: {
          twoFactorEnabled: true,
          enrolledAt: now.toISOString(),
        },
        metadata: {
          summary: `2FA enrolled for ${userAccount.email}`,
          objectType: "UserAccount",
          objectId: userAccountId,
        },
      },
    });
  });

  return { success: true };
}

// ============================================================================
// VERIFICATION
// ============================================================================

/**
 * Verify a 2FA code (TOTP or backup code).
 *
 * Tries TOTP first, then falls back to backup codes.
 *
 * @param userAccountId - The user account ID
 * @param code - TOTP code or backup code
 * @param actorMemberId - ID of member performing the action (for audit)
 * @returns Verification result
 */
export async function verify2FA(
  userAccountId: string,
  code: string,
  actorMemberId?: string
): Promise<VerificationResult> {
  const userAccount = await prisma.userAccount.findUnique({
    where: { id: userAccountId },
    select: {
      twoFactorSecret: true,
      twoFactorEnabled: true,
      twoFactorBackupCodes: true,
      memberId: true,
      email: true,
    },
  });

  if (!userAccount) {
    return { success: false, error: "User account not found" };
  }

  if (!userAccount.twoFactorEnabled || !userAccount.twoFactorSecret) {
    return { success: false, error: "2FA is not enabled" };
  }

  // Try TOTP first
  if (verifyTotpCode(userAccount.twoFactorSecret, code)) {
    // Update last verified timestamp
    await prisma.$transaction(async (tx) => {
      await tx.userAccount.update({
        where: { id: userAccountId },
        data: { twoFactorVerifiedAt: new Date() },
      });

      await tx.auditLog.create({
        data: {
          action: AuditAction.TWO_FACTOR_VERIFIED,
          resourceType: "UserAccount",
          resourceId: userAccountId,
          memberId: actorMemberId ?? userAccount.memberId,
          before: Prisma.JsonNull,
          after: { method: "totp", verifiedAt: new Date().toISOString() },
          metadata: {
            summary: `2FA verified for ${userAccount.email}`,
            method: "totp",
          },
        },
      });
    });

    return { success: true, usedBackupCode: false };
  }

  // Try backup codes
  const backupCodeIndex = verifyBackupCode(
    code,
    userAccount.twoFactorBackupCodes
  );
  if (backupCodeIndex >= 0) {
    // Remove used backup code
    const updatedBackupCodes = [...userAccount.twoFactorBackupCodes];
    updatedBackupCodes.splice(backupCodeIndex, 1);

    await prisma.$transaction(async (tx) => {
      await tx.userAccount.update({
        where: { id: userAccountId },
        data: {
          twoFactorVerifiedAt: new Date(),
          twoFactorBackupCodes: updatedBackupCodes,
        },
      });

      await tx.auditLog.create({
        data: {
          action: AuditAction.TWO_FACTOR_BACKUP_USED,
          resourceType: "UserAccount",
          resourceId: userAccountId,
          memberId: actorMemberId ?? userAccount.memberId,
          before: { backupCodesRemaining: userAccount.twoFactorBackupCodes.length },
          after: {
            backupCodesRemaining: updatedBackupCodes.length,
            verifiedAt: new Date().toISOString(),
          },
          metadata: {
            summary: `Backup code used for ${userAccount.email}`,
            codesRemaining: updatedBackupCodes.length,
          },
        },
      });
    });

    return { success: true, usedBackupCode: true };
  }

  return { success: false, error: "Invalid code" };
}

// ============================================================================
// MANAGEMENT
// ============================================================================

/**
 * Disable 2FA for a user (admin action).
 *
 * This is a privileged operation that should only be performed by admins
 * when a user has lost access to their authenticator.
 *
 * @param userAccountId - The user account ID
 * @param actorMemberId - ID of admin performing the action
 * @param reason - Reason for disabling (for audit)
 */
export async function disable2FA(
  userAccountId: string,
  actorMemberId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const userAccount = await prisma.userAccount.findUnique({
    where: { id: userAccountId },
    select: {
      twoFactorEnabled: true,
      memberId: true,
      email: true,
    },
  });

  if (!userAccount) {
    return { success: false, error: "User account not found" };
  }

  if (!userAccount.twoFactorEnabled) {
    return { success: false, error: "2FA is not enabled" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.userAccount.update({
      where: { id: userAccountId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        twoFactorBackupCodes: [],
        twoFactorVerifiedAt: null,
        // Keep twoFactorEnrolledAt for audit history
      },
    });

    await tx.auditLog.create({
      data: {
        action: AuditAction.TWO_FACTOR_DISABLED,
        resourceType: "UserAccount",
        resourceId: userAccountId,
        memberId: actorMemberId,
        before: { twoFactorEnabled: true },
        after: { twoFactorEnabled: false, reason },
        metadata: {
          summary: `2FA disabled for ${userAccount.email} by admin`,
          reason,
          targetMemberId: userAccount.memberId,
        },
      },
    });
  });

  return { success: true };
}

/**
 * Regenerate backup codes for a user.
 *
 * @param userAccountId - The user account ID
 * @param totpCode - Current TOTP code to verify identity
 * @returns New backup codes if successful
 */
export async function regenerateBackupCodes(
  userAccountId: string,
  totpCode: string
): Promise<{ success: true; backupCodes: string[] } | { success: false; error: string }> {
  const userAccount = await prisma.userAccount.findUnique({
    where: { id: userAccountId },
    select: {
      twoFactorSecret: true,
      twoFactorEnabled: true,
    },
  });

  if (!userAccount || !userAccount.twoFactorEnabled || !userAccount.twoFactorSecret) {
    return { success: false, error: "2FA is not enabled" };
  }

  // Verify current TOTP code
  if (!verifyTotpCode(userAccount.twoFactorSecret, totpCode)) {
    return { success: false, error: "Invalid verification code" };
  }

  // Generate new backup codes
  const { plainCodes, hashedCodes } = generateBackupCodes();

  await prisma.userAccount.update({
    where: { id: userAccountId },
    data: { twoFactorBackupCodes: hashedCodes },
  });

  return { success: true, backupCodes: plainCodes };
}

// ============================================================================
// STATUS & QUERIES
// ============================================================================

/**
 * Get 2FA status for a user.
 *
 * @param userAccountId - The user account ID
 * @param role - User's global role (for enforcement check)
 * @returns 2FA status
 */
export async function get2FAStatus(
  userAccountId: string,
  role: GlobalRole
): Promise<TwoFactorStatus | null> {
  const userAccount = await prisma.userAccount.findUnique({
    where: { id: userAccountId },
    select: {
      twoFactorEnabled: true,
      twoFactorEnrolledAt: true,
      twoFactorVerifiedAt: true,
      twoFactorBackupCodes: true,
    },
  });

  if (!userAccount) return null;

  return {
    enabled: userAccount.twoFactorEnabled,
    enrolledAt: userAccount.twoFactorEnrolledAt,
    lastVerifiedAt: userAccount.twoFactorVerifiedAt,
    backupCodesRemaining: userAccount.twoFactorBackupCodes.length,
    enforcementStatus: check2FAEnforcement(
      role,
      userAccount.twoFactorEnabled,
      userAccount.twoFactorVerifiedAt
    ),
  };
}

/**
 * Get 2FA compliance report for admin dashboard.
 *
 * Lists all users who require 2FA and their compliance status.
 */
export async function get2FAComplianceReport(): Promise<{
  compliant: { memberId: string; email: string; enrolledAt: Date }[];
  nonCompliant: { memberId: string; email: string; role: string }[];
  totalRequiring: number;
  complianceRate: number;
}> {
  // Get all user accounts with their member roles
  // Note: In production, this would need to join with role assignments
  // For now, we'll query users with 2FA status
  const accounts = await prisma.userAccount.findMany({
    where: { isActive: true },
    select: {
      id: true,
      memberId: true,
      email: true,
      twoFactorEnabled: true,
      twoFactorEnrolledAt: true,
      member: {
        select: {
          roleAssignments: {
            where: { endDate: null },
            select: { committeeRole: { select: { name: true } } },
          },
        },
      },
    },
  });

  // For simplicity, we'll consider any user with role assignments as requiring 2FA
  // In production, this would use the actual GlobalRole mapping
  const compliant: { memberId: string; email: string; enrolledAt: Date }[] = [];
  const nonCompliant: { memberId: string; email: string; role: string }[] = [];

  for (const account of accounts) {
    const hasRoles = account.member.roleAssignments.length > 0;
    if (!hasRoles) continue; // Skip regular members

    if (account.twoFactorEnabled && account.twoFactorEnrolledAt) {
      compliant.push({
        memberId: account.memberId,
        email: account.email,
        enrolledAt: account.twoFactorEnrolledAt,
      });
    } else {
      const role = account.member.roleAssignments[0]?.committeeRole?.name ?? "Officer";
      nonCompliant.push({
        memberId: account.memberId,
        email: account.email,
        role,
      });
    }
  }

  const totalRequiring = compliant.length + nonCompliant.length;
  const complianceRate = totalRequiring > 0 ? compliant.length / totalRequiring : 1;

  return {
    compliant,
    nonCompliant,
    totalRequiring,
    complianceRate,
  };
}

/**
 * Log a 2FA enforcement block (when user is blocked due to missing 2FA).
 */
export async function log2FABlock(
  userAccountId: string,
  memberId: string,
  reason: string,
  attemptedCapability?: string
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      action: AuditAction.TWO_FACTOR_REQUIRED_BLOCK,
      resourceType: "UserAccount",
      resourceId: userAccountId,
      memberId,
      before: Prisma.JsonNull,
      after: { blocked: true, reason },
      metadata: {
        summary: `Access blocked - 2FA required`,
        reason,
        attemptedCapability,
      },
    },
  });
}
