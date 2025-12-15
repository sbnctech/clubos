import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, errors } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) {
    return authResult.response;
  }

  const { memberId } = authResult.context;

  try {
    const memberships = await prisma.committeeMembership.findMany({
      where: { memberId },
      include: {
        committee: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { startDate: "desc" },
    });

    const now = new Date();

    return apiSuccess({
      memberId,
      memberships: memberships.map((m) => ({
        id: m.id,
        committeeId: m.committee.id,
        committeeName: m.committee.name,
        committeeSlug: m.committee.slug,
        role: m.role,
        startDate: m.startDate.toISOString(),
        endDate: m.endDate?.toISOString() ?? null,
        isActive: m.startDate <= now && (m.endDate === null || m.endDate >= now),
      })),
    });
  } catch (error) {
    console.error("Error fetching committee memberships:", error);
    return errors.internal("Failed to fetch committee memberships");
  }
}
