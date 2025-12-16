/**
 * File Authorization Module
 * Charter: P1 (identity), P2 (default-deny), P9 (fail closed)
 */
import { NextRequest } from "next/server";
import { FileVisibility, FileObjectType } from "@prisma/client";
import { AuthContext, GlobalRole, hasCapability } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type FileAuthContext = AuthContext;
export type FileAuthResult =
  | { authorized: true; context: FileAuthContext }
  | { authorized: false; reason: string; status: 401 | 403 };

const VISIBILITY_LEVEL: Record<FileVisibility, number> = { PUBLIC: 0, MEMBER: 1, OFFICER: 2, BOARD: 3 };
const ROLE_VISIBILITY_LEVEL: Record<GlobalRole, number> = {
  member: 1, "event-chair": 2, webmaster: 1, "vp-activities": 2, "past-president": 2, president: 3, admin: 3,
};

export function canAccessVisibility(role: GlobalRole, visibility: FileVisibility): boolean {
  return ROLE_VISIBILITY_LEVEL[role] >= VISIBILITY_LEVEL[visibility];
}

export async function authorizeFileUpload(
  authContext: AuthContext, objectType: FileObjectType, objectId: string, visibility: FileVisibility
): Promise<FileAuthResult> {
  const { memberId, globalRole } = authContext;
  if (globalRole === "member" && !hasCapability(globalRole, "events:view")) {
    if (objectType === "EVENT") {
      const reg = await prisma.eventRegistration.findFirst({ where: { eventId: objectId, memberId } });
      if (!reg) return { authorized: false, reason: "Not registered for this event", status: 403 };
    } else {
      return { authorized: false, reason: "Members can only upload files to events they are registered for", status: 403 };
    }
  }
  if (!canAccessVisibility(globalRole, visibility)) {
    return { authorized: false, reason: `Cannot set visibility to ${visibility} with role ${globalRole}`, status: 403 };
  }
  switch (objectType) {
    case "BOARD_RECORD": case "MEETING":
      if (!canAccessVisibility(globalRole, "BOARD")) return { authorized: false, reason: "Only board members can upload to board records", status: 403 };
      break;
    case "TRANSITION_PLAN":
      if (!hasCapability(globalRole, "transitions:view")) return { authorized: false, reason: "Cannot upload to transition plans", status: 403 };
      break;
    case "PAGE":
      if (!hasCapability(globalRole, "publishing:manage")) return { authorized: false, reason: "Cannot upload to pages", status: 403 };
      break;
  }
  return { authorized: true, context: authContext };
}

export async function authorizeFileAccess(authContext: AuthContext | null, fileId: string): Promise<FileAuthResult> {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    select: { id: true, visibility: true, objectType: true, objectId: true, deletedAt: true },
  });
  if (!file) return { authorized: false, reason: "File not found", status: 403 };
  if (file.deletedAt) return { authorized: false, reason: "File not found", status: 403 };
  if (file.visibility === "PUBLIC") {
    return authContext 
      ? { authorized: true, context: authContext }
      : { authorized: true, context: { memberId: "anonymous", email: "anonymous@public", globalRole: "member" } };
  }
  if (!authContext) return { authorized: false, reason: "Authentication required", status: 401 };
  if (!canAccessVisibility(authContext.globalRole, file.visibility)) {
    return { authorized: false, reason: "Insufficient permissions", status: 403 };
  }
  return { authorized: true, context: authContext };
}

export async function authorizeFileDelete(authContext: AuthContext, fileId: string): Promise<FileAuthResult> {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    select: { id: true, uploadedById: true, visibility: true, deletedAt: true },
  });
  if (!file || file.deletedAt) return { authorized: false, reason: "File not found", status: 403 };
  if (file.uploadedById === authContext.memberId) return { authorized: true, context: authContext };
  if (hasCapability(authContext.globalRole, "admin:full")) return { authorized: true, context: authContext };
  return { authorized: false, reason: "Only the uploader or admin can delete files", status: 403 };
}

export async function logFileAccess(
  fileId: string, accessedById: string | null, accessType: "download" | "view" | "url_generated",
  req: NextRequest, expiresAt?: Date
): Promise<void> {
  const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
  const userAgent = req.headers.get("user-agent");
  await prisma.fileAccessLog.create({
    data: { fileId, accessedById: accessedById === "anonymous" ? null : accessedById, accessType, ipAddress, userAgent, expiresAt },
  });
}
