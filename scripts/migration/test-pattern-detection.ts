/**
 * Test script for pattern detection and theme extraction
 *
 * Usage: npx tsx scripts/migration/test-pattern-detection.ts
 */

import * as fs from "fs";
import * as path from "path";
import { extractThemeFromCrawl, getThemeSummary } from "../../src/lib/migration/theme-extractor";
import { analyzeHtmlPatterns, getPatternSummary } from "../../src/lib/migration/html-pattern-analyzer";
import { analyzeScript } from "../../src/lib/migration/script-analyzer";

const REPORTS_DIR = path.join(__dirname, "reports");

interface CrawlPage {
  url: string;
  title: string;
  customHtml?: Array<{
    htmlSnippet: string;
    location: string;
    containsScript: boolean;
  }>;
}

interface CrawlReport {
  config: { baseUrl: string };
  pages: CrawlPage[];
}

function testReport(reportPath: string) {
  console.log("\n" + "=".repeat(80));
  console.log(`Testing: ${path.basename(reportPath)}`);
  console.log("=".repeat(80));

  const report: CrawlReport = JSON.parse(fs.readFileSync(reportPath, "utf-8"));

  // Extract theme
  console.log("\n📎 THEME EXTRACTION");
  console.log("-".repeat(40));
  const theme = extractThemeFromCrawl(report);
  console.log(getThemeSummary(theme));

  if (theme.colors.length > 0) {
    console.log("\nTop colors found:");
    theme.colors.slice(0, 5).forEach((c) => {
      console.log(`  ${c.normalizedColor}: ${c.count} occurrences (${c.contexts.join(", ")})`);
    });
  }

  if (theme.fonts.length > 0) {
    console.log("\nTop fonts found:");
    theme.fonts.slice(0, 3).forEach((f) => {
      console.log(`  ${f.font}: ${f.count} occurrences (${f.contexts.join(", ")})`);
    });
  }

  if (theme.buttonStyles.length > 0) {
    console.log("\nButton styles found:");
    theme.buttonStyles.forEach((b) => {
      console.log(`  ${b.waClass}: ${b.count} occurrences → ${b.suggestedVariant}`);
    });
  }

  // Analyze patterns per page
  console.log("\n📋 PATTERN DETECTION");
  console.log("-".repeat(40));

  const patternCounts: Record<string, number> = {};
  const scriptCounts: Record<string, number> = {};

  for (const page of report.pages) {
    if (!page.customHtml) continue;

    for (const block of page.customHtml) {
      // Check HTML patterns
      const patterns = analyzeHtmlPatterns(block.htmlSnippet);
      for (const p of patterns) {
        patternCounts[p.pattern] = (patternCounts[p.pattern] || 0) + 1;
      }

      // Check scripts
      if (block.containsScript) {
        const scriptMatch = block.htmlSnippet.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
        if (scriptMatch) {
          const analysis = analyzeScript(scriptMatch[1]);
          scriptCounts[analysis.purpose] = (scriptCounts[analysis.purpose] || 0) + 1;
        }
      }
    }
  }

  console.log("\nPatterns detected:");
  Object.entries(patternCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([pattern, count]) => {
      console.log(`  ${pattern}: ${count}`);
    });

  if (Object.keys(scriptCounts).length > 0) {
    console.log("\nScript types detected:");
    Object.entries(scriptCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([purpose, count]) => {
        console.log(`  ${purpose}: ${count}`);
      });
  }

  // Show sample detections
  console.log("\n📌 SAMPLE DETECTIONS");
  console.log("-".repeat(40));

  let sampleCount = 0;
  for (const page of report.pages) {
    if (!page.customHtml || sampleCount >= 5) continue;

    for (const block of page.customHtml) {
      if (sampleCount >= 5) break;

      const patterns = analyzeHtmlPatterns(block.htmlSnippet);
      for (const p of patterns) {
        if (sampleCount >= 5) break;
        if (p.pattern !== "unknown") {
          console.log(`\n[${p.pattern}] ${p.description}`);
          console.log(`  Action: ${p.replacement.action}`);
          console.log(`  Auto-apply: ${p.replacement.autoApply ? "Yes" : "No"}`);
          if (p.replacement.blockData) {
            console.log(`  Block data: ${JSON.stringify(p.replacement.blockData).substring(0, 100)}...`);
          }
          sampleCount++;
        }
      }
    }
  }
}

// Run tests
const reports = fs.readdirSync(REPORTS_DIR).filter((f) => f.endsWith(".json"));

if (reports.length === 0) {
  console.log("No crawl reports found in", REPORTS_DIR);
  process.exit(1);
}

for (const report of reports) {
  testReport(path.join(REPORTS_DIR, report));
}

console.log("\n" + "=".repeat(80));
console.log("Done!");
