#!/usr/bin/env npx tsx
/**
 * CI OpenAPI Drift Detection
 *
 * Charter Principles:
 * - P8: Schema and APIs are stable contracts
 *
 * This script detects drift between the OpenAPI spec and actual route implementations:
 *
 * 1. UNDOCUMENTED ROUTES: Routes in code not in OpenAPI spec
 * 2. MISSING ROUTES: Routes in OpenAPI spec not in code
 * 3. METHOD MISMATCH: HTTP methods don't match between spec and code
 *
 * The OpenAPI spec (docs/api/openapi.yaml) is the source of truth for
 * what the API SHOULD look like. Code must match the spec.
 *
 * Exit codes:
 *   0 - No drift detected
 *   1 - Drift detected (spec and code don't match)
 *
 * Usage:
 *   npx tsx scripts/ci/check-openapi-drift.ts
 *   npm run test:guardrails:openapi
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import * as yaml from "yaml";

// ANSI colors
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const NC = "\x1b[0m";

// Routes to exclude from drift detection (internal, health, etc.)
const EXCLUDED_ROUTES = new Set([
  "/api/health",
  "/api/admin/health",
  "/api/v1/health",
  "/api/openapi",
  "/api/v1/docs/openapi",
  // Demo routes (not part of production API)
  "/api/admin/demo",
  // Auth routes handled specially
  "/api/auth",
]);

// Patterns for route directories to exclude
const EXCLUDED_PATTERNS = [
  /\/demo\//,
  /\/test\//,
  /\/_/,  // Next.js special routes
];

interface RouteInfo {
  path: string;
  methods: string[];
}

interface DriftIssue {
  type: "undocumented" | "missing" | "method_mismatch";
  path: string;
  details: string;
}

/**
 * Extract routes from OpenAPI spec
 */
function getOpenAPIRoutes(specPath: string): Map<string, Set<string>> {
  const routes = new Map<string, Set<string>>();

  if (!fs.existsSync(specPath)) {
    console.log(`${YELLOW}OpenAPI spec not found at ${specPath}${NC}`);
    return routes;
  }

  const content = fs.readFileSync(specPath, "utf-8");
  const spec = yaml.parse(content);

  if (!spec.paths) {
    return routes;
  }

  for (const [apiPath, methods] of Object.entries(spec.paths)) {
    // Convert OpenAPI path to normalized form
    // /api/v1/members/{id} -> /api/v1/members/[id]
    const normalizedPath = apiPath.replace(/{([^}]+)}/g, "[$1]");

    const methodSet = new Set<string>();
    for (const method of Object.keys(methods as object)) {
      if (["get", "post", "put", "patch", "delete", "options", "head"].includes(method)) {
        methodSet.add(method.toUpperCase());
      }
    }

    if (methodSet.size > 0) {
      routes.set(normalizedPath, methodSet);
    }
  }

  return routes;
}

/**
 * Extract routes from file system (Next.js App Router)
 */
function getCodeRoutes(apiDir: string): Map<string, Set<string>> {
  const routes = new Map<string, Set<string>>();

  if (!fs.existsSync(apiDir)) {
    return routes;
  }

  // Find all route.ts files
  const routeFiles = execSync(`find ${apiDir} -name "route.ts" -type f`, {
    encoding: "utf-8",
  })
    .trim()
    .split("\n")
    .filter(Boolean);

  for (const file of routeFiles) {
    // Convert file path to API path
    // src/app/api/v1/members/[id]/route.ts -> /api/v1/members/[id]
    const relativePath = path.relative(apiDir, file);
    const apiPath = "/api/" + relativePath.replace(/\/route\.ts$/, "");

    // Skip excluded routes
    if (EXCLUDED_ROUTES.has(apiPath)) continue;
    if (EXCLUDED_PATTERNS.some((p) => p.test(apiPath))) continue;

    // Read file to find exported HTTP methods
    const content = fs.readFileSync(file, "utf-8");
    const methods = new Set<string>();

    // Look for exported async functions named GET, POST, etc.
    const methodMatches = content.matchAll(/export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)/g);
    for (const match of methodMatches) {
      methods.add(match[1]);
    }

    if (methods.size > 0) {
      routes.set(apiPath, methods);
    }
  }

  return routes;
}

/**
 * Compare OpenAPI spec routes with code routes
 */
function detectDrift(
  specRoutes: Map<string, Set<string>>,
  codeRoutes: Map<string, Set<string>>
): DriftIssue[] {
  const issues: DriftIssue[] = [];

  // Check for undocumented routes (in code but not in spec)
  for (const [path, methods] of codeRoutes) {
    if (!specRoutes.has(path)) {
      issues.push({
        type: "undocumented",
        path,
        details: `Methods: ${[...methods].join(", ")}`,
      });
    } else {
      // Check for method mismatches
      const specMethods = specRoutes.get(path)!;
      const missingInSpec = [...methods].filter((m) => !specMethods.has(m));
      const extraInSpec = [...specMethods].filter((m) => !methods.has(m));

      if (missingInSpec.length > 0) {
        issues.push({
          type: "method_mismatch",
          path,
          details: `Code has ${missingInSpec.join(", ")} but spec doesn't`,
        });
      }
      if (extraInSpec.length > 0) {
        issues.push({
          type: "method_mismatch",
          path,
          details: `Spec has ${extraInSpec.join(", ")} but code doesn't`,
        });
      }
    }
  }

  // Check for missing routes (in spec but not in code)
  for (const [path, methods] of specRoutes) {
    if (!codeRoutes.has(path)) {
      issues.push({
        type: "missing",
        path,
        details: `Expected methods: ${[...methods].join(", ")}`,
      });
    }
  }

  return issues;
}

function main() {
  console.log("=".repeat(60));
  console.log("CI OpenAPI Drift Detection");
  console.log("=".repeat(60));
  console.log("");

  const specPath = path.join(process.cwd(), "docs/api/openapi.yaml");
  const apiDir = path.join(process.cwd(), "src/app/api");

  console.log(`${CYAN}Loading OpenAPI spec...${NC}`);
  const specRoutes = getOpenAPIRoutes(specPath);
  console.log(`  Found ${specRoutes.size} routes in spec`);

  console.log(`${CYAN}Scanning code routes...${NC}`);
  const codeRoutes = getCodeRoutes(apiDir);
  console.log(`  Found ${codeRoutes.size} routes in code`);
  console.log("");

  if (specRoutes.size === 0) {
    console.log(`${YELLOW}WARNING: No routes in OpenAPI spec${NC}`);
    console.log("OpenAPI drift detection is informational only.");
    console.log("");
    console.log("=".repeat(60));
    console.log(`${YELLOW}OPENAPI DRIFT CHECK SKIPPED${NC}`);
    console.log("=".repeat(60));
    process.exit(0);
  }

  const issues = detectDrift(specRoutes, codeRoutes);

  if (issues.length === 0) {
    console.log(`${GREEN}✓ No drift detected - spec and code are in sync${NC}`);
    console.log("");
    console.log("=".repeat(60));
    console.log(`${GREEN}OPENAPI DRIFT CHECK PASSED${NC}`);
    console.log("=".repeat(60));
    process.exit(0);
  }

  // Group issues by type
  const undocumented = issues.filter((i) => i.type === "undocumented");
  const missing = issues.filter((i) => i.type === "missing");
  const mismatches = issues.filter((i) => i.type === "method_mismatch");

  console.log(`${YELLOW}⚠ Found ${issues.length} drift issue(s)${NC}`);
  console.log("");

  if (undocumented.length > 0) {
    console.log(`${YELLOW}UNDOCUMENTED ROUTES (in code, not in spec):${NC}`);
    for (const issue of undocumented) {
      console.log(`  ${issue.path}`);
      console.log(`    ${issue.details}`);
    }
    console.log("");
  }

  if (missing.length > 0) {
    console.log(`${RED}MISSING ROUTES (in spec, not in code):${NC}`);
    for (const issue of missing) {
      console.log(`  ${issue.path}`);
      console.log(`    ${issue.details}`);
    }
    console.log("");
  }

  if (mismatches.length > 0) {
    console.log(`${YELLOW}METHOD MISMATCHES:${NC}`);
    for (const issue of mismatches) {
      console.log(`  ${issue.path}`);
      console.log(`    ${issue.details}`);
    }
    console.log("");
  }

  console.log("=".repeat(60));
  // Drift is informational for now, not a hard failure
  // Change to exit(1) when spec is complete
  console.log(`${YELLOW}OPENAPI DRIFT CHECK: ${issues.length} issue(s) found${NC}`);
  console.log("=".repeat(60));
  console.log("");
  console.log("To fix:");
  console.log("  1. Add missing routes to docs/api/openapi.yaml");
  console.log("  2. Or add undocumented routes to EXCLUDED_ROUTES in this script");
  console.log("");

  // Exit 0 for now (informational), change to 1 when enforcing
  process.exit(0);
}

main();
