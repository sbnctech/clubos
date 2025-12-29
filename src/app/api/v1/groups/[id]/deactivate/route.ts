/**
 * Deactivate Activity Group API
 * POST /api/v1/groups/:id/deactivate - Deactivate an approved group
 *
 * Charter: P2 (groups:approve capability), P1 (audit), P3 (state machine), P5 (reversible)
 *
 * Copyright (c) Murmurant, Inc.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireCapability } from "@/lib/auth";
import { errors } from "@/lib/api";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/v1/groups/:id/deactivate
 * Deactivate an approved group (President/VP Activities only)
 * Body: { reason: string } - Reason is required for deactivation
 *
 * Side effects:
 * - Changes status from APPROVED to DEACTIVATED
 * - Sets deactivatedAt, deactivatedById, deactivationReason
 * - Group is hidden from directory but data is preserved (P5: reversible)
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
        members: {
          where: { leftAt: null },
          select: { id: true },
        },
      },
    });

    if (!group) {
      return errors.notFound("ActivityGroup", id);
    }

    if (group.status !== "APPROVED") {
      return errors.validation(
        `Cannot deactivate group with status: ${group.status}. Only APPROVED groups can be deactivated.`
      );
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return errors.validation(
        "A reason is required when deactivating a group"
      );
    }

    const memberCount = group.members.length;

    const updated = await prisma.activityGroup.update({
      where: { id },
      data: {
        status: "DEACTIVATED",
        deactivatedAt: new Date(),
        deactivatedById: auth.context.memberId,
        deactivationReason: reason.trim(),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "GROUP_DEACTIVATED",
        resourceType: "ActivityGroup",
        resourceId: id,
        memberId: auth.context.memberId,
        before: { status: "APPROVED", memberCount },
        after: { status: "DEACTIVATED", reason: reason.trim() },
      },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      status: updated.status,
      deactivatedAt: updated.deactivatedAt?.toISOString(),
      reason: updated.deactivationReason,
      memberCount,
      message: `Group deactivated. ${memberCount} members affected.`,
    });
  } catch (error) {
    console.error("Error deactivating group:", error);
    return errors.internal("Failed to deactivate group");
  }
}
