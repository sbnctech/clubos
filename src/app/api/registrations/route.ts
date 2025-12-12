import { NextResponse } from "next/server";
import { listRegistrations } from "@/lib/mockRegistrations";

export async function GET() {
  const registrations = listRegistrations();
  return NextResponse.json({ registrations });
}
