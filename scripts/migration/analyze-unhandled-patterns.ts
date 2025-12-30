/**
 * Analyze crawl reports to find unhandled patterns
 *
 * Usage: npx tsx scripts/migration/analyze-unhandled-patterns.ts
 */

import * as fs from "fs";
import * as path from "path";
import { analyzeHtmlPatterns } from "../../src/lib/migration/html-pattern-analyzer";

const REPORTS_DIR = path.join(__dirname, "reports");

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

interface PatternStats {
  count: number;
  samples: string[];
  locations: string[];
}

function analyzeReport(reportPath: string) {
  console.log("\n" + "=".repeat(80));
  console.log(`Analyzing: ${path.basename(reportPath)}`);
  console.log("=".repeat(80));

  const report: CrawlReport = JSON.parse(fs.readFileSync(reportPath, "utf-8"));

  // Track unhandled content
  const unhandledPatterns: Map<string, PatternStats> = new Map();
  const waGadgets: Map<string, PatternStats> = new Map();
  const externalResources: Map<string, number> = new Map();
  const forms: string[] = [];
  const iframes: string[] = [];

  for (const page of report.pages) {
    if (!page.customHtml) continue;

    for (const block of page.customHtml) {
      const html = block.htmlSnippet;
      const location = block.location;

      // Extract WA gadget type from location class
      const gadgetMatch = location.match(/WaGadget(\w+)/);
      if (gadgetMatch) {
        const gadgetType = gadgetMatch[1];
        if (!waGadgets.has(gadgetType)) {
          waGadgets.set(gadgetType, { count: 0, samples: [], locations: [] });
        }
        const stats = waGadgets.get(gadgetType)!;
        stats.count++;
        if (stats.samples.length < 2) {
          stats.samples.push(html.substring(0, 300));
        }
        stats.locations.push(page.url);
      }

      // Check for forms
      if (block.containsForm) {
        forms.push(`${page.url}: ${html.substring(0, 100)}`);
      }

      // Check for iframes
      if (block.containsIframe) {
        iframes.push(`${page.url}: ${html.substring(0, 200)}`);
      }

      // Track external resources
      for (const url of block.externalUrls) {
        try {
          const domain = new URL(url).hostname;
          externalResources.set(domain, (externalResources.get(domain) || 0) + 1);
        } catch {
          // ignore invalid URLs
        }
      }

      // Run pattern detection
      const patterns = analyzeHtmlPatterns(html);

      // If no patterns detected or only "unknown", analyze what we're missing
      if (patterns.length === 0 || patterns.every(p => p.pattern === "unknown")) {
        // Try to categorize what this content is
        const category = categorizeUnhandled(html);
        if (!unhandledPatterns.has(category)) {
          unhandledPatterns.set(category, { count: 0, samples: [], locations: [] });
        }
        const stats = unhandledPatterns.get(category)!;
        stats.count++;
        if (stats.samples.length < 3) {
          stats.samples.push(html.substring(0, 400));
        }
        stats.locations.push(location);
      }
    }
  }

  // Print WA Gadgets found
  console.log("\n📦 WA GADGET TYPES FOUND");
  console.log("-".repeat(40));
  const sortedGadgets = [...waGadgets.entries()].sort((a, b) => b[1].count - a[1].count);
  for (const [type, stats] of sortedGadgets) {
    console.log(`  ${type}: ${stats.count} occurrences`);
  }

  // Print unhandled patterns
  console.log("\n❓ UNHANDLED CONTENT CATEGORIES");
  console.log("-".repeat(40));
  const sortedUnhandled = [...unhandledPatterns.entries()].sort((a, b) => b[1].count - a[1].count);
  for (const [category, stats] of sortedUnhandled) {
    console.log(`\n  ${category}: ${stats.count} occurrences`);
    if (stats.samples.length > 0) {
      console.log(`    Sample: ${stats.samples[0].substring(0, 150).replace(/\n/g, " ")}...`);
    }
  }

  // Print forms
  if (forms.length > 0) {
    console.log("\n📝 FORMS FOUND");
    console.log("-".repeat(40));
    console.log(`  ${forms.length} form(s) detected`);
    forms.slice(0, 3).forEach(f => console.log(`    ${f.substring(0, 100)}...`));
  }

  // Print iframes
  if (iframes.length > 0) {
    console.log("\n🖼️ IFRAMES FOUND");
    console.log("-".repeat(40));
    iframes.slice(0, 5).forEach(f => console.log(`    ${f.substring(0, 150)}...`));
  }

  // Print external resources
  if (externalResources.size > 0) {
    console.log("\n🌐 EXTERNAL RESOURCES");
    console.log("-".repeat(40));
    const sorted = [...externalResources.entries()].sort((a, b) => b[1] - a[1]);
    sorted.slice(0, 10).forEach(([domain, count]) => {
      console.log(`    ${domain}: ${count}`);
    });
  }

  return { waGadgets, unhandledPatterns, forms, iframes, externalResources };
}

function categorizeUnhandled(html: string): string {
  // Navigation/Menu
  if (/menuBackground|menuHorizontal|menuItem/i.test(html)) {
    return "navigation-menu";
  }

  // Login/Auth
  if (/loginContainer|loginLink|loginPanel/i.test(html)) {
    return "login-widget";
  }

  // Search
  if (/searchBox|searchField|generalSearchBox/i.test(html)) {
    return "search-widget";
  }

  // Mobile panel
  if (/mobilePanel|mobilePanelButton/i.test(html)) {
    return "mobile-panel";
  }

  // Photo album/gallery
  if (/photoAlbum|albumThumbnail|photoGallery/i.test(html)) {
    return "photo-album";
  }

  // Event list/calendar
  if (/eventList|upcomingEvents|eventCalendar|eventItem/i.test(html)) {
    return "event-list";
  }

  // Member directory
  if (/memberDirectory|memberList|memberProfile/i.test(html)) {
    return "member-directory";
  }

  // Blog/news
  if (/blogPost|newsItem|articleList/i.test(html)) {
    return "blog-post";
  }

  // Donation/payment
  if (/donationForm|paymentForm|contribution/i.test(html)) {
    return "donation-form";
  }

  // Forum/discussion
  if (/forumThread|discussionPost|messageBoard/i.test(html)) {
    return "forum";
  }

  // File/document list
  if (/fileList|documentLibrary|downloadList/i.test(html)) {
    return "document-list";
  }

  // Sidebar/widget area
  if (/sidebarWidget|widgetArea/i.test(html)) {
    return "sidebar-widget";
  }

  // Footer
  if (/footerContent|copyrightText|footerLinks/i.test(html)) {
    return "footer";
  }

  // Header/logo area
  if (/<img[^>]*logo/i.test(html) || /headerLogo|siteLogo/i.test(html)) {
    return "logo-header";
  }

  // Simple image (single)
  if (/<img[^>]*>/i.test(html) && !/<img[^>]*>[\s\S]*<img/i.test(html)) {
    return "single-image";
  }

  // Simple paragraph/text
  if (/^<p[^>]*>[\s\S]*<\/p>$/i.test(html.trim()) && html.length < 500) {
    return "simple-paragraph";
  }

  // Headline/heading
  if (/^<(h[1-6])[^>]*>[\s\S]*<\/\1>$/i.test(html.trim())) {
    return "simple-heading";
  }

  // Link list
  if ((html.match(/<a /gi) || []).length >= 3) {
    return "link-list";
  }

  // Styled content (font tags, inline styles)
  if (/<font|style\s*=/i.test(html)) {
    return "styled-content";
  }

  // Table
  if (/<table/i.test(html)) {
    return "data-table";
  }

  // List (ul/ol)
  if (/<[uo]l/i.test(html)) {
    return "list-content";
  }

  // Empty/spacer
  if (html.replace(/<[^>]+>/g, "").trim().length < 10) {
    return "empty-spacer";
  }

  return "other-content";
}

// Run analysis
const reports = fs.readdirSync(REPORTS_DIR).filter((f) => f.endsWith(".json"));
const allGadgets: Map<string, number> = new Map();
const allUnhandled: Map<string, number> = new Map();

for (const report of reports) {
  const result = analyzeReport(path.join(REPORTS_DIR, report));

  // Aggregate
  for (const [type, stats] of result.waGadgets) {
    allGadgets.set(type, (allGadgets.get(type) || 0) + stats.count);
  }
  for (const [type, stats] of result.unhandledPatterns) {
    allUnhandled.set(type, (allUnhandled.get(type) || 0) + stats.count);
  }
}

// Summary
console.log("\n" + "=".repeat(80));
console.log("AGGREGATE SUMMARY");
console.log("=".repeat(80));

console.log("\n📊 ALL WA GADGET TYPES (priority for widget mapping):");
[...allGadgets.entries()]
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });

console.log("\n📊 ALL UNHANDLED CATEGORIES (priority for pattern detection):");
[...allUnhandled.entries()]
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
