import { NextResponse } from "next/server";
import { listRegistrations } from "@/lib/mockRegistrations";
import { getMemberById } from "@/lib/mockMembers";
import { listEvents } from "@/lib/mockEvents";

export async function GET() {
  const registrations = listRegistrations();
  const allEvents = listEvents();
  const eventById = new Map(allEvents.map((e) => [e.id, e]));

  const headerRow = "id,memberId,memberName,eventId,eventTitle,status,registeredAt";

  const dataRows = registrations.map((r) => {
    const member = getMemberById(r.memberId);
    const event = eventById.get(r.eventId);

    const memberName = member
      ? `${member.firstName} ${member.lastName}`
      : "Unknown member";
    const eventTitle = event ? event.title : "Unknown event";

    return `${r.id},${r.memberId},${memberName},${r.eventId},${eventTitle},${r.status},${r.registeredAt}`;
  });

  const csv = [headerRow, ...dataRows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="registrations.csv"',
    },
  });
}
