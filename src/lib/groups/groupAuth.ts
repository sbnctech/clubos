/**
 * Activity Group Authorization Helpers
 *
 * Charter P2: Object-scoped permissions for group coordinators
 * Charter P1: All authorization decisions are auditable
 *
 * This module provides authorization helpers for activity groups.
 * Coordinator permissions are scoped to specific groups.
 */

import { prisma } from "@/lib/prisma";
import { hasCapability, type AuthContext } from "@/lib/auth";

// Note: ActivityGroupRole will be available after prisma generate
// For now, use string literal until Prisma client is regenerated
const COORDINATOR_ROLE = "COORDINATOR";

/**
 * Check if a member is a coordinator of a specific group.
 *
 * @param memberId - The member's ID
 * @param groupId - The group's ID
 * @returns true if the member is an active coordinator of the group
 */
export async function isGroupCoordinator(
  memberId: string,
  groupId: string
): Promise<boolean> {
  const membership = await prisma.activityGroupMember.findFirst({
    where: {
      groupId,
      memberId,
      role: COORDINATOR_ROLE,
      leftAt: null, // Currently active
    },
  });
  return membership !== null;
}

/**
 * Check if a member is an active member of a specific group.
 *
 * @param memberId - The member's ID
 * @param groupId - The group's ID
 * @returns true if the member is an active member of the group
 */
export async function isGroupMember(
  memberId: string,
  groupId: string
): Promise<boolean> {
  const membership = await prisma.activityGroupMember.findFirst({
    where: {
      groupId,
      memberId,
      leftAt: null, // Currently active
    },
  });
  return membership !== null;
}

/**
 * Check if an actor can manage a specific group.
 * Management includes editing group details, managing members, etc.
 *
 * @param actor - The authenticated user context
 * @param groupId - The group's ID
 * @returns true if the actor can manage the group
 */
export async function canManageGroup(
  actor: AuthContext,
  groupId: string
): Promise<boolean> {
  // Admin can manage any group
  if (hasCapability(actor.globalRole, "admin:full")) {
    return true;
  }

  // Coordinators can manage their own groups
  if (actor.memberId && (await isGroupCoordinator(actor.memberId, groupId))) {
    return true;
  }

  return false;
}

/**
 * Check if an actor can send messages to a specific group.
 *
 * @param actor - The authenticated user context
 * @param groupId - The group's ID
 * @returns true if the actor can send messages to the group
 */
export async function canMessageGroup(
  actor: AuthContext,
  groupId: string
): Promise<boolean> {
  // Admin can message any group
  if (hasCapability(actor.globalRole, "admin:full")) {
    return true;
  }

  // Only coordinators can send group messages
  if (actor.memberId && (await isGroupCoordinator(actor.memberId, groupId))) {
    return true;
  }

  return false;
}

/**
 * Check if an actor can create events for a specific group.
 * Group events bypass the normal approval workflow.
 *
 * @param actor - The authenticated user context
 * @param groupId - The group's ID
 * @returns true if the actor can create events for the group
 */
export async function canCreateGroupEvent(
  actor: AuthContext,
  groupId: string
): Promise<boolean> {
  // Admin can create events for any group
  if (hasCapability(actor.globalRole, "admin:full")) {
    return true;
  }

  // Only coordinators can create group events
  if (actor.memberId && (await isGroupCoordinator(actor.memberId, groupId))) {
    return true;
  }

  return false;
}

/**
 * Check if an actor can approve/reject/deactivate groups.
 *
 * @param actor - The authenticated user context
 * @returns true if the actor can approve groups
 */
export function canApproveGroups(actor: AuthContext): boolean {
  return hasCapability(actor.globalRole, "groups:approve");
}

/**
 * Check if an actor can view a specific group.
 * Public groups are viewable by all authenticated users.
 * Non-public groups are viewable by members and admins.
 *
 * @param actor - The authenticated user context
 * @param groupId - The group's ID
 * @returns true if the actor can view the group
 */
export async function canViewGroup(
  actor: AuthContext,
  groupId: string
): Promise<boolean> {
  // Anyone with groups:view can see public groups
  if (!hasCapability(actor.globalRole, "groups:view")) {
    return false;
  }

  const group = await prisma.activityGroup.findUnique({
    where: { id: groupId },
    select: { isPublic: true, status: true },
  });

  if (!group) {
    return false;
  }

  // Admin can see all groups
  if (hasCapability(actor.globalRole, "admin:full")) {
    return true;
  }

  // Groups:approve can see all groups (for review)
  if (hasCapability(actor.globalRole, "groups:approve")) {
    return true;
  }

  // Public approved groups are visible to all members
  if (group.isPublic && group.status === "APPROVED") {
    return true;
  }

  // Members can see their own groups regardless of public status
  if (actor.memberId && (await isGroupMember(actor.memberId, groupId))) {
    return true;
  }

  return false;
}

/**
 * Check if an actor can create announcements for a specific group.
 *
 * @param actor - The authenticated user context
 * @param groupId - The group's ID
 * @returns true if the actor can create announcements for the group
 */
export async function canCreateAnnouncement(
  actor: AuthContext,
  groupId: string
): Promise<boolean> {
  // Only coordinators can create announcements
  return canManageGroup(actor, groupId);
}

/**
 * Require coordinator access to a group, throwing if not authorized.
 *
 * @param actor - The authenticated user context
 * @param groupId - The group's ID
 * @throws Error if not authorized
 */
export async function requireGroupCoordinator(
  actor: AuthContext,
  groupId: string
): Promise<void> {
  if (!(await canManageGroup(actor, groupId))) {
    throw new Error("Not authorized: requires group coordinator access");
  }
}

/**
 * Require group approval capability, throwing if not authorized.
 *
 * @param actor - The authenticated user context
 * @throws Error if not authorized
 */
export function requireGroupApprover(actor: AuthContext): void {
  if (!canApproveGroups(actor)) {
    throw new Error("Not authorized: requires group approval capability");
  }
}
