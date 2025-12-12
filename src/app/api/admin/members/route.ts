import { NextRequest, NextResponse } from "next/server";
import { getActiveMembers } from "@/lib/mockMembers";
import {
  countMemberRegistrations,
  countMemberWaitlisted,
} from "@/lib/mockRegistrations";

type AdminMemberListItem = {
  id: string;
  name: string;
  email: string;
  status: string;
  phone: string;
  joinedAt: string;
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

  const activeMembers = getActiveMembers();

  const allMembers: AdminMemberListItem[] = activeMembers.map((m) => ({
    id: m.id,
    name: `${m.firstName} ${m.lastName}`,
    email: m.email,
    status: m.status,
    phone: m.phone,
    joinedAt: m.joinedAt,
    registrationCount: countMemberRegistrations(m.id),
    waitlistedCount: countMemberWaitlisted(m.id),
  }));

  const totalItems = allMembers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const items = allMembers.slice(startIndex, startIndex + pageSize);

  return NextResponse.json({
    items,
    page,
    pageSize,
    totalItems,
    totalPages,
  });
}
