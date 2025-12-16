import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { authorizeFileAccess, logFileAccess } from "@/lib/fileAuthorization";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const expiresInMinutes = parseInt(searchParams.get("expiresIn") || "60", 10);
  if (expiresInMinutes < 1 || expiresInMinutes > 1440) return NextResponse.json({ error: "Bad Request", message: "expiresIn must be between 1 and 1440 minutes" }, { status: 400 });
  const authResult = await requireAuth(req);
  const authContext = authResult.ok ? authResult.context : null;
  const accessAuth = await authorizeFileAccess(authContext, id);
  if (!accessAuth.authorized) return NextResponse.json({ error: accessAuth.status === 401 ? "Unauthorized" : "Forbidden", message: accessAuth.reason }, { status: accessAuth.status });
  const file = await prisma.file.findUnique({ where: { id }, select: { id: true, filename: true, storageKey: true, mimeType: true } });
  if (!file) return NextResponse.json({ error: "Not Found", message: "File not found" }, { status: 404 });
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  await logFileAccess(id, accessAuth.context.memberId, "url_generated", req, expiresAt);
  return NextResponse.json({ url: `/api/v1/files/${id}/download`, expiresAt: expiresAt.toISOString(), filename: file.filename, mimeType: file.mimeType });
}
