import { NextRequest, NextResponse } from "next/server";
import { listEvents } from "@/lib/mockEvents";
import {
  countEventRegistrations,
  countEventWaitlisted,
} from "@/lib/mockRegistrations";

type AdminEventListItem = {
  id: string;
  title: string;
  category: string;
  startTime: string;
  registrationCount: number;
  waitlistedCount: number;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Parse pagination params with defaults
  const pageParam = searchParams.get("page");
  const pageSizeParam = searchParams.get("pageSize");

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

  const allEvents = listEvents();

  const events: AdminEventListItem[] = allEvents.map((e) => ({
    id: e.id,
    title: e.title,
    category: e.category,
    startTime: e.startTime,
    registrationCount: countEventRegistrations(e.id),
    waitlistedCount: countEventWaitlisted(e.id),
  }));

  const totalItems = events.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const items = events.slice(startIndex, startIndex + pageSize);

  return NextResponse.json({
    items,
    page,
    pageSize,
    totalItems,
    totalPages,
  });
}
