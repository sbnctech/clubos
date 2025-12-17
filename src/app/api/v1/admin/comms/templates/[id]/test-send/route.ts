// Copyright (c) Santa Barbara Newcomers Club
// Template Test Send API - sends test email to specified address
// Charter: P1 (provable identity), P2 (capability check), N8 (preview before commit)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/lib/auth";
import { replaceTokens, getEmailProvider, type TokenContext } from "@/lib/publishing/email";
import { canUseIdentity } from "../../identities/route";

type RouteParams = { params: Promise<{ id: string }> };

// Sample data for test send
const SAMPLE_CONTEXT: TokenContext = {
  member: {
    id: "test-member-id",
    firstName: "Test",
    lastName: "Recipient",
    email: "test@example.com",
    phone: "(805) 555-0000",
  },
  event: {
    id: "test-event-id",
    title: "Sample Event",
    description: "This is a test email preview.",
    location: "Test Location",
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
    category: "Test",
  },
};

/**
 * POST /api/v1/admin/comms/templates/:id/test-send
 *
 * Send a test email using this template
 *
 * Body:
 * - to: Email address to send test to (required)
 * - identityId: Email identity to send from (required)
 * - context: Custom TokenContext (optional)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  // Require comms:send capability for test sends
  const auth = await requireCapability(request, "comms:send");
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

  const body = await request.json();
  const { to, identityId, context: customContext } = body;

  // Validate required fields
  if (!to || !identityId) {
    return NextResponse.json(
      { error: "Missing required fields", message: "to and identityId are required" },
      { status: 400 }
    );
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json(
      { error: "Invalid email", message: "Invalid recipient email address" },
      { status: 400 }
    );
  }

  // Get and validate identity
  const identity = await prisma.emailIdentity.findUnique({
    where: { id: identityId },
  });

  if (!identity || !identity.isActive) {
    return NextResponse.json(
      { error: "Invalid identity", message: "Email identity not found or inactive" },
      { status: 400 }
    );
  }

  // Check if user can use this identity
  if (!canUseIdentity(auth.context.globalRole, identity.allowedRoles as string[])) {
    return NextResponse.json(
      { error: "Access denied", message: "You are not authorized to send from this identity" },
      { status: 403 }
    );
  }

  // Build context
  const context: TokenContext = {
    ...SAMPLE_CONTEXT,
    ...customContext,
    member: {
      ...SAMPLE_CONTEXT.member!,
      email: to,
      ...(customContext?.member || {}),
    },
  };

  // Render template
  const renderedSubject = `[TEST] ${replaceTokens(template.subject, context)}`;
  const renderedHtml = replaceTokens(template.bodyHtml, context);
  const renderedText = template.bodyText ? replaceTokens(template.bodyText, context) : undefined;

  // Send via provider
  const provider = getEmailProvider();
  const result = await provider.send({
    to,
    subject: renderedSubject,
    html: renderedHtml,
    text: renderedText,
    from: `${identity.displayName} <${identity.email}>`,
    replyTo: identity.replyTo || undefined,
  });

  if (!result.success) {
    return NextResponse.json(
      { error: "Send failed", message: result.error || "Failed to send test email" },
      { status: 500 }
    );
  }

  // Log the test send in outbox
  await prisma.emailOutbox.create({
    data: {
      identityId: identity.id,
      recipientEmail: to,
      subject: renderedSubject,
      bodyHtml: renderedHtml,
      bodyText: renderedText || null,
      templateId: template.id,
      templateData: context as unknown as Record<string, unknown>,
      status: "SENT",
      sentAt: new Date(),
      providerMsgId: result.messageId,
      createdById: auth.context.memberId === "e2e-admin" ? null : auth.context.memberId,
    },
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: "SEND",
      resourceType: "message_template",
      resourceId: template.id,
      memberId: auth.context.memberId === "e2e-admin" ? null : auth.context.memberId,
      metadata: {
        type: "test_send",
        to,
        identityId,
        messageId: result.messageId,
      },
    },
  });

  return NextResponse.json({
    success: true,
    messageId: result.messageId,
    to,
    subject: renderedSubject,
  });
}
