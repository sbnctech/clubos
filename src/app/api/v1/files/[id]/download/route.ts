import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { authorizeFileAccess, logFileAccess } from "@/lib/fileAuthorization";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const authResult = await requireAuth(req);
  const authContext = authResult.ok ? authResult.context : null;
  const accessAuth = await authorizeFileAccess(authContext, id);
  if (!accessAuth.authorized) return NextResponse.json({ error: accessAuth.status === 401 ? "Unauthorized" : "Forbidden", message: accessAuth.reason }, { status: accessAuth.status });
  const file = await prisma.file.findUnique({ where: { id }, select: { id: true, filename: true, originalName: true, storageKey: true, mimeType: true, size: true } });
  if (!file) return NextResponse.json({ error: "Not Found", message: "File not found" }, { status: 404 });
  await logFileAccess(id, accessAuth.context.memberId, "download", req);
  return new NextResponse(JSON.stringify({ message: "Storage integration pending", storageKey: file.storageKey }), {
    status: 200, headers: { "Content-Type": file.mimeType, "Content-Disposition": `attachment; filename="${file.originalName}"`, "Content-Length": file.size.toString() },
  });
}
