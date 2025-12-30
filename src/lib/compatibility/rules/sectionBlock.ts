/**
 * Section + Block Compatibility Rules
 *
 * Rules governing which blocks can be placed in which sections.
 *
 * Charter: P4 (no hidden rules), P6 (human-first UI)
 *
 * @see docs/design/COMPATIBILITY_SYSTEM.md
 */

import type { CompatibilityRule } from "../types";

/**
 * Section + Block compatibility rules.
 *
 * Key constraints:
 * - Sidebar sections only allow widget-style blocks
 * - Hero sections only allow hero-style blocks
 * - Navigation sections have limited block types
 */
export const sectionBlockRules: CompatibilityRule[] = [
  // ============================================================================
  // Sidebar Section Restrictions
  // ============================================================================
  {
    id: "sidebar-widget-blocks-only",
    domain: "section-block",
    type: "restricts",
    severity: "error",
    subject: "section:sidebar",
    allows: [
      "block:news-feed",
      "block:calendar-mini",
      "block:event-list-compact",
      "block:sponsors",
      "block:text",
      "block:heading",
      "block:image",
      "block:button",
      "block:divider",
      "block:spacer",
      "block:quick-links",
      "block:social-links",
    ],
    message: "Sidebar only supports widget-style blocks.",
    fixAction: "Move this block to the main content area",
    description: "Sidebar sections have limited width and work best with compact, widget-style blocks.",
  },

  // ============================================================================
  // Hero Section Restrictions
  // ============================================================================
  {
    id: "hero-section-limited-blocks",
    domain: "section-block",
    type: "restricts",
    severity: "error",
    subject: "section:hero",
    allows: [
      "block:hero-banner",
      "block:carousel",
      "block:video-background",
      "block:heading",
      "block:text",
      "block:button",
      "block:image",
    ],
    message: "Hero section only supports hero-style blocks.",
    fixAction: "Move this block to the main content area",
    description: "Hero sections are designed for impactful visual content.",
  },

  // ============================================================================
  // Panel Section Restrictions
  // ============================================================================
  {
    id: "panel-widget-blocks-only",
    domain: "section-block",
    type: "restricts",
    severity: "error",
    subject: "section:panel",
    allows: [
      "block:news-feed",
      "block:calendar-mini",
      "block:event-list-compact",
      "block:activity-feed",
      "block:notifications",
      "block:quick-links",
      "block:text",
      "block:heading",
      "block:image",
      "block:button",
      "block:divider",
    ],
    message: "Right panel only supports widget-style blocks.",
    fixAction: "Move this block to the main content area",
    description: "Panel sections have limited width and work best with compact blocks.",
  },

  // ============================================================================
  // Navigation Section Restrictions
  // ============================================================================
  {
    id: "nav-left-limited-blocks",
    domain: "section-block",
    type: "restricts",
    severity: "error",
    subject: "section:nav-left",
    allows: [
      "block:navigation-menu",
      "block:user-menu",
      "block:quick-actions",
      "block:search",
    ],
    message: "Left navigation only supports navigation blocks.",
    description: "Navigation sections are reserved for navigation and user controls.",
  },
];

export default sectionBlockRules;
