import { NextRequest, NextResponse } from "next/server";
import { listRegistrations } from "@/lib/mockRegistrations";
import { getMemberById } from "@/lib/mockMembers";
import { listEvents } from "@/lib/mockEvents";

type EnrichedRegistration = {
  id: string;
  memberId: string;
  memberName: string;
  eventId: string;
  eventTitle: string;
  status: string;
  registeredAt: string;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const memberIdFilter = searchParams.get("memberId");
  const eventIdFilter = searchParams.get("eventId");
  const statusFilter = searchParams.get("status");

  const allRegistrations = listRegistrations();
  const allEvents = listEvents();
  const eventById = new Map(allEvents.map((e) => [e.id, e]));

  // Filter registrations based on query parameters
  let filtered = allRegistrations;

  if (memberIdFilter) {
    filtered = filtered.filter((r) => r.memberId === memberIdFilter);
  }

  if (eventIdFilter) {
    filtered = filtered.filter((r) => r.eventId === eventIdFilter);
  }

  if (statusFilter) {
    filtered = filtered.filter((r) => r.status === statusFilter);
  }

  // Enrich with member and event names
  const registrations: EnrichedRegistration[] = filtered.map((r) => {
    const member = getMemberById(r.memberId);
    const event = eventById.get(r.eventId);

    return {
      id: r.id,
      memberId: r.memberId,
      memberName: member
        ? `${member.firstName} ${member.lastName}`
        : "Unknown member",
      eventId: r.eventId,
      eventTitle: event ? event.title : "Unknown event",
      status: r.status,
      registeredAt: r.registeredAt,
    };
  });

  return NextResponse.json({ registrations });
}
