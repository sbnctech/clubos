import { NextRequest, NextResponse } from "next/server";
import { listRegistrations } from "@/lib/mockRegistrations";
import { getMemberById } from "@/lib/mockMembers";
import { listEvents } from "@/lib/mockEvents";

type ActivityItem = {
  id: string;
  type: "REGISTRATION";
  memberId: string;
  memberName: string;
  eventId: string;
  eventTitle: string;
  status: string;
  registeredAt: string;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Parse pagination params with defaults
  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");
  const limitParam = searchParams.get("limit");

  let page = 1;
  let pageSize = 20;

  if (pageParam !== null) {
    const parsed = parseInt(pageParam, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      page = parsed;
    }
  }

  if (pageSizeParam !== null) {
    const parsed = parseInt(pageSizeParam, 10);
    if (!isNaN(parsed) && parsed >= 1) {
      pageSize = Math.min(parsed, 100);
    }
  }

  const allRegistrations = listRegistrations();
  const allEvents = listEvents();
  const eventById = new Map(allEvents.map((e) => [e.id, e]));

  // Build activity items from registrations
  const activity: ActivityItem[] = allRegistrations.map((r) => {
    const member = getMemberById(r.memberId);
    const event = eventById.get(r.eventId);

    return {
      id: r.id,
      type: "REGISTRATION" as const,
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

  // Legacy limit param support (for backward compatibility)
  if (limitParam !== null && pageParam === null && pageSizeParam === null) {
    const limit = parseInt(limitParam, 10);
    if (!isNaN(limit) && limit > 0) {
      return NextResponse.json({ activity: activity.slice(0, limit) });
    }
  }

  const totalItems = activity.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const items = activity.slice(startIndex, startIndex + pageSize);

  return NextResponse.json({
    activity: items,
    items,
    page,
    pageSize,
    totalItems,
    totalPages,
  });
}
