import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/export/members
 *
 * Export all members as CSV.
 * Returns members ordered by lastName, firstName for deterministic output.
 */
export async function GET() {
  const members = await prisma.member.findMany({
    include: {
      membershipStatus: true,
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const headerRow = "id,name,email,status,joinedAt,phone";

  const dataRows = members.map((m) => {
    const name = `${m.firstName} ${m.lastName}`;
    const status = m.membershipStatus.code;
    const joinedAt = m.joinedAt.toISOString();
    const phone = m.phone ?? "";
    return `${m.id},${name},${m.email},${status},${joinedAt},${phone}`;
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
