/**
 * Approve Activity Group API
 * POST /api/v1/groups/:id/approve - Approve a proposed group
 *
 * Charter: P2 (groups:approve capability), P1 (audit), P3 (state machine)
 *
 * Copyright (c) Murmurant, Inc.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireCapability } from "@/lib/auth";
import { errors } from "@/lib/api";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/v1/groups/:id/approve
 * Approve a proposed group (President/VP Activities only)
 * Body: { notes?: string }
 *
 * Side effects:
 * - Changes status from PROPOSED to APPROVED
 * - Sets approvedAt and approvedById
 * - Makes proposer the first coordinator
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireCapability(request, "groups:approve");
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;

  try {
    const group = await prisma.activityGroup.findUnique({
      where: { id },
      include: {
        proposedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!group) {
      return errors.notFound("ActivityGroup", id);
    }

    if (group.status !== "PROPOSED") {
      return errors.validation(
        `Cannot approve group with status: ${group.status}. Only PROPOSED groups can be approved.`
      );
    }

    const body = await request.json().catch(() => ({}));
    const { notes } = body;

    // Approve the group and make proposer the coordinator
    const [updated] = await prisma.$transaction([
      // Update group status
      prisma.activityGroup.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          approvedById: auth.context.memberId,
        },
      }),
      // Add proposer as coordinator
      prisma.activityGroupMember.create({
        data: {
          groupId: id,
          memberId: group.proposedById,
          role: "COORDINATOR",
          joinedAt: new Date(),
        },
      }),
      // Audit log
      prisma.auditLog.create({
        data: {
          action: "GROUP_APPROVED",
          resourceType: "ActivityGroup",
          resourceId: id,
          memberId: auth.context.memberId,
          before: { status: "PROPOSED" },
          after: { status: "APPROVED", notes },
        },
      }),
    ]);

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      status: updated.status,
      approvedAt: updated.approvedAt?.toISOString(),
      coordinator: {
        id: group.proposedBy.id,
        name: `${group.proposedBy.firstName} ${group.proposedBy.lastName}`,
      },
      message: "Group approved successfully. Proposer is now the coordinator.",
    });
  } catch (error) {
    console.error("Error approving group:", error);
    return errors.internal("Failed to approve group");
  }
}
