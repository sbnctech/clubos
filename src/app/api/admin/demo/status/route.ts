/**
 * GET /api/admin/demo/status
 *
 * Demo system status API - returns system health indicators.
 * Requires admin:full capability.
 *
 * Response:
 * - 200: { database, email, environment, timestamp }
 * - 401: Not authenticated
 * - 403: Not authorized
 *
 * Charter: P1 (identity provable), P2 (default deny), P7 (audit trail)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireCapability } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  // Require admin:full for demo access
  const auth = await requireCapability(req, "admin:full");
  if (!auth.ok) return auth.response;

  const now = new Date();

  // Check database connectivity
  let databaseStatus: "connected" | "error" = "error";
  let databaseLatencyMs: number | null = null;
  let memberCount: number | null = null;
  let eventCount: number | null = null;

  try {
    const dbStart = Date.now();
    const counts = await prisma.$transaction([
      prisma.member.count(),
      prisma.event.count(),
    ]);
    databaseLatencyMs = Date.now() - dbStart;
    memberCount = counts[0];
    eventCount = counts[1];
    databaseStatus = "connected";
  } catch {
    databaseStatus = "error";
  }

  // Check email configuration (no secrets exposed)
  const emailEnabled = !!(
    process.env.RESEND_API_KEY || process.env.SMTP_HOST
  );
  const emailProvider = process.env.RESEND_API_KEY
    ? "resend"
    : process.env.SMTP_HOST
      ? "smtp"
      : "none";

  // Check environment
  const environment = process.env.NODE_ENV || "development";
  const isProduction = environment === "production";

  // Check passkey configuration
  const passkeyConfigured = !!(
    process.env.PASSKEY_RP_ID && process.env.PASSKEY_ORIGIN
  );

  return NextResponse.json({
    timestamp: now.toISOString(),
    database: {
      status: databaseStatus,
      latencyMs: databaseLatencyMs,
      memberCount,
      eventCount,
    },
    email: {
      enabled: emailEnabled,
      provider: emailProvider,
    },
    environment: {
      nodeEnv: environment,
      isProduction,
      passkeyConfigured,
    },
  });
}
