import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthContext, GlobalRole, hasCapability } from "@/lib/auth";
import { FileVisibility, FileAccessType } from "@prisma/client";

/**
 * File Authorization Utilities
 *
 * Charter P2: Default-deny, object-scoped authorization
 * Charter P7: Observability - all file access is logged
 * Charter P9: Fail closed - missing auth = 401
 *
 * Visibility Hierarchy (most to least restrictive):
 * - BOARD: Only board members (president, vp-activities, past-president, admin)
 * - OFFICER: Officers and above (includes event-chair)
 * - MEMBER: All authenticated members
 * - PUBLIC: No auth required
 */

// Canonical auth result type for file operations
export type FileAuthResult =
  | { authorized: true; context: FileAuthContext }
  | { authorized: false; reason: string; status: 401 | 403 };

export type FileAuthContext = AuthContext & {
  fileId?: string;
  visibility?: FileVisibility;
};

/**
 * Check if a role can access a given visibility level.
 */
export function canAccessVisibility(
  role: GlobalRole,
  visibility: FileVisibility
): boolean {
  // PUBLIC is accessible to everyone
  if (visibility === "PUBLIC") {
    return true;
  }

  // Admin has full access
  if (hasCapability(role, "admin:full")) {
    return true;
  }

  // Board-level roles can access everything
  const boardRoles: GlobalRole[] = ["president", "past-president", "vp-activities"];
  if (boardRoles.includes(role)) {
    return true;
  }

  // BOARD visibility requires board-level role (handled above)
  if (visibility === "BOARD") {
    return false;
  }

  // Officer-level roles can access OFFICER and below
  const officerRoles: GlobalRole[] = ["event-chair"];
  if (officerRoles.includes(role)) {
    return true; // OFFICER, MEMBER, or PUBLIC
  }

  // OFFICER visibility requires officer-level role (handled above)
  if (visibility === "OFFICER") {
    return false;
  }

  // MEMBER visibility requires any authenticated role
  if (visibility === "MEMBER") {
    return role === "member" || role === "webmaster";
  }

  return false;
}

/**
 * Authorize access to list files.
 */
export async function authorizeFileList(
  req: NextRequest
): Promise<FileAuthResult> {
  const authResult = await requireAuth(req);

  if (!authResult.ok) {
    return {
      authorized: false,
      reason: "Missing or invalid authentication",
      status: 401,
    };
  }

  return {
    authorized: true,
    context: authResult.context,
  };
}

/**
 * Authorize access to a specific file.
 */
export async function authorizeFileAccess(
  req: NextRequest,
  fileId: string
): Promise<FileAuthResult> {
  const file = await prisma.file.findUnique({
    where: { id: fileId, deletedAt: null },
    select: { id: true, visibility: true },
  });

  if (!file) {
    return {
      authorized: false,
      reason: "File not found",
      status: 403,
    };
  }

  if (file.visibility === "PUBLIC") {
    return {
      authorized: true,
      context: {
        memberId: "anonymous",
        email: "",
        globalRole: "member",
        fileId,
        visibility: file.visibility,
      },
    };
  }

  const authResult = await requireAuth(req);

  if (!authResult.ok) {
    return {
      authorized: false,
      reason: "Authentication required",
      status: 401,
    };
  }

  if (!canAccessVisibility(authResult.context.globalRole, file.visibility)) {
    return {
      authorized: false,
      reason: "Insufficient permissions for this file",
      status: 403,
    };
  }

  return {
    authorized: true,
    context: {
      ...authResult.context,
      fileId,
      visibility: file.visibility,
    },
  };
}

/**
 * Log file access for audit trail.
 */
export async function logFileAccess(
  fileId: string,
  accessedById: string | null,
  accessType: FileAccessType,
  req: NextRequest,
  expiresAt?: Date
): Promise<void> {
  await prisma.fileAccessLog.create({
    data: {
      fileId,
      accessedById,
      accessType,
      ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip"),
      userAgent: req.headers.get("user-agent"),
      expiresAt,
    },
  });
}

/**
 * Get visibility filter for Prisma queries based on role.
 */
export function getVisibilityFilter(role: GlobalRole): { visibility: { in: FileVisibility[] } } {
  const visibilities: FileVisibility[] = [];

  visibilities.push("PUBLIC");
  visibilities.push("MEMBER");

  const officerAndAbove: GlobalRole[] = [
    "admin", "president", "past-president", "vp-activities", "event-chair"
  ];
  if (officerAndAbove.includes(role)) {
    visibilities.push("OFFICER");
  }

  const boardAndAbove: GlobalRole[] = [
    "admin", "president", "past-president", "vp-activities"
  ];
  if (boardAndAbove.includes(role)) {
    visibilities.push("BOARD");
  }

  return { visibility: { in: visibilities } };
}
