/**
 * 2FA Enforcement Rules
 *
 * Charter Principles:
 * - P2: Default deny, least privilege - privileged access requires 2FA
 * - P9: Security must fail closed - missing 2FA blocks access
 *
 * Defines which capabilities require mandatory 2FA and provides
 * enforcement checking functions.
 */

import { Capability, GlobalRole, hasCapability } from "@/lib/auth";

// ============================================================================
// CAPABILITIES REQUIRING 2FA
// ============================================================================

/**
 * Capabilities that require mandatory 2FA.
 *
 * These capabilities provide access to:
 * - PII (Personally Identifiable Information)
 * - Financial data
 * - Administrative functions
 * - Data exports
 */
export const CAPABILITIES_REQUIRING_2FA: Capability[] = [
  // Full admin access - highest privilege
  "admin:full",
  // PII access
  "members:view",
  "members:history",
  // Financial data
  "finance:view",
  "finance:manage",
  // Data exports (bulk PII/financial data)
  "exports:access",
  // Privilege escalation
  "users:manage",
  // Sending communications (prevents impersonation)
  "comms:send",
];

/**
 * Session duration for 2FA verification.
 * After this time, step-up auth is required for sensitive operations.
 */
export const TWO_FACTOR_SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

/**
 * Grace period for new users to enroll in 2FA before being blocked.
 * Set to 0 for immediate enforcement (recommended).
 */
export const TWO_FACTOR_ENROLLMENT_GRACE_PERIOD_MS = 0;

// ============================================================================
// ENFORCEMENT CHECKING
// ============================================================================

/**
 * Check if a role requires 2FA enrollment.
 *
 * A role requires 2FA if it has ANY capability that requires 2FA.
 *
 * @param role - The user's global role
 * @returns true if the role requires 2FA
 */
export function roleRequires2FA(role: GlobalRole): boolean {
  return CAPABILITIES_REQUIRING_2FA.some((cap) => hasCapability(role, cap));
}

/**
 * Check if a specific capability requires 2FA.
 *
 * @param capability - The capability being checked
 * @returns true if the capability requires 2FA
 */
export function capabilityRequires2FA(capability: Capability): boolean {
  return CAPABILITIES_REQUIRING_2FA.includes(capability);
}

/**
 * Get all capabilities that a role has which require 2FA.
 *
 * Useful for showing users why they need 2FA.
 *
 * @param role - The user's global role
 * @returns Array of capabilities that require 2FA
 */
export function getRequiring2FACapabilities(role: GlobalRole): Capability[] {
  return CAPABILITIES_REQUIRING_2FA.filter((cap) => hasCapability(role, cap));
}

/**
 * Check if 2FA verification is still valid (within session duration).
 *
 * @param lastVerifiedAt - Timestamp of last successful 2FA verification
 * @returns true if verification is still valid
 */
export function is2FASessionValid(lastVerifiedAt: Date | null): boolean {
  if (!lastVerifiedAt) return false;

  const elapsed = Date.now() - lastVerifiedAt.getTime();
  return elapsed < TWO_FACTOR_SESSION_DURATION_MS;
}

/**
 * Result of a 2FA enforcement check.
 */
export type TwoFactorEnforcementResult =
  | { required: false }
  | {
      required: true;
      enrolled: boolean;
      verified: boolean;
      action: "enroll" | "verify" | "none";
      reason: string;
    };

/**
 * Check 2FA enforcement status for a user.
 *
 * @param role - User's global role
 * @param twoFactorEnabled - Whether user has 2FA enabled
 * @param lastVerifiedAt - Last 2FA verification timestamp
 * @returns Enforcement result with required action
 */
export function check2FAEnforcement(
  role: GlobalRole,
  twoFactorEnabled: boolean,
  lastVerifiedAt: Date | null
): TwoFactorEnforcementResult {
  // Check if role requires 2FA
  if (!roleRequires2FA(role)) {
    return { required: false };
  }

  // 2FA is required - check enrollment
  if (!twoFactorEnabled) {
    const requiringCaps = getRequiring2FACapabilities(role);
    return {
      required: true,
      enrolled: false,
      verified: false,
      action: "enroll",
      reason: `Your role (${role}) has capabilities that require 2FA: ${requiringCaps.join(", ")}`,
    };
  }

  // Enrolled - check if verification is current
  if (!is2FASessionValid(lastVerifiedAt)) {
    return {
      required: true,
      enrolled: true,
      verified: false,
      action: "verify",
      reason: "2FA verification expired. Please verify to continue.",
    };
  }

  // Enrolled and verified
  return {
    required: true,
    enrolled: true,
    verified: true,
    action: "none",
    reason: "2FA verification is current.",
  };
}

// ============================================================================
// ROLES SUMMARY (for documentation/UI)
// ============================================================================

/**
 * Get a summary of which roles require 2FA.
 *
 * Useful for admin dashboards and compliance reporting.
 */
export function get2FARequirementsSummary(): {
  role: GlobalRole;
  requires2FA: boolean;
  requiringCapabilities: Capability[];
}[] {
  const roles: GlobalRole[] = [
    "admin",
    "president",
    "past-president",
    "vp-activities",
    "event-chair",
    "webmaster",
    "member",
  ];

  return roles.map((role) => ({
    role,
    requires2FA: roleRequires2FA(role),
    requiringCapabilities: getRequiring2FACapabilities(role),
  }));
}
