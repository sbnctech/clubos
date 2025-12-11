import { NextRequest, NextResponse } from "next/server";
import { emailLogStore, EmailLogEntryInput } from "../../../../../server/email-log-store";

export async function POST(req: NextRequest) {
  let body: EmailLogEntryInput = {};
  try {
    body = await req.json();
  } catch (_err) {
    body = {};
  }

  const entry = await emailLogStore.add(body);

  return NextResponse.json({
    ok: true,
    id: entry.id,
    subject: entry.subject,
  });
}

export async function GET() {
  const emails = await emailLogStore.listRecent(100);

  return NextResponse.json({
    emails,
  });
}
