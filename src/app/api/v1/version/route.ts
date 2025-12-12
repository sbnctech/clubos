import { NextResponse } from "next/server";

/**
 * GET /api/v1/version
 *
 * Returns application version information for deployment verification.
 */
export async function GET() {
  const response = {
    version: process.env.APP_VERSION || "0.1.0",
    environment: process.env.NODE_ENV || "development",
    buildTime: process.env.BUILD_TIME || null,
    gitCommit: process.env.GIT_COMMIT || null,
    apiVersion: "v1",
  };

  return NextResponse.json(response);
}
