#!/usr/bin/env npx tsx
/**
 * Test the HTML-to-blocks converter with crawl data.
 */

import * as fs from "fs";
import { convertCrawledPage, convertCustomHtmlBlocks, WA_WIDGET_MAP } from "../../src/lib/migration/html-to-blocks";

const reportPath = process.argv[2] || "scripts/migration/reports/bedford-crawl-report.json";

console.log("HTML-to-Blocks Converter Test");
console.log("=".repeat(50));
console.log(`Loading: ${reportPath}\n`);

const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));

// Test with first content page (skip home duplicates)
const testPage = report.pages.find(
  (p: { url: string }) => !p.url.endsWith("/") && !p.url.includes("Sys/")
) || report.pages[0];

console.log(`Testing page: ${testPage.url}`);
console.log(`Title: ${testPage.title}`);
console.log(`Custom HTML blocks: ${testPage.customHtml.length}`);
console.log("");

// Show WA widgets detected
console.log("--- WA WIDGETS DETECTED ---");
for (const block of testPage.customHtml) {
  for (const [waType] of Object.entries(WA_WIDGET_MAP)) {
    if (block.location.includes(waType)) {
      const mapping = WA_WIDGET_MAP[waType];
      console.log(`  ${waType} -> ${mapping.murmurantType} (${mapping.description})`);
    }
  }
}
console.log("");

// Convert the page
console.log("--- CONVERSION RESULT ---");
const result = convertCustomHtmlBlocks(testPage.customHtml);

console.log(`Blocks created: ${result.blocks.length}`);
console.log(`Warnings: ${result.warnings.length}`);
console.log(`Widgets mapped: ${result.widgetMapping.length}`);
console.log("");

// Show widget mappings
if (result.widgetMapping.length > 0) {
  console.log("--- WIDGET MAPPINGS ---");
  for (const mapping of result.widgetMapping) {
    console.log(`  Position ${mapping.position}: ${mapping.waType} -> ${mapping.murmurantType}`);
  }
  console.log("");
}

// Show first few blocks
console.log("--- SAMPLE BLOCKS ---");
for (const block of result.blocks.slice(0, 8)) {
  const data = block.data as Record<string, unknown>;
  let preview = "";

  if (block.type === "heading") {
    preview = `"${(data.text as string)?.substring(0, 50)}..."`;
  } else if (block.type === "text") {
    preview = `"${(data.content as string)?.substring(0, 50)}..."`;
  } else if (block.type === "image") {
    preview = data.src as string;
  } else if (block.type === "placeholder") {
    preview = `[${data.widgetType}]`;
  } else if (block.type === "html") {
    preview = "(raw HTML)";
  }

  console.log(`  ${block.type}: ${preview}`);
}

// Show warnings
if (result.warnings.length > 0) {
  console.log("\n--- WARNINGS ---");
  for (const warning of result.warnings.slice(0, 5)) {
    console.log(`  ${warning.type}: ${warning.message}`);
  }
}

// Summary
console.log("\n" + "=".repeat(50));
console.log("CONVERSION SUMMARY");
console.log("=".repeat(50));
console.log(`Total elements processed: ${result.stats.totalElements}`);
console.log(`Blocks created: ${result.stats.convertedBlocks}`);
console.log(`Elements skipped: ${result.stats.skippedElements}`);
console.log(`Warnings generated: ${result.stats.warnings}`);
