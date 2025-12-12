import { NextRequest, NextResponse } from "next/server";
import { getMemberById } from "@/lib/mockMembers";
import { listRegistrations } from "@/lib/mockRegistrations";
import { listEvents } from "@/lib/mockEvents";

type MemberDetailResponse = {
  member: {
    id: string;
    name: string;
    email: string;
    phone: string;
    joinedAt: string;
    status: string;
  };
  registrations: Array<{
    id: string;
    eventId: string;
    eventTitle: string;
    status: string;
    registeredAt: string;
  }>;
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const member = getMemberById(id);

  if (!member) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const allRegistrations = listRegistrations();
  const allEvents = listEvents();

  const eventById = new Map(allEvents.map((e) => [e.id, e]));

  const memberRegistrations = allRegistrations
    .filter((r) => r.memberId === id)
    .map((r) => {
      const event = eventById.get(r.eventId);
      return {
        id: r.id,
        eventId: r.eventId,
        eventTitle: event ? event.title : r.eventId,
        status: r.status,
        registeredAt: r.registeredAt,
      };
    });

  const response: MemberDetailResponse = {
    member: {
      id: member.id,
      name: `${member.firstName} ${member.lastName}`,
      email: member.email,
      phone: member.phone,
      joinedAt: member.joinedAt,
      status: member.status,
    },
    registrations: memberRegistrations,
  };

  return NextResponse.json(response);
}
