import { NextResponse } from "next/server";
import { listRegistrations } from "@/lib/mockRegistrations";
import { getMemberById } from "@/lib/mockMembers";
import { listEvents } from "@/lib/mockEvents";

export async function GET() {
  const allRegistrations = listRegistrations();
  const allEvents = listEvents();
  const eventById = new Map(allEvents.map((e) => [e.id, e]));

  // Build activity items from registrations
  const activity = allRegistrations.map((r) => {
    const member = getMemberById(r.memberId);
    const event = eventById.get(r.eventId);

    return {
      id: r.id,
      type: "REGISTRATION",
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

  // Sort by registeredAt descending (most recent first)
  activity.sort((a, b) => b.registeredAt.localeCompare(a.registeredAt));

  const headerRow = "id,type,memberId,memberName,eventId,eventTitle,status,registeredAt";

  const dataRows = activity.map((a) => {
    return `${a.id},${a.type},${a.memberId},${a.memberName},${a.eventId},${a.eventTitle},${a.status},${a.registeredAt}`;
  });

  const csv = [headerRow, ...dataRows].join("\n") + "\n";

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="activity.csv"',
    },
  });
}
