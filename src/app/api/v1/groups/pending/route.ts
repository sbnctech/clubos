/**
 * Pending Activity Groups API
 * GET /api/v1/groups/pending - List pending group proposals (approvers only)
 *
 * Charter: P2 (only approvers can see pending), P1 (audit visibility)
 *
 * Copyright (c) Murmurant, Inc.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireCapability } from "@/lib/auth";
import { errors } from "@/lib/api";
import { prisma } from "@/lib/prisma";

interface PendingGroup {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  schedule: string | null;
  imageEmoji: string | null;
  proposedAt: string;
  proposedBy: {
    id: string;
    name: string;
    email: string;
  };
}

// Type for Prisma query result
interface PendingGroupWithProposer {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  schedule: string | null;
  imageEmoji: string | null;
  proposedAt: Date;
  proposedBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

/**
 * GET /api/v1/groups/pending
 * List pending group proposals (only users with groups:approve capability)
 */
export async function GET(request: NextRequest) {
  const auth = await requireCapability(request, "groups:approve");
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const groups = await prisma.activityGroup.findMany({
      where: { status: "PROPOSED" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        schedule: true,
        imageEmoji: true,
        proposedAt: true,
        proposedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { proposedAt: "asc" }, // Oldest first (FIFO queue)
    });

    const result: PendingGroup[] = (
      groups as PendingGroupWithProposer[]
    ).map((g) => ({
      id: g.id,
      name: g.name,
      slug: g.slug,
      description: g.description,
      category: g.category,
      schedule: g.schedule,
      imageEmoji: g.imageEmoji,
      proposedAt: g.proposedAt.toISOString(),
      proposedBy: {
        id: g.proposedBy.id,
        name: `${g.proposedBy.firstName} ${g.proposedBy.lastName}`,
        email: g.proposedBy.email,
      },
    }));

    return NextResponse.json({
      pendingCount: result.length,
      groups: result,
    });
  } catch (error) {
    console.error("Error fetching pending groups:", error);
    return errors.internal("Failed to fetch pending groups");
  }
}
