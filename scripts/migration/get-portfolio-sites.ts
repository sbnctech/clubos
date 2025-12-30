#!/usr/bin/env npx tsx
/**
 * Extract portfolio site links from nicasiodesign.com
 */

import { chromium } from "playwright";

async function main() {
  console.log("Launching browser...");
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log("Navigating to portfolio page...");
  await page.goto("https://nicasiodesign.com/portfolio/", {
    waitUntil: "networkidle",
    timeout: 30000,
  });

  console.log("Extracting links...");
  const links = await page.evaluate(() => {
    // Try multiple selectors for portfolio items
    const selectors = [
      ".portfolio-item a",
      ".project-link",
      ".portfolio-link",
      "a[href*='wildapricot']",
      "a[href*='.org']",
      ".elementor-portfolio-item a",
      ".gallery-item a",
      ".work-item a",
    ];

    const allLinks: { text: string; href: string }[] = [];

    for (const selector of selectors) {
      const items = document.querySelectorAll(selector);
      items.forEach((a) => {
        const anchor = a as HTMLAnchorElement;
        if (anchor.href) {
          allLinks.push({
            text: anchor.textContent?.trim() || "",
            href: anchor.href,
          });
        }
      });
    }

    // Dedupe by href
    const seen = new Set<string>();
    return allLinks.filter((l) => {
      if (seen.has(l.href)) return false;
      if (l.href.includes("nicasiodesign.com")) return false;
      seen.add(l.href);
      return true;
    });
  });

  console.log("\n=== Portfolio Sites Found ===\n");
  for (const link of links) {
    console.log(`${link.text || "(no text)"}`);
    console.log(`  ${link.href}`);
  }

  console.log(`\nTotal: ${links.length} external links`);

  await browser.close();
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
