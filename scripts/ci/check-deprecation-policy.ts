#!/usr/bin/env npx tsx
/**
 * CI Deprecation Policy Enforcement
 *
 * Charter Principles:
 * - P8: Schema and APIs are stable contracts
 *
 * This script enforces deprecation policy for API endpoints:
 *
 * 1. DEPRECATION MINIMUM: Deprecated endpoints must have sunset date >= 6 months out
 * 2. SUNSET ENFORCEMENT: Past-sunset endpoints must be removed or extended
 * 3. DOCUMENTATION: Deprecated endpoints must have reason documented
 *
 * To deprecate an endpoint, add this comment block in the route file:
 *
 *   @deprecated
 *   @sunset 2025-12-31
 *   @successor /api/v2/members
 *   @reason Replaced by v2 API with improved pagination
 *
 * Exit codes:
 *   0 - All deprecations are compliant
 *   1 - Policy violations detected
 *
 * Usage:
 *   npx tsx scripts/ci/check-deprecation-policy.ts
 *   npm run test:guardrails:deprecation
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

// Minimum deprecation period in days
const MIN_DEPRECATION_DAYS = 180; // 6 months

interface DeprecationInfo {
  file: string;
  path: string;
  sunset: Date | null;
  successor: string | null;
  reason: string | null;
}

interface PolicyViolation {
  file: string;
  path: string;
  type: "missing_sunset" | "sunset_too_soon" | "past_sunset" | "missing_reason";
  details: string;
}

/**
 * Parse deprecation metadata from a route file
 */
function parseDeprecation(filePath: string): DeprecationInfo | null {
  const content = fs.readFileSync(filePath, "utf-8");

  // Check if file has @deprecated marker
  if (!content.includes("@deprecated")) {
    return null;
  }

  // Convert file path to API path
  const apiDir = path.join(process.cwd(), "src/app/api");
  const relativePath = path.relative(apiDir, filePath);
  const apiPath = "/api/" + relativePath.replace(/\/route\.ts$/, "");

  // Extract sunset date
  const sunsetMatch = content.match(/@sunset\s+(\d{4}-\d{2}-\d{2})/);
  const sunset = sunsetMatch ? new Date(sunsetMatch[1]) : null;

  // Extract successor
  const successorMatch = content.match(/@successor\s+([^\s\n]+)/);
  const successor = successorMatch ? successorMatch[1] : null;

  // Extract reason
  const reasonMatch = content.match(/@reason\s+(.+?)(?:\n|$)/);
  const reason = reasonMatch ? reasonMatch[1].trim() : null;

  return {
    file: relativePath,
    path: apiPath,
    sunset,
    successor,
    reason,
  };
}

/**
 * Check deprecation against policy
 */
function checkPolicy(dep: DeprecationInfo): PolicyViolation[] {
  const violations: PolicyViolation[] = [];
  const now = new Date();
  const minSunset = new Date(now.getTime() + MIN_DEPRECATION_DAYS * 24 * 60 * 60 * 1000);

  // Check for missing sunset date
  if (!dep.sunset) {
    violations.push({
      file: dep.file,
      path: dep.path,
      type: "missing_sunset",
      details: "Deprecated endpoint must have @sunset date",
    });
  } else {
    // Check if sunset is in the past
    if (dep.sunset < now) {
      violations.push({
        file: dep.file,
        path: dep.path,
        type: "past_sunset",
        details: `Sunset date ${dep.sunset.toISOString().split("T")[0]} has passed - remove or extend`,
      });
    }
    // Check if sunset is too soon (for new deprecations)
    // This is a warning, not a hard failure for existing deprecations
    else if (dep.sunset < minSunset) {
      const daysUntil = Math.ceil((dep.sunset.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      violations.push({
        file: dep.file,
        path: dep.path,
        type: "sunset_too_soon",
        details: `Sunset in ${daysUntil} days - minimum is ${MIN_DEPRECATION_DAYS} days (6 months)`,
      });
    }
  }

  // Check for missing reason
  if (!dep.reason) {
    violations.push({
      file: dep.file,
      path: dep.path,
      type: "missing_reason",
      details: "Deprecated endpoint must have @reason explaining why",
    });
  }

  return violations;
}

function findRouteFiles(): string[] {
  const apiDir = path.join(process.cwd(), "src/app/api");

  if (!fs.existsSync(apiDir)) {
    return [];
  }

  try {
    const output = execSync(`find ${apiDir} -name "route.ts" -type f`, {
      encoding: "utf-8",
    });
    return output.trim().split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

function main() {
  console.log("=".repeat(60));
  console.log("CI Deprecation Policy Enforcement");
  console.log("=".repeat(60));
  console.log("");

  const routeFiles = findRouteFiles();
  console.log(`${CYAN}Scanning ${routeFiles.length} route files for deprecations...${NC}`);
  console.log("");

  const deprecations: DeprecationInfo[] = [];
  const allViolations: PolicyViolation[] = [];

  for (const file of routeFiles) {
    const dep = parseDeprecation(file);
    if (dep) {
      deprecations.push(dep);
      const violations = checkPolicy(dep);
      allViolations.push(...violations);
    }
  }

  // Report found deprecations
  if (deprecations.length === 0) {
    console.log(`${GREEN}✓ No deprecated endpoints found${NC}`);
    console.log("");
    console.log("=".repeat(60));
    console.log(`${GREEN}DEPRECATION POLICY CHECK PASSED${NC}`);
    console.log("=".repeat(60));
    process.exit(0);
  }

  console.log(`Found ${deprecations.length} deprecated endpoint(s):`);
  console.log("");

  for (const dep of deprecations) {
    const sunsetStr = dep.sunset
      ? dep.sunset.toISOString().split("T")[0]
      : "NOT SET";
    console.log(`  ${YELLOW}${dep.path}${NC}`);
    console.log(`    Sunset: ${sunsetStr}`);
    if (dep.successor) console.log(`    Successor: ${dep.successor}`);
    if (dep.reason) console.log(`    Reason: ${dep.reason}`);
    console.log("");
  }

  if (allViolations.length === 0) {
    console.log(`${GREEN}✓ All deprecations comply with policy${NC}`);
    console.log("");
    console.log("=".repeat(60));
    console.log(`${GREEN}DEPRECATION POLICY CHECK PASSED${NC}`);
    console.log("=".repeat(60));
    process.exit(0);
  }

  // Report violations
  console.log(`${RED}✗ Found ${allViolations.length} policy violation(s)${NC}`);
  console.log("");

  const pastSunset = allViolations.filter((v) => v.type === "past_sunset");
  const tooSoon = allViolations.filter((v) => v.type === "sunset_too_soon");
  const missingSunset = allViolations.filter((v) => v.type === "missing_sunset");
  const missingReason = allViolations.filter((v) => v.type === "missing_reason");

  if (pastSunset.length > 0) {
    console.log(`${RED}PAST SUNSET (must remove or extend):${NC}`);
    for (const v of pastSunset) {
      console.log(`  ${v.path}`);
      console.log(`    ${v.details}`);
    }
    console.log("");
  }

  if (missingSunset.length > 0) {
    console.log(`${RED}MISSING SUNSET DATE:${NC}`);
    for (const v of missingSunset) {
      console.log(`  ${v.path}`);
      console.log(`    ${v.details}`);
    }
    console.log("");
  }

  if (tooSoon.length > 0) {
    console.log(`${YELLOW}SUNSET TOO SOON (warning):${NC}`);
    for (const v of tooSoon) {
      console.log(`  ${v.path}`);
      console.log(`    ${v.details}`);
    }
    console.log("");
  }

  if (missingReason.length > 0) {
    console.log(`${YELLOW}MISSING REASON:${NC}`);
    for (const v of missingReason) {
      console.log(`  ${v.path}`);
      console.log(`    ${v.details}`);
    }
    console.log("");
  }

  // Only hard-fail on critical violations
  const criticalViolations = pastSunset.length + missingSunset.length;

  console.log("=".repeat(60));
  if (criticalViolations > 0) {
    console.log(`${RED}DEPRECATION POLICY CHECK FAILED${NC}`);
    console.log("=".repeat(60));
    console.log("");
    console.log("To fix:");
    console.log("  1. Add @sunset date at least 6 months in the future");
    console.log("  2. Add @reason explaining the deprecation");
    console.log("  3. Optionally add @successor with the replacement endpoint");
    console.log("");
    console.log("Example:");
    console.log(`  ${CYAN}/**`);
    console.log(`   * @deprecated`);
    console.log(`   * @sunset 2026-06-30`);
    console.log(`   * @successor /api/v2/members`);
    console.log(`   * @reason Replaced by v2 API with cursor pagination`);
    console.log(`   */${NC}`);
    console.log("");
    process.exit(1);
  } else {
    console.log(`${YELLOW}DEPRECATION POLICY CHECK: ${allViolations.length} warning(s)${NC}`);
    console.log("=".repeat(60));
    process.exit(0);
  }
}

main();
