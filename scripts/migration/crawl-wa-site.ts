#!/usr/bin/env npx tsx
/**
 * Wild Apricot Site Crawler Runner
 *
 * Usage:
 *   npx tsx scripts/migration/crawl-wa-site.ts <site-url> [options]
 *
 * Examples:
 *   npx tsx scripts/migration/crawl-wa-site.ts https://bedfordridinglanes.wildapricot.org
 *   npx tsx scripts/migration/crawl-wa-site.ts https://iwachicago.org --max-pages=30 --depth=2
 *   npx tsx scripts/migration/crawl-wa-site.ts https://example.org --wa-account-id=12345 --wa-api-key=KEY
 *
 * Options:
 *   --max-pages=N       Maximum pages to crawl (default: 50)
 *   --depth=N           Maximum link depth (default: 3)
 *   --delay=N           Delay between requests in ms (default: 1000)
 *   --output=FILE       Save JSON report to file
 *   --quiet             Only output summary
 *   --wa-account-id=ID  Wild Apricot account ID (for authenticated crawl)
 *   --wa-api-key=KEY    Wild Apricot API key (for authenticated crawl)
 */

import { crawlSite, printReport, type CrawlReport } from "./lib/wa-crawler";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
Wild Apricot Site Crawler

Usage:
  npx tsx scripts/migration/crawl-wa-site.ts <site-url> [options]

Options:
  --max-pages=N       Maximum pages to crawl (default: 50)
  --depth=N           Maximum link depth (default: 3)
  --delay=N           Delay between requests in ms (default: 1000)
  --output=FILE       Save JSON report to file
  --quiet             Only output summary

Authentication (for full site access):
  --wa-account-id=ID  Wild Apricot account ID
  --wa-api-key=KEY    Wild Apricot API key

Examples:
  # Public pages only (for testing)
  npx tsx scripts/migration/crawl-wa-site.ts https://bedfordridinglanes.wildapricot.org

  # With authentication (full site access)
  npx tsx scripts/migration/crawl-wa-site.ts https://example.org \\
    --wa-account-id=12345 --wa-api-key=YOUR_KEY

  # Save report to file
  npx tsx scripts/migration/crawl-wa-site.ts https://example.org --output=./report.json
    `);
    process.exit(0);
  }

  // Parse URL (first non-flag argument)
  const baseUrl = args.find((a) => !a.startsWith("--"));
  if (!baseUrl) {
    console.error("Error: No site URL provided");
    process.exit(1);
  }

  // Validate URL
  try {
    new URL(baseUrl);
  } catch {
    console.error(`Error: Invalid URL: ${baseUrl}`);
    process.exit(1);
  }

  // Parse options
  const getOption = (name: string, defaultValue: number): number => {
    const arg = args.find((a) => a.startsWith(`--${name}=`));
    if (arg) {
      const value = parseInt(arg.split("=")[1], 10);
      if (!isNaN(value)) return value;
    }
    return defaultValue;
  };

  const getStringOption = (name: string): string | undefined => {
    const arg = args.find((a) => a.startsWith(`--${name}=`));
    if (arg) {
      return arg.split("=")[1];
    }
    return undefined;
  };

  const maxPages = getOption("max-pages", 50);
  const maxDepth = getOption("depth", 3);
  const delayMs = getOption("delay", 1000);
  const outputFile = getStringOption("output");
  const quiet = args.includes("--quiet");

  // Auth options
  const waAccountId = getStringOption("wa-account-id");
  const waApiKey = getStringOption("wa-api-key");
  const hasAuth = waAccountId && waApiKey;

  console.log("Wild Apricot Site Crawler");
  console.log("=".repeat(40));
  console.log(`Target: ${baseUrl}`);
  console.log(`Max pages: ${maxPages}, Max depth: ${maxDepth}, Delay: ${delayMs}ms`);
  if (hasAuth) {
    console.log(`Auth: Account ${waAccountId} (authenticated crawl)`);
  } else {
    console.log("Auth: None (public pages only)");
  }
  console.log("");

  try {
    const report = await crawlSite({
      baseUrl,
      maxPages,
      maxDepth,
      delayMs,
      waAccountId,
      waApiKey,
    });

    // Print report
    if (!quiet) {
      printReport(report);
    } else {
      console.log("\n--- SUMMARY ---");
      console.log(`Pages crawled: ${report.pagesCrawled}`);
      console.log(`Custom HTML blocks: ${report.summary.totalCustomHtmlBlocks}`);
      console.log(`Embeds: ${report.summary.totalEmbeds}`);
      console.log(`  Allowlisted: ${report.summary.embedsByClassification["allowlisted"] || 0}`);
      console.log(`  Manual: ${report.summary.embedsByClassification["manual"] || 0}`);
      console.log(`  Unsupported: ${report.summary.embedsByClassification["unsupported"] || 0}`);
      console.log(`Scripts: ${report.summary.scriptsDetected}`);
      console.log(`Forms: ${report.summary.formsDetected}`);
    }

    // Save to file if requested
    if (outputFile) {
      const outputPath = path.resolve(outputFile);
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
      console.log(`\nReport saved to: ${outputPath}`);
    }

    // Migration readiness assessment
    console.log("\n" + "=".repeat(60));
    console.log("MIGRATION READINESS ASSESSMENT");
    console.log("=".repeat(60));

    const autoCount = report.summary.embedsByClassification["allowlisted"] || 0;
    const manualCount = report.summary.embedsByClassification["manual"] || 0;
    const unsupportedCount = report.summary.embedsByClassification["unsupported"] || 0;
    const totalEmbeds = autoCount + manualCount + unsupportedCount;

    console.log("\nContent that can AUTO-migrate:");
    console.log(`  - Static HTML pages: ${report.pagesCrawled}`);
    console.log(`  - Allowlisted embeds (YouTube, Google Maps, etc.): ${autoCount}`);

    console.log("\nContent requiring MANUAL review:");
    console.log(`  - Custom HTML blocks: ${report.summary.totalCustomHtmlBlocks}`);
    console.log(`  - Non-allowlisted embeds: ${manualCount}`);
    console.log(`  - External images to re-upload: ${report.summary.externalImages}`);

    console.log("\nContent that CANNOT migrate:");
    console.log(`  - Scripts/tracking pixels: ${report.summary.scriptsDetected}`);
    console.log(`  - Unsupported embeds: ${unsupportedCount}`);

    const autoPercentage = totalEmbeds > 0 ? Math.round((autoCount / totalEmbeds) * 100) : 100;
    console.log(`\nEmbed migration coverage: ${autoPercentage}% automatic`);

    if (report.summary.scriptsDetected > 0) {
      console.log("\n⚠️  Scripts detected - will need native ClubOS alternatives");
    }

    if (report.errors.length > 0) {
      console.log(`\n⚠️  ${report.errors.length} pages had errors during crawl`);
    }

    process.exit(0);
  } catch (err) {
    console.error("Crawl failed:", err);
    process.exit(1);
  }
}

main();
