import { NextResponse } from "next/server";
import { getActiveMembers } from "@/lib/mockMembers";
import { listEvents } from "@/lib/mockEvents";
import { listRegistrations, countByStatus } from "@/lib/mockRegistrations";

// Fixed reference date for deterministic upcoming events calculation
const REFERENCE_DATE = new Date("2025-05-01T00:00:00Z");

type DashboardSummary = {
  totalMembers: number;
  activeMembers: number;
  totalEvents: number;
  upcomingEvents: number;
  totalRegistrations: number;
  waitlistedRegistrations: number;
};

export async function GET() {
  const activeMembers = getActiveMembers();
  const allEvents = listEvents();
  const allRegistrations = listRegistrations();

  // Count upcoming events (startTime >= reference date)
  const upcomingEvents = allEvents.filter((e) => {
    const eventDate = new Date(e.startTime);
    return eventDate >= REFERENCE_DATE;
  }).length;

  // Note: totalMembers equals activeMembers since current mock data
  // only contains active members. When a getAllMembers() helper is added,
  // this should be updated.
  const summary: DashboardSummary = {
    totalMembers: activeMembers.length,
    activeMembers: activeMembers.length,
    totalEvents: allEvents.length,
    upcomingEvents,
    totalRegistrations: allRegistrations.length,
    waitlistedRegistrations: countByStatus("WAITLISTED"),
  };

  return NextResponse.json({ summary });
}
