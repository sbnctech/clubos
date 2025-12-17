// Copyright (c) Santa Barbara Newcomers Club
// Message Templates API - CRUD with variable support
// Charter: P2 (default deny), N8 (template safety - variables validated)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/lib/auth";
import { getAvailableTokens } from "@/lib/publishing/email";

/**
 * GET /api/v1/admin/comms/templates
 *
 * List all message templates with pagination
 */
export async function GET(request: NextRequest) {
  const auth = await requireCapability(request, "comms:manage");
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get("pageSize") || "20", 10)));
  const includeInactive = searchParams.get("includeInactive") === "true";

  const where: Record<string, unknown> = {};
  if (!includeInactive) {
    where.isActive = true;
  }

  const [items, totalItems] = await Promise.all([
    prisma.messageTemplate.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.messageTemplate.count({ where }),
  ]);

  return NextResponse.json({
    items,
    page,
    pageSize,
    totalItems,
    totalPages: Math.ceil(totalItems / pageSize),
  });
}

/**
 * POST /api/v1/admin/comms/templates
 *
 * Create a new message template
 */
export async function POST(request: NextRequest) {
  const auth = await requireCapability(request, "comms:manage");
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const { name, slug, subject, bodyHtml, bodyText, tokens, providerOpts } = body;

  // Validate required fields
  if (!name || !slug || !subject || !bodyHtml) {
    return NextResponse.json(
      { error: "Missing required fields", message: "name, slug, subject, and bodyHtml are required" },
      { status: 400 }
    );
  }

  // Validate slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json(
      { error: "Invalid slug", message: "Slug must contain only lowercase letters, numbers, and hyphens" },
      { status: 400 }
    );
  }

  // Check for duplicate slug
  const existing = await prisma.messageTemplate.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json(
      { error: "Duplicate slug", message: "A template with this slug already exists" },
      { status: 409 }
    );
  }

  const template = await prisma.messageTemplate.create({
    data: {
      name,
      slug,
      subject,
      bodyHtml,
      bodyText: bodyText || null,
      tokens: tokens || getAvailableTokens(),
      providerOpts: providerOpts || null,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: "CREATE",
      resourceType: "message_template",
      resourceId: template.id,
      memberId: auth.context.memberId === "e2e-admin" ? null : auth.context.memberId,
      after: { name, slug, subject } as Record<string, unknown>,
    },
  });

  return NextResponse.json(template, { status: 201 });
}
