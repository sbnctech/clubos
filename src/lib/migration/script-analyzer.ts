/**
 * Script Analyzer
 *
 * Analyzes JavaScript/jQuery code to determine its purpose and suggest
 * native Murmurant alternatives. Inline scripts are NOT allowed in
 * Murmurant for security reasons - we must offer replacements.
 *
 * Charter: P4 (no hidden rules), P9 (security fails closed)
 */

// ============================================================================
// Script Pattern Detection
// ============================================================================

export interface ScriptAnalysis {
  /** What the script is trying to do */
  purpose: ScriptPurpose;
  /** Human-readable description */
  description: string;
  /** Confidence level 0-1 */
  confidence: number;
  /** Murmurant replacement if available */
  replacement: ScriptReplacement | null;
  /** Original code snippet for reference */
  snippet: string;
}

export type ScriptPurpose =
  | "carousel"        // Image slider/carousel
  | "lightbox"        // Image popup/lightbox
  | "accordion"       // Collapsible sections
  | "tabs"            // Tabbed content
  | "analytics"       // Google Analytics, Facebook Pixel, etc.
  | "countdown"       // Countdown timer
  | "form-validation" // Form input validation
  | "smooth-scroll"   // Smooth scrolling to anchors
  | "sticky-header"   // Fixed header on scroll
  | "lazy-load"       // Lazy loading images
  | "social-share"    // Social sharing buttons
  | "modal"           // Popup modal dialogs
  | "tooltip"         // Hover tooltips
  | "animation"       // Scroll animations, fade effects
  | "menu-toggle"     // Mobile menu toggle
  | "unknown";        // Can't determine purpose

export interface ScriptReplacement {
  /** Type of Murmurant block/feature to use */
  type: "block" | "built-in" | "remove" | "manual";
  /** Specific block type if applicable */
  blockType?: string;
  /** What to tell the user */
  action: string;
  /** Detailed instructions */
  instructions: string;
}

// Pattern definitions for script detection
interface ScriptPattern {
  purpose: ScriptPurpose;
  patterns: RegExp[];
  description: string;
  replacement: ScriptReplacement;
}

const SCRIPT_PATTERNS: ScriptPattern[] = [
  // Carousels and sliders (including Camera.js, a common WA plugin)
  {
    purpose: "carousel",
    patterns: [
      /slick\s*\(/i,
      /owl[\s-]?carousel/i,
      /swiper/i,
      /\.carousel\s*\(/i,
      /bxSlider/i,
      /flexslider/i,
      /\.slider\s*\(/i,
      /cycle\s*\(/i,
      /slideshow/i,
      /camera_wrap/i,           // Camera.js
      /\.camera\s*\(/i,         // Camera.js
      /cameraNavigation/i,      // Camera.js config
      /cameraAutoAdvance/i,     // Camera.js config
      /nivo[\s-]?slider/i,
    ],
    description: "Image carousel or slider (Camera.js detected)",
    replacement: {
      type: "block",
      blockType: "carousel",
      action: "Replace with Carousel block",
      instructions: "The images from this carousel will be added to a native Carousel block. Settings like auto-advance and navigation will be configured automatically.",
    },
  },

  // Lightbox/image popups
  {
    purpose: "lightbox",
    patterns: [
      /lightbox/i,
      /fancybox/i,
      /magnific[\s-]?popup/i,
      /colorbox/i,
      /\.modal.*img/i,
      /photo[\s-]?swipe/i,
    ],
    description: "Image lightbox or popup gallery",
    replacement: {
      type: "block",
      blockType: "gallery",
      action: "Replace with Gallery block",
      instructions: "Add a Gallery block. Images will automatically open in a lightbox when clicked.",
    },
  },

  // Accordions
  {
    purpose: "accordion",
    patterns: [
      /\.accordion\s*\(/i,
      /slideToggle/i,
      /slideUp.*slideDown|slideDown.*slideUp/i,
      /collapse.*toggle/i,
      /\.panel.*collapse/i,
    ],
    description: "Collapsible accordion sections",
    replacement: {
      type: "block",
      blockType: "accordion",
      action: "Replace with Accordion block",
      instructions: "Add an Accordion block and copy the section titles and content into each panel.",
    },
  },

  // Tabs
  {
    purpose: "tabs",
    patterns: [
      /\.tabs?\s*\(/i,
      /tab-content/i,
      /\.tab-pane/i,
      /ui-tabs/i,
    ],
    description: "Tabbed content sections",
    replacement: {
      type: "block",
      blockType: "tabs",
      action: "Replace with Tabs block",
      instructions: "Add a Tabs block and create a tab for each section of content.",
    },
  },

  // Analytics and tracking
  {
    purpose: "analytics",
    patterns: [
      /ga\s*\(/i,
      /gtag\s*\(/i,
      /google.*analytics/i,
      /fbq\s*\(/i,
      /facebook.*pixel/i,
      /_gaq/i,
      /trackEvent/i,
      /pageview/i,
      /hotjar/i,
      /mixpanel/i,
      /segment\.com/i,
    ],
    description: "Analytics or tracking script",
    replacement: {
      type: "remove",
      action: "Remove - use built-in analytics",
      instructions: "Murmurant has built-in analytics. This tracking script can be safely removed. If you need specific tracking, configure it in Site Settings > Analytics.",
    },
  },

  // Countdown timers
  {
    purpose: "countdown",
    patterns: [
      /countdown/i,
      /timer.*date|date.*timer/i,
      /setInterval.*getTime/i,
      /new Date\(.*\).*-.*new Date/i,
    ],
    description: "Countdown timer",
    replacement: {
      type: "block",
      blockType: "countdown",
      action: "Replace with Countdown block",
      instructions: "Add a Countdown block and set the target date. The countdown will automatically update.",
    },
  },

  // Form validation
  {
    purpose: "form-validation",
    patterns: [
      /\.validate\s*\(/i,
      /checkValidity/i,
      /setCustomValidity/i,
      /required.*pattern/i,
      /form.*submit.*prevent/i,
    ],
    description: "Form validation script",
    replacement: {
      type: "built-in",
      action: "Remove - forms have built-in validation",
      instructions: "Murmurant forms have built-in validation. Use the form builder to set required fields and validation rules.",
    },
  },

  // Smooth scroll
  {
    purpose: "smooth-scroll",
    patterns: [
      /smooth.*scroll/i,
      /scrollTo.*behavior/i,
      /animate.*scrollTop/i,
      /scroll-behavior/i,
    ],
    description: "Smooth scrolling for anchor links",
    replacement: {
      type: "built-in",
      action: "Remove - smooth scroll is built-in",
      instructions: "Smooth scrolling is enabled by default in Murmurant. Anchor links will scroll smoothly.",
    },
  },

  // Social sharing
  {
    purpose: "social-share",
    patterns: [
      /addthis/i,
      /sharethis/i,
      /share.*facebook|facebook.*share/i,
      /share.*twitter|twitter.*share/i,
      /social.*share|share.*social/i,
    ],
    description: "Social media sharing buttons",
    replacement: {
      type: "block",
      blockType: "social-share",
      action: "Replace with Social Share block",
      instructions: "Add a Social Share block to add sharing buttons for Facebook, Twitter, LinkedIn, and email.",
    },
  },

  // Modal dialogs
  {
    purpose: "modal",
    patterns: [
      /\.modal\s*\(/i,
      /showModal/i,
      /dialog.*open/i,
      /popup.*show|show.*popup/i,
    ],
    description: "Popup modal or dialog",
    replacement: {
      type: "manual",
      action: "Review - may need redesign",
      instructions: "Modals often contain important content. Consider whether this content should be on its own page, in an accordion, or if a modal is truly needed.",
    },
  },

  // Lazy loading
  {
    purpose: "lazy-load",
    patterns: [
      /lazy/i,
      /data-src/i,
      /loading.*lazy/i,
      /intersection.*observer.*img/i,
    ],
    description: "Lazy loading for images",
    replacement: {
      type: "built-in",
      action: "Remove - lazy loading is automatic",
      instructions: "Murmurant automatically lazy-loads images for better performance. This script is not needed.",
    },
  },

  // Animation libraries
  {
    purpose: "animation",
    patterns: [
      /aos/i,
      /animate\.css/i,
      /wow\.js/i,
      /scrollreveal/i,
      /\.animate\s*\(/i,
      /fadeIn|fadeOut|slideIn|slideOut/i,
    ],
    description: "Scroll or fade animations",
    replacement: {
      type: "built-in",
      action: "Remove - subtle animations are built-in",
      instructions: "Murmurant includes subtle, accessible animations. Avoid excessive animation which can cause accessibility issues.",
    },
  },

  // Menu toggle (mobile)
  {
    purpose: "menu-toggle",
    patterns: [
      /menu.*toggle|toggle.*menu/i,
      /hamburger/i,
      /nav.*mobile|mobile.*nav/i,
      /\.navbar-toggle/i,
    ],
    description: "Mobile menu toggle",
    replacement: {
      type: "built-in",
      action: "Remove - mobile menu is automatic",
      instructions: "Murmurant automatically creates a mobile-friendly menu. This script is not needed.",
    },
  },
];

// ============================================================================
// Analysis Functions
// ============================================================================

/**
 * Analyze a script/code snippet to determine its purpose.
 */
export function analyzeScript(code: string): ScriptAnalysis {
  const trimmed = code.trim();
  const snippet = trimmed.substring(0, 200);

  // Try each pattern
  for (const pattern of SCRIPT_PATTERNS) {
    for (const regex of pattern.patterns) {
      if (regex.test(trimmed)) {
        return {
          purpose: pattern.purpose,
          description: pattern.description,
          confidence: 0.8, // High confidence if pattern matches
          replacement: pattern.replacement,
          snippet,
        };
      }
    }
  }

  // Check for jQuery but unknown purpose
  if (/\$\(|jQuery/i.test(trimmed)) {
    return {
      purpose: "unknown",
      description: "jQuery code with unknown purpose",
      confidence: 0.3,
      replacement: {
        type: "manual",
        action: "Review manually",
        instructions: "This jQuery code couldn't be automatically identified. Review what it does and determine if a native Murmurant feature can replace it.",
      },
      snippet,
    };
  }

  // Completely unknown
  return {
    purpose: "unknown",
    description: "Unknown JavaScript code",
    confidence: 0.1,
    replacement: {
      type: "manual",
      action: "Review manually",
      instructions: "This script couldn't be identified. Inline JavaScript is not allowed for security reasons. Determine what functionality is needed and use a native Murmurant feature.",
    },
    snippet,
  };
}

/**
 * Analyze all scripts in an HTML string.
 */
export function analyzeScriptsInHtml(html: string): ScriptAnalysis[] {
  const results: ScriptAnalysis[] = [];

  // Find <script> tags
  const scriptTagRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = scriptTagRegex.exec(html)) !== null) {
    const content = match[1].trim();
    if (content) {
      results.push(analyzeScript(content));
    }
  }

  // Find inline event handlers (onclick, onload, etc.)
  const inlineEventRegex = /on\w+\s*=\s*["']([^"']+)["']/gi;
  while ((match = inlineEventRegex.exec(html)) !== null) {
    const content = match[1].trim();
    if (content && content.length > 10) {
      const analysis = analyzeScript(content);
      analysis.description = `Inline event handler: ${analysis.description}`;
      results.push(analysis);
    }
  }

  return results;
}

/**
 * Get a summary of all issues that need attention.
 */
export function getScriptIssueSummary(analyses: ScriptAnalysis[]): {
  canAutoFix: number;
  needsReview: number;
  canRemove: number;
} {
  return {
    canAutoFix: analyses.filter(a =>
      a.replacement?.type === "block" && a.confidence > 0.5
    ).length,
    needsReview: analyses.filter(a =>
      a.replacement?.type === "manual" || a.confidence <= 0.5
    ).length,
    canRemove: analyses.filter(a =>
      a.replacement?.type === "built-in" || a.replacement?.type === "remove"
    ).length,
  };
}
