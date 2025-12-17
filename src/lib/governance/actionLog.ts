/**
 * Leadership Action Log
 *
 * Reference: docs/governance/MENTOR_ACTION_LOG_SIGNALS.md
 *
 * Logs governance-relevant actions for leadership visibility:
 * - VP Membership program health review
 * - Board third-year membership decision support
 * - Volunteer recognition (without gamification)
 *
 * Charter Principles:
 * - P7: Observability is a product feature
 * - N5: Never let automation mutate data without audit logs
 *
 * Design: Evidence, not judgment. Milestones, not metrics.
 */

import { prisma } from "@/lib/prisma";
import { AuditAction, Prisma } from "@prisma/client";
import { AuthContext } from "@/lib/auth";

export type ActionCategory = "MEMBER" | "EVENT" | "FINANCE" | "GOVERNANCE";

export interface LogActionInput {
  /** Category for filtering (MEMBER, EVENT, etc.) */
  category: ActionCategory;
  /** Human-readable action label (e.g., "mentor assigned") */
  action: string;
  /** Human-readable summary for leadership display */
  summary: string;
  /** Type of object being acted upon */
  objectType: string;
  /** ID of the object */
  objectId: string;
  /** Human-readable label for the object */
  objectLabel?: string;
  /** State before action (human-readable) */
  beforeState?: string | null;
  /** State after action (human-readable) */
  afterState?: string | null;
  /** Additional structured metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Log a governance action to the leadership action log.
 *
 * This creates an audit log entry with human-readable metadata
 * suitable for leadership visibility dashboards.
 *
 * Usage:
 * ```typescript
 * await logAction(auth.context, {
 *   category: "MEMBER",
 *   action: "mentor assigned",
 *   summary: "Assigned Jane as mentor for Tom",
 *   objectType: "Member",
 *   objectId: newbieId,
 *   objectLabel: "Tom Chen",
 *   afterState: "Mentored by Jane Smith",
 * });
 * ```
 */
export async function logAction(
  actor: AuthContext,
  input: LogActionInput
): Promise<void> {
  const {
    category,
    action,
    summary,
    objectType,
    objectId,
    objectLabel,
    beforeState,
    afterState,
    metadata,
  } = input;

  try {
    // Map human-readable action to AuditAction enum
    const auditAction = mapToAuditAction(action);

    await prisma.auditLog.create({
      data: {
        action: auditAction,
        resourceType: objectType,
        resourceId: objectId,
        memberId: actor.memberId !== "e2e-admin" ? actor.memberId : null,
        before: beforeState ? { state: beforeState } : Prisma.JsonNull,
        after: afterState ? { state: afterState } : Prisma.JsonNull,
        metadata: {
          category,
          actionLabel: action,
          summary,
          objectType,
          objectId,
          objectLabel: objectLabel ?? null,
          actorRole: actor.globalRole,
          ...metadata,
        },
      },
    });

    // Log for observability (Charter P7)
    console.log(
      `[ACTION LOG] ${category}/${action}: ${summary} (by ${actor.email})`
    );
  } catch (error) {
    // Log but don't fail - action log failure shouldn't block operations
    console.error("[ACTION LOG] Failed to log action:", error);
  }
}

/**
 * Map human-readable action labels to AuditAction enum values.
 */
function mapToAuditAction(action: string): AuditAction {
  const mapping: Record<string, AuditAction> = {
    "mentor assigned": "MENTOR_ASSIGNED",
    "mentor attending with newbie": "MENTOR_NEWBIE_SHARED_REGISTRATION",
    "mentor accompanied newbie": "MENTOR_NEWBIE_SHARED_ATTENDANCE",
  };

  return mapping[action] ?? "UPDATE";
}

/**
 * Query action log entries for a member's leadership history.
 *
 * Returns human-readable entries suitable for display in member profiles
 * and third-year membership review.
 */
export async function getMemberActionHistory(
  memberId: string,
  options?: { limit?: number; categories?: ActionCategory[] }
): Promise<ActionLogEntry[]> {
  const { limit = 20, categories } = options ?? {};

  const logs = await prisma.auditLog.findMany({
    where: {
      OR: [
        { memberId }, // Actions performed by this member
        { resourceId: memberId }, // Actions on this member
      ],
      ...(categories && {
        metadata: {
          path: ["category"],
          string_contains: categories.join("|"),
        },
      }),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      action: true,
      metadata: true,
      createdAt: true,
    },
  });

  return logs.map((log) => {
    const meta = log.metadata as Record<string, unknown> | null;
    return {
      id: log.id,
      action: log.action,
      category: (meta?.category as ActionCategory) ?? "GOVERNANCE",
      actionLabel: (meta?.actionLabel as string) ?? log.action,
      summary: (meta?.summary as string) ?? "",
      timestamp: log.createdAt,
    };
  });
}

export interface ActionLogEntry {
  id: string;
  action: string;
  category: ActionCategory;
  actionLabel: string;
  summary: string;
  timestamp: Date;
}
