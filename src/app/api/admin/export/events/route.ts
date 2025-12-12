import { NextResponse } from "next/server";
import { listEvents } from "@/lib/mockEvents";
import {
  countEventRegistrations,
  countEventWaitlisted,
} from "@/lib/mockRegistrations";

export async function GET() {
  const events = listEvents();

  const headerRow = "id,title,category,startTime,registrationCount,waitlistedCount";

  const dataRows = events.map((e) => {
    const registrationCount = countEventRegistrations(e.id);
    const waitlistedCount = countEventWaitlisted(e.id);
    return `${e.id},${e.title},${e.category},${e.startTime},${registrationCount},${waitlistedCount}`;
  });

  const csv = [headerRow, ...dataRows].join("\n") + "\n";

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="events.csv"',
    },
  });
}
