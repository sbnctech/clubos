import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";

/**
 * GET /api/v1/health
 *
 * Health check endpoint for monitoring and load balancer health probes.
 *
 * Notes:
 * - In early Preview deploys, DATABASE_URL may be unset. In that case we DO NOT
 *   attempt a DB probe and we report database status as "skipped".
 * - When DATABASE_URL is present, we attempt a lightweight DB probe placeholder
 *   (still no external services wired on Day 3).
 */
export async function GET() {
  const now = new Date().toISOString();
  const env = getEnv();

  const dbConfigured = !!(env.DATABASE_URL && env.DATABASE_URL.trim().length > 0);

  let dbStatus: "ok" | "error" | "skipped" = dbConfigured ? "ok" : "skipped";
  let dbLatencyMs: number | null = null;

  if (dbConfigured) {
    try {
      const start = Date.now();
      // TODO(Day 3): Replace with actual Prisma health check when Prisma client is wired
      // await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Date.now() - start;
      dbStatus = "ok";
    } catch {
      dbStatus = "error";
      dbLatencyMs = null;
    }
  }

  const overallStatus = dbStatus === "error" ? "degraded" : "healthy";

  const response = {
    status: overallStatus,
    timestamp: now,
    version: process.env.APP_VERSION || "0.1.0",
    checks: {
      database: {
        configured: dbConfigured,
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
    },
  };

  const httpStatus = overallStatus === "healthy" ? 200 : 503;

  return NextResponse.json(response, { status: httpStatus });
}
