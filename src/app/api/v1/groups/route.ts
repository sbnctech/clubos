/**
 * Activity Groups API
 * GET /api/v1/groups - List approved groups (public for members)
 * POST /api/v1/groups - Propose new group (any member)
 *
 * Charter: P2 (members can view/propose), P1 (audit for proposals), P3 (state machine)
 *
 * Copyright (c) Murmurant, Inc.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireCapability, hasCapability } from "@/lib/auth";
import { apiCreated, errors } from "@/lib/api";
import { prisma } from "@/lib/prisma";

interface GroupSummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  schedule: string | null;
  imageEmoji: string | null;
  memberCount: number;
  coordinatorName: string | null;
}

// Type for Prisma query result
interface GroupWithMembers {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  schedule: string | null;
  imageEmoji: string | null;
  members: Array<{
    role: string;
    member: {
      firstName: string;
      lastName: string;
    };
  }>;
}

/**
 * GET /api/v1/groups
 * List approved activity groups (visible to all authenticated members)
 * Query params:
 *   - category: filter by category
 *   - includePrivate: include non-public groups (admin only)
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const includePrivate =
      searchParams.get("includePrivate") === "true" &&
      hasCapability(auth.context.globalRole, "admin:full");

    // Build where clause
    const where: {
      status: "APPROVED" | "PROPOSED" | "REJECTED" | "DEACTIVATED";
      category?: string;
      isPublic?: boolean;
    } = {
      status: "APPROVED",
    };

    if (category) {
      where.category = category;
    }

    if (!includePrivate) {
      where.isPublic = true;
    }

    const groups = await prisma.activityGroup.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        schedule: true,
        imageEmoji: true,
        members: {
          where: { leftAt: null },
          select: {
            id: true,
            role: true,
            member: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const result: GroupSummary[] = (groups as GroupWithMembers[]).map((g) => {
      const coordinator = g.members.find(
        (m: { role: string }) => m.role === "COORDINATOR"
      );
      return {
        id: g.id,
        name: g.name,
        slug: g.slug,
        description: g.description,
        category: g.category,
        schedule: g.schedule,
        imageEmoji: g.imageEmoji,
        memberCount: g.members.length,
        coordinatorName: coordinator
          ? `${coordinator.member.firstName} ${coordinator.member.lastName}`
          : null,
      };
    });

    return NextResponse.json({ groups: result });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return errors.internal("Failed to fetch groups");
  }
}

/**
 * POST /api/v1/groups
 * Propose a new activity group (any member with groups:propose)
 * Body: { name, description, category?, schedule?, imageEmoji? }
 */
export async function POST(request: NextRequest) {
  const auth = await requireCapability(request, "groups:propose");
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const { name, description, category, schedule, imageEmoji } = body;

    if (!name || !description) {
      return errors.validation("Name and description are required");
    }

    // Generate slug from name
    const baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    // Check for existing slug and make unique if needed
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.activityGroup.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create the group in PROPOSED status
    const group = await prisma.activityGroup.create({
      data: {
        name,
        slug,
        description,
        category: category || null,
        schedule: schedule || null,
        imageEmoji: imageEmoji || null,
        status: "PROPOSED",
        proposedById: auth.context.memberId,
        proposedAt: new Date(),
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: "GROUP_PROPOSED",
        resourceType: "ActivityGroup",
        resourceId: group.id,
        memberId: auth.context.memberId,
        after: { name, slug, description, category, schedule, imageEmoji },
      },
    });

    return apiCreated({
      id: group.id,
      name: group.name,
      slug: group.slug,
      description: group.description,
      status: group.status,
      message: "Group proposed successfully. Awaiting approval.",
    });
  } catch (error) {
    console.error("Error proposing group:", error);
    return errors.internal("Failed to propose group");
  }
}
