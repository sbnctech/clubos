/**
 * Screenshot Capture for Migration Workbench
 *
 * Uses Playwright to capture screenshots of source WA sites
 * for side-by-side comparison with migrated content.
 *
 * This solves the cross-origin iframe issue - WA sites block
 * being loaded in iframes, so we capture screenshots during crawl.
 */

import { chromium, type Browser, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

export interface ScreenshotConfig {
  /** Base URL of the site */
  baseUrl: string;
  /** Output directory for screenshots */
  outputDir: string;
  /** Viewport width (default: 1280) */
  viewportWidth?: number;
  /** Viewport height (default: 800) */
  viewportHeight?: number;
  /** Whether to capture full page (default: false) */
  fullPage?: boolean;
  /** Delay after page load before screenshot (ms, default: 1000) */
  loadDelay?: number;
}

export interface PageScreenshot {
  url: string;
  path: string;
  filename: string;
  capturedAt: string;
  width: number;
  height: number;
  fullPage: boolean;
}

export interface ScreenshotReport {
  config: ScreenshotConfig;
  capturedAt: string;
  screenshots: PageScreenshot[];
  errors: Array<{ url: string; error: string }>;
}

/**
 * Generate a safe filename from a URL
 */
function urlToFilename(url: string, baseUrl: string): string {
  // Remove base URL and clean up
  let path = url.replace(baseUrl, "").replace(/^\//, "");

  // Handle empty path (homepage)
  if (!path || path === "/") {
    path = "index";
  }

  // Replace slashes and special chars
  path = path
    .replace(/\//g, "__")
    .replace(/[?&=]/g, "_")
    .replace(/[^a-zA-Z0-9_-]/g, "");

  // Limit length
  if (path.length > 100) {
    path = path.substring(0, 100);
  }

  return `${path}.png`;
}

/**
 * Capture screenshots of multiple pages
 */
export async function captureScreenshots(
  config: ScreenshotConfig,
  urls: string[]
): Promise<ScreenshotReport> {
  const viewportWidth = config.viewportWidth ?? 1280;
  const viewportHeight = config.viewportHeight ?? 800;
  const fullPage = config.fullPage ?? false;
  const loadDelay = config.loadDelay ?? 1000;

  // Ensure output directory exists
  if (!fs.existsSync(config.outputDir)) {
    fs.mkdirSync(config.outputDir, { recursive: true });
  }

  const screenshots: PageScreenshot[] = [];
  const errors: Array<{ url: string; error: string }> = [];

  let browser: Browser | null = null;

  try {
    console.log("Launching browser for screenshot capture...");
    browser = await chromium.launch({
      headless: true,
    });

    const context = await browser.newContext({
      viewport: { width: viewportWidth, height: viewportHeight },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    for (const url of urls) {
      console.log(`  Capturing: ${url}`);

      try {
        // Navigate to page
        await page.goto(url, {
          waitUntil: "networkidle",
          timeout: 30000,
        });

        // Wait for any lazy-loaded content
        await page.waitForTimeout(loadDelay);

        // Generate filename
        const filename = urlToFilename(url, config.baseUrl);
        const screenshotPath = path.join(config.outputDir, filename);

        // Capture screenshot
        await page.screenshot({
          path: screenshotPath,
          fullPage,
        });

        screenshots.push({
          url,
          path: screenshotPath,
          filename,
          capturedAt: new Date().toISOString(),
          width: viewportWidth,
          height: fullPage ? 0 : viewportHeight, // Full page has variable height
          fullPage,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`    Error: ${message}`);
        errors.push({ url, error: message });
      }
    }

    await browser.close();
    browser = null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }

  const report: ScreenshotReport = {
    config,
    capturedAt: new Date().toISOString(),
    screenshots,
    errors,
  };

  // Save report
  const reportPath = path.join(config.outputDir, "screenshot-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nScreenshot report saved to: ${reportPath}`);

  return report;
}

/**
 * Capture a single page screenshot
 */
export async function captureSingleScreenshot(
  url: string,
  outputPath: string,
  options?: {
    viewportWidth?: number;
    viewportHeight?: number;
    fullPage?: boolean;
    loadDelay?: number;
  }
): Promise<void> {
  const viewportWidth = options?.viewportWidth ?? 1280;
  const viewportHeight = options?.viewportHeight ?? 800;
  const fullPage = options?.fullPage ?? false;
  const loadDelay = options?.loadDelay ?? 1000;

  const browser = await chromium.launch({ headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: viewportWidth, height: viewportHeight },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });

    const page = await context.newPage();

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 30000,
    });

    await page.waitForTimeout(loadDelay);

    await page.screenshot({
      path: outputPath,
      fullPage,
    });
  } finally {
    await browser.close();
  }
}

/**
 * Capture comparison screenshots (viewport and full page)
 */
export async function captureComparisonSet(
  url: string,
  outputDir: string
): Promise<{
  viewport: string;
  fullPage: string;
  mobile: string;
}> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });

  try {
    // Desktop viewport
    const desktopContext = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    });
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await desktopPage.waitForTimeout(1000);

    const viewportPath = path.join(outputDir, "desktop-viewport.png");
    await desktopPage.screenshot({ path: viewportPath, fullPage: false });

    const fullPagePath = path.join(outputDir, "desktop-full.png");
    await desktopPage.screenshot({ path: fullPagePath, fullPage: true });

    await desktopContext.close();

    // Mobile viewport
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 }, // iPhone 14 size
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
      isMobile: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    await mobilePage.waitForTimeout(1000);

    const mobilePath = path.join(outputDir, "mobile.png");
    await mobilePage.screenshot({ path: mobilePath, fullPage: false });

    await mobileContext.close();

    return {
      viewport: viewportPath,
      fullPage: fullPagePath,
      mobile: mobilePath,
    };
  } finally {
    await browser.close();
  }
}
