/**
 * Tier-Aware Capability Gating
 *
 * Implements membership tier checks integrated with the capability system.
 * This enables features to be gated by both role (capability) AND membership tier.
 *
 * Charter References:
 * - P2: Default deny, fail closed - unknown tier = deny
 * - P4: No hidden rules - tier requirements are explicit
 * - P7: Audit logging for tier-gated denials
 *
 * Issue: #252 - Capability gating for tiered features
 *
 * Copyright © 2025 Murmurant, Inc.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, hasCapability, type AuthContext, type AuthResult, type Capability } from "@/lib/auth";

/**
 * Membership tier codes.
 *
 * Tiers are organization-specific classifications based on tenure or plan.
 * These represent common tier codes; organizations may define their own.
 *
 * Tier hierarchy (higher tier includes lower tier benefits):
 * PROSPECT < NEWCOMER < FIRST_YEAR < SECOND_YEAR < THIRD_YEAR_PLUS
 */
export type MembershipTierCode =
  | "PROSPECT"        // Pre-membership, limited access
  | "NEWCOMER"        // New member, basic access
  | "FIRST_YEAR"      // First year member
  | "SECOND_YEAR"     // Second year member
  | "THIRD_YEAR_PLUS" // Third year and beyond
  | "ALUMNI"          // Former member, limited access
  | "EXTENDED"        // Extended member (legacy code)
  | "LAPSED";         // Lapsed membership

/**
 * Tier hierarchy for comparison.
 * Higher number = higher tier level.
 * Unknown tiers get priority 0 (fail closed - lowest access).
 */
const TIER_PRIORITY: Record<string, number> = {
  // Non-member states (restricted access)
  PROSPECT: 1,
  LAPSED: 1,
  ALUMNI: 2,

  // Active member tiers (ascending access)
  NEWCOMER: 10,
  FIRST_YEAR: 20,
  SECOND_YEAR: 30,
  THIRD_YEAR_PLUS: 40,
  EXTENDED: 35, // Legacy code - between SECOND_YEAR and THIRD_YEAR_PLUS
};

/**
 * Get the priority level for a tier code.
 * Unknown tiers return 0 (fail closed - no access).
 *
 * @param tierCode - The tier code to look up
 * @returns Priority number (0 for unknown, higher = more access)
 */
export function getTierPriority(tierCode: string | null | undefined): number {
  if (!tierCode) return 0;
  return TIER_PRIORITY[tierCode] ?? 0;
}

/**
 * Check if a member's tier meets or exceeds the minimum required tier.
 *
 * Charter P2: Fail closed - null/unknown tier always returns false.
 *
 * @param memberTier - The member's current tier code
 * @param minTier - The minimum tier required
 * @returns true if memberTier >= minTier
 */
export function hasTier(
  memberTier: string | null | undefined,
  minTier: MembershipTierCode
): boolean {
  const memberPriority = getTierPriority(memberTier);
  const requiredPriority = getTierPriority(minTier);

  // Fail closed: if either is 0 (unknown), deny access
  if (memberPriority === 0) return false;
  if (requiredPriority === 0) return false;

  return memberPriority >= requiredPriority;
}

/**
 * Check if a tier code is a valid active member tier.
 * Non-member states (PROSPECT, LAPSED, ALUMNI) are not considered active.
 */
export function isActiveMemberTier(tierCode: string | null | undefined): boolean {
  if (!tierCode) return false;
  const priority = getTierPriority(tierCode);
  // Active member tiers have priority >= 10
  return priority >= 10;
}

/**
 * Extended auth context that includes membership tier.
 */
export interface TieredAuthContext extends AuthContext {
  /** Member's current membership tier code */
  memberTierCode: string | null;
  /** Member's tier name for display */
  memberTierName: string | null;
}

/**
 * Result type for tier-aware auth checks.
 */
export type TieredAuthResult =
  | { ok: true; context: TieredAuthContext }
  | { ok: false; response: NextResponse };

/**
 * Fetch member's tier information from the database.
 *
 * @param memberId - The member's ID
 * @returns Tier code and name, or nulls if not found
 */
async function getMemberTier(memberId: string): Promise<{
  tierCode: string | null;
  tierName: string | null;
}> {
  const { prisma } = await import("@/lib/prisma");

  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: {
      membershipTier: {
        select: {
          code: true,
          name: true,
        },
      },
      membershipStatus: {
        select: {
          code: true,
          label: true,
        },
      },
    },
  });

  // If member has explicit tier, use it
  if (member?.membershipTier) {
    return {
      tierCode: member.membershipTier.code,
      tierName: member.membershipTier.name,
    };
  }

  // Fallback: derive tier from membership status
  // This supports legacy data where tier wasn't explicitly set
  if (member?.membershipStatus) {
    return {
      tierCode: member.membershipStatus.code,
      tierName: member.membershipStatus.label,
    };
  }

  return { tierCode: null, tierName: null };
}

/**
 * Enrich auth context with tier information.
 *
 * @param context - Base auth context
 * @returns Auth context with tier info added
 */
export async function enrichAuthWithTier(
  context: AuthContext
): Promise<TieredAuthContext> {
  const { tierCode, tierName } = await getMemberTier(context.memberId);

  return {
    ...context,
    memberTierCode: tierCode,
    memberTierName: tierName,
  };
}

/**
 * Log a tier-gated denial for audit purposes.
 *
 * Charter P7: Observability - audit all access denials.
 *
 * @param context - The auth context (may be partial)
 * @param capability - The capability that was checked
 * @param requiredTier - The tier that was required
 * @param actualTier - The member's actual tier
 * @param reason - Why the denial occurred
 */
async function auditTierDenial(
  context: Partial<TieredAuthContext>,
  capability: Capability,
  requiredTier: MembershipTierCode,
  actualTier: string | null,
  reason: "insufficient_tier" | "unknown_tier" | "missing_capability"
): Promise<void> {
  // In production, this would write to an audit log table or service
  // For now, log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("[TIER_DENIAL]", {
      memberId: context.memberId ?? "unknown",
      email: context.email ?? "unknown",
      capability,
      requiredTier,
      actualTier,
      reason,
      timestamp: new Date().toISOString(),
    });
  }

  // TODO: Write to AuditLog table when billing is implemented
  // const { prisma } = await import("@/lib/prisma");
  // await prisma.auditLog.create({
  //   data: {
  //     action: "tier_gated_denial",
  //     actorId: context.memberId,
  //     details: { capability, requiredTier, actualTier, reason },
  //   },
  // });
}

/**
 * Validate the authenticated user has both the required capability AND minimum tier.
 *
 * This is the primary entrypoint for tier-gated feature access.
 *
 * Charter References:
 * - P2: Default deny, fail closed
 * - P4: No hidden rules - all requirements explicit
 * - P7: Audit logging for denials
 *
 * Usage:
 * ```typescript
 * const auth = await requireTieredCapability(req, "events:create", "FIRST_YEAR");
 * if (!auth.ok) return auth.response;
 *
 * // User has both capability AND tier
 * ```
 *
 * @param req - The incoming request
 * @param capability - The required capability
 * @param minTier - The minimum tier required
 * @returns Auth result with tiered context or error response
 */
export async function requireTieredCapability(
  req: NextRequest,
  capability: Capability,
  minTier: MembershipTierCode
): Promise<TieredAuthResult> {
  // Step 1: Authenticate
  const authResult = await requireAuth(req);
  if (!authResult.ok) {
    return authResult;
  }

  const baseContext = authResult.context;

  // Step 2: Check capability
  if (!hasCapability(baseContext.globalRole, capability)) {
    await auditTierDenial(
      baseContext,
      capability,
      minTier,
      null,
      "missing_capability"
    );

    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Access denied",
          message: `Required capability: ${capability}`,
          code: "MISSING_CAPABILITY",
        },
        { status: 403 }
      ),
    };
  }

  // Step 3: Enrich with tier info
  const tieredContext = await enrichAuthWithTier(baseContext);

  // Step 4: Check tier (fail closed)
  if (!tieredContext.memberTierCode) {
    await auditTierDenial(
      tieredContext,
      capability,
      minTier,
      null,
      "unknown_tier"
    );

    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Access denied",
          message: "Membership tier could not be determined",
          code: "UNKNOWN_TIER",
        },
        { status: 403 }
      ),
    };
  }

  // Step 5: Compare tiers
  if (!hasTier(tieredContext.memberTierCode, minTier)) {
    await auditTierDenial(
      tieredContext,
      capability,
      minTier,
      tieredContext.memberTierCode,
      "insufficient_tier"
    );

    return {
      ok: false,
      response: NextResponse.json(
        {
          error: "Access denied",
          message: `Required membership tier: ${minTier}`,
          code: "INSUFFICIENT_TIER",
          currentTier: tieredContext.memberTierCode,
          requiredTier: minTier,
        },
        { status: 403 }
      ),
    };
  }

  // Success: user has both capability and tier
  return { ok: true, context: tieredContext };
}

/**
 * Get authenticated user's tier information.
 *
 * Use this when you need tier info for display/UI but don't need
 * to enforce a minimum tier requirement.
 *
 * @param req - The incoming request
 * @returns Auth result with tier info or error response
 */
export async function getAuthWithTier(
  req: NextRequest
): Promise<TieredAuthResult> {
  const authResult = await requireAuth(req);
  if (!authResult.ok) {
    return authResult;
  }

  const tieredContext = await enrichAuthWithTier(authResult.context);
  return { ok: true, context: tieredContext };
}

/**
 * Helper to check if auth context meets a tier requirement.
 *
 * Use this after authentication when you already have the context
 * and just need to check tier for conditional rendering.
 *
 * @param context - Tiered auth context
 * @param minTier - Minimum tier required
 * @returns true if context.memberTierCode >= minTier
 */
export function contextHasTier(
  context: TieredAuthContext,
  minTier: MembershipTierCode
): boolean {
  return hasTier(context.memberTierCode, minTier);
}
