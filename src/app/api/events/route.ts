import { NextResponse } from "next/server";
import { listEvents } from "@/lib/mockEvents";

export async function GET() {
  const events = listEvents();
  return NextResponse.json({ events });
}
