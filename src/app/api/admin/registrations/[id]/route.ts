import { NextRequest, NextResponse } from "next/server";
import { listRegistrations } from "@/lib/mockRegistrations";
import { getMemberById } from "@/lib/mockMembers";
import { listEvents } from "@/lib/mockEvents";

type RegistrationDetailResponse = {
  registration: {
    id: string;
    memberId: string;
    memberName: string;
    eventId: string;
    eventTitle: string;
    status: string;
    registeredAt: string;
  };
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const allRegistrations = listRegistrations();
  const registration = allRegistrations.find((r) => r.id === id);

  if (!registration) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const allEvents = listEvents();
  const member = getMemberById(registration.memberId);
  const event = allEvents.find((e) => e.id === registration.eventId);

  const response: RegistrationDetailResponse = {
    registration: {
      id: registration.id,
      memberId: registration.memberId,
      memberName: member
        ? `${member.firstName} ${member.lastName}`
        : "Unknown member",
      eventId: registration.eventId,
      eventTitle: event ? event.title : "Unknown event",
      status: registration.status,
      registeredAt: registration.registeredAt,
    },
  };

  return NextResponse.json(response);
}
