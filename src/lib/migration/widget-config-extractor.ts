/**
 * Widget Config Extractor
 *
 * Extracts configuration properties from WA widgets found in HTML.
 * This enables auto-configuration of Murmurant widgets to match
 * the source site's widget behavior.
 *
 * Charter: P4 (no hidden rules), P8 (stable contracts)
 */

// ============================================================================
// Types
// ============================================================================

export type WaWidgetType =
  | "events"
  | "store-catalog"
  | "store-product"
  | "store-cart"
  | "search"
  | "social-profile"
  | "custom-menu"
  | "slideshow"
  | "photo-album"
  | "login"
  | "member-directory"
  | "donation"
  | "membership-app"
  | "content"
  | "unknown";

export interface ExtractedWidgetConfig {
  /** Widget type */
  type: WaWidgetType;
  /** WA style class (gadgetStyle001, etc.) */
  styleVariant: string | null;
  /** Extracted properties specific to widget type */
  properties: WidgetProperties;
  /** Raw class names for debugging */
  rawClasses: string[];
  /** Location in page (from gadget wrapper) */
  location: string;
}

export type WidgetProperties =
  | EventsWidgetProps
  | StoreCatalogWidgetProps
  | StoreProductWidgetProps
  | SearchWidgetProps
  | SocialProfileWidgetProps
  | CustomMenuWidgetProps
  | SlideshowWidgetProps
  | PhotoAlbumWidgetProps
  | ContentWidgetProps
  | Record<string, unknown>;

// ============================================================================
// Widget-Specific Property Types
// ============================================================================

export interface EventsWidgetProps {
  view: "list" | "calendar" | "unknown";
  timezone: string | null;
  eventCount: number;
  events: Array<{
    title: string;
    url: string;
    date?: string;
  }>;
}

export interface StoreCatalogWidgetProps {
  products: Array<{
    name: string;
    price: string;
    imageUrl: string | null;
    productUrl: string;
  }>;
  productCount: number;
}

export interface StoreProductWidgetProps {
  name: string;
  price: string | null;
  description: string | null;
  imageUrl: string | null;
}

export interface SearchWidgetProps {
  placeholder: string;
  alignment: "left" | "center" | "right";
  actionUrl: string | null;
}

export interface SocialProfileWidgetProps {
  orientation: "horizontal" | "vertical";
  alignment: "left" | "center" | "right";
  platforms: Array<{
    name: string;
    url: string;
  }>;
}

export interface CustomMenuWidgetProps {
  orientation: "horizontal" | "vertical";
  alignment: "left" | "center" | "right";
  items: Array<{
    label: string;
    url: string;
    hasSubmenu: boolean;
  }>;
}

export interface SlideshowWidgetProps {
  transitionTime: number; // milliseconds
  transitionEffect: string;
  autoAdvance: boolean;
  imageCount: number;
  images: Array<{
    src: string;
    caption?: string;
  }>;
}

export interface PhotoAlbumWidgetProps {
  albumId: string | null;
  imageCount: number;
  images: Array<{
    src: string;
    thumbnail?: string;
    caption?: string;
  }>;
}

export interface ContentWidgetProps {
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  editableAreaId: string | null;
  isStretch: boolean;
}

// ============================================================================
// Main Extractor
// ============================================================================

/**
 * Extract widget configuration from HTML and location string.
 */
export function extractWidgetConfig(
  html: string,
  location: string
): ExtractedWidgetConfig | null {
  // Parse widget type from location classes
  const widgetType = detectWidgetType(location);
  if (!widgetType) return null;

  // Extract style variant
  const styleMatch = location.match(/gadgetStyle(\d+|None)/i);
  const styleVariant = styleMatch ? `gadgetStyle${styleMatch[1]}` : null;

  // Extract raw classes
  const rawClasses = location.split(/\s+/).filter((c) => c.length > 0);

  // Extract type-specific properties
  const properties = extractProperties(widgetType, html, location);

  return {
    type: widgetType,
    styleVariant,
    properties,
    rawClasses,
    location,
  };
}

/**
 * Detect widget type from location class string.
 */
function detectWidgetType(location: string): WaWidgetType | null {
  const loc = location.toLowerCase();

  if (/wagadgetupcoming\s*events|wagadgetevents/i.test(location)) {
    return "events";
  }
  if (/wagadgetonlinestorecatalog/i.test(location)) {
    return "store-catalog";
  }
  if (/wagadgetonlinestoreproduct/i.test(location)) {
    return "store-product";
  }
  if (/wagadgetonlinestorecart/i.test(location)) {
    return "store-cart";
  }
  if (/wagadgetsitesearch|wagadgetsearch/i.test(location)) {
    return "search";
  }
  if (/wagadgetsocialprofile/i.test(location)) {
    return "social-profile";
  }
  if (/wagadgetcustommenu/i.test(location)) {
    return "custom-menu";
  }
  if (/wagadgetslideshow/i.test(location)) {
    return "slideshow";
  }
  if (/wagadgetphotoalbum|camera_wrap/i.test(location)) {
    return "photo-album";
  }
  if (/wagadgetlogin/i.test(location)) {
    return "login";
  }
  if (/wagadgetmemberdirectory/i.test(location)) {
    return "member-directory";
  }
  if (/wagadgetdonation/i.test(location)) {
    return "donation";
  }
  if (/wagadgetmembershipapplication/i.test(location)) {
    return "membership-app";
  }
  if (/wagadgetcontent/i.test(location)) {
    return "content";
  }

  return null;
}

// ============================================================================
// Property Extractors
// ============================================================================

function extractProperties(
  type: WaWidgetType,
  html: string,
  location: string
): WidgetProperties {
  switch (type) {
    case "events":
      return extractEventsProps(html, location);
    case "store-catalog":
      return extractStoreCatalogProps(html);
    case "store-product":
      return extractStoreProductProps(html);
    case "search":
      return extractSearchProps(html);
    case "social-profile":
      return extractSocialProfileProps(html, location);
    case "custom-menu":
      return extractCustomMenuProps(html, location);
    case "slideshow":
      return extractSlideshowProps(html);
    case "photo-album":
      return extractPhotoAlbumProps(html);
    case "content":
      return extractContentProps(html, location);
    default:
      return {};
  }
}

/**
 * Extract events widget properties.
 */
function extractEventsProps(html: string, location: string): EventsWidgetProps {
  // Determine view mode
  let view: "list" | "calendar" | "unknown" = "unknown";
  if (/eventsstatelist/i.test(location) || /<ul[^>]*>/i.test(html)) {
    view = "list";
  } else if (/eventsstatecalendar|calendar/i.test(location)) {
    view = "calendar";
  }

  // Extract timezone
  const tzMatch = html.match(/event-time-zone[^>]*>([^<]+)</i);
  const timezone = tzMatch ? tzMatch[1].trim() : null;

  // Extract events
  const events: EventsWidgetProps["events"] = [];
  const eventRegex = /<a[^>]*href=["']([^"']*event[^"']*)["'][^>]*>([^<]+)</gi;
  let match;
  while ((match = eventRegex.exec(html)) !== null) {
    events.push({
      url: match[1],
      title: match[2].trim(),
    });
  }

  return {
    view,
    timezone,
    eventCount: events.length,
    events,
  };
}

/**
 * Extract store catalog properties.
 */
function extractStoreCatalogProps(html: string): StoreCatalogWidgetProps {
  const products: StoreCatalogWidgetProps["products"] = [];

  // Match product list items
  const itemRegex =
    /<li[^>]*OnlineStoreCatalog_list_item[^>]*>([\s\S]*?)<\/li>/gi;
  let itemMatch;

  while ((itemMatch = itemRegex.exec(html)) !== null) {
    const itemHtml = itemMatch[1];

    // Extract product URL
    const urlMatch = itemHtml.match(/href=["']([^"']*\/Products\/[^"']+)["']/i);
    const productUrl = urlMatch ? urlMatch[1] : "";

    // Extract image
    const imgMatch = itemHtml.match(/<img[^>]*src=["']([^"']+)["']/i);
    const imageUrl = imgMatch ? imgMatch[1] : null;

    // Extract name
    const nameMatch = itemHtml.match(
      /OnlineStoreCatalog_list_item_link[^>]*>([^<]+)</i
    );
    const name = nameMatch ? nameMatch[1].trim() : "";

    // Extract price
    const priceMatch = itemHtml.match(
      /OnlineStoreCatalog_list_price[^>]*>\s*([^<]+)</i
    );
    const price = priceMatch ? priceMatch[1].trim() : "";

    if (name || productUrl) {
      products.push({ name, price, imageUrl, productUrl });
    }
  }

  return {
    products,
    productCount: products.length,
  };
}

/**
 * Extract store product properties.
 */
function extractStoreProductProps(html: string): StoreProductWidgetProps {
  // Extract title
  const titleMatch = html.match(
    /OnlineStoreProduct_title[^>]*>[\s\S]*?<h\d[^>]*>([^<]+)/i
  );
  const name = titleMatch ? titleMatch[1].trim() : "";

  // Extract price
  const priceMatch = html.match(/OnlineStoreProduct_price[^>]*>([^<]+)/i);
  const price = priceMatch ? priceMatch[1].trim() : null;

  // Extract image
  const imgMatch = html.match(
    /OnlineStoreProduct[^>]*img[^>]*src=["']([^"']+)["']/i
  );
  const imageUrl = imgMatch ? imgMatch[1] : null;

  // Extract description
  const descMatch = html.match(
    /OnlineStoreProduct_description[^>]*>([\s\S]*?)<\/div>/i
  );
  const description = descMatch
    ? descMatch[1].replace(/<[^>]+>/g, "").trim()
    : null;

  return { name, price, description, imageUrl };
}

/**
 * Extract search widget properties.
 */
function extractSearchProps(html: string): SearchWidgetProps {
  // Extract placeholder
  const placeholderMatch = html.match(/placeholder=["']([^"']+)["']/i);
  const placeholder = placeholderMatch
    ? placeholderMatch[1]
    : "Enter search string";

  // Extract alignment
  let alignment: "left" | "center" | "right" = "left";
  if (/alignRight/i.test(html)) alignment = "right";
  else if (/alignCenter/i.test(html)) alignment = "center";

  // Extract action URL
  const actionMatch = html.match(/action=["']([^"']+)["']/i);
  const actionUrl = actionMatch ? actionMatch[1] : null;

  return { placeholder, alignment, actionUrl };
}

/**
 * Extract social profile properties.
 */
function extractSocialProfileProps(
  html: string,
  location: string
): SocialProfileWidgetProps {
  // Extract orientation
  const orientation: "horizontal" | "vertical" = /orientationVertical/i.test(
    html
  )
    ? "vertical"
    : "horizontal";

  // Extract alignment
  let alignment: "left" | "center" | "right" = "left";
  if (/alignRight/i.test(html)) alignment = "right";
  else if (/alignCenter/i.test(html)) alignment = "center";

  // Extract platforms
  const platforms: SocialProfileWidgetProps["platforms"] = [];
  const linkRegex =
    /<a[^>]*href=["']([^"']+)["'][^>]*title=["']([^"']+)["'][^>]*class=["']([^"']+)["']/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    platforms.push({
      url: match[1],
      name: match[2] || match[3], // Use title or class as name
    });
  }

  // Fallback: try simpler pattern
  if (platforms.length === 0) {
    const simpleLinkRegex =
      /<a[^>]*href=["']([^"']+)["'][^>]*class=["']([^"']+)["']/gi;
    while ((match = simpleLinkRegex.exec(html)) !== null) {
      const url = match[1];
      const className = match[2];
      // Infer platform from class or URL
      const platform = inferPlatformFromUrl(url) || className;
      if (platform) {
        platforms.push({ url, name: platform });
      }
    }
  }

  return { orientation, alignment, platforms };
}

/**
 * Infer social platform from URL.
 */
function inferPlatformFromUrl(url: string): string | null {
  const platforms: Record<string, RegExp> = {
    Facebook: /facebook\.com/i,
    Twitter: /twitter\.com/i,
    X: /x\.com/i,
    Instagram: /instagram\.com/i,
    LinkedIn: /linkedin\.com/i,
    YouTube: /youtube\.com/i,
    Pinterest: /pinterest\.com/i,
    TikTok: /tiktok\.com/i,
  };

  for (const [name, pattern] of Object.entries(platforms)) {
    if (pattern.test(url)) return name;
  }
  return null;
}

/**
 * Extract custom menu properties.
 */
function extractCustomMenuProps(
  html: string,
  location: string
): CustomMenuWidgetProps {
  // Extract orientation
  const orientation: "horizontal" | "vertical" = /orientationVertical/i.test(
    html
  )
    ? "vertical"
    : "horizontal";

  // Extract alignment
  let alignment: "left" | "center" | "right" = "left";
  if (/alignRight/i.test(html)) alignment = "right";
  else if (/alignCenter/i.test(html)) alignment = "center";

  // Extract menu items
  const items: CustomMenuWidgetProps["items"] = [];
  const itemRegex =
    /<li[^>]*>[\s\S]*?<a[^>]*href=["']([^"']+)["'][^>]*(?:title=["']([^"']+)["'])?[^>]*>([^<]*)</gi;
  let match;

  while ((match = itemRegex.exec(html)) !== null) {
    const url = match[1];
    const label = match[2] || match[3] || "";
    // Check for submenu
    const hasSubmenu = /<ul/i.test(html.substring(match.index, match.index + 200));

    if (label.trim()) {
      items.push({
        url,
        label: label.trim(),
        hasSubmenu,
      });
    }
  }

  return { orientation, alignment, items };
}

/**
 * Extract slideshow properties.
 */
function extractSlideshowProps(html: string): SlideshowWidgetProps {
  // Extract Camera.js config from script
  const timeMatch = html.match(/time\s*:\s*\(?(\d+)\s*\*?\s*1000\)?/i);
  const transitionTime = timeMatch ? parseInt(timeMatch[1], 10) * 1000 : 3000;

  const fxMatch = html.match(/fx\s*:\s*['"]([^'"]+)['"]/i);
  const transitionEffect = fxMatch ? fxMatch[1] : "simpleFade";

  const autoMatch = html.match(/cameraAutoAdvance\s*=.*?(true|false)/i);
  const autoAdvance = autoMatch ? autoMatch[1] === "true" : true;

  // Extract images
  const images: SlideshowWidgetProps["images"] = [];
  const imgRegex = /data-src=["']([^"']+)["']/gi;
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    images.push({ src: match[1] });
  }

  // Fallback: look for background-image
  if (images.length === 0) {
    const bgRegex = /background-image\s*:\s*url\(['"]?([^'")\s]+)['"]?\)/gi;
    while ((match = bgRegex.exec(html)) !== null) {
      images.push({ src: match[1] });
    }
  }

  return {
    transitionTime,
    transitionEffect,
    autoAdvance,
    imageCount: images.length,
    images,
  };
}

/**
 * Extract photo album properties.
 */
function extractPhotoAlbumProps(html: string): PhotoAlbumWidgetProps {
  // Extract album ID from camera_wrap
  const idMatch = html.match(/camera_wrap[^>]*id=["']([^"']+)["']/i);
  const albumId = idMatch ? idMatch[1] : null;

  // Extract images
  const images: PhotoAlbumWidgetProps["images"] = [];
  const imgRegex = /data-src=["']([^"']+)["']/gi;
  let match;

  while ((match = imgRegex.exec(html)) !== null) {
    const src = match[1];
    // Look for thumbnail
    const thumbMatch = html.match(
      new RegExp(`data-thumb=["']([^"']+)["'][^>]*data-src=["']${src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["']`, "i")
    );
    images.push({
      src,
      thumbnail: thumbMatch ? thumbMatch[1] : undefined,
    });
  }

  return {
    albumId,
    imageCount: images.length,
    images,
  };
}

/**
 * Extract content widget properties.
 */
function extractContentProps(html: string, location: string): ContentWidgetProps {
  // Extract padding
  const paddingTop = extractPadding(html, "top");
  const paddingRight = extractPadding(html, "right");
  const paddingBottom = extractPadding(html, "bottom");
  const paddingLeft = extractPadding(html, "left");

  // Extract editable area ID
  const areaMatch = html.match(/data-editableArea=["'](\d+)["']/i);
  const editableAreaId = areaMatch ? areaMatch[1] : null;

  // Check for stretch
  const isStretch = /\bstretch\b/i.test(location);

  return {
    padding: {
      top: paddingTop,
      right: paddingRight,
      bottom: paddingBottom,
      left: paddingLeft,
    },
    editableAreaId,
    isStretch,
  };
}

/**
 * Extract padding value from style.
 */
function extractPadding(html: string, side: string): number {
  const regex = new RegExp(`padding-${side}\\s*:\\s*(\\d+)px`, "i");
  const match = html.match(regex);
  return match ? parseInt(match[1], 10) : 0;
}

// ============================================================================
// Batch Extraction
// ============================================================================

/**
 * Extract all widget configs from a page's custom HTML blocks.
 */
export function extractAllWidgetConfigs(
  blocks: Array<{ htmlSnippet: string; location: string }>
): ExtractedWidgetConfig[] {
  const configs: ExtractedWidgetConfig[] = [];

  for (const block of blocks) {
    const config = extractWidgetConfig(block.htmlSnippet, block.location);
    if (config) {
      configs.push(config);
    }
  }

  return configs;
}

/**
 * Get a summary of widget configs for a page.
 */
export function summarizeWidgetConfigs(
  configs: ExtractedWidgetConfig[]
): Record<WaWidgetType, number> {
  const summary: Record<string, number> = {};

  for (const config of configs) {
    summary[config.type] = (summary[config.type] || 0) + 1;
  }

  return summary as Record<WaWidgetType, number>;
}
