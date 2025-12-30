#!/usr/bin/env npx tsx
/**
 * Trial Migration Script
 *
 * Runs pattern detection on crawl reports to identify what can be
 * auto-migrated vs what needs manual intervention.
 *
 * Usage:
 *   npx tsx scripts/migration/trial-migration.ts <crawl-report.json>
 *   npx tsx scripts/migration/trial-migration.ts scripts/migration/reports/bedford-crawl-report.json
 */

import * as fs from "fs";
import * as path from "path";
import { analyzeHtmlPatterns, type HtmlPatternMatch } from "../../src/lib/migration/html-pattern-analyzer";
import { extractThemeFromCrawl, type ExtractedTheme } from "../../src/lib/migration/theme-extractor";

interface CrawlPage {
  url: string;
  title: string;
  customHtml?: Array<{
    htmlSnippet: string;
    location: string;
    containsScript: boolean;
    containsIframe: boolean;
    containsForm: boolean;
    externalUrls: string[];
  }>;
}

interface CrawlReport {
  config: { baseUrl: string };
  pages: CrawlPage[];
}

interface MigrationResult {
  url: string;
  title: string;
  blocks: BlockMigration[];
  autoMigrateCount: number;
  manualReviewCount: number;
  removeCount: number;
  unknownCount: number;
}

interface BlockMigration {
  originalHtml: string;
  location: string;
  pattern: string;
  action: "auto" | "manual" | "remove" | "unknown";
  targetBlockType?: string;
  confidence: number;
  issues: string[];
}

interface MigrationReport {
  site: string;
  crawledAt: string;
  theme: ExtractedTheme;
  pages: MigrationResult[];
  summary: {
    totalPages: number;
    totalBlocks: number;
    autoMigrate: number;
    manualReview: number;
    remove: number;
    unknown: number;
    autoMigratePercentage: number;
    byPattern: Record<string, number>;
    byAction: Record<string, number>;
    topIssues: string[];
  };
}

function categorizeAction(match: HtmlPatternMatch): "auto" | "manual" | "remove" | "unknown" {
  if (match.replacement.type === "remove") return "remove";
  if (match.replacement.autoApply && match.confidence >= 0.8) return "auto";
  if (match.replacement.autoApply && match.confidence >= 0.5) return "manual";
  if (match.pattern === "unknown") return "unknown";
  return "manual";
}

function identifyIssues(html: string, match: HtmlPatternMatch): string[] {
  const issues: string[] = [];

  // Check for scripts
  if (/<script/i.test(html)) {
    issues.push("Contains inline script - cannot migrate");
  }

  // Check for iframes (that aren't video embeds)
  if (/<iframe/i.test(html) && match.pattern !== "embed-video") {
    issues.push("Contains iframe - needs review");
  }

  // Check for forms
  if (/<form/i.test(html)) {
    issues.push("Contains form - needs native replacement");
  }

  // Check for complex CSS
  if (html.match(/style\s*=\s*["'][^"']{100,}["']/i)) {
    issues.push("Complex inline styles - may lose formatting");
  }

  // Check for font tags (legacy styling)
  if (/<font/i.test(html)) {
    issues.push("Legacy <font> tags - styling will be normalized");
  }

  // Check for external resources
  if (/src=["']https?:\/\//i.test(html)) {
    issues.push("External resources - may need re-upload");
  }

  // Check for WA-specific classes that indicate system widgets
  if (/WaGadget(Login|Search|Mobile|Navigation)/i.test(html)) {
    issues.push("WA system widget - will be replaced by native feature");
  }

  return issues;
}

function runTrialMigration(reportPath: string): MigrationReport {
  console.log("\n" + "=".repeat(80));
  console.log("TRIAL MIGRATION");
  console.log("=".repeat(80));
  console.log(`Report: ${path.basename(reportPath)}`);

  const report: CrawlReport = JSON.parse(fs.readFileSync(reportPath, "utf-8"));

  // Extract theme
  console.log("\n>>> Extracting theme...");
  const theme = extractThemeFromCrawl(report);
  console.log(`  Primary color: ${theme.primaryColor || "not detected"}`);
  console.log(`  Accent color: ${theme.accentColor || "not detected"}`);
  console.log(`  Colors found: ${theme.colors.length}`);
  console.log(`  Fonts found: ${theme.fonts.length}`);
  console.log(`  Confidence: ${(theme.confidence * 100).toFixed(0)}%`);

  // Process each page
  console.log("\n>>> Processing pages...");
  const pageResults: MigrationResult[] = [];
  const patternCounts: Record<string, number> = {};
  const actionCounts: Record<string, number> = { auto: 0, manual: 0, remove: 0, unknown: 0 };
  const allIssues: string[] = [];

  for (const page of report.pages) {
    if (!page.customHtml || page.customHtml.length === 0) {
      continue;
    }

    const blocks: BlockMigration[] = [];

    for (const block of page.customHtml) {
      const html = block.htmlSnippet;
      const patterns = analyzeHtmlPatterns(html);

      if (patterns.length === 0) {
        // No pattern detected
        const issues = identifyIssues(html, {
          pattern: "unknown",
          description: "Unknown content",
          confidence: 0,
          replacement: { type: "simplify", action: "Review manually", autoApply: false },
          extractedData: {},
          originalHtml: html,
        });

        blocks.push({
          originalHtml: html.substring(0, 200),
          location: block.location,
          pattern: "unknown",
          action: "unknown",
          confidence: 0,
          issues,
        });

        actionCounts.unknown++;
        patternCounts["unknown"] = (patternCounts["unknown"] || 0) + 1;
        allIssues.push(...issues);
      } else {
        // Process each detected pattern
        for (const match of patterns) {
          const action = categorizeAction(match);
          const issues = identifyIssues(html, match);

          blocks.push({
            originalHtml: html.substring(0, 200),
            location: block.location,
            pattern: match.pattern,
            action,
            targetBlockType: match.replacement.widgetType,
            confidence: match.confidence,
            issues,
          });

          actionCounts[action]++;
          patternCounts[match.pattern] = (patternCounts[match.pattern] || 0) + 1;
          allIssues.push(...issues);
        }
      }
    }

    if (blocks.length > 0) {
      pageResults.push({
        url: page.url,
        title: page.title,
        blocks,
        autoMigrateCount: blocks.filter((b) => b.action === "auto").length,
        manualReviewCount: blocks.filter((b) => b.action === "manual").length,
        removeCount: blocks.filter((b) => b.action === "remove").length,
        unknownCount: blocks.filter((b) => b.action === "unknown").length,
      });
    }
  }

  // Compile summary
  const totalBlocks = actionCounts.auto + actionCounts.manual + actionCounts.remove + actionCounts.unknown;
  const autoPercentage = totalBlocks > 0 ? (actionCounts.auto / totalBlocks) * 100 : 0;

  // Get top issues
  const issueFrequency: Record<string, number> = {};
  for (const issue of allIssues) {
    issueFrequency[issue] = (issueFrequency[issue] || 0) + 1;
  }
  const topIssues = Object.entries(issueFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([issue, count]) => `${issue} (${count})`);

  const migrationReport: MigrationReport = {
    site: report.config.baseUrl,
    crawledAt: new Date().toISOString(),
    theme,
    pages: pageResults,
    summary: {
      totalPages: pageResults.length,
      totalBlocks,
      autoMigrate: actionCounts.auto,
      manualReview: actionCounts.manual,
      remove: actionCounts.remove,
      unknown: actionCounts.unknown,
      autoMigratePercentage: autoPercentage,
      byPattern: patternCounts,
      byAction: actionCounts,
      topIssues,
    },
  };

  return migrationReport;
}

function printMigrationReport(report: MigrationReport): void {
  console.log("\n" + "=".repeat(80));
  console.log("MIGRATION REPORT");
  console.log("=".repeat(80));

  console.log(`\nSite: ${report.site}`);
  console.log(`Pages with content: ${report.summary.totalPages}`);
  console.log(`Total content blocks: ${report.summary.totalBlocks}`);

  console.log("\n--- MIGRATION READINESS ---");
  console.log(`  Auto-migrate:  ${report.summary.autoMigrate} blocks (${report.summary.autoMigratePercentage.toFixed(1)}%)`);
  console.log(`  Manual review: ${report.summary.manualReview} blocks`);
  console.log(`  Remove:        ${report.summary.remove} blocks`);
  console.log(`  Unknown:       ${report.summary.unknown} blocks`);

  console.log("\n--- PATTERNS DETECTED ---");
  const sortedPatterns = Object.entries(report.summary.byPattern)
    .sort((a, b) => b[1] - a[1]);
  for (const [pattern, count] of sortedPatterns) {
    const icon = pattern === "unknown" ? "?" : "✓";
    console.log(`  ${icon} ${pattern}: ${count}`);
  }

  console.log("\n--- THEME EXTRACTED ---");
  console.log(`  Primary: ${report.theme.primaryColor || "not detected"}`);
  console.log(`  Accent:  ${report.theme.accentColor || "not detected"}`);
  if (report.theme.headingFont) {
    console.log(`  Heading font: ${report.theme.headingFont}`);
  }
  if (report.theme.bodyFont) {
    console.log(`  Body font: ${report.theme.bodyFont}`);
  }
  if (report.theme.buttonStyles.length > 0) {
    console.log(`  Button styles: ${report.theme.buttonStyles.map((b) => b.waClass).join(", ")}`);
  }

  if (report.summary.topIssues.length > 0) {
    console.log("\n--- TOP ISSUES ---");
    for (const issue of report.summary.topIssues) {
      console.log(`  ⚠ ${issue}`);
    }
  }

  // Show sample pages with issues
  console.log("\n--- SAMPLE PAGES ---");
  const pagesWithIssues = report.pages
    .filter((p) => p.unknownCount > 0 || p.manualReviewCount > 0)
    .slice(0, 5);

  for (const page of pagesWithIssues) {
    console.log(`\n  ${page.url}`);
    console.log(`    Title: ${page.title.substring(0, 50)}`);
    console.log(`    Auto: ${page.autoMigrateCount}, Manual: ${page.manualReviewCount}, Unknown: ${page.unknownCount}`);

    // Show blocks that need attention
    const needsAttention = page.blocks.filter((b) => b.action !== "auto" && b.action !== "remove");
    for (const block of needsAttention.slice(0, 2)) {
      console.log(`    - [${block.pattern}] ${block.originalHtml.substring(0, 60).replace(/\n/g, " ")}...`);
      if (block.issues.length > 0) {
        console.log(`      Issues: ${block.issues.slice(0, 2).join("; ")}`);
      }
    }
  }

  // Recommendations
  console.log("\n--- RECOMMENDATIONS ---");

  if (report.summary.autoMigratePercentage >= 80) {
    console.log("  ✅ High automation rate - good candidate for migration");
  } else if (report.summary.autoMigratePercentage >= 50) {
    console.log("  🔶 Medium automation rate - some manual work needed");
  } else {
    console.log("  ⚠️ Low automation rate - significant manual work required");
  }

  if (report.summary.unknown > 10) {
    console.log("  💡 Consider adding pattern detectors for frequently unknown content");
  }

  const scriptIssues = report.summary.topIssues.filter((i) => i.includes("script"));
  if (scriptIssues.length > 0) {
    console.log("  ⚠️ Scripts detected - need native ClubOS alternatives for:");
    scriptIssues.forEach((i) => console.log(`     ${i}`));
  }
}

// Main
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
Trial Migration Script

Runs pattern detection on crawl reports to identify what can be
auto-migrated vs what needs manual intervention.

Usage:
  npx tsx scripts/migration/trial-migration.ts <crawl-report.json>

Examples:
  npx tsx scripts/migration/trial-migration.ts scripts/migration/reports/bedford-crawl-report.json
  npx tsx scripts/migration/trial-migration.ts scripts/migration/reports/iwa-crawl-report.json

Options:
  --output=FILE  Save migration report to JSON file
    `);
    process.exit(0);
  }

  const reportFile = args.find((a) => !a.startsWith("--"));
  if (!reportFile || !fs.existsSync(reportFile)) {
    console.error(`Error: Report file not found: ${reportFile}`);
    process.exit(1);
  }

  const outputFile = args.find((a) => a.startsWith("--output="))?.split("=")[1];

  try {
    const report = runTrialMigration(reportFile);
    printMigrationReport(report);

    if (outputFile) {
      fs.writeFileSync(outputFile, JSON.stringify(report, null, 2));
      console.log(`\nMigration report saved to: ${outputFile}`);
    }
  } catch (err) {
    console.error("Trial migration failed:", err);
    process.exit(1);
  }
}

main();
