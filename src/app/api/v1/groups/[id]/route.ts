/**
 * Activity Group Detail API
 * GET /api/v1/groups/:id - Get group details
 * PATCH /api/v1/groups/:id - Update group (coordinator or admin)
 *
 * Charter: P2 (scoped access), P1 (audit for mutations)
 *
 * Copyright (c) Murmurant, Inc.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, hasCapability } from "@/lib/auth";
import { errors } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { canViewGroup, canManageGroup } from "@/lib/groups";

interface GroupDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  schedule: string | null;
  imageEmoji: string | null;
  status: string;
  isPublic: boolean;
  memberCount: number;
  coordinator: {
    id: string;
    name: string;
  } | null;
  proposedAt: string;
  proposedBy: {
    id: string;
    name: string;
  };
  approvedAt: string | null;
  canEdit: boolean;
}

/**
 * GET /api/v1/groups/:id
 * Get group details (visibility depends on status and membership)
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
    // Check if user can view this group
    if (!(await canViewGroup(auth.context, id))) {
      return errors.forbidden("Not authorized to view this group");
    }

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
        members: {
          where: { leftAt: null },
          select: {
            id: true,
            role: true,
            member: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!group) {
      return errors.notFound("ActivityGroup", id);
    }

    const coordinator = group.members.find(
      (m: { role: string }) => m.role === "COORDINATOR"
    );
    const canEdit = await canManageGroup(auth.context, id);

    const result: GroupDetail = {
      id: group.id,
      name: group.name,
      slug: group.slug,
      description: group.description,
      category: group.category,
      schedule: group.schedule,
      imageEmoji: group.imageEmoji,
      status: group.status,
      isPublic: group.isPublic,
      memberCount: group.members.length,
      coordinator: coordinator
        ? {
            id: coordinator.member.id,
            name: `${coordinator.member.firstName} ${coordinator.member.lastName}`,
          }
        : null,
      proposedAt: group.proposedAt.toISOString(),
      proposedBy: {
        id: group.proposedBy.id,
        name: `${group.proposedBy.firstName} ${group.proposedBy.lastName}`,
      },
      approvedAt: group.approvedAt?.toISOString() || null,
      canEdit,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching group:", error);
    return errors.internal("Failed to fetch group");
  }
}

/**
 * PATCH /api/v1/groups/:id
 * Update group details (coordinator or admin only)
 * Body: { name?, description?, category?, schedule?, imageEmoji?, isPublic? }
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
      return errors.forbidden("Not authorized to edit this group");
    }

    const group = await prisma.activityGroup.findUnique({
      where: { id },
    });

    if (!group) {
      return errors.notFound("ActivityGroup", id);
    }

    // Only approved groups can be edited (not proposed/rejected/deactivated)
    if (group.status !== "APPROVED") {
      return errors.validation(
        "Only approved groups can be edited. Status: " + group.status
      );
    }

    const body = await request.json();
    const { name, description, category, schedule, imageEmoji, isPublic } =
      body;

    // Build update data
    const updateData: {
      name?: string;
      description?: string;
      category?: string | null;
      schedule?: string | null;
      imageEmoji?: string | null;
      isPublic?: boolean;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (schedule !== undefined) updateData.schedule = schedule;
    if (imageEmoji !== undefined) updateData.imageEmoji = imageEmoji;
    if (isPublic !== undefined) {
      // Only admin can change public/private status
      if (!hasCapability(auth.context.globalRole, "admin:full")) {
        return errors.forbidden("Only admins can change group visibility");
      }
      updateData.isPublic = isPublic;
    }

    const before = {
      name: group.name,
      description: group.description,
      category: group.category,
      schedule: group.schedule,
      imageEmoji: group.imageEmoji,
      isPublic: group.isPublic,
    };

    const updated = await prisma.activityGroup.update({
      where: { id },
      data: updateData,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        resourceType: "ActivityGroup",
        resourceId: id,
        memberId: auth.context.memberId,
        before,
        after: updateData,
      },
    });

    return NextResponse.json({
      id: updated.id,
      name: updated.name,
      slug: updated.slug,
      description: updated.description,
      category: updated.category,
      schedule: updated.schedule,
      imageEmoji: updated.imageEmoji,
      isPublic: updated.isPublic,
      message: "Group updated successfully",
    });
  } catch (error) {
    console.error("Error updating group:", error);
    return errors.internal("Failed to update group");
  }
}
