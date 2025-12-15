import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, errors } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { evaluateTicketEligibility } from "@/server/eligibility/eligibility";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: eventId } = await params;

  const authResult = await requireAuth(request);
  if (!authResult.ok) {
    return authResult.response;
  }

  const { memberId } = authResult.context;

  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        ticketTypes: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!event) {
      return errors.notFound("Event", eventId);
    }

    const ticketTypesWithEligibility = await Promise.all(
      event.ticketTypes.map(async (tt) => {
        const eligibility = await evaluateTicketEligibility({
          memberId,
          eventId,
          ticketTypeCode: tt.code,
          asOfDate: event.startTime,
        });

        return {
          id: tt.id,
          code: tt.code,
          name: tt.name,
          description: tt.description,
          price: tt.price,
          capacity: tt.capacity,
          eligibility,
        };
      })
    );

    return apiSuccess({
      eventId,
      ticketTypes: ticketTypesWithEligibility,
    });
  } catch (error) {
    console.error("Error fetching ticket types:", error);
    return errors.internal("Failed to fetch ticket types");
  }
}
