// Copyright (c) Santa Barbara Newcomers Club
// Email Identities API - manages from-addresses for sbnewcomers.org
// Charter: P1 (identity provable), P2 (default deny, role-based), P4 (no hidden rules)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCapability, hasCapability, type GlobalRole } from "@/lib/auth";

/**
 * Check if a role can use a specific email identity
 * Charter P2: Role-based control of from-addresses
 */
export function canUseIdentity(role: GlobalRole, allowedRoles: string[]): boolean {
  // Admin can use any identity
  if (hasCapability(role, "admin:full")) return true;

  // Check if role is in allowed list
  return allowedRoles.includes(role);
}

/**
 * GET /api/v1/admin/comms/identities
 *
 * List all email identities. Returns only identities the user can send as
 * unless they have admin:full capability.
 */
export async function GET(request: NextRequest) {
  // Charter P1/P2: Require comms:manage capability
  const auth = await requireCapability(request, "comms:manage");
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const includeInactive = searchParams.get("includeInactive") === "true";
  const onlyUsable = searchParams.get("onlyUsable") === "true";

  const where: Record<string, unknown> = {};
  if (!includeInactive) {
    where.isActive = true;
  }

  const identities = await prisma.emailIdentity.findMany({
    where,
    orderBy: [{ isDefault: "desc" }, { displayName: "asc" }],
  });

  // Filter to only identities this user can use if requested
  const result = onlyUsable
    ? identities.filter((id) =>
        canUseIdentity(auth.context.globalRole, id.allowedRoles as string[])
      )
    : identities;

  // Add canUse flag for UI
  const itemsWithAccess = result.map((id) => ({
    ...id,
    canUse: canUseIdentity(auth.context.globalRole, id.allowedRoles as string[]),
  }));

  return NextResponse.json({ items: itemsWithAccess });
}

/**
 * POST /api/v1/admin/comms/identities
 *
 * Create a new email identity. Requires admin:full capability.
 */
export async function POST(request: NextRequest) {
  // Charter P2: Only admin can create identities
  const auth = await requireCapability(request, "admin:full");
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const { email, displayName, description, replyTo, allowedRoles, isDefault } = body;

  // Validate required fields
  if (!email || !displayName) {
    return NextResponse.json(
      { error: "Missing required fields", message: "email and displayName are required" },
      { status: 400 }
    );
  }

  // Validate email format
  if (!email.endsWith("@sbnewcomers.org")) {
    return NextResponse.json(
      { error: "Invalid email", message: "Email must be a sbnewcomers.org address" },
      { status: 400 }
    );
  }

  // If setting as default, unset other defaults
  if (isDefault) {
    await prisma.emailIdentity.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
  }

  const identity = await prisma.emailIdentity.create({
    data: {
      email,
      displayName,
      description: description || null,
      replyTo: replyTo || null,
      allowedRoles: allowedRoles || [],
      isDefault: isDefault || false,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: "CREATE",
      resourceType: "email_identity",
      resourceId: identity.id,
      memberId: auth.context.memberId === "e2e-admin" ? null : auth.context.memberId,
      after: identity as unknown as Record<string, unknown>,
    },
  });

  return NextResponse.json(identity, { status: 201 });
}
