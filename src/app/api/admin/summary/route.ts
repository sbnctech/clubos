import { NextResponse } from "next/server";
import { getAdminSummary } from "@/lib/adminSummary";

export async function GET() {
  const summary = getAdminSummary();
  return NextResponse.json({ summary });
}
