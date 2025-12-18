#!/usr/bin/env npx tsx
/**
 * Wild Apricot Health Check Script
 *
 * Verifies API connectivity and credentials without making changes.
 * Run with: npx tsx scripts/importing/wa_health_check.ts
 *
 * Environment variables:
 *   WA_API_KEY    - Required: Wild Apricot API key
 *   WA_ACCOUNT_ID - Required: Wild Apricot account ID
 */

import { createWAClient } from "@/lib/importing/wildapricot";

async function main(): Promise<void> {
  console.log("");
  console.log("=".repeat(60));
  console.log("  Wild Apricot Health Check");
  console.log("=".repeat(60));
  console.log("");

  // Check for required environment variables
  if (!process.env.WA_API_KEY) {
    console.error("[FAIL] WA_API_KEY environment variable is required");
    process.exit(1);
  }
  console.log("[OK] WA_API_KEY is set");

  if (!process.env.WA_ACCOUNT_ID) {
    console.error("[FAIL] WA_ACCOUNT_ID environment variable is required");
    process.exit(1);
  }
  console.log(`[OK] WA_ACCOUNT_ID is set (${process.env.WA_ACCOUNT_ID})`);

  // Test API connectivity
  console.log("");
  console.log("Testing API connectivity...");

  const client = createWAClient();
  const result = await client.healthCheck();

  if (result.ok) {
    console.log("[OK] WA API is reachable");
    console.log("[OK] Token obtained successfully");
    console.log(`[OK] Account ID verified: ${result.accountId}`);
    console.log("");
    console.log("=".repeat(60));
    console.log("  Health check PASSED");
    console.log("=".repeat(60));
    console.log("");
    process.exit(0);
  } else {
    console.error(`[FAIL] API health check failed: ${result.error}`);
    console.log("");
    console.log("=".repeat(60));
    console.log("  Health check FAILED");
    console.log("=".repeat(60));
    console.log("");
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(2);
});
