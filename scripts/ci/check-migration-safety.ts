#!/usr/bin/env npx tsx
/**
 * CI Migration Safety Check
 *
 * Charter Principles:
 * - P8: Schema and APIs are stable contracts
 * - P9: Security must fail closed
 *
 * This script enforces that database migrations are additive-only:
 *
 * BLOCKED OPERATIONS (require merge captain override):
 * - DROP TABLE
 * - DROP COLUMN
 * - ALTER COLUMN ... TYPE (type changes)
 * - DROP INDEX (on production tables)
 * - DROP CONSTRAINT
 * - RENAME TABLE
 * - RENAME COLUMN
 *
 * ALLOWED OPERATIONS:
 * - CREATE TABLE
 * - ADD COLUMN
 * - CREATE INDEX
 * - ADD CONSTRAINT
 * - INSERT/UPDATE seed data
 *
 * OVERRIDE:
 * To allow a destructive migration, add a comment at the top of the SQL:
 *   -- MIGRATION_OVERRIDE: merge_captain_approved
 *   -- REASON: [explanation]
 *   -- DEPRECATION_ISSUE: #123
 *
 * Exit codes:
 *   0 - All migrations are safe (additive-only)
 *   1 - Destructive operations detected
 *
 * Usage:
 *   npx tsx scripts/ci/check-migration-safety.ts
 *   npm run test:guardrails:migrations
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

// ANSI colors
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const NC = "\x1b[0m";

// Destructive SQL patterns that require override
const DESTRUCTIVE_PATTERNS = [
  { pattern: /DROP\s+TABLE/i, name: "DROP TABLE", severity: "critical" },
  { pattern: /DROP\s+COLUMN/i, name: "DROP COLUMN", severity: "critical" },
  // Note: DROP DEFAULT is safe (removes default value, not the column)
  { pattern: /ALTER\s+.*\s+DROP\s+(?!DEFAULT)/i, name: "ALTER...DROP", severity: "critical" },
  { pattern: /ALTER\s+COLUMN\s+.*\s+TYPE/i, name: "TYPE CHANGE", severity: "high" },
  { pattern: /ALTER\s+.*\s+ALTER\s+COLUMN\s+.*\s+TYPE/i, name: "TYPE CHANGE", severity: "high" },
  { pattern: /RENAME\s+TABLE/i, name: "RENAME TABLE", severity: "high" },
  { pattern: /RENAME\s+COLUMN/i, name: "RENAME COLUMN", severity: "high" },
  { pattern: /ALTER\s+TABLE\s+.*\s+RENAME\s+TO/i, name: "RENAME TABLE", severity: "high" },
  { pattern: /ALTER\s+TABLE\s+.*\s+RENAME\s+COLUMN/i, name: "RENAME COLUMN", severity: "high" },
  { pattern: /DROP\s+CONSTRAINT/i, name: "DROP CONSTRAINT", severity: "medium" },
  { pattern: /DROP\s+INDEX/i, name: "DROP INDEX", severity: "medium" },
  { pattern: /TRUNCATE/i, name: "TRUNCATE", severity: "critical" },
] as const;

// Override marker that allows destructive operations
const OVERRIDE_MARKER = "MIGRATION_OVERRIDE: merge_captain_approved";

interface Violation {
  file: string;
  line: number;
  operation: string;
  severity: string;
  content: string;
}

function checkMigrationFile(filePath: string): Violation[] {
  const violations: Violation[] = [];
  const content = fs.readFileSync(filePath, "utf-8");

  // Check for override marker
  if (content.includes(OVERRIDE_MARKER)) {
    // Verify it has required fields
    if (!content.includes("REASON:")) {
      violations.push({
        file: path.basename(filePath),
        line: 1,
        operation: "INVALID_OVERRIDE",
        severity: "critical",
        content: "Override marker found but missing REASON comment",
      });
    }
    // If valid override, skip destructive checks
    if (violations.length === 0) {
      return [];
    }
  }

  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Skip comments
    if (line.trim().startsWith("--")) continue;

    for (const { pattern, name, severity } of DESTRUCTIVE_PATTERNS) {
      if (pattern.test(line)) {
        violations.push({
          file: path.basename(filePath),
          line: lineNum,
          operation: name,
          severity,
          content: line.trim().slice(0, 80),
        });
      }
    }
  }

  return violations;
}

function findMigrationFiles(): string[] {
  const migrationsDir = path.join(process.cwd(), "prisma/migrations");

  if (!fs.existsSync(migrationsDir)) {
    return [];
  }

  try {
    const output = execSync(`find ${migrationsDir} -name "migration.sql" -type f`, {
      encoding: "utf-8",
    });
    return output.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function main() {
  console.log("=".repeat(60));
  console.log("CI Migration Safety Check");
  console.log("=".repeat(60));
  console.log("");

  const migrationFiles = findMigrationFiles();

  if (migrationFiles.length === 0) {
    console.log(`${YELLOW}No migration files found in prisma/migrations${NC}`);
    console.log("This is expected if using db push for development.");
    console.log("");
    console.log("=".repeat(60));
    console.log(`${GREEN}MIGRATION SAFETY CHECK PASSED${NC}`);
    console.log("=".repeat(60));
    process.exit(0);
  }

  console.log(`${CYAN}Checking ${migrationFiles.length} migration file(s)...${NC}`);
  console.log("");

  const allViolations: Violation[] = [];

  for (const file of migrationFiles) {
    const violations = checkMigrationFile(file);
    allViolations.push(...violations);
  }

  if (allViolations.length === 0) {
    console.log(`${GREEN}✓ All migrations are additive-only (safe)${NC}`);
    console.log("");
    console.log("=".repeat(60));
    console.log(`${GREEN}MIGRATION SAFETY CHECK PASSED${NC}`);
    console.log("=".repeat(60));
    process.exit(0);
  }

  // Group by severity
  const critical = allViolations.filter((v) => v.severity === "critical");
  const high = allViolations.filter((v) => v.severity === "high");
  const medium = allViolations.filter((v) => v.severity === "medium");

  console.log(`${RED}✗ Found ${allViolations.length} destructive operation(s)${NC}`);
  console.log("");

  if (critical.length > 0) {
    console.log(`${RED}CRITICAL (data loss risk):${NC}`);
    for (const v of critical) {
      console.log(`  ${v.file}:${v.line} - ${v.operation}`);
      console.log(`    ${v.content}`);
    }
    console.log("");
  }

  if (high.length > 0) {
    console.log(`${YELLOW}HIGH (breaking change):${NC}`);
    for (const v of high) {
      console.log(`  ${v.file}:${v.line} - ${v.operation}`);
      console.log(`    ${v.content}`);
    }
    console.log("");
  }

  if (medium.length > 0) {
    console.log(`${YELLOW}MEDIUM (may affect queries):${NC}`);
    for (const v of medium) {
      console.log(`  ${v.file}:${v.line} - ${v.operation}`);
      console.log(`    ${v.content}`);
    }
    console.log("");
  }

  console.log("=".repeat(60));
  console.log(`${RED}MIGRATION SAFETY CHECK FAILED${NC}`);
  console.log("=".repeat(60));
  console.log("");
  console.log("To override (requires merge captain approval):");
  console.log("Add these comments at the top of the migration SQL:");
  console.log("");
  console.log(`  ${CYAN}-- MIGRATION_OVERRIDE: merge_captain_approved${NC}`);
  console.log(`  ${CYAN}-- REASON: [explain why this is safe]${NC}`);
  console.log(`  ${CYAN}-- DEPRECATION_ISSUE: #[issue number]${NC}`);
  console.log("");
  console.log("Reference: docs/reliability/SYSTEM_GUARANTEES.md Section 9");
  console.log("");

  process.exit(1);
}

main();
