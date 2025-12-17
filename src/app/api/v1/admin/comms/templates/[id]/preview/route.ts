// Copyright (c) Santa Barbara Newcomers Club
// Template Preview API - renders template with sample or provided data
// Charter: N8 (template safety - preview before commit)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/lib/auth";
import { replaceTokens, type TokenContext } from "@/lib/publishing/email";

type RouteParams = { params: Promise<{ id: string }> };

// Sample data for preview
const SAMPLE_CONTEXT: TokenContext = {
  member: {
    id: "sample-member-id",
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@example.com",
    phone: "(805) 555-1234",
  },
  event: {
    id: "sample-event-id",
    title: "Monthly Coffee Social",
    description: "Join us for coffee and conversation at our favorite local café.",
    location: "Pierre Lafond Coffee, 516 San Ysidro Rd",
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +2 hours
    category: "Social",
  },
  club: {
    name: "Santa Barbara Newcomers Club",
    website: "https://sbnewcomers.org",
    email: "info@sbnewcomers.org",
  },
};

/**
 * POST /api/v1/admin/comms/templates/:id/preview
 *
 * Preview a template with sample or custom data
 *
 * Body (optional):
 * - context: Custom TokenContext to use instead of sample data
 * - memberId: Fetch real member data for preview
 * - eventId: Fetch real event data for preview
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
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

  let context: TokenContext = SAMPLE_CONTEXT;

  // Parse body if present
  try {
    const body = await request.json();

    // If custom context provided, use it
    if (body.context) {
      context = { ...SAMPLE_CONTEXT, ...body.context };
    }

    // If memberId provided, fetch real member data
    if (body.memberId) {
      const member = await prisma.member.findUnique({
        where: { id: body.memberId },
      });
      if (member) {
        context.member = {
          id: member.id,
          firstName: member.firstName,
          lastName: member.lastName,
          email: member.email,
          phone: member.phone,
        };
      }
    }

    // If eventId provided, fetch real event data
    if (body.eventId) {
      const event = await prisma.event.findUnique({
        where: { id: body.eventId },
      });
      if (event) {
        context.event = {
          id: event.id,
          title: event.title,
          description: event.description,
          location: event.location,
          startTime: event.startTime,
          endTime: event.endTime,
          category: event.category,
        };
      }
    }

    // Custom variables
    if (body.custom) {
      context.custom = body.custom;
    }
  } catch {
    // No body or invalid JSON - use sample data
  }

  // Render template with context
  const renderedSubject = replaceTokens(template.subject, context);
  const renderedHtml = replaceTokens(template.bodyHtml, context);
  const renderedText = template.bodyText ? replaceTokens(template.bodyText, context) : null;

  return NextResponse.json({
    template: {
      id: template.id,
      name: template.name,
      slug: template.slug,
    },
    preview: {
      subject: renderedSubject,
      html: renderedHtml,
      text: renderedText,
    },
    context: {
      member: context.member ? { firstName: context.member.firstName, lastName: context.member.lastName } : null,
      event: context.event ? { title: context.event.title } : null,
    },
  });
}
