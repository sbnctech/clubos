// Copyright (c) Santa Barbara Newcomers Club
// Individual Email Identity API
// Charter: P1, P2, P5 (reversible actions)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/v1/admin/comms/identities/:id
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await requireCapability(request, "comms:manage");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const identity = await prisma.emailIdentity.findUnique({
    where: { id },
  });

  if (!identity) {
    return NextResponse.json(
      { error: "Not found", message: "Email identity not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(identity);
}

/**
 * PUT /api/v1/admin/comms/identities/:id
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await requireCapability(request, "admin:full");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await request.json();
  const { displayName, description, replyTo, allowedRoles, isActive, isDefault } = body;

  const existing = await prisma.emailIdentity.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { error: "Not found", message: "Email identity not found" },
      { status: 404 }
    );
  }

  // If setting as default, unset other defaults
  if (isDefault && !existing.isDefault) {
    await prisma.emailIdentity.updateMany({
      where: { isDefault: true },
      data: { isDefault: false },
    });
  }

  const updated = await prisma.emailIdentity.update({
    where: { id },
    data: {
      displayName: displayName ?? existing.displayName,
      description: description !== undefined ? description : existing.description,
      replyTo: replyTo !== undefined ? replyTo : existing.replyTo,
      allowedRoles: allowedRoles ?? existing.allowedRoles,
      isActive: isActive ?? existing.isActive,
      isDefault: isDefault ?? existing.isDefault,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      resourceType: "email_identity",
      resourceId: id,
      memberId: auth.context.memberId === "e2e-admin" ? null : auth.context.memberId,
      before: existing as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    },
  });

  return NextResponse.json(updated);
}

/**
 * DELETE /api/v1/admin/comms/identities/:id
 *
 * Soft delete - sets isActive to false
 * Charter P5: Reversible actions
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await requireCapability(request, "admin:full");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const existing = await prisma.emailIdentity.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json(
      { error: "Not found", message: "Email identity not found" },
      { status: 404 }
    );
  }

  // Soft delete - deactivate instead of hard delete
  const updated = await prisma.emailIdentity.update({
    where: { id },
    data: { isActive: false, isDefault: false },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: "DELETE",
      resourceType: "email_identity",
      resourceId: id,
      memberId: auth.context.memberId === "e2e-admin" ? null : auth.context.memberId,
      before: existing as unknown as Record<string, unknown>,
      after: updated as unknown as Record<string, unknown>,
    },
  });

  return NextResponse.json({ success: true, message: "Identity deactivated" });
}
