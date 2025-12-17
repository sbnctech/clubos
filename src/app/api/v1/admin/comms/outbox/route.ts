// Copyright (c) Santa Barbara Newcomers Club
// Email Outbox API - track email delivery status
// Charter: P3 (state machine), P7 (observability)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/lib/auth";

/**
 * GET /api/v1/admin/comms/outbox
 *
 * List outbox items with filtering and pagination
 *
 * Query params:
 * - status: Filter by status (DRAFT, QUEUED, SENDING, SENT, DELIVERED, BOUNCED, FAILED)
 * - identityId: Filter by sender identity
 * - page, pageSize: Pagination
 */
export async function GET(request: NextRequest) {
  const auth = await requireCapability(request, "comms:manage");
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const identityId = searchParams.get("identityId");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));

  const where: Record<string, unknown> = {};
  if (status) {
    where.status = status;
  }
  if (identityId) {
    where.identityId = identityId;
  }

  const [items, totalItems] = await Promise.all([
    prisma.emailOutbox.findMany({
      where,
      include: {
        identity: {
          select: { email: true, displayName: true },
        },
        template: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.emailOutbox.count({ where }),
  ]);

  // Get status counts for dashboard
  const statusCounts = await prisma.emailOutbox.groupBy({
    by: ["status"],
    _count: true,
  });

  const counts = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count])
  );

  return NextResponse.json({
    items,
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
    statusCounts: counts,
  });
}
