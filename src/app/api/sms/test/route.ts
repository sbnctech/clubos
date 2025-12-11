import { NextResponse } from "next/server";
import { sendSmsMock } from "@/lib/sms/mockClient";

export async function GET() {
  const { providerMessageId } = await sendSmsMock({
    to: "+15555550123",
    body: "Test SMS from ClubOS mock client",
    direction: "OUTBOUND",
  });

  return NextResponse.json({
    status: "ok",
    providerMessageId,
  });
}
