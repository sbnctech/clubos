import { NextRequest, NextResponse } from "next/server";
import { getAdminSummary } from "@/lib/adminSummary";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (!auth.ok) return auth.response;

  const summary = getAdminSummary();
  return NextResponse.json({ summary });
}
