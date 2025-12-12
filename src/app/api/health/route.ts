import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let dbStatus = "ok";
  let dbError: string | undefined;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    dbStatus = "error";
    dbError = err instanceof Error ? err.message : "Unknown database error";
  }

  const status = dbStatus === "ok" ? "ok" : "degraded";

  return NextResponse.json({
    status,
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      error: dbError,
    },
  });
}
