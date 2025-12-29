/**
 * Reject Activity Group API
 * POST /api/v1/groups/:id/reject - Reject a proposed group
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
 * POST /api/v1/groups/:id/reject
 * Reject a proposed group (President/VP Activities only)
 * Body: { reason: string } - Reason is required for rejection
 *
 * Side effects:
 * - Changes status from PROPOSED to REJECTED
 * - Sets rejectedAt, rejectedById, rejectionNotes
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
    });

    if (!group) {
      return errors.notFound("ActivityGroup", id);
    }

    if (group.status !== "PROPOSED") {
      return errors.validation(
        `Cannot reject group with status: ${group.status}. Only PROPOSED groups can be rejected.`
      );
    }

    const body = await request.json();
    const { reason } = body;

    if (!reason || typeof reason !== "string" || reason.trim().length === 0) {
      return errors.validation("A reason is required when rejecting a group");
    }

    const updated = await prisma.activityGroup.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectedAt: new Date(),
        rejectedById: auth.context.memberId,
        rejectionNotes: reason.trim(),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "GROUP_REJECTED",
        resourceType: "ActivityGroup",
        resourceId: id,
        memberId: auth.context.memberId,
        before: { status: "PROPOSED" },
        after: { status: "REJECTED", reason: reason.trim() },
      },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      status: updated.status,
      rejectedAt: updated.rejectedAt?.toISOString(),
      reason: updated.rejectionNotes,
      message: "Group rejected.",
    });
  } catch (error) {
    console.error("Error rejecting group:", error);
    return errors.internal("Failed to reject group");
  }
}
