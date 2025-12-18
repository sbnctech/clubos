#!/usr/bin/env npx tsx
/**
 * Wild Apricot MembershipStatus Seeder
 *
 * Seeds MembershipStatus records required for WA import.
 * This script is idempotent - running it multiple times is safe.
 *
 * Run with:
 *   npx tsx scripts/importing/seed_membership_statuses.ts
 *
 * Environment variables:
 *   ALLOW_PROD_SEED - Required in production: Set to "1" to allow
 *   DRY_RUN         - Optional: Set to "1" for preview mode (no writes)
 *
 * Status codes created:
 *   - active: Currently active member
 *   - lapsed: Membership has expired
 *   - pending_new: New member pending approval/payment
 *   - pending_renewal: Renewal in progress
 *   - suspended: Membership suspended
 *   - not_a_member: Guest or non-member contact
 *   - unknown: Fallback for unmapped statuses
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Load .env manually
import { config } from "dotenv";
config();

// ============================================================================
// Safety Checks
// ============================================================================

function isProductionDatabase(): boolean {
  const dbUrl = process.env.DATABASE_URL || "";
  return (
    process.env.NODE_ENV === "production" ||
    dbUrl.includes("production") ||
    dbUrl.includes("prod.") ||
    dbUrl.includes("neon.tech") ||
    dbUrl.includes("supabase.co") ||
    (dbUrl.includes(".com") && !dbUrl.includes("localhost"))
  );
}

function validateProductionSafety(): void {
  if (isProductionDatabase() && process.env.ALLOW_PROD_SEED !== "1") {
    throw new Error(
      "Production database detected. Set ALLOW_PROD_SEED=1 to proceed."
    );
  }
}

function isDryRun(): boolean {
  return process.env.DRY_RUN === "1";
}

// ============================================================================
// Prisma Client
// ============================================================================

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({ adapter });
}

// ============================================================================
// Status Definitions
// ============================================================================

/**
 * MembershipStatus records required for WA import.
 * These codes match the output of mapContactStatusToCode() in transformers.ts.
 */
const WA_MEMBERSHIP_STATUSES = [
  {
    code: "active",
    label: "Active",
    description: "Currently active member (WA import)",
    isActive: true,
    isEligibleForRenewal: true,
    isBoardEligible: true,
    sortOrder: 10,
  },
  {
    code: "lapsed",
    label: "Lapsed",
    description: "Membership has expired (WA import)",
    isActive: false,
    isEligibleForRenewal: true,
    isBoardEligible: false,
    sortOrder: 20,
  },
  {
    code: "pending_new",
    label: "Pending New",
    description: "New member pending approval or payment (WA import)",
    isActive: false,
    isEligibleForRenewal: false,
    isBoardEligible: false,
    sortOrder: 30,
  },
  {
    code: "pending_renewal",
    label: "Pending Renewal",
    description: "Member with renewal in progress (WA import)",
    isActive: true,
    isEligibleForRenewal: false,
    isBoardEligible: false,
    sortOrder: 40,
  },
  {
    code: "suspended",
    label: "Suspended",
    description: "Membership suspended (WA import)",
    isActive: false,
    isEligibleForRenewal: false,
    isBoardEligible: false,
    sortOrder: 50,
  },
  {
    code: "not_a_member",
    label: "Not a Member",
    description: "Guest or non-member contact (WA import)",
    isActive: false,
    isEligibleForRenewal: false,
    isBoardEligible: false,
    sortOrder: 60,
  },
  {
    code: "unknown",
    label: "Unknown",
    description: "Unmapped WA status (WA import)",
    isActive: false,
    isEligibleForRenewal: false,
    isBoardEligible: false,
    sortOrder: 99,
  },
];

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  console.log("");
  console.log("=".repeat(60));
  console.log("  WA MembershipStatus Seeder");
  console.log("=".repeat(60));
  console.log("");

  // Safety check
  try {
    validateProductionSafety();
  } catch (error) {
    console.error("");
    console.error("ERROR:", error instanceof Error ? error.message : error);
    console.error("");
    console.error("To run against production, set:");
    console.error(
      "  ALLOW_PROD_SEED=1 npx tsx scripts/importing/seed_membership_statuses.ts"
    );
    console.error("");
    process.exit(1);
  }

  // Show mode
  if (isDryRun()) {
    console.log("Mode: DRY RUN (no database writes)");
    console.log("");
  }

  const prisma = createPrismaClient();

  try {
    // Check database connectivity
    console.log("Checking database connection...");
    await prisma.$queryRaw`SELECT 1`;
    console.log("[OK] Database connection established");
    console.log("");

    // Check existing statuses
    console.log("Checking existing MembershipStatus records...");
    const existingStatuses = await prisma.membershipStatus.findMany({
      where: {
        code: {
          in: WA_MEMBERSHIP_STATUSES.map((s) => s.code),
        },
      },
      select: { code: true },
    });

    const existingCodes = new Set(existingStatuses.map((s) => s.code));
    const missingCodes = WA_MEMBERSHIP_STATUSES.filter(
      (s) => !existingCodes.has(s.code)
    );

    console.log(`  Found: ${existingCodes.size} existing WA status codes`);
    console.log(`  Missing: ${missingCodes.length} status codes`);
    console.log("");

    if (missingCodes.length === 0) {
      console.log("All WA MembershipStatus codes already exist.");
      console.log("");
      console.log("=".repeat(60));
      console.log("  No changes needed");
      console.log("=".repeat(60));
      console.log("");
      process.exit(0);
    }

    // Seed missing statuses
    console.log("Seeding MembershipStatus records...");

    for (const status of WA_MEMBERSHIP_STATUSES) {
      if (isDryRun()) {
        if (existingCodes.has(status.code)) {
          console.log(`  [SKIP] ${status.code} (already exists)`);
        } else {
          console.log(`  [DRY] Would create: ${status.code}`);
        }
      } else {
        const result = await prisma.membershipStatus.upsert({
          where: { code: status.code },
          update: {
            label: status.label,
            description: status.description,
            isActive: status.isActive,
            isEligibleForRenewal: status.isEligibleForRenewal,
            isBoardEligible: status.isBoardEligible,
            sortOrder: status.sortOrder,
          },
          create: status,
        });

        if (existingCodes.has(status.code)) {
          console.log(`  [UPDATE] ${status.code}`);
        } else {
          console.log(`  [CREATE] ${status.code} (id: ${result.id})`);
        }
      }
    }

    console.log("");
    console.log("=".repeat(60));
    if (isDryRun()) {
      console.log("  Dry run complete - no changes made");
    } else {
      console.log("  Seeding complete");
    }
    console.log("=".repeat(60));
    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("");
    console.error("ERROR:", error instanceof Error ? error.message : error);
    console.error("");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(2);
});
