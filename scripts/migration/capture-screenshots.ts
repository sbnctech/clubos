#!/usr/bin/env npx tsx
/**
 * Screenshot Capture for Migration Workbench
 *
 * Captures screenshots of WA site pages for side-by-side comparison
 * with migrated Murmurant content.
 *
 * Usage:
 *   npx tsx scripts/migration/capture-screenshots.ts <site-url> [options]
 *   npx tsx scripts/migration/capture-screenshots.ts --from-report=<crawl-report.json>
 *
 * Examples:
 *   npx tsx scripts/migration/capture-screenshots.ts https://bedfordridinglanes.wildapricot.org
 *   npx tsx scripts/migration/capture-screenshots.ts --from-report=reports/bedford-crawl.json
 *   npx tsx scripts/migration/capture-screenshots.ts https://example.org --full-page --output=./shots
 */

import * as fs from "fs";
import * as path from "path";
import { captureScreenshots, captureComparisonSet } from "./lib/screenshot-capture";

interface CrawlReport {
  config: { baseUrl: string };
  pages: Array<{ url: string; title: string }>;
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "--help" || args[0] === "-h") {
    console.log(`
Screenshot Capture for Migration Workbench

Usage:
  npx tsx scripts/migration/capture-screenshots.ts <site-url> [options]
  npx tsx scripts/migration/capture-screenshots.ts --from-report=<crawl-report.json>

Options:
  --from-report=FILE  Use URLs from an existing crawl report JSON
  --output=DIR        Output directory for screenshots (default: ./screenshots/<site-slug>)
  --full-page         Capture full-page screenshots
  --viewport=WxH      Viewport size (default: 1280x800)
  --compare           Capture desktop, full-page, and mobile for each page
  --max=N             Maximum number of pages to capture (default: all)

Examples:
  # Capture homepage and follow internal links
  npx tsx scripts/migration/capture-screenshots.ts https://bedfordridinglanes.wildapricot.org

  # Use URLs from existing crawl report
  npx tsx scripts/migration/capture-screenshots.ts --from-report=reports/bedford-crawl.json

  # Capture comparison set (desktop, full-page, mobile)
  npx tsx scripts/migration/capture-screenshots.ts https://example.org/about --compare
    `);
    process.exit(0);
  }

  // Parse options
  const getStringOption = (name: string): string | undefined => {
    const arg = args.find((a) => a.startsWith(`--${name}=`));
    if (arg) {
      return arg.split("=").slice(1).join("="); // Handle = in value
    }
    return undefined;
  };

  const getNumberOption = (name: string, defaultValue: number): number => {
    const arg = args.find((a) => a.startsWith(`--${name}=`));
    if (arg) {
      const value = parseInt(arg.split("=")[1], 10);
      if (!isNaN(value)) return value;
    }
    return defaultValue;
  };

  const reportFile = getStringOption("from-report");
  const outputDir = getStringOption("output");
  const fullPage = args.includes("--full-page");
  const compare = args.includes("--compare");
  const maxPages = getNumberOption("max", 100);
  const viewportArg = getStringOption("viewport");

  let viewportWidth = 1280;
  let viewportHeight = 800;
  if (viewportArg) {
    const [w, h] = viewportArg.split("x").map((s) => parseInt(s, 10));
    if (!isNaN(w) && !isNaN(h)) {
      viewportWidth = w;
      viewportHeight = h;
    }
  }

  let urls: string[] = [];
  let baseUrl: string;

  if (reportFile) {
    // Load URLs from crawl report
    if (!fs.existsSync(reportFile)) {
      console.error(`Error: Report file not found: ${reportFile}`);
      process.exit(1);
    }

    const report: CrawlReport = JSON.parse(fs.readFileSync(reportFile, "utf-8"));
    baseUrl = report.config.baseUrl;
    urls = report.pages.slice(0, maxPages).map((p) => p.url);

    console.log(`Loaded ${urls.length} URLs from crawl report`);
  } else {
    // Use provided URL as starting point
    const url = args.find((a) => !a.startsWith("--"));
    if (!url) {
      console.error("Error: No URL provided");
      process.exit(1);
    }

    try {
      const parsedUrl = new URL(url);
      baseUrl = `${parsedUrl.protocol}//${parsedUrl.host}`;
    } catch {
      console.error(`Error: Invalid URL: ${url}`);
      process.exit(1);
    }

    urls = [url];
  }

  // Determine output directory
  let screenshotDir = outputDir;
  if (!screenshotDir) {
    const urlSlug = new URL(baseUrl).hostname.replace(/\./g, "-");
    screenshotDir = path.join(__dirname, "screenshots", urlSlug);
  }

  console.log("\nScreenshot Capture for Migration");
  console.log("=".repeat(40));
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Pages to capture: ${urls.length}`);
  console.log(`Output: ${screenshotDir}`);
  console.log(`Viewport: ${viewportWidth}x${viewportHeight}`);
  console.log(`Full page: ${fullPage}`);
  console.log(`Compare mode: ${compare}`);
  console.log("");

  try {
    if (compare && urls.length === 1) {
      // Capture comparison set for a single page
      console.log("Capturing comparison set...");
      const result = await captureComparisonSet(urls[0], screenshotDir);
      console.log("\nScreenshots captured:");
      console.log(`  Desktop viewport: ${result.viewport}`);
      console.log(`  Desktop full page: ${result.fullPage}`);
      console.log(`  Mobile: ${result.mobile}`);
    } else {
      // Capture screenshots for all URLs
      const report = await captureScreenshots(
        {
          baseUrl,
          outputDir: screenshotDir,
          viewportWidth,
          viewportHeight,
          fullPage,
        },
        urls
      );

      console.log("\n" + "=".repeat(40));
      console.log("CAPTURE SUMMARY");
      console.log("=".repeat(40));
      console.log(`Screenshots captured: ${report.screenshots.length}`);
      if (report.errors.length > 0) {
        console.log(`Errors: ${report.errors.length}`);
        report.errors.forEach((e) => console.log(`  ${e.url}: ${e.error}`));
      }
    }

    console.log(`\nScreenshots saved to: ${screenshotDir}`);
    process.exit(0);
  } catch (err) {
    console.error("Screenshot capture failed:", err);
    process.exit(1);
  }
}

main();
