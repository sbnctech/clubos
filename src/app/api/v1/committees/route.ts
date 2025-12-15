import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, errors } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (!authResult.ok) {
    return authResult.response;
  }

  try {
    const committees = await prisma.committee.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        isActive: true,
      },
      orderBy: { name: "asc" },
    });

    return apiSuccess({ committees });
  } catch (error) {
    console.error("Error fetching committees:", error);
    return errors.internal("Failed to fetch committees");
  }
}
