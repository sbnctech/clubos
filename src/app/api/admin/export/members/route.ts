import { NextResponse } from "next/server";
import { getActiveMembers } from "@/lib/mockMembers";

export async function GET() {
  const members = getActiveMembers();

  const headerRow = "id,name,email,status,joinedAt,phone";

  const dataRows = members.map((m) => {
    const name = `${m.firstName} ${m.lastName}`;
    return `${m.id},${name},${m.email},${m.status},${m.joinedAt},${m.phone}`;
  });

  const csv = [headerRow, ...dataRows].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="members.csv"',
    },
  });
}
