/**
 * HTML to Blocks Converter
 *
 * Converts Wild Apricot HTML content into Murmurant block format.
 * Handles common patterns: headings, paragraphs, images, lists, embeds.
 * Maps WA system widgets to native Murmurant equivalents.
 *
 * Charter: P4 (no hidden rules), P6 (human-first UI)
 */

import { type BaseBlock } from "@/lib/blocks/types";

// ============================================================================
// WA Widget to Murmurant Widget Mapping
// ============================================================================

/**
 * Maps Wild Apricot gadget types to Murmurant native widgets.
 * WA uses class names like "WaGadgetEventCalendar", "WaGadgetMembershipLevelsList", etc.
 */
export const WA_WIDGET_MAP: Record<string, {
  murmurantType: string;
  description: string;
  autoReplace: boolean;
}> = {
  // Calendar & Events
  "WaGadgetEventCalendar": {
    murmurantType: "interactive-calendar",
    description: "Event calendar widget",
    autoReplace: true,
  },
  "WaGadgetEventsList": {
    murmurantType: "events-list",
    description: "Upcoming events list",
    autoReplace: true,
  },
  "WaGadgetEventRegistration": {
    murmurantType: "event-registration",
    description: "Event registration form",
    autoReplace: true,
  },

  // Membership
  "WaGadgetMembershipLevelsList": {
    murmurantType: "membership-levels",
    description: "Membership tiers display",
    autoReplace: true,
  },
  "WaGadgetMembershipApplication": {
    murmurantType: "membership-application",
    description: "Membership application form",
    autoReplace: true,
  },
  "WaGadgetMemberDirectory": {
    murmurantType: "member-directory",
    description: "Member directory/search",
    autoReplace: true,
  },
  "WaGadgetMemberProfile": {
    murmurantType: "member-profile",
    description: "Member profile widget",
    autoReplace: true,
  },

  // Donations & Store
  "WaGadgetDonationForm": {
    murmurantType: "donation-form",
    description: "Donation form",
    autoReplace: true,
  },
  "WaGadgetProductsList": {
    murmurantType: "store-products",
    description: "Store products list",
    autoReplace: true,
  },
  "WaGadgetShoppingCart": {
    murmurantType: "shopping-cart",
    description: "Shopping cart widget",
    autoReplace: true,
  },

  // Content
  "WaGadgetBlogPostsList": {
    murmurantType: "blog-posts",
    description: "Blog posts list",
    autoReplace: true,
  },
  "WaGadgetPhotoAlbum": {
    murmurantType: "gallery",
    description: "Photo gallery",
    autoReplace: true,
  },
  "WaGadgetContactForm": {
    murmurantType: "contact-form",
    description: "Contact form",
    autoReplace: true,
  },

  // Navigation (skip these - handled by layout)
  "WaGadgetLoginForm": {
    murmurantType: "skip",
    description: "Login form - handled by auth system",
    autoReplace: false,
  },
  "WaGadgetMenuHorizontal": {
    murmurantType: "skip",
    description: "Navigation menu - handled by layout",
    autoReplace: false,
  },
  "WaGadgetMenuVertical": {
    murmurantType: "skip",
    description: "Sidebar menu - handled by layout",
    autoReplace: false,
  },
  "WaGadgetMobilePanel": {
    murmurantType: "skip",
    description: "Mobile menu - handled by layout",
    autoReplace: false,
  },
  "WaGadgetFooter": {
    murmurantType: "skip",
    description: "Footer - handled by layout",
    autoReplace: false,
  },
  "WaGadgetBreadcrumb": {
    murmurantType: "breadcrumb",
    description: "Breadcrumb navigation",
    autoReplace: true,
  },

  // Social & Sharing
  "WaGadgetSocialSharing": {
    murmurantType: "social-share",
    description: "Social sharing buttons",
    autoReplace: true,
  },
  "WaGadgetSocialFollow": {
    murmurantType: "social-follow",
    description: "Social follow links",
    autoReplace: true,
  },

  // Search
  "WaGadgetSearch": {
    murmurantType: "search",
    description: "Site search widget",
    autoReplace: true,
  },
};

/**
 * Detect WA widget type from location class string.
 */
export function detectWaWidget(location: string): {
  widgetType: string | null;
  mapping: typeof WA_WIDGET_MAP[string] | null;
} {
  for (const [waType, mapping] of Object.entries(WA_WIDGET_MAP)) {
    if (location.includes(waType)) {
      return { widgetType: waType, mapping };
    }
  }
  return { widgetType: null, mapping: null };
}

/**
 * Create a Murmurant widget block from WA widget type.
 */
function createWidgetBlock(murmurantType: string, waType: string): BaseBlock {
  return {
    id: createBlockId(),
    type: "placeholder", // Placeholder until native widget is implemented
    version: 1,
    data: {
      widgetType: murmurantType,
      sourceWidget: waType,
      message: `Native ${murmurantType} widget will render here`,
    },
    meta: {
      className: `widget-${murmurantType}`,
    },
  };
}

// ============================================================================
// Types
// ============================================================================

export interface ConversionResult {
  blocks: BaseBlock[];
  warnings: ConversionWarning[];
  stats: ConversionStats;
}

export interface ConversionWarning {
  type: "script" | "unsupported_embed" | "complex_html" | "external_resource";
  severity: "info" | "warning" | "error";
  message: string;
  recommendation: string;
  htmlSnippet?: string;
}

/**
 * Create a detailed warning with recommendation.
 */
function createWarning(
  type: ConversionWarning["type"],
  details: { snippet?: string; domain?: string; scriptType?: string }
): ConversionWarning {
  const warnings: Record<ConversionWarning["type"], {
    severity: ConversionWarning["severity"];
    message: string;
    recommendation: string;
  }> = {
    script: {
      severity: "warning",
      message: details.scriptType === "analytics"
        ? "Analytics/tracking script detected (e.g., Google Analytics, Facebook Pixel)"
        : details.scriptType === "jquery"
        ? "jQuery code detected - likely a carousel, slider, or interactive widget"
        : "JavaScript code detected that cannot be automatically migrated",
      recommendation: details.scriptType === "analytics"
        ? "Use Murmurant's built-in analytics instead. No action needed - tracking will be handled natively."
        : details.scriptType === "jquery"
        ? "Review if this creates a carousel/slider. Use native Murmurant carousel block instead."
        : "Review the functionality this script provides and use a native Murmurant feature if available.",
    },
    unsupported_embed: {
      severity: "error",
      message: `Embed from ${details.domain || "unknown source"} is not on the allowlist`,
      recommendation: `Contact support to request adding ${details.domain} to the embed allowlist, or replace with alternative content.`,
    },
    complex_html: {
      severity: "info",
      message: "Complex HTML structure preserved as raw block",
      recommendation: "Review this block in the editor. You may want to simplify it or convert to native blocks for better mobile responsiveness.",
    },
    external_resource: {
      severity: "info",
      message: `External resource detected: ${details.domain || "unknown"}`,
      recommendation: "External images and resources will continue to work, but consider re-uploading to Murmurant for better performance and reliability.",
    },
  };

  const info = warnings[type];
  return {
    type,
    severity: info.severity,
    message: info.message,
    recommendation: info.recommendation,
    htmlSnippet: details.snippet?.substring(0, 200),
  };
}

export interface ConversionStats {
  totalElements: number;
  convertedBlocks: number;
  skippedElements: number;
  warnings: number;
}

// ============================================================================
// Block Creation Helpers
// ============================================================================

function createBlockId(): string {
  return crypto.randomUUID();
}

function createHeadingBlock(level: number, text: string): BaseBlock {
  return {
    id: createBlockId(),
    type: "heading",
    version: 1,
    data: {
      level,
      text: decodeHtmlEntities(text.trim()),
    },
    meta: {},
  };
}

function createTextBlock(content: string): BaseBlock {
  return {
    id: createBlockId(),
    type: "text",
    version: 1,
    data: {
      content: decodeHtmlEntities(content.trim()),
    },
    meta: {},
  };
}

function createImageBlock(src: string, alt?: string): BaseBlock {
  return {
    id: createBlockId(),
    type: "image",
    version: 1,
    data: {
      src,
      alt: alt ? decodeHtmlEntities(alt) : "",
    },
    meta: {},
  };
}

function createListBlock(items: string[], ordered: boolean): BaseBlock {
  return {
    id: createBlockId(),
    type: "list",
    version: 1,
    data: {
      items: items.map((item) => decodeHtmlEntities(item.trim())),
      ordered,
    },
    meta: {},
  };
}

function createDividerBlock(): BaseBlock {
  return {
    id: createBlockId(),
    type: "divider",
    version: 1,
    data: {},
    meta: {},
  };
}

function createButtonBlock(text: string, href: string): BaseBlock {
  return {
    id: createBlockId(),
    type: "button",
    version: 1,
    data: {
      text: decodeHtmlEntities(text.trim()),
      href,
      variant: "primary",
    },
    meta: {},
  };
}

function createIframeBlock(src: string, width?: string, height?: string): BaseBlock {
  return {
    id: createBlockId(),
    type: "iframe",
    version: 1,
    data: {
      src,
      width: width || "100%",
      height: height || "400",
    },
    meta: {},
  };
}

function createHtmlBlock(html: string): BaseBlock {
  return {
    id: createBlockId(),
    type: "html",
    version: 1,
    data: {
      content: html,
      isLegacy: true,
    },
    meta: {},
  };
}

// ============================================================================
// HTML Parsing Helpers
// ============================================================================

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)));
}

function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTextContent(html: string): string {
  // Remove script and style tags first
  let clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "");

  // Replace block elements with newlines
  clean = clean
    .replace(/<\/(p|div|br|li|h[1-6])>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n");

  // Strip remaining tags
  clean = stripHtmlTags(clean);

  // Normalize whitespace
  clean = clean
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");

  return clean;
}

/**
 * Check if text content looks like JavaScript code and identify type.
 */
function detectScriptType(text: string): { isScript: boolean; scriptType?: string } {
  const trimmed = text.trim();

  // jQuery patterns
  if (/^jq\$\(|^\$\(|\.ready\(|\.click\(|\.on\(/.test(trimmed)) {
    return { isScript: true, scriptType: "jquery" };
  }

  // Analytics patterns
  if (/ga\(|gtag\(|fbq\(|_gaq|analytics|pixel/i.test(trimmed)) {
    return { isScript: true, scriptType: "analytics" };
  }

  // General script patterns
  const scriptPatterns = [
    /^function\s*\(/,    // function declaration
    /^var\s+\w+\s*=/,    // var declaration
    /^let\s+\w+\s*=/,    // let declaration
    /^const\s+\w+\s*=/,  // const declaration
    /^document\./,        // document manipulation
    /^window\./,          // window manipulation
    /\.addEventListener/, // event listeners
    /\.onclick\s*=/,      // inline event handlers
    /^if\s*\(/,          // if statement
    /^for\s*\(/,         // for loop
    /^while\s*\(/,       // while loop
  ];

  if (scriptPatterns.some((pattern) => pattern.test(trimmed))) {
    return { isScript: true, scriptType: "general" };
  }

  return { isScript: false };
}

// Keep old function for backwards compatibility
function looksLikeScript(text: string): boolean {
  return detectScriptType(text).isScript;
}

/**
 * Check if text looks like HTML markup that wasn't parsed.
 */
function looksLikeHtml(text: string): boolean {
  const htmlPatterns = [
    /^<[a-z]/i,           // starts with HTML tag
    /^&lt;[a-z]/i,        // escaped HTML tag
    /class=["']/,         // has class attribute
    /style=["']/,         // has style attribute
  ];

  return htmlPatterns.some((pattern) => pattern.test(text.trim()));
}

// ============================================================================
// Pattern Matchers
// ============================================================================

interface PatternMatch {
  type: string;
  block: BaseBlock | null;
  consumed: boolean;
  warning?: ConversionWarning;
}

function matchHeading(html: string): PatternMatch | null {
  const match = html.match(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/i);
  if (!match) return null;

  const level = parseInt(match[1], 10);
  const text = stripHtmlTags(match[2]);

  if (!text.trim()) return null;

  return {
    type: "heading",
    block: createHeadingBlock(level, text),
    consumed: true,
  };
}

function matchParagraph(html: string): PatternMatch | null {
  const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  if (!match) return null;

  const content = match[1].trim();
  if (!content) return null;

  // Check if it's just an image inside a paragraph
  const imgOnly = content.match(/^\s*<img[^>]+>\s*$/i);
  if (imgOnly) {
    const imgMatch = content.match(/<img[^>]*src=["']([^"']+)["'][^>]*(?:alt=["']([^"']*)["'])?/i);
    if (imgMatch) {
      return {
        type: "image",
        block: createImageBlock(imgMatch[1], imgMatch[2]),
        consumed: true,
      };
    }
  }

  // Check if it contains a link that looks like a button
  const buttonMatch = content.match(/<a[^>]*href=["']([^"']+)["'][^>]*class=["'][^"']*(?:btn|button)[^"']*["'][^>]*>([\s\S]*?)<\/a>/i);
  if (buttonMatch) {
    const text = stripHtmlTags(buttonMatch[2]);
    if (text) {
      return {
        type: "button",
        block: createButtonBlock(text, buttonMatch[1]),
        consumed: true,
      };
    }
  }

  // Regular paragraph
  const text = extractTextContent(content);
  if (!text) return null;

  return {
    type: "text",
    block: createTextBlock(text),
    consumed: true,
  };
}

function matchImage(html: string): PatternMatch | null {
  const match = html.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/i);
  if (!match) return null;

  const src = match[1];
  const altMatch = html.match(/alt=["']([^"']*)["']/i);
  const alt = altMatch ? altMatch[1] : undefined;

  return {
    type: "image",
    block: createImageBlock(src, alt),
    consumed: true,
  };
}

function matchList(html: string): PatternMatch | null {
  const ulMatch = html.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i);
  const olMatch = html.match(/<ol[^>]*>([\s\S]*?)<\/ol>/i);

  const match = ulMatch || olMatch;
  if (!match) return null;

  const ordered = !!olMatch;
  const listContent = match[1];

  const items: string[] = [];
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  let liMatch;
  while ((liMatch = liRegex.exec(listContent)) !== null) {
    const text = stripHtmlTags(liMatch[1]).trim();
    if (text) items.push(text);
  }

  if (items.length === 0) return null;

  return {
    type: "list",
    block: createListBlock(items, ordered),
    consumed: true,
  };
}

function matchDivider(html: string): PatternMatch | null {
  if (/<hr\s*\/?>/i.test(html)) {
    return {
      type: "divider",
      block: createDividerBlock(),
      consumed: true,
    };
  }
  return null;
}

function matchIframe(html: string): PatternMatch | null {
  const match = html.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*>/i);
  if (!match) return null;

  const src = match[1];
  const widthMatch = html.match(/width=["']([^"']+)["']/i);
  const heightMatch = html.match(/height=["']([^"']+)["']/i);

  // Check if it's an allowlisted embed source
  const allowlistedDomains = [
    "youtube.com",
    "youtube-nocookie.com",
    "youtu.be",
    "vimeo.com",
    "player.vimeo.com",
    "google.com/maps",
    "maps.google.com",
    "open.spotify.com",
    "soundcloud.com",
    "codepen.io",
  ];

  const isAllowlisted = allowlistedDomains.some((domain) => src.includes(domain));

  if (isAllowlisted) {
    return {
      type: "iframe",
      block: createIframeBlock(src, widthMatch?.[1], heightMatch?.[1]),
      consumed: true,
    };
  }

  // Non-allowlisted iframe - create with warning
  return {
    type: "iframe",
    block: createIframeBlock(src, widthMatch?.[1], heightMatch?.[1]),
    consumed: true,
    warning: {
      type: "unsupported_embed",
      severity: "warning",
      message: `Iframe from ${new URL(src).hostname} may not be supported`,
      recommendation: "Verify this embed works correctly after migration. Consider using a native Murmurant widget if available.",
      htmlSnippet: html.substring(0, 200),
    },
  };
}

function matchScript(html: string): PatternMatch | null {
  if (/<script/i.test(html)) {
    // Try to identify the script type
    let scriptType = "general";
    if (/google-analytics|gtag|ga\(/i.test(html)) {
      scriptType = "analytics";
    } else if (/fbq\(|facebook/i.test(html)) {
      scriptType = "analytics";
    } else if (/jquery|jq\$/i.test(html)) {
      scriptType = "jquery";
    }

    return {
      type: "script",
      block: null,
      consumed: true,
      warning: createWarning("script", {
        snippet: html,
        scriptType,
      }),
    };
  }
  return null;
}

// ============================================================================
// Main Converter
// ============================================================================

/**
 * Convert a single HTML snippet to blocks.
 */
export function convertHtmlSnippet(html: string): ConversionResult {
  const blocks: BaseBlock[] = [];
  const warnings: ConversionWarning[] = [];
  let totalElements = 0;
  let skippedElements = 0;

  // Clean up the HTML
  let remaining = html.trim();

  // Remove WA wrapper divs
  remaining = remaining.replace(
    /<div[^>]*class=["'][^"']*(?:gadgetStyleBody|gadgetContentEditableArea)[^"']*["'][^>]*>/gi,
    ""
  );
  remaining = remaining.replace(/<\/div>\s*$/gi, "");

  // Check for scripts first
  const scriptMatch = matchScript(remaining);
  if (scriptMatch?.warning) {
    warnings.push(scriptMatch.warning);
  }

  // Remove script tags
  remaining = remaining.replace(/<script[\s\S]*?<\/script>/gi, "");

  // Try to match patterns in order of specificity
  const matchers = [
    matchHeading,
    matchIframe,
    matchList,
    matchImage,
    matchParagraph,
    matchDivider,
  ];

  // Split by major block elements
  const blockElements = remaining.split(/(?=<(?:h[1-6]|p|ul|ol|div|hr|iframe)[^>]*>)/gi);

  for (const element of blockElements) {
    if (!element.trim()) continue;

    totalElements++;
    let matched = false;

    for (const matcher of matchers) {
      const result = matcher(element);
      if (result) {
        if (result.block) {
          blocks.push(result.block);
        }
        if (result.warning) {
          warnings.push(result.warning);
        }
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Check if there's meaningful text content
      const textContent = extractTextContent(element);
      if (textContent && textContent.length > 10) {
        // Skip if it looks like script code
        const scriptCheck = detectScriptType(textContent);
        if (scriptCheck.isScript) {
          warnings.push(createWarning("script", {
            snippet: textContent,
            scriptType: scriptCheck.scriptType,
          }));
          skippedElements++;
          continue;
        }
        // Skip if it looks like unparsed HTML
        if (looksLikeHtml(textContent)) {
          blocks.push(createHtmlBlock(element));
          warnings.push(createWarning("complex_html", {
            snippet: element,
          }));
          continue;
        }
        // Create a text block for clean content
        blocks.push(createTextBlock(textContent));
      } else if (element.trim().length > 50) {
        // Complex HTML that couldn't be parsed - keep as HTML block
        blocks.push(createHtmlBlock(element));
        warnings.push(createWarning("complex_html", {
          snippet: element,
        }));
        skippedElements++;
      }
    }
  }

  return {
    blocks,
    warnings,
    stats: {
      totalElements,
      convertedBlocks: blocks.length,
      skippedElements,
      warnings: warnings.length,
    },
  };
}

/**
 * Convert an array of WA custom HTML blocks to Murmurant blocks.
 * Detects WA widgets and maps them to native Murmurant equivalents.
 */
export function convertCustomHtmlBlocks(
  customHtmlBlocks: Array<{ htmlSnippet: string; location: string }>
): ConversionResult & { widgetMapping: Array<{ waType: string; murmurantType: string; position: number }> } {
  const allBlocks: BaseBlock[] = [];
  const allWarnings: ConversionWarning[] = [];
  const widgetMapping: Array<{ waType: string; murmurantType: string; position: number }> = [];
  let totalElements = 0;
  let skippedElements = 0;

  for (const block of customHtmlBlocks) {
    // Check if this is a WA system widget
    const { widgetType, mapping } = detectWaWidget(block.location);

    if (widgetType && mapping) {
      if (mapping.murmurantType === "skip") {
        // Skip navigation/layout widgets
        skippedElements++;
        continue;
      }

      if (mapping.autoReplace) {
        // Create a native widget placeholder
        const widgetBlock = createWidgetBlock(mapping.murmurantType, widgetType);
        allBlocks.push(widgetBlock);
        widgetMapping.push({
          waType: widgetType,
          murmurantType: mapping.murmurantType,
          position: allBlocks.length - 1,
        });
        totalElements++;
        continue;
      }
    }

    // Not a recognized widget - convert as HTML content
    const result = convertHtmlSnippet(block.htmlSnippet);
    allBlocks.push(...result.blocks);
    allWarnings.push(...result.warnings);
    totalElements += result.stats.totalElements;
    skippedElements += result.stats.skippedElements;
  }

  return {
    blocks: allBlocks,
    warnings: allWarnings,
    widgetMapping,
    stats: {
      totalElements,
      convertedBlocks: allBlocks.length,
      skippedElements,
      warnings: allWarnings.length,
    },
  };
}

/**
 * Convert a full page from crawl data to blocks.
 */
export function convertCrawledPage(page: {
  url: string;
  title: string;
  customHtml: Array<{ htmlSnippet: string; location: string }>;
  embeds: Array<{ src: string; width?: string; height?: string }>;
  images: Array<{ src: string; alt?: string; isExternal: boolean }>;
}): ConversionResult {
  // Start with title as heading
  const blocks: BaseBlock[] = [
    createHeadingBlock(1, page.title.replace(/^[^-]+ - /, "")), // Remove site prefix
  ];

  // Convert custom HTML blocks
  const htmlResult = convertCustomHtmlBlocks(page.customHtml);
  blocks.push(...htmlResult.blocks);

  // Add any embeds that weren't in HTML blocks
  for (const embed of page.embeds) {
    const alreadyIncluded = blocks.some(
      (b) => b.type === "iframe" && (b.data as { src?: string }).src === embed.src
    );
    if (!alreadyIncluded) {
      blocks.push(createIframeBlock(embed.src, embed.width, embed.height));
    }
  }

  return {
    blocks,
    warnings: htmlResult.warnings,
    stats: {
      totalElements: htmlResult.stats.totalElements + 1, // +1 for title
      convertedBlocks: blocks.length,
      skippedElements: htmlResult.stats.skippedElements,
      warnings: htmlResult.warnings.length,
    },
  };
}
