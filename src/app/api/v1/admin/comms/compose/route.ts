// Copyright (c) Santa Barbara Newcomers Club
// Email Composer API - compose and send emails
// Charter: P1 (provable identity), P2 (role-based from-address), P3 (state machine)
// Charter: N5 (idempotent via idempotencyKey), N7 (minimize PII exposure)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCapability } from "@/lib/auth";
import { replaceTokens, getEmailProvider, type TokenContext } from "@/lib/publishing/email";
import { canUseIdentity } from "../identities/route";

/**
 * POST /api/v1/admin/comms/compose
 *
 * Compose and optionally send an email
 *
 * Body:
 * - identityId: Email identity to send from (required)
 * - templateId: Template to use (optional - if not provided, use raw subject/body)
 * - subject: Subject line (required if no templateId)
 * - bodyHtml: HTML body (required if no templateId)
 * - bodyText: Plain text body (optional)
 * - recipients: Array of { email, name?, memberId?, context? }
 * - scheduledFor: ISO date string for scheduled send (optional)
 * - idempotencyKey: Client key to prevent duplicates (optional)
 * - sendImmediately: If true, send now instead of queueing (default: false)
 */
export async function POST(request: NextRequest) {
  const auth = await requireCapability(request, "comms:send");
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const {
    identityId,
    templateId,
    subject: rawSubject,
    bodyHtml: rawBodyHtml,
    bodyText: rawBodyText,
    recipients,
    scheduledFor,
    idempotencyKey,
    sendImmediately,
  } = body;

  // Validate identity
  if (!identityId) {
    return NextResponse.json(
      { error: "Missing required field", message: "identityId is required" },
      { status: 400 }
    );
  }

  const identity = await prisma.emailIdentity.findUnique({
    where: { id: identityId },
  });

  if (!identity || !identity.isActive) {
    return NextResponse.json(
      { error: "Invalid identity", message: "Email identity not found or inactive" },
      { status: 400 }
    );
  }

  // Check role-based access to identity
  if (!canUseIdentity(auth.context.globalRole, identity.allowedRoles as string[])) {
    return NextResponse.json(
      { error: "Access denied", message: "You are not authorized to send from this identity" },
      { status: 403 }
    );
  }

  // Get template if provided
  let template = null;
  if (templateId) {
    template = await prisma.messageTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) {
      return NextResponse.json(
        { error: "Invalid template", message: "Template not found" },
        { status: 400 }
      );
    }
  }

  // Validate we have subject and body from template or raw input
  const subjectTemplate = template?.subject || rawSubject;
  const bodyHtmlTemplate = template?.bodyHtml || rawBodyHtml;
  const bodyTextTemplate = template?.bodyText || rawBodyText;

  if (!subjectTemplate || !bodyHtmlTemplate) {
    return NextResponse.json(
      { error: "Missing content", message: "Either templateId or subject+bodyHtml required" },
      { status: 400 }
    );
  }

  // Validate recipients
  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    return NextResponse.json(
      { error: "Missing recipients", message: "At least one recipient is required" },
      { status: 400 }
    );
  }

  // Validate recipient format
  for (const r of recipients) {
    if (!r.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) {
      return NextResponse.json(
        { error: "Invalid recipient", message: `Invalid email: ${r.email}` },
        { status: 400 }
      );
    }
  }

  // Check idempotency
  if (idempotencyKey) {
    const existing = await prisma.emailOutbox.findUnique({
      where: { idempotencyKey },
    });
    if (existing) {
      return NextResponse.json(
        {
          success: true,
          message: "Already processed (idempotent)",
          outboxId: existing.id,
          status: existing.status,
        },
        { status: 200 }
      );
    }
  }

  // Parse scheduled time
  let scheduledDate: Date | null = null;
  if (scheduledFor) {
    scheduledDate = new Date(scheduledFor);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid date", message: "scheduledFor must be a valid ISO date" },
        { status: 400 }
      );
    }
  }

  // Create outbox entries for each recipient
  const outboxItems = [];
  const provider = getEmailProvider();
  const results: Array<{ email: string; success: boolean; messageId?: string; error?: string }> = [];

  for (const recipient of recipients) {
    // Build context for this recipient
    const context: TokenContext = {
      member: recipient.memberId
        ? await getMemberContext(recipient.memberId)
        : {
            id: "unknown",
            firstName: recipient.name?.split(" ")[0] || "Member",
            lastName: recipient.name?.split(" ").slice(1).join(" ") || "",
            email: recipient.email,
          },
      ...(recipient.context || {}),
    };

    // Render template
    const renderedSubject = replaceTokens(subjectTemplate, context);
    const renderedHtml = replaceTokens(bodyHtmlTemplate, context);
    const renderedText = bodyTextTemplate ? replaceTokens(bodyTextTemplate, context) : null;

    // Determine initial status
    const initialStatus = sendImmediately ? "SENDING" : scheduledDate ? "QUEUED" : "DRAFT";

    // Create outbox entry
    const outboxItem = await prisma.emailOutbox.create({
      data: {
        idempotencyKey: idempotencyKey ? `${idempotencyKey}-${recipient.email}` : null,
        identityId: identity.id,
        recipientEmail: recipient.email,
        recipientId: recipient.memberId || null,
        recipientName: recipient.name || null,
        subject: renderedSubject,
        bodyHtml: renderedHtml,
        bodyText: renderedText,
        templateId: template?.id || null,
        templateData: context as unknown as Record<string, unknown>,
        status: initialStatus,
        scheduledFor: scheduledDate,
        createdById: auth.context.memberId === "e2e-admin" ? null : auth.context.memberId,
      },
    });

    outboxItems.push(outboxItem);

    // Send immediately if requested
    if (sendImmediately) {
      const sendResult = await provider.send({
        to: recipient.email,
        subject: renderedSubject,
        html: renderedHtml,
        text: renderedText || undefined,
        from: `${identity.displayName} <${identity.email}>`,
        replyTo: identity.replyTo || undefined,
      });

      // Update outbox status
      await prisma.emailOutbox.update({
        where: { id: outboxItem.id },
        data: {
          status: sendResult.success ? "SENT" : "FAILED",
          sentAt: sendResult.success ? new Date() : null,
          providerMsgId: sendResult.messageId || null,
          errorMessage: sendResult.error || null,
        },
      });

      results.push({
        email: recipient.email,
        success: sendResult.success,
        messageId: sendResult.messageId,
        error: sendResult.error,
      });
    }
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: "CREATE",
      resourceType: "email_outbox",
      resourceId: outboxItems[0]?.id || "batch",
      memberId: auth.context.memberId === "e2e-admin" ? null : auth.context.memberId,
      metadata: {
        recipientCount: recipients.length,
        templateId: template?.id || null,
        identityId: identity.id,
        sendImmediately,
        scheduledFor: scheduledDate?.toISOString() || null,
      },
    },
  });

  return NextResponse.json({
    success: true,
    outboxCount: outboxItems.length,
    outboxIds: outboxItems.map((i) => i.id),
    status: sendImmediately ? "sent" : scheduledDate ? "scheduled" : "draft",
    results: sendImmediately ? results : undefined,
  });
}

/**
 * Helper to get member context
 */
async function getMemberContext(memberId: string): Promise<TokenContext["member"]> {
  const member = await prisma.member.findUnique({
    where: { id: memberId },
  });

  if (!member) {
    return {
      id: memberId,
      firstName: "Member",
      lastName: "",
      email: "unknown@example.com",
    };
  }

  return {
    id: member.id,
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email,
    phone: member.phone,
  };
}
