import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type EventDetailResponse = {
  event: {
    id: string;
    title: string;
    category: string | null;
    startTime: string;
  };
  registrations: Array<{
    id: string;
    memberId: string;
    memberName: string;
    status: string;
    registeredAt: string;
  }>;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Validate UUID format to avoid Prisma errors
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch event with registrations and member details
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      registrations: {
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          registeredAt: "asc",
        },
      },
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const response: EventDetailResponse = {
    event: {
      id: event.id,
      title: event.title,
      category: event.category,
      startTime: event.startTime.toISOString(),
    },
    registrations: event.registrations.map((r) => ({
      id: r.id,
      memberId: r.memberId,
      memberName: `${r.member.firstName} ${r.member.lastName}`,
      status: r.status,
      registeredAt: r.registeredAt.toISOString(),
    })),
  };

  return NextResponse.json(response);
}
