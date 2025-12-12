import { NextRequest, NextResponse } from "next/server";
import { listEvents } from "@/lib/mockEvents";
import { listRegistrations } from "@/lib/mockRegistrations";
import { getMemberById } from "@/lib/mockMembers";

type EventDetailResponse = {
  event: {
    id: string;
    title: string;
    category: string;
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

  const allEvents = listEvents();
  const event = allEvents.find((e) => e.id === id);

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const allRegistrations = listRegistrations();

  const eventRegistrations = allRegistrations
    .filter((r) => r.eventId === id)
    .map((r) => {
      const member = getMemberById(r.memberId);
      return {
        id: r.id,
        memberId: r.memberId,
        memberName: member
          ? `${member.firstName} ${member.lastName}`
          : r.memberId,
        status: r.status,
        registeredAt: r.registeredAt,
      };
    });

  const response: EventDetailResponse = {
    event: {
      id: event.id,
      title: event.title,
      category: event.category,
      startTime: event.startTime,
    },
    registrations: eventRegistrations,
  };

  return NextResponse.json(response);
}
