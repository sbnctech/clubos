#!/usr/bin/env npx tsx
/**
 * Wild Apricot MembershipTier Seeder
 *
 * Seeds MembershipTier records required for WA import.
 * This script is idempotent - running it multiple times is safe.
 *
 * Run with:
 *   npx tsx scripts/importing/seed_membership_tiers.ts
 *
 * Environment variables:
 *   ALLOW_PROD_SEED - Required in production: Set to "1" to allow
 *   DRY_RUN         - Optional: Set to "1" for preview mode (no writes)
 *
 * Tier codes created:
 *   - unknown: Unknown/unmapped tier (sortOrder 0)
 *   - extended_member: Extended Member (WA: ExtendedNewcomer) (sortOrder 10)
 *   - newbie_member: Newbie Member (WA: NewbieNewcomer) (sortOrder 20)
 *   - member: Member (WA: NewcomerMember) (sortOrder 30)
 *
 * Note: "Admins" in WA is NOT a membership tier - it's modeled via roles/capabilities.
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
// Tier Definitions
// ============================================================================

/**
 * MembershipTier records for ClubOS.
 * These map from Wild Apricot membership levels.
 *
 * WA Level -> ClubOS MembershipTier.name
 * - ExtendedNewcomer -> Extended Member
 * - NewbieNewcomer   -> Newbie Member
 * - NewcomerMember   -> Member
 *
 * "Admins" in WA is NOT a membership tier (it's modeled via roles/capabilities).
 */
const MEMBERSHIP_TIERS = [
  {
    code: "unknown",
    name: "Unknown",
    sortOrder: 0,
  },
  {
    code: "extended_member",
    name: "Extended Member",
    sortOrder: 10,
  },
  {
    code: "newbie_member",
    name: "Newbie Member",
    sortOrder: 20,
  },
  {
    code: "member",
    name: "Member",
    sortOrder: 30,
  },
];

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  console.log("");
  console.log("=".repeat(60));
  console.log("  WA MembershipTier Seeder");
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
      "  ALLOW_PROD_SEED=1 npx tsx scripts/importing/seed_membership_tiers.ts"
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

    // Check existing tiers
    console.log("Checking existing MembershipTier records...");
    const existingTiers = await prisma.membershipTier.findMany({
      where: {
        code: {
          in: MEMBERSHIP_TIERS.map((t) => t.code),
        },
      },
      select: { code: true },
    });

    const existingCodes = new Set(existingTiers.map((t) => t.code));
    const missingCodes = MEMBERSHIP_TIERS.filter(
      (t) => !existingCodes.has(t.code)
    );

    console.log(`  Found: ${existingCodes.size} existing tier codes`);
    console.log(`  Missing: ${missingCodes.length} tier codes`);
    console.log("");

    if (missingCodes.length === 0) {
      console.log("All MembershipTier codes already exist.");
      console.log("");
      console.log("=".repeat(60));
      console.log("  No changes needed");
      console.log("=".repeat(60));
      console.log("");
      process.exit(0);
    }

    // Seed missing tiers
    console.log("Seeding MembershipTier records...");

    for (const tier of MEMBERSHIP_TIERS) {
      if (isDryRun()) {
        if (existingCodes.has(tier.code)) {
          console.log(`  [SKIP] ${tier.code} (already exists)`);
        } else {
          console.log(`  [DRY] Would create: ${tier.code} -> "${tier.name}"`);
        }
      } else {
        const result = await prisma.membershipTier.upsert({
          where: { code: tier.code },
          update: {
            name: tier.name,
            sortOrder: tier.sortOrder,
          },
          create: tier,
        });

        if (existingCodes.has(tier.code)) {
          console.log(`  [UPDATE] ${tier.code}`);
        } else {
          console.log(`  [CREATE] ${tier.code} -> "${tier.name}" (id: ${result.id})`);
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
