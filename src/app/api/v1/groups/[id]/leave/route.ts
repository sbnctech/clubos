/**
 * Leave Activity Group API
 * POST /api/v1/groups/:id/leave - Leave a group
 *
 * Charter: P2 (self-service), P1 (audit), P3 (state machine)
 *
 * Copyright (c) Murmurant, Inc.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { errors } from "@/lib/api";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/v1/groups/:id/leave
 * Leave a group (any authenticated member who is in the group)
 *
 * Side effects:
 * - Sets leftAt on ActivityGroupMember record
 * - Audit logged
 *
 * Note: Coordinators can leave, but the group should have at least one coordinator.
 * If the last coordinator leaves, the group may become orphaned.
 */
export async function POST(
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

    // Find active membership
    const membership = await prisma.activityGroupMember.findFirst({
      where: {
        groupId: id,
        memberId: auth.context.memberId,
        leftAt: null,
      },
    });

    if (!membership) {
      return errors.validation("You are not a member of this group");
    }

    // If coordinator, warn about orphaning the group
    if (membership.role === "COORDINATOR") {
      const otherCoordinators = await prisma.activityGroupMember.count({
        where: {
          groupId: id,
          role: "COORDINATOR",
          leftAt: null,
          NOT: { id: membership.id },
        },
      });

      if (otherCoordinators === 0) {
        // Check for body to see if they're confirming
        const body = await request.json().catch(() => ({}));
        if (!body.confirmOrphan) {
          return NextResponse.json(
            {
              warning: true,
              message:
                "You are the last coordinator. Leaving will orphan the group. Set confirmOrphan: true to proceed.",
            },
            { status: 409 }
          );
        }
      }
    }

    // Leave the group
    await prisma.activityGroupMember.update({
      where: { id: membership.id },
      data: { leftAt: new Date() },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "GROUP_LEAVE",
        resourceType: "ActivityGroup",
        resourceId: id,
        memberId: auth.context.memberId,
        before: { groupId: id, role: membership.role },
        after: { leftAt: new Date().toISOString() },
      },
    });

    return NextResponse.json({
      groupId: id,
      groupName: group.name,
      leftAt: new Date().toISOString(),
      message: `You have left ${group.name}`,
    });
  } catch (error) {
    console.error("Error leaving group:", error);
    return errors.internal("Failed to leave group");
  }
}
