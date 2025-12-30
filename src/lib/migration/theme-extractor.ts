/**
 * Theme Extractor
 *
 * Analyzes crawl reports to extract common styling patterns (colors, fonts)
 * and creates a theme configuration for the migrated site.
 *
 * Philosophy: Extract brand identity during migration, apply via theme tokens,
 * never store inline styles on individual blocks.
 *
 * Charter: P6 (human-first), P4 (no hidden rules)
 */

// ============================================================================
// Types
// ============================================================================

export interface ExtractedTheme {
  /** Primary brand color (most common non-black/white color) */
  primaryColor?: string;
  /** Secondary/accent color */
  accentColor?: string;
  /** All colors found with frequency */
  colors: ColorFrequency[];
  /** Primary heading font */
  headingFont?: string;
  /** Primary body font */
  bodyFont?: string;
  /** All fonts found with frequency */
  fonts: FontFrequency[];
  /** Button styles detected */
  buttonStyles: ButtonStyleInfo[];
  /** Confidence score 0-1 */
  confidence: number;
}

export interface ColorFrequency {
  color: string;
  normalizedColor: string;
  count: number;
  contexts: ("heading" | "text" | "background" | "link" | "button")[];
}

export interface FontFrequency {
  font: string;
  normalizedFont: string;
  count: number;
  contexts: ("heading" | "body")[];
}

export interface ButtonStyleInfo {
  waClass: string;
  count: number;
  suggestedVariant: "primary" | "secondary" | "outline" | "ghost";
}

// ============================================================================
// Color Utilities
// ============================================================================

/** Normalize color to hex format */
function normalizeColor(color: string): string | null {
  // Already hex
  if (/^#[0-9a-f]{6}$/i.test(color)) {
    return color.toLowerCase();
  }
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    // Expand shorthand
    const r = color[1];
    const g = color[2];
    const b = color[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  // RGB format
  const rgbMatch = color.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10).toString(16).padStart(2, "0");
    const g = parseInt(rgbMatch[2], 10).toString(16).padStart(2, "0");
    const b = parseInt(rgbMatch[3], 10).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`.toLowerCase();
  }

  // Named colors (common ones)
  const namedColors: Record<string, string> = {
    white: "#ffffff",
    black: "#000000",
    red: "#ff0000",
    green: "#008000",
    blue: "#0000ff",
    yellow: "#ffff00",
    gray: "#808080",
    grey: "#808080",
  };
  if (namedColors[color.toLowerCase()]) {
    return namedColors[color.toLowerCase()];
  }

  return null;
}

/** Check if color is near black/white (not brand color) */
function isNeutralColor(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  // Near white
  if (r > 240 && g > 240 && b > 240) return true;
  // Near black
  if (r < 15 && g < 15 && b < 15) return true;
  // Gray (similar r, g, b values, low saturation)
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max - min < 20) return true;

  return false;
}

/** Calculate color similarity (0-1, 1 = identical) */
function colorSimilarity(hex1: string, hex2: string): number {
  const r1 = parseInt(hex1.slice(1, 3), 16);
  const g1 = parseInt(hex1.slice(3, 5), 16);
  const b1 = parseInt(hex1.slice(5, 7), 16);
  const r2 = parseInt(hex2.slice(1, 3), 16);
  const g2 = parseInt(hex2.slice(3, 5), 16);
  const b2 = parseInt(hex2.slice(5, 7), 16);

  const distance = Math.sqrt(
    Math.pow(r1 - r2, 2) + Math.pow(g1 - g2, 2) + Math.pow(b1 - b2, 2)
  );
  // Max distance is sqrt(3 * 255^2) ≈ 441
  return 1 - distance / 441;
}

// ============================================================================
// Font Utilities
// ============================================================================

/** Normalize font name */
function normalizeFont(font: string): string {
  return font
    .replace(/['"]/g, "")
    .trim()
    .toLowerCase()
    .split(",")[0] // Take first font in stack
    .trim();
}

/** Map WA fonts to modern equivalents */
function modernizeFont(font: string): string {
  const fontMap: Record<string, string> = {
    verdana: "system-ui",
    arial: "system-ui",
    helvetica: "system-ui",
    "times new roman": "Georgia",
    georgia: "Georgia",
    "courier new": "ui-monospace",
    tahoma: "system-ui",
    "trebuchet ms": "system-ui",
  };
  return fontMap[font] || font;
}

// ============================================================================
// Extraction Functions
// ============================================================================

interface CrawlPage {
  url: string;
  title: string;
  customHtml?: Array<{
    htmlSnippet: string;
    location: string;
  }>;
}

interface CrawlReport {
  pages: CrawlPage[];
}

/**
 * Extract theme from a crawl report
 */
export function extractThemeFromCrawl(report: CrawlReport): ExtractedTheme {
  const colorCounts = new Map<string, { count: number; contexts: Set<string> }>();
  const fontCounts = new Map<string, { count: number; contexts: Set<string> }>();
  const buttonCounts = new Map<string, number>();

  // Process each page
  for (const page of report.pages) {
    if (!page.customHtml) continue;

    for (const block of page.customHtml) {
      const html = block.htmlSnippet;

      // Extract colors
      extractColors(html, colorCounts);

      // Extract fonts
      extractFonts(html, fontCounts);

      // Extract button styles
      extractButtonStyles(html, buttonCounts);
    }
  }

  // Build color frequency list
  const colors: ColorFrequency[] = [];
  for (const [normalized, data] of colorCounts) {
    colors.push({
      color: normalized,
      normalizedColor: normalized,
      count: data.count,
      contexts: Array.from(data.contexts) as ColorFrequency["contexts"],
    });
  }
  colors.sort((a, b) => b.count - a.count);

  // Build font frequency list
  const fonts: FontFrequency[] = [];
  for (const [normalized, data] of fontCounts) {
    fonts.push({
      font: normalized,
      normalizedFont: normalized,
      count: data.count,
      contexts: Array.from(data.contexts) as FontFrequency["contexts"],
    });
  }
  fonts.sort((a, b) => b.count - a.count);

  // Build button style list
  const buttonStyles: ButtonStyleInfo[] = [];
  for (const [waClass, count] of buttonCounts) {
    buttonStyles.push({
      waClass,
      count,
      suggestedVariant: suggestButtonVariant(waClass, count, buttonCounts),
    });
  }
  buttonStyles.sort((a, b) => b.count - a.count);

  // Determine primary and accent colors
  const brandColors = colors.filter((c) => !isNeutralColor(c.normalizedColor));
  const primaryColor = brandColors[0]?.normalizedColor;
  let accentColor = brandColors[1]?.normalizedColor;

  // If accent is too similar to primary, pick next
  if (primaryColor && accentColor && colorSimilarity(primaryColor, accentColor) > 0.85) {
    accentColor = brandColors[2]?.normalizedColor;
  }

  // Determine fonts
  const headingFonts = fonts.filter((f) => f.contexts.includes("heading"));
  const bodyFonts = fonts.filter((f) => f.contexts.includes("body"));

  return {
    primaryColor,
    accentColor,
    colors,
    headingFont: headingFonts[0] ? modernizeFont(headingFonts[0].font) : undefined,
    bodyFont: bodyFonts[0] ? modernizeFont(bodyFonts[0].font) : undefined,
    fonts,
    buttonStyles,
    confidence: calculateConfidence(colors, fonts, report.pages.length),
  };
}

function extractColors(
  html: string,
  counts: Map<string, { count: number; contexts: Set<string> }>
) {
  // Color attribute: color="#BED600"
  const colorAttrRegex = /color\s*=\s*["']([^"']+)["']/gi;
  let match;
  while ((match = colorAttrRegex.exec(html)) !== null) {
    const normalized = normalizeColor(match[1]);
    if (normalized) {
      addColorCount(counts, normalized, "text");
    }
  }

  // CSS color property: color: #BED600
  const cssColorRegex = /(?:^|;|\s)color\s*:\s*([^;}"']+)/gi;
  while ((match = cssColorRegex.exec(html)) !== null) {
    const normalized = normalizeColor(match[1].trim());
    if (normalized) {
      addColorCount(counts, normalized, "text");
    }
  }

  // Background color
  const bgColorRegex = /background(?:-color)?\s*:\s*([^;}"']+)/gi;
  while ((match = bgColorRegex.exec(html)) !== null) {
    const normalized = normalizeColor(match[1].trim());
    if (normalized) {
      addColorCount(counts, normalized, "background");
    }
  }
}

function extractFonts(
  html: string,
  counts: Map<string, { count: number; contexts: Set<string> }>
) {
  // Font face attribute: face="Verdana"
  const faceAttrRegex = /face\s*=\s*["']([^"']+)["']/gi;
  let match;
  while ((match = faceAttrRegex.exec(html)) !== null) {
    const normalized = normalizeFont(match[1]);
    if (normalized) {
      // Check if in heading context
      const isHeading = /<h[1-6][^>]*>.*?face\s*=\s*["'][^"']*["']/i.test(
        html.substring(Math.max(0, match.index - 50), match.index + 100)
      );
      addFontCount(counts, normalized, isHeading ? "heading" : "body");
    }
  }

  // CSS font-family
  const fontFamilyRegex = /font-family\s*:\s*([^;}"']+)/gi;
  while ((match = fontFamilyRegex.exec(html)) !== null) {
    const normalized = normalizeFont(match[1]);
    if (normalized) {
      addFontCount(counts, normalized, "body");
    }
  }
}

function extractButtonStyles(html: string, counts: Map<string, number>) {
  // WA button classes: stylizedButton buttonStyle002
  const buttonRegex = /stylizedButton\s+(buttonStyle\d+)/gi;
  let match;
  while ((match = buttonRegex.exec(html)) !== null) {
    const style = match[1].toLowerCase();
    counts.set(style, (counts.get(style) || 0) + 1);
  }
}

function addColorCount(
  counts: Map<string, { count: number; contexts: Set<string> }>,
  color: string,
  context: string
) {
  const existing = counts.get(color) || { count: 0, contexts: new Set<string>() };
  existing.count++;
  existing.contexts.add(context);
  counts.set(color, existing);
}

function addFontCount(
  counts: Map<string, { count: number; contexts: Set<string> }>,
  font: string,
  context: string
) {
  const existing = counts.get(font) || { count: 0, contexts: new Set<string>() };
  existing.count++;
  existing.contexts.add(context);
  counts.set(font, existing);
}

function suggestButtonVariant(
  waClass: string,
  count: number,
  allCounts: Map<string, number>
): ButtonStyleInfo["suggestedVariant"] {
  // Most common button style = primary
  let maxCount = 0;
  for (const c of allCounts.values()) {
    if (c > maxCount) maxCount = c;
  }

  if (count === maxCount) return "primary";
  if (count > maxCount / 2) return "secondary";
  return "outline";
}

function calculateConfidence(
  colors: ColorFrequency[],
  fonts: FontFrequency[],
  pageCount: number
): number {
  // Higher confidence if:
  // - Colors appear consistently across pages
  // - Clear primary color emerges
  // - Consistent font usage

  const brandColors = colors.filter((c) => !isNeutralColor(c.normalizedColor));

  let score = 0.5; // Base

  // Strong primary color (appears many times)
  if (brandColors[0]?.count > pageCount * 2) {
    score += 0.2;
  }

  // Consistent font usage
  if (fonts[0]?.count > pageCount) {
    score += 0.15;
  }

  // Multiple pages analyzed
  if (pageCount >= 10) {
    score += 0.15;
  }

  return Math.min(score, 1);
}

// ============================================================================
// Summary Helpers
// ============================================================================

/**
 * Get a human-readable summary of the extracted theme
 */
export function getThemeSummary(theme: ExtractedTheme): string {
  const parts: string[] = [];

  if (theme.primaryColor) {
    parts.push(`Primary color: ${theme.primaryColor}`);
  }
  if (theme.accentColor) {
    parts.push(`Accent color: ${theme.accentColor}`);
  }
  if (theme.headingFont) {
    parts.push(`Heading font: ${theme.headingFont}`);
  }
  if (theme.buttonStyles.length > 0) {
    parts.push(`${theme.buttonStyles.length} button style(s) detected`);
  }

  const confidence = Math.round(theme.confidence * 100);
  parts.push(`Confidence: ${confidence}%`);

  return parts.join(" | ");
}

/**
 * Check if a color matches the theme's primary or accent color
 */
export function matchesThemeColor(
  color: string,
  theme: ExtractedTheme
): "primary" | "accent" | null {
  const normalized = normalizeColor(color);
  if (!normalized) return null;

  if (theme.primaryColor && colorSimilarity(normalized, theme.primaryColor) > 0.9) {
    return "primary";
  }
  if (theme.accentColor && colorSimilarity(normalized, theme.accentColor) > 0.9) {
    return "accent";
  }

  return null;
}
