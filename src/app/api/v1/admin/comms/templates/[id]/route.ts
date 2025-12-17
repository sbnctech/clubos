// Copyright (c) Santa Barbara Newcomers Club
// Individual Message Template API
// Charter: P2, P5, N8 (template safety)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/lib/auth";

type RouteParams = { params: Promise<{ id: string }> };

/**
 * GET /api/v1/admin/comms/templates/:id
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const auth = await requireCapability(request, "comms:manage");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const template = await prisma.messageTemplate.findUnique({
    where: { id },
  });

  if (!template) {
    return NextResponse.json(
      { error: "Not found", message: "Template not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(template);
}

/**
 * PUT /api/v1/admin/comms/templates/:id
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const auth = await requireCapability(request, "comms:manage");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const body = await request.json();
  const { name, subject, bodyHtml, bodyText, tokens, providerOpts, isActive } = body;

  const existing = await prisma.messageTemplate.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json(
      { error: "Not found", message: "Template not found" },
      { status: 404 }
    );
  }

  const updated = await prisma.messageTemplate.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      subject: subject ?? existing.subject,
      bodyHtml: bodyHtml ?? existing.bodyHtml,
      bodyText: bodyText !== undefined ? bodyText : existing.bodyText,
      tokens: tokens ?? existing.tokens,
      providerOpts: providerOpts !== undefined ? providerOpts : existing.providerOpts,
      isActive: isActive ?? existing.isActive,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      resourceType: "message_template",
      resourceId: id,
      memberId: auth.context.memberId === "e2e-admin" ? null : auth.context.memberId,
      before: { name: existing.name, subject: existing.subject } as Record<string, unknown>,
      after: { name: updated.name, subject: updated.subject } as Record<string, unknown>,
    },
  });

  return NextResponse.json(updated);
}

/**
 * DELETE /api/v1/admin/comms/templates/:id
 *
 * Soft delete - sets isActive to false
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const auth = await requireCapability(request, "comms:manage");
  if (!auth.ok) return auth.response;

  const { id } = await params;
  const existing = await prisma.messageTemplate.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json(
      { error: "Not found", message: "Template not found" },
      { status: 404 }
    );
  }

  const updated = await prisma.messageTemplate.update({
    where: { id },
    data: { isActive: false },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: "DELETE",
      resourceType: "message_template",
      resourceId: id,
      memberId: auth.context.memberId === "e2e-admin" ? null : auth.context.memberId,
      before: { isActive: true } as Record<string, unknown>,
      after: { isActive: false } as Record<string, unknown>,
    },
  });

  return NextResponse.json({ success: true, message: "Template deactivated" });
}
