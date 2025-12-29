/**
 * Activity Group Members API
 * GET /api/v1/groups/:id/members - List group members
 * PATCH /api/v1/groups/:id/members - Update member role (coordinator only)
 * DELETE /api/v1/groups/:id/members - Remove member (coordinator only)
 *
 * Charter: P2 (scoped access), P1 (audit)
 *
 * Copyright (c) Murmurant, Inc.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { errors } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { canManageGroup, isGroupMember } from "@/lib/groups";

interface GroupMemberSummary {
  id: string;
  memberId: string;
  name: string;
  role: string;
  joinedAt: string;
}

// Type for Prisma query result (since Prisma client may not be generated)
interface MemberWithMember {
  id: string;
  role: string;
  joinedAt: Date;
  member: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
}

/**
 * GET /api/v1/groups/:id/members
 * List group members (members see names, coordinators see more)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;

  try {
    const group = await prisma.activityGroup.findUnique({
      where: { id },
    });

    if (!group) {
      return errors.notFound("ActivityGroup", id);
    }

    // Check if user can see members
    const isMember = await isGroupMember(auth.context.memberId, id);
    const canManage = await canManageGroup(auth.context, id);

    if (!isMember && !canManage) {
      return errors.forbidden("Not authorized to view group members");
    }

    const members = await prisma.activityGroupMember.findMany({
      where: {
        groupId: id,
        leftAt: null,
      },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: canManage, // Only coordinators see email
          },
        },
      },
      orderBy: [{ role: "asc" }, { joinedAt: "asc" }], // Coordinators first, then by join date
    });

    const result: GroupMemberSummary[] = (
      members as MemberWithMember[]
    ).map((m) => ({
      id: m.id,
      memberId: m.member.id,
      name: `${m.member.firstName} ${m.member.lastName}`,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
      ...(canManage && { email: m.member.email }),
    }));

    return NextResponse.json({
      groupId: id,
      groupName: group.name,
      memberCount: result.length,
      members: result,
      canManage,
    });
  } catch (error) {
    console.error("Error fetching group members:", error);
    return errors.internal("Failed to fetch group members");
  }
}

/**
 * PATCH /api/v1/groups/:id/members
 * Update a member's role (coordinator only)
 * Body: { memberId: string, role: "COORDINATOR" | "MEMBER" }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;

  try {
    // Check if user can manage this group
    if (!(await canManageGroup(auth.context, id))) {
      return errors.forbidden("Not authorized to manage group members");
    }

    const body = await request.json();
    const { memberId, role } = body;

    if (!memberId || !role) {
      return errors.validation("memberId and role are required");
    }

    if (!["COORDINATOR", "MEMBER"].includes(role)) {
      return errors.validation("role must be COORDINATOR or MEMBER");
    }

    // Find the membership
    const membership = await prisma.activityGroupMember.findFirst({
      where: {
        groupId: id,
        memberId,
        leftAt: null,
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!membership) {
      return errors.notFound("ActivityGroupMember", memberId);
    }

    // Prevent demoting the last coordinator
    if (membership.role === "COORDINATOR" && role === "MEMBER") {
      const coordinatorCount = await prisma.activityGroupMember.count({
        where: {
          groupId: id,
          role: "COORDINATOR",
          leftAt: null,
        },
      });

      if (coordinatorCount === 1) {
        return errors.validation(
          "Cannot demote the last coordinator. Promote another member first."
        );
      }
    }

    const oldRole = membership.role;

    await prisma.activityGroupMember.update({
      where: { id: membership.id },
      data: { role },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        resourceType: "ActivityGroupMember",
        resourceId: membership.id,
        memberId: auth.context.memberId,
        before: { role: oldRole },
        after: { role },
      },
    });

    return NextResponse.json({
      membershipId: membership.id,
      memberId,
      name: `${membership.member.firstName} ${membership.member.lastName}`,
      oldRole,
      newRole: role,
      message: `Member role updated from ${oldRole} to ${role}`,
    });
  } catch (error) {
    console.error("Error updating member role:", error);
    return errors.internal("Failed to update member role");
  }
}

/**
 * DELETE /api/v1/groups/:id/members
 * Remove a member from the group (coordinator only)
 * Body: { memberId: string, reason?: string }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;

  try {
    // Check if user can manage this group
    if (!(await canManageGroup(auth.context, id))) {
      return errors.forbidden("Not authorized to manage group members");
    }

    const body = await request.json();
    const { memberId, reason } = body;

    if (!memberId) {
      return errors.validation("memberId is required");
    }

    // Find the membership
    const membership = await prisma.activityGroupMember.findFirst({
      where: {
        groupId: id,
        memberId,
        leftAt: null,
      },
      include: {
        member: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!membership) {
      return errors.notFound("ActivityGroupMember", memberId);
    }

    // Prevent removing the last coordinator
    if (membership.role === "COORDINATOR") {
      const coordinatorCount = await prisma.activityGroupMember.count({
        where: {
          groupId: id,
          role: "COORDINATOR",
          leftAt: null,
        },
      });

      if (coordinatorCount === 1) {
        return errors.validation(
          "Cannot remove the last coordinator. Promote another member first."
        );
      }
    }

    // Prevent self-removal via this endpoint (use /leave instead)
    if (memberId === auth.context.memberId) {
      return errors.validation("Use the /leave endpoint to leave the group");
    }

    await prisma.activityGroupMember.update({
      where: { id: membership.id },
      data: { leftAt: new Date() },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "DELETE",
        resourceType: "ActivityGroupMember",
        resourceId: membership.id,
        memberId: auth.context.memberId,
        before: {
          memberId,
          name: `${membership.member.firstName} ${membership.member.lastName}`,
          role: membership.role,
        },
        after: { removed: true, reason: reason || null },
      },
    });

    return NextResponse.json({
      memberId,
      name: `${membership.member.firstName} ${membership.member.lastName}`,
      removedAt: new Date().toISOString(),
      message: "Member removed from group",
    });
  } catch (error) {
    console.error("Error removing member:", error);
    return errors.internal("Failed to remove member");
  }
}
