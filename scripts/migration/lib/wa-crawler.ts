/**
 * Wild Apricot Site Crawler
 *
 * Crawls public WA pages to discover content structure, templates,
 * custom HTML blocks, embeds, and CSS styling.
 *
 * Uses native parsing (no cheerio dependency).
 */

import { extractWidgetConfig } from "../../../src/lib/migration/widget-config-extractor";

// Rate limiting
const DELAY_MS = 1000;
const MAX_PAGES = 50;

export interface CrawlConfig {
  baseUrl: string;
  maxDepth?: number;
  maxPages?: number;
  delayMs?: number;
  /** Wild Apricot account ID for authenticated crawl */
  waAccountId?: string;
  /** Wild Apricot API key for authenticated crawl */
  waApiKey?: string;
  /** Capture screenshots during crawl (requires Playwright) */
  captureScreenshots?: boolean;
  /** Output directory for screenshots */
  screenshotDir?: string;
}

export interface PageContent {
  url: string;
  title: string;
  depth: number;
  template?: string;
  sections: SectionInfo[];
  customHtml: CustomHtmlBlock[];
  embeds: EmbedInfo[];
  images: ImageInfo[];
  links: LinkInfo[];
  styles: StyleInfo;
  navigation: NavItem[];
  /** Path to screenshot file (if captured) */
  screenshotPath?: string;
  /** Screenshot filename only */
  screenshotFilename?: string;
}

export interface SectionInfo {
  id?: string;
  className?: string;
  tagName: string;
  textLength: number;
  hasCustomHtml: boolean;
}

export interface CustomHtmlBlock {
  location: string;
  htmlSnippet: string;
  containsScript: boolean;
  containsIframe: boolean;
  containsForm: boolean;
  externalUrls: string[];
  /** Extracted widget configuration (if this is a WA widget) */
  widgetConfig?: import("../../../src/lib/migration/widget-config-extractor").ExtractedWidgetConfig;
}

export interface EmbedInfo {
  type: "iframe" | "video" | "audio" | "object" | "embed";
  src: string;
  domain?: string;
  width?: string;
  height?: string;
  classification: "allowlisted" | "manual" | "unsupported";
}

export interface ImageInfo {
  src: string;
  alt?: string;
  isExternal: boolean;
}

export interface LinkInfo {
  href: string;
  text: string;
  isInternal: boolean;
  isNavigation: boolean;
}

export interface StyleInfo {
  inlineStyleCount: number;
  styleTagCount: number;
  externalStylesheets: string[];
  cssVariables: string[];
  primaryColors: string[];
  fontFamilies: string[];
}

export interface NavItem {
  text: string;
  href: string;
  level: number;
  children: NavItem[];
}

export interface CrawlReport {
  config: CrawlConfig;
  crawledAt: string;
  duration: number;
  pagesDiscovered: number;
  pagesCrawled: number;
  pages: PageContent[];
  summary: CrawlSummary;
  errors: CrawlError[];
}

export interface CrawlSummary {
  totalSections: number;
  totalCustomHtmlBlocks: number;
  totalEmbeds: number;
  embedsByClassification: Record<string, number>;
  embedsByDomain: Record<string, number>;
  totalImages: number;
  externalImages: number;
  uniqueTemplates: string[];
  externalStylesheets: string[];
  scriptsDetected: number;
  formsDetected: number;
  /** Number of screenshots captured */
  screenshotsCaptured: number;
}

export interface CrawlError {
  url: string;
  error: string;
  statusCode?: number;
}

// Allowlisted embed domains
const ALLOWLISTED_DOMAINS = [
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "vimeo.com",
  "player.vimeo.com",
  "google.com",
  "www.google.com",
  "maps.google.com",
  "calendar.google.com",
  "docs.google.com",
  "forms.google.com",
  "drive.google.com",
  "canva.com",
  "www.canva.com",
];

function classifyEmbed(src: string): "allowlisted" | "manual" | "unsupported" {
  if (!src) return "unsupported";

  try {
    const url = new URL(src);

    // Check tracking/analytics - unsupported
    if (
      src.includes("googletagmanager") ||
      src.includes("google-analytics") ||
      src.includes("fbevents") ||
      src.includes("pixel")
    ) {
      return "unsupported";
    }

    // Check allowlist
    if (ALLOWLISTED_DOMAINS.some((d) => url.hostname.includes(d))) {
      return "allowlisted";
    }

    return "manual";
  } catch {
    return "manual";
  }
}

function extractDomain(src: string): string | undefined {
  try {
    return new URL(src).hostname;
  } catch {
    return undefined;
  }
}

function extractAttribute(tag: string, attr: string): string | undefined {
  const regex = new RegExp(`${attr}=["']([^"']+)["']`, "i");
  const match = tag.match(regex);
  return match ? match[1] : undefined;
}

function extractAllMatches(html: string, regex: RegExp): string[] {
  const matches: string[] = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    matches.push(match[1] || match[0]);
  }
  return matches;
}

function extractColors(css: string): string[] {
  const colors: Set<string> = new Set();

  // Hex colors
  const hexMatches = css.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  hexMatches.forEach((c) => colors.add(c.toLowerCase()));

  // RGB/RGBA
  const rgbMatches = css.match(/rgba?\([^)]+\)/gi) || [];
  rgbMatches.forEach((c) => colors.add(c.toLowerCase()));

  // Named colors (common theme colors)
  const namedColors = [
    "navy",
    "blue",
    "teal",
    "green",
    "olive",
    "maroon",
    "red",
    "purple",
    "orange",
    "coral",
    "gold",
    "crimson",
    "indigo",
    "steelblue",
    "darkblue",
    "darkgreen",
    "darkorange",
    "darkred",
    "royalblue",
    "forestgreen",
  ];
  for (const named of namedColors) {
    const regex = new RegExp(`:\\s*${named}\\s*[;)]`, "gi");
    if (regex.test(css)) {
      colors.add(named);
    }
  }

  // Filter out common non-theme colors
  const nonThemeColors = new Set([
    "#000",
    "#000000",
    "#fff",
    "#ffffff",
    "#f0f0f0",
    "#f5f5f5",
    "#fafafa",
    "#333",
    "#333333",
    "#666",
    "#666666",
    "#999",
    "#999999",
    "#ccc",
    "#cccccc",
    "#ddd",
    "#dddddd",
    "#eee",
    "#eeeeee",
    "rgb(0, 0, 0)",
    "rgb(255, 255, 255)",
    "rgba(0, 0, 0, 0)",
    "rgba(0, 0, 0, 1)",
    "rgba(255, 255, 255, 0)",
    "rgba(255, 255, 255, 1)",
  ]);

  const filtered = Array.from(colors).filter((c) => !nonThemeColors.has(c));

  // Sort by frequency (colors that appear more often are likely theme colors)
  const colorCounts: Record<string, number> = {};
  for (const color of filtered) {
    const escapedColor = color.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = css.match(new RegExp(escapedColor, "gi")) || [];
    colorCounts[color] = matches.length;
  }

  return filtered
    .sort((a, b) => (colorCounts[b] || 0) - (colorCounts[a] || 0))
    .slice(0, 20);
}

function extractFonts(css: string): string[] {
  const fonts: Set<string> = new Set();
  const fontMatches = css.match(/font-family:\s*([^;]+)/gi) || [];
  fontMatches.forEach((match) => {
    const value = match.replace(/font-family:\s*/i, "").trim();
    fonts.add(value);
  });
  return Array.from(fonts);
}

function extractCssVariables(css: string): string[] {
  const vars: Set<string> = new Set();
  const varMatches = css.match(/--[\w-]+/g) || [];
  varMatches.forEach((v) => vars.add(v));
  return Array.from(vars);
}

interface FetchOptions {
  waAccountId?: string;
  waApiKey?: string;
}

async function fetchPage(
  url: string,
  options?: FetchOptions
): Promise<{ html: string; status: number }> {
  const headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (compatible; MurmurantMigrationBot/1.0)",
    Accept: "text/html,application/xhtml+xml",
  };

  // Add WA auth if credentials provided
  if (options?.waAccountId && options?.waApiKey) {
    // WA uses OAuth2 bearer token - the API key is the bearer token after OAuth exchange
    // For now we pass it as Authorization header; actual implementation would do OAuth flow
    headers["Authorization"] = `Bearer ${options.waApiKey}`;
  }

  const response = await fetch(url, {
    headers,
    redirect: "follow",
  });

  const html = await response.text();
  return { html, status: response.status };
}

function parsePage(html: string, url: string, depth: number, baseUrl: string): PageContent {
  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : url;

  // Detect WA template from body class
  let template: string | undefined;
  const bodyMatch = html.match(/<body[^>]*class=["']([^"']+)["']/i);
  if (bodyMatch) {
    const templateMatch = bodyMatch[1].match(/template-(\w+)/);
    if (templateMatch) {
      template = templateMatch[1];
    }
  }

  // Extract sections (main, article, section tags)
  const sections: SectionInfo[] = [];
  const sectionRegex = /<(main|article|section|div)[^>]*(?:class=["']([^"']*)["'])?[^>]*(?:id=["']([^"']*)["'])?[^>]*>/gi;
  let sectionMatch;
  while ((sectionMatch = sectionRegex.exec(html)) !== null) {
    const tag = sectionMatch[0];
    const tagName = sectionMatch[1].toLowerCase();
    const className = sectionMatch[2];
    const id = sectionMatch[3];

    // Only track meaningful sections
    if (className?.includes("content") || className?.includes("section") || id?.includes("content") || tagName === "main" || tagName === "article" || tagName === "section") {
      sections.push({
        id,
        className,
        tagName,
        textLength: 0, // Would need full parsing to calculate
        hasCustomHtml: tag.includes("gadget") || tag.includes("widget"),
      });
    }
  }

  // Extract custom HTML blocks (WA gadget patterns)
  const customHtml: CustomHtmlBlock[] = [];
  const gadgetRegex = /<div[^>]*class=["'][^"']*(?:contentGadget|WaGadgetContent|gadget|widget|custom-html)[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi;
  let gadgetMatch;
  while ((gadgetMatch = gadgetRegex.exec(html)) !== null) {
    const content = gadgetMatch[1];
    const externalUrls: string[] = [];

    // Find external URLs in the block
    const urlRegex = /(?:src|href)=["'](https?:\/\/[^"']+)["']/gi;
    let urlMatch;
    while ((urlMatch = urlRegex.exec(content)) !== null) {
      if (!urlMatch[1].includes(baseUrl)) {
        externalUrls.push(urlMatch[1]);
      }
    }

    const location = extractAttribute(gadgetMatch[0], "class") || "unknown";
    const htmlSnippet = content.substring(0, 500);

    // Extract widget configuration if this is a WA widget
    const widgetConfig = extractWidgetConfig(content, location) || undefined;

    customHtml.push({
      location,
      htmlSnippet,
      containsScript: /<script/i.test(content),
      containsIframe: /<iframe/i.test(content),
      containsForm: /<form/i.test(content),
      externalUrls,
      widgetConfig,
    });
  }

  // Extract embeds (iframes, videos, etc.)
  const embeds: EmbedInfo[] = [];
  const embedRegex = /<(iframe|video|audio|object|embed)[^>]*>/gi;
  let embedMatch;
  while ((embedMatch = embedRegex.exec(html)) !== null) {
    const tag = embedMatch[0];
    const type = embedMatch[1].toLowerCase() as EmbedInfo["type"];
    const src = extractAttribute(tag, "src") || extractAttribute(tag, "data") || "";

    embeds.push({
      type,
      src,
      domain: extractDomain(src),
      width: extractAttribute(tag, "width"),
      height: extractAttribute(tag, "height"),
      classification: classifyEmbed(src),
    });
  }

  // Extract images
  const images: ImageInfo[] = [];
  const imgRegex = /<img[^>]+>/gi;
  let imgMatch;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    const tag = imgMatch[0];
    const src = extractAttribute(tag, "src") || "";

    images.push({
      src,
      alt: extractAttribute(tag, "alt"),
      isExternal: src.startsWith("http") && !src.includes(baseUrl),
    });
  }

  // Extract links
  const links: LinkInfo[] = [];
  const seenHrefs = new Set<string>();
  // Match full anchor tag including content
  const linkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(html)) !== null) {
    const href = linkMatch[1];
    // Extract text from inner content, stripping HTML tags
    const innerHtml = linkMatch[2];
    const text = innerHtml
      .replace(/<[^>]+>/g, " ") // Remove HTML tags
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    if (seenHrefs.has(href)) continue;
    seenHrefs.add(href);

    const isInternal =
      href.startsWith("/") ||
      href.startsWith(baseUrl) ||
      (!href.startsWith("http") && !href.startsWith("mailto:") && !href.startsWith("tel:") && !href.startsWith("#"));

    // Check if link is in navigation context
    const linkIndex = linkMatch.index;
    const contextBefore = html.substring(Math.max(0, linkIndex - 200), linkIndex);
    const isNavigation = /(?:nav|menu|header|navigation)/i.test(contextBefore);

    links.push({
      href,
      text: text.substring(0, 100),
      isInternal,
      isNavigation,
    });
  }

  // Extract styles
  const externalStylesheets: string[] = [];
  const stylesheetRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["']/gi;
  let sheetMatch;
  while ((sheetMatch = stylesheetRegex.exec(html)) !== null) {
    externalStylesheets.push(sheetMatch[1]);
  }

  // Extract inline CSS from <style> tags
  let allCss = "";
  const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let styleMatch;
  let styleTagCount = 0;
  while ((styleMatch = styleRegex.exec(html)) !== null) {
    allCss += styleMatch[1];
    styleTagCount++;
  }

  // Extract inline style attributes (these contain actual theme colors)
  const inlineStyleRegex = /style=["']([^"']+)["']/gi;
  let inlineMatch;
  let inlineStyleCount = 0;
  while ((inlineMatch = inlineStyleRegex.exec(html)) !== null) {
    allCss += " " + inlineMatch[1];
    inlineStyleCount++;
  }

  // Extract colors from common WA class patterns (they often encode colors)
  const colorClassMatches = html.match(/class=["'][^"']*color[^"']*["']/gi) || [];
  for (const match of colorClassMatches) {
    // Extract hex-like patterns from class names (e.g., "color-1a2b3c")
    const hexInClass = match.match(/[0-9a-f]{6}/gi);
    if (hexInClass) {
      allCss += " color: #" + hexInClass[0] + ";";
    }
  }

  // Extract bgcolor attributes (legacy HTML)
  const bgcolorMatches = html.match(/bgcolor=["']([^"']+)["']/gi) || [];
  for (const match of bgcolorMatches) {
    const color = match.replace(/bgcolor=["']/i, "").replace(/["']$/, "");
    allCss += " background-color: " + color + ";";
  }

  const styles: StyleInfo = {
    inlineStyleCount,
    styleTagCount,
    externalStylesheets,
    cssVariables: extractCssVariables(allCss),
    primaryColors: extractColors(allCss),
    fontFamilies: extractFonts(allCss),
  };

  // Extract navigation (simplified)
  const navigation: NavItem[] = [];
  const navRegex = /<nav[^>]*>([\s\S]*?)<\/nav>/gi;
  let navMatch;
  while ((navMatch = navRegex.exec(html)) !== null) {
    const navContent = navMatch[1];
    const navLinkRegex = /<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)</gi;
    let navLinkMatch;
    while ((navLinkMatch = navLinkRegex.exec(navContent)) !== null) {
      navigation.push({
        text: navLinkMatch[2].trim(),
        href: navLinkMatch[1],
        level: 0,
        children: [],
      });
    }
  }

  return {
    url,
    title,
    depth,
    template,
    sections,
    customHtml,
    embeds,
    images,
    links,
    styles,
    navigation,
  };
}

function generateSummary(pages: PageContent[]): CrawlSummary {
  const embedsByClassification: Record<string, number> = {};
  const embedsByDomain: Record<string, number> = {};
  const allTemplates = new Set<string>();
  const allStylesheets = new Set<string>();

  let totalSections = 0;
  let totalCustomHtmlBlocks = 0;
  let totalEmbeds = 0;
  let totalImages = 0;
  let externalImages = 0;
  let scriptsDetected = 0;
  let formsDetected = 0;

  for (const page of pages) {
    totalSections += page.sections.length;
    totalCustomHtmlBlocks += page.customHtml.length;
    totalEmbeds += page.embeds.length;
    totalImages += page.images.length;
    externalImages += page.images.filter((i) => i.isExternal).length;

    for (const block of page.customHtml) {
      if (block.containsScript) scriptsDetected++;
      if (block.containsForm) formsDetected++;
    }

    for (const embed of page.embeds) {
      embedsByClassification[embed.classification] =
        (embedsByClassification[embed.classification] || 0) + 1;

      if (embed.domain) {
        embedsByDomain[embed.domain] = (embedsByDomain[embed.domain] || 0) + 1;
      }
    }

    if (page.template) {
      allTemplates.add(page.template);
    }

    for (const sheet of page.styles.externalStylesheets) {
      allStylesheets.add(sheet);
    }
  }

  // Count screenshots
  const screenshotsCaptured = pages.filter((p) => p.screenshotPath).length;

  return {
    totalSections,
    totalCustomHtmlBlocks,
    totalEmbeds,
    embedsByClassification,
    embedsByDomain,
    totalImages,
    externalImages,
    uniqueTemplates: Array.from(allTemplates),
    externalStylesheets: Array.from(allStylesheets),
    scriptsDetected,
    formsDetected,
    screenshotsCaptured,
  };
}

export async function crawlSite(config: CrawlConfig): Promise<CrawlReport> {
  const startTime = Date.now();
  const maxDepth = config.maxDepth ?? 3;
  const maxPages = config.maxPages ?? MAX_PAGES;
  const delayMs = config.delayMs ?? DELAY_MS;

  const baseUrl = config.baseUrl.replace(/\/$/, "");
  const visited = new Set<string>();
  const toVisit: Array<{ url: string; depth: number }> = [{ url: baseUrl, depth: 0 }];
  const pages: PageContent[] = [];
  const errors: CrawlError[] = [];

  // Auth options for fetch
  const fetchOptions: FetchOptions = {
    waAccountId: config.waAccountId,
    waApiKey: config.waApiKey,
  };

  console.log(`Starting crawl of ${baseUrl}`);
  console.log(`Max depth: ${maxDepth}, Max pages: ${maxPages}`);

  while (toVisit.length > 0 && pages.length < maxPages) {
    const { url, depth } = toVisit.shift()!;

    // Normalize URL
    let normalizedUrl = url;
    if (url.startsWith("/")) {
      normalizedUrl = baseUrl + url;
    }

    // Skip if already visited or external
    if (visited.has(normalizedUrl)) continue;
    if (!normalizedUrl.startsWith(baseUrl) && !normalizedUrl.startsWith("/")) continue;

    // Skip non-HTML resources
    if (/\.(jpg|jpeg|png|gif|svg|pdf|css|js|ico|woff|woff2|ttf|xml|json)$/i.test(normalizedUrl)) {
      continue;
    }

    visited.add(normalizedUrl);

    console.log(`[${pages.length + 1}/${maxPages}] Crawling: ${normalizedUrl} (depth ${depth})`);

    try {
      const { html, status } = await fetchPage(normalizedUrl, fetchOptions);

      if (status >= 400) {
        errors.push({ url: normalizedUrl, error: `HTTP ${status}`, statusCode: status });
        continue;
      }

      const page = parsePage(html, normalizedUrl, depth, baseUrl);
      pages.push(page);

      // Add internal links to queue if within depth limit
      if (depth < maxDepth) {
        for (const link of page.links) {
          if (link.isInternal && !visited.has(link.href)) {
            let nextUrl = link.href;
            if (nextUrl.startsWith("/")) {
              nextUrl = baseUrl + nextUrl;
            }
            if (!visited.has(nextUrl) && (nextUrl.startsWith(baseUrl) || nextUrl.startsWith("/"))) {
              toVisit.push({ url: nextUrl, depth: depth + 1 });
            }
          }
        }
      }

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      errors.push({ url: normalizedUrl, error: message });
      console.error(`Error crawling ${normalizedUrl}: ${message}`);
    }
  }

  const duration = Date.now() - startTime;

  console.log(`\nCrawl complete. ${pages.length} pages in ${(duration / 1000).toFixed(1)}s`);

  return {
    config,
    crawledAt: new Date().toISOString(),
    duration,
    pagesDiscovered: visited.size,
    pagesCrawled: pages.length,
    pages,
    summary: generateSummary(pages),
    errors,
  };
}

export function printReport(report: CrawlReport): void {
  console.log("\n" + "=".repeat(60));
  console.log("CRAWL REPORT");
  console.log("=".repeat(60));

  console.log(`\nSite: ${report.config.baseUrl}`);
  console.log(`Crawled: ${report.crawledAt}`);
  console.log(`Duration: ${(report.duration / 1000).toFixed(1)}s`);
  console.log(`Pages discovered: ${report.pagesDiscovered}`);
  console.log(`Pages crawled: ${report.pagesCrawled}`);

  console.log("\n--- SUMMARY ---");
  console.log(`Total sections: ${report.summary.totalSections}`);
  console.log(`Custom HTML blocks: ${report.summary.totalCustomHtmlBlocks}`);
  console.log(`Scripts detected: ${report.summary.scriptsDetected}`);
  console.log(`Forms detected: ${report.summary.formsDetected}`);

  console.log(`\nEmbeds: ${report.summary.totalEmbeds}`);
  for (const [classification, count] of Object.entries(report.summary.embedsByClassification)) {
    console.log(`  ${classification}: ${count}`);
  }

  if (Object.keys(report.summary.embedsByDomain).length > 0) {
    console.log("\nEmbed domains:");
    for (const [domain, count] of Object.entries(report.summary.embedsByDomain)) {
      console.log(`  ${domain}: ${count}`);
    }
  }

  console.log(`\nImages: ${report.summary.totalImages} (${report.summary.externalImages} external)`);

  if (report.summary.uniqueTemplates.length > 0) {
    console.log(`\nTemplates: ${report.summary.uniqueTemplates.join(", ")}`);
  }

  if (report.summary.externalStylesheets.length > 0) {
    console.log(`\nExternal stylesheets: ${report.summary.externalStylesheets.length}`);
    report.summary.externalStylesheets.slice(0, 5).forEach((s) => console.log(`  ${s}`));
  }

  if (report.errors.length > 0) {
    console.log(`\n--- ERRORS (${report.errors.length}) ---`);
    report.errors.slice(0, 10).forEach((e) => console.log(`  ${e.url}: ${e.error}`));
  }

  console.log("\n--- PAGE DETAILS ---");
  for (const page of report.pages.slice(0, 10)) {
    console.log(`\n${page.url}`);
    console.log(`  Title: ${page.title.substring(0, 60)}`);
    console.log(`  Sections: ${page.sections.length}, Embeds: ${page.embeds.length}, Images: ${page.images.length}`);
    if (page.customHtml.length > 0) {
      console.log(`  Custom HTML blocks: ${page.customHtml.length}`);
    }
    if (page.navigation.length > 0) {
      console.log(`  Nav items: ${page.navigation.length}`);
    }
  }

  if (report.pages.length > 10) {
    console.log(`\n... and ${report.pages.length - 10} more pages`);
  }
}
