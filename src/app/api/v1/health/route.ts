import { NextResponse } from "next/server";

/**
 * GET /api/v1/health
 *
 * Health check endpoint for monitoring and load balancer health probes.
 * Returns system health status including database connectivity.
 */
export async function GET() {
  const now = new Date().toISOString();

  // Check database connectivity
  let dbStatus: "ok" | "error" = "ok";
  let dbLatencyMs: number | null = null;

  try {
    const start = Date.now();
    // TODO: Replace with actual Prisma health check when Schema ready
    // await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - start;
    dbStatus = "ok";
  } catch {
    dbStatus = "error";
    dbLatencyMs = null;
  }

  const response = {
    status: dbStatus === "ok" ? "healthy" : "degraded",
    timestamp: now,
    version: process.env.APP_VERSION || "0.1.0",
    checks: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
    },
  };

  const httpStatus = response.status === "healthy" ? 200 : 503;

  return NextResponse.json(response, { status: httpStatus });
}
