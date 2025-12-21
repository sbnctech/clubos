#!/usr/bin/env npx ts-node
/**
 * Policy Registry Validation Script
 *
 * CI gate that scans source code for requirePolicy() calls and validates
 * that all referenced policy IDs exist in POLICY_REGISTRY.yaml.
 *
 * Usage:
 *   npx ts-node scripts/ci/validate-policies.ts
 *
 * Exit codes:
 *   0 - All policy references are valid
 *   1 - One or more policy references are invalid
 *
 * Charter Principles:
 * - N5: No hidden rules - validates policy references are documented
 *
 * Copyright (c) Santa Barbara Newcomers Club
 */

import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

// ANSI colors for output
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const CYAN = "\x1b[36m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

interface PolicyRegistry {
  policies: Array<{ id: string; title: string }>;
}

interface PolicyReference {
  policyId: string;
  file: string;
  line: number;
  column: number;
}

/**
 * Load all valid policy IDs from the registry
 */
function loadPolicyIds(): Set<string> {
  const registryPath = path.join(
    process.cwd(),
    "docs/policies/POLICY_REGISTRY.yaml"
  );

  if (!fs.existsSync(registryPath)) {
    console.error(`${RED}Error: Policy registry not found at ${registryPath}${RESET}`);
    process.exit(1);
  }

  const content = fs.readFileSync(registryPath, "utf8");
  const registry = yaml.load(content) as PolicyRegistry;

  if (!registry.policies || !Array.isArray(registry.policies)) {
    console.error(`${RED}Error: Invalid policy registry format${RESET}`);
    process.exit(1);
  }

  return new Set(registry.policies.map((p) => p.id));
}

/**
 * Recursively find all TypeScript/JavaScript files in a directory
 */
function findSourceFiles(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules, .next, and other non-source directories
    if (entry.isDirectory()) {
      if (
        entry.name === "node_modules" ||
        entry.name === ".next" ||
        entry.name === ".git" ||
        entry.name === "dist" ||
        entry.name === "coverage"
      ) {
        continue;
      }
      findSourceFiles(fullPath, files);
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Find all requirePolicy() calls in a file
 */
function findPolicyReferences(filePath: string): PolicyReference[] {
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  const references: PolicyReference[] = [];

  // Match requirePolicy("POL-XXX-NNN") or requirePolicy('POL-XXX-NNN')
  const pattern = /requirePolicy\s*\(\s*["']([^"']+)["']\s*\)/g;

  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    let match;

    while ((match = pattern.exec(line)) !== null) {
      references.push({
        policyId: match[1],
        file: filePath,
        line: lineNum + 1,
        column: match.index + 1,
      });
    }
  }

  return references;
}

/**
 * Main validation function
 */
function main() {
  console.log(`${BOLD}${CYAN}Policy Registry Validation${RESET}`);
  console.log("━".repeat(50));
  console.log();

  // Load valid policy IDs
  console.log(`${CYAN}Loading policy registry...${RESET}`);
  const validPolicyIds = loadPolicyIds();
  console.log(`Found ${validPolicyIds.size} policies in registry`);
  console.log();

  // Find all source files
  console.log(`${CYAN}Scanning source files...${RESET}`);
  const srcDir = path.join(process.cwd(), "src");
  const sourceFiles = findSourceFiles(srcDir);
  console.log(`Found ${sourceFiles.length} source files`);
  console.log();

  // Find all policy references
  console.log(`${CYAN}Finding policy references...${RESET}`);
  const allReferences: PolicyReference[] = [];

  for (const file of sourceFiles) {
    const refs = findPolicyReferences(file);
    allReferences.push(...refs);
  }

  console.log(`Found ${allReferences.length} requirePolicy() calls`);
  console.log();

  // Validate each reference
  const invalidRefs: PolicyReference[] = [];
  const validRefs: PolicyReference[] = [];

  for (const ref of allReferences) {
    if (validPolicyIds.has(ref.policyId)) {
      validRefs.push(ref);
    } else {
      invalidRefs.push(ref);
    }
  }

  // Report results
  console.log("━".repeat(50));
  console.log(`${BOLD}Results${RESET}`);
  console.log();

  if (validRefs.length > 0) {
    console.log(`${GREEN}✓ Valid references: ${validRefs.length}${RESET}`);
    for (const ref of validRefs) {
      const relativePath = path.relative(process.cwd(), ref.file);
      console.log(`  ${ref.policyId} at ${relativePath}:${ref.line}`);
    }
    console.log();
  }

  if (invalidRefs.length > 0) {
    console.log(`${RED}✗ Invalid references: ${invalidRefs.length}${RESET}`);
    for (const ref of invalidRefs) {
      const relativePath = path.relative(process.cwd(), ref.file);
      console.log(
        `  ${RED}${ref.policyId}${RESET} at ${relativePath}:${ref.line}:${ref.column}`
      );
    }
    console.log();
    console.log(
      `${YELLOW}These policy IDs were not found in docs/policies/POLICY_REGISTRY.yaml${RESET}`
    );
    console.log();
  }

  // Summary
  console.log("━".repeat(50));
  if (invalidRefs.length === 0) {
    console.log(`${GREEN}${BOLD}✓ All policy references are valid${RESET}`);
    process.exit(0);
  } else {
    console.log(
      `${RED}${BOLD}✗ ${invalidRefs.length} invalid policy reference(s) found${RESET}`
    );
    console.log();
    console.log(`${YELLOW}To fix:${RESET}`);
    console.log(
      "  1. Verify the policy ID is spelled correctly (format: POL-XXX-NNN)"
    );
    console.log("  2. Add missing policies to docs/policies/POLICY_REGISTRY.yaml");
    console.log("  3. Run this script again to validate");
    process.exit(1);
  }
}

main();
