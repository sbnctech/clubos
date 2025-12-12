import { NextResponse } from "next/server";
import { getActiveMembers } from "@/lib/mockMembers";

export async function GET() {
  const members = getActiveMembers();
  return NextResponse.json({ members });
}
