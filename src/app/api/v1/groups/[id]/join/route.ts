/**
 * Join Activity Group API
 * POST /api/v1/groups/:id/join - Join an approved group
 *
 * Charter: P2 (groups:join capability), P1 (audit), P3 (state machine)
 *
 * Copyright (c) Murmurant, Inc.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireCapability } from "@/lib/auth";
import { errors } from "@/lib/api";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/v1/groups/:id/join
 * Join an approved activity group (any member with groups:join)
 *
 * Side effects:
 * - Creates ActivityGroupMember record with role MEMBER
 * - Audit logged
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireCapability(request, "groups:join");
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

    if (group.status !== "APPROVED") {
      return errors.validation(
        `Cannot join group with status: ${group.status}. Only APPROVED groups can be joined.`
      );
    }

    // Check if already a member
    const existingMembership = await prisma.activityGroupMember.findFirst({
      where: {
        groupId: id,
        memberId: auth.context.memberId,
        leftAt: null,
      },
    });

    if (existingMembership) {
      return errors.conflict("You are already a member of this group");
    }

    // Join the group
    const membership = await prisma.activityGroupMember.create({
      data: {
        groupId: id,
        memberId: auth.context.memberId,
        role: "MEMBER",
        joinedAt: new Date(),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "GROUP_JOIN",
        resourceType: "ActivityGroup",
        resourceId: id,
        memberId: auth.context.memberId,
        after: { groupId: id, role: "MEMBER" },
      },
    });

    return NextResponse.json({
      membershipId: membership.id,
      groupId: id,
      groupName: group.name,
      role: membership.role,
      joinedAt: membership.joinedAt.toISOString(),
      message: `You have joined ${group.name}`,
    });
  } catch (error) {
    console.error("Error joining group:", error);
    return errors.internal("Failed to join group");
  }
}
