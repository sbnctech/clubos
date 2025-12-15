import { NextRequest, NextResponse } from "next/server";
import { requireVPOrAdmin } from "@/lib/eventAuth";

/**
 * GET /api/admin/ticket-types
 *
 * Lists all ticket types for admin view.
 * Requires VP or Admin role.
 *
 * NOTE: This is a stub endpoint. TicketType model is added in PR #78.
 * Once merged, this should query from Prisma.
 */
export async function GET(req: NextRequest) {
  // Require VP or Admin
  const auth = await requireVPOrAdmin(req);
  if (!auth.ok) return auth.response;

  // Stub: Return 501 until TicketType model is available
  // TODO: Once PR #78 is merged, implement actual query:
  // const ticketTypes = await prisma.ticketType.findMany({
  //   include: { event: { select: { id: true, title: true } } },
  //   orderBy: [{ event: { startTime: "desc" } }, { sortOrder: "asc" }],
  // });

  return NextResponse.json(
    {
      error: "Not Implemented",
      message: "TicketType model not yet available. Pending PR #78 merge.",
      ticketTypes: [],
    },
    { status: 501 }
  );
}
