import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { authorizeFileUpload } from "@/lib/fileAuthorization";
import { prisma } from "@/lib/prisma";
import { FileObjectType, FileVisibility } from "@prisma/client";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.ok) return authResult.response;
  const { globalRole } = authResult.context;
  const { searchParams } = new URL(req.url);
  const objectType = searchParams.get("objectType") as FileObjectType | null;
  const objectId = searchParams.get("objectId");
  if (!objectType || !objectId) return NextResponse.json({ error: "Bad Request", message: "objectType and objectId are required" }, { status: 400 });
  const files = await prisma.file.findMany({
    where: { objectType, objectId, deletedAt: null },
    select: { id: true, filename: true, originalName: true, mimeType: true, size: true, visibility: true, uploadedById: true, createdAt: true,
      uploadedBy: { select: { id: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: "desc" },
  });
  const accessibleFiles = files.filter((f) => {
    if (globalRole === "admin") return true;
    if (f.visibility === "PUBLIC" || f.visibility === "MEMBER") return true;
    if (f.visibility === "OFFICER") return ["admin", "president", "past-president", "vp-activities", "event-chair"].includes(globalRole);
    if (f.visibility === "BOARD") return ["admin", "president"].includes(globalRole);
    return false;
  });
  return NextResponse.json({ items: accessibleFiles, count: accessibleFiles.length });
}

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.ok) return authResult.response;
  const { memberId } = authResult.context;
  let body: { objectType: FileObjectType; objectId: string; filename: string; originalName: string; mimeType: string; size: number; visibility?: FileVisibility; storageKey?: string; };
  try { body = await req.json(); } catch { return NextResponse.json({ error: "Bad Request", message: "Invalid JSON body" }, { status: 400 }); }
  const { objectType, objectId, filename, originalName, mimeType, size, visibility } = body;
  if (!objectType || !objectId || !filename || !originalName || !mimeType || size === undefined) return NextResponse.json({ error: "Bad Request", message: "Missing required fields" }, { status: 400 });
  const effectiveVisibility = visibility || "MEMBER";
  const uploadAuth = await authorizeFileUpload(authResult.context, objectType, objectId, effectiveVisibility);
  if (!uploadAuth.authorized) return NextResponse.json({ error: uploadAuth.status === 401 ? "Unauthorized" : "Forbidden", message: uploadAuth.reason }, { status: uploadAuth.status });
  const storageKey = body.storageKey || `${objectType.toLowerCase()}/${objectId}/${randomUUID()}-${filename}`;
  const file = await prisma.file.create({
    data: { objectType, objectId, filename, originalName, mimeType, size, visibility: effectiveVisibility, storageKey, uploadedById: memberId },
    select: { id: true, filename: true, originalName: true, mimeType: true, size: true, visibility: true, storageKey: true, createdAt: true },
  });
  return NextResponse.json(file, { status: 201 });
}
