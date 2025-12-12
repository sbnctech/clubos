import { NextRequest, NextResponse } from "next/server";
import { getActiveMembers, MockMember } from "@/lib/mockMembers";
import { listEvents, MockEvent } from "@/lib/mockEvents";
import { listRegistrations, MockRegistration } from "@/lib/mockRegistrations";

type SearchResults = {
  members: MockMember[];
  events: MockEvent[];
  registrations: Array<MockRegistration & { memberName: string; eventTitle: string }>;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (searchParams.get("q") ?? "").toLowerCase().trim();

  if (!query) {
    return NextResponse.json({
      results: {
        members: [],
        events: [],
        registrations: [],
      },
    });
  }

  const allMembers = getActiveMembers();
  const allEvents = listEvents();
  const allRegistrations = listRegistrations();

  // Build lookup maps for registration enrichment
  const memberById = new Map(allMembers.map((m) => [m.id, m]));
  const eventById = new Map(allEvents.map((e) => [e.id, e]));

  // Search members by name or email
  const matchedMembers = allMembers.filter((m) => {
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    return fullName.includes(query) || m.email.toLowerCase().includes(query);
  });

  // Search events by title
  const matchedEvents = allEvents.filter((e) =>
    e.title.toLowerCase().includes(query)
  );

  // Search registrations by member name or event title
  const matchedRegistrations = allRegistrations
    .map((r) => {
      const member = memberById.get(r.memberId);
      const event = eventById.get(r.eventId);
      const memberName = member
        ? `${member.firstName} ${member.lastName}`
        : r.memberId;
      const eventTitle = event ? event.title : r.eventId;
      return { ...r, memberName, eventTitle };
    })
    .filter((r) => {
      return (
        r.memberName.toLowerCase().includes(query) ||
        r.eventTitle.toLowerCase().includes(query)
      );
    });

  const results: SearchResults = {
    members: matchedMembers,
    events: matchedEvents,
    registrations: matchedRegistrations,
  };

  return NextResponse.json({ results });
}
