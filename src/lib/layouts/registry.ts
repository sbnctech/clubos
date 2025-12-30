/**
 * Layout Registry
 *
 * Built-in layout configurations for the 6 supported layout types.
 * Each layout defines sections, grid, and navigation settings.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 *
 * @see docs/projects/PAGE_PRESENTATION_SYSTEM.md
 * @see docs/design/LAYOUT_CONCEPTS.md
 */

import type { LayoutConfig, LayoutType } from "./schema";

// ============================================================================
// Classic Layout
// ============================================================================

/**
 * Classic layout: Simple top navigation, no sidebars.
 * WA-compatible: Yes (standard theme layout)
 *
 * ```
 * ┌─────────────────────────────────────┐
 * │            HEADER                   │
 * ├─────────────────────────────────────┤
 * │            HERO (optional)          │
 * ├─────────────────────────────────────┤
 * │                                     │
 * │            MAIN                     │
 * │                                     │
 * ├─────────────────────────────────────┤
 * │            FOOTER                   │
 * └─────────────────────────────────────┘
 * ```
 */
export const classicLayout: LayoutConfig = {
  id: "classic",
  name: "Classic",
  description: "Simple top navigation with full-width content. Best for landing pages and simple content.",
  category: "simple",
  icon: "layout-classic",

  // Navigation
  navPosition: "top",
  hasLeftSidebar: false,
  hasRightSidebar: false,

  // Auth
  allowedAuthPositions: ["top-right", "header"],
  defaultAuthPosition: "top-right",

  // WA compatibility
  waCompatible: true,

  // Grid
  gridTemplate: `
    "header header"
    "hero hero"
    "main main"
    "footer footer"
  `,
  gridColumns: "1fr",
  gridRows: "auto auto 1fr auto",
  mobileBreakpoint: "768px",
  mobileGridTemplate: `
    "header"
    "hero"
    "main"
    "footer"
  `,

  // Sections
  sections: [
    {
      id: "header",
      type: "header",
      name: "Header",
      gridArea: "header",
      isOptional: false,
      hideOnMobile: false,
      collapseOnMobile: false,
      mobileOrder: 1,
      allowedBlocks: null,
    },
    {
      id: "hero",
      type: "hero",
      name: "Hero",
      gridArea: "hero",
      isOptional: true,
      hideOnMobile: false,
      collapseOnMobile: false,
      mobileOrder: 2,
      allowedBlocks: ["hero-banner", "carousel", "video-background", "heading", "button"],
    },
    {
      id: "main",
      type: "main",
      name: "Main Content",
      gridArea: "main",
      maxWidth: "1200px",
      isOptional: false,
      hideOnMobile: false,
      collapseOnMobile: false,
      mobileOrder: 3,
      allowedBlocks: null,
    },
    {
      id: "footer",
      type: "footer",
      name: "Footer",
      gridArea: "footer",
      isOptional: false,
      hideOnMobile: false,
      collapseOnMobile: false,
      mobileOrder: 4,
      allowedBlocks: null,
    },
  ],
};

// ============================================================================
// Magazine Layout
// ============================================================================

/**
 * Magazine layout: Top navigation with right sidebar.
 * WA-compatible: No (sidebars can't span stripes)
 *
 * ```
 * ┌─────────────────────────────────────┐
 * │            HEADER                   │
 * ├─────────────────────────────────────┤
 * │            HERO                     │
 * ├──────────────────────┬──────────────┤
 * │                      │              │
 * │       MAIN           │   SIDEBAR    │
 * │       (70%)          │   (30%)      │
 * │                      │              │
 * ├──────────────────────┴──────────────┤
 * │            FOOTER                   │
 * └─────────────────────────────────────┘
 * ```
 */
export const magazineLayout: LayoutConfig = {
  id: "magazine",
  name: "Magazine",
  description: "Top navigation with content sidebar. Best for member home pages and news.",
  category: "content",
  icon: "layout-magazine",

  // Navigation
  navPosition: "top",
  hasLeftSidebar: false,
  hasRightSidebar: true,

  // Auth
  allowedAuthPositions: ["top-right", "header"],
  defaultAuthPosition: "top-right",

  // WA compatibility
  waCompatible: false,

  // Grid
  gridTemplate: `
    "header header"
    "hero hero"
    "main sidebar"
    "footer footer"
  `,
  gridColumns: "1fr 320px",
  gridRows: "auto auto 1fr auto",
  mobileBreakpoint: "768px",
  mobileGridTemplate: `
    "header"
    "hero"
    "main"
    "sidebar"
    "footer"
  `,

  // Sections
  sections: [
    {
      id: "header",
      type: "header",
      name: "Header",
      gridArea: "header",
      isOptional: false,
      hideOnMobile: false,
      collapseOnMobile: false,
      mobileOrder: 1,
      allowedBlocks: null,
    },
    {
      id: "hero",
      type: "hero",
      name: "Hero",
      gridArea: "hero",
      isOptional: true,
      hideOnMobile: false,
      collapseOnMobile: false,
      mobileOrder: 2,
      allowedBlocks: ["hero-banner", "carousel", "video-background", "heading", "button"],
    },
    {
      id: "main",
      type: "main",
      name: "Main Content",
      gridArea: "main",
      isOptional: false,
      hideOnMobile: false,
      collapseOnMobile: false,
      mobileOrder: 3,
      allowedBlocks: null,
    },
    {
      id: "sidebar",
      type: "sidebar",
      name: "Sidebar",
      gridArea: "sidebar",
      defaultWidth: "320px",
      minWidth: "280px",
      maxWidth: "400px",
      isOptional: false,
      hideOnMobile: false,
      collapseOnMobile: true,
      mobileOrder: 4,
      allowedBlocks: ["news-feed", "calendar-mini", "event-list-compact", "sponsors", "text", "image", "button"],
    },
    {
      id: "footer",
      type: "footer",
      name: "Footer",
      gridArea: "footer",
      isOptional: false,
      hideOnMobile: false,
      collapseOnMobile: false,
      mobileOrder: 5,
      allowedBlocks: null,
    },
  ],
};

// ============================================================================
// Portal Layout
// ============================================================================

/**
 * Portal layout: Top bar + left sidebar navigation.
 * WA-compatible: No
 *
 * ```
 * ┌─────────────────────────────────────┐
 * │            HEADER                   │
 * ├──────────┬──────────────────────────┤
 * │          │                          │
 * │  LEFT    │         MAIN             │
 * │  NAV     │                          │
 * │  (200px) │                          │
 * │          │                          │
 * ├──────────┴──────────────────────────┤
 * │            FOOTER                   │
 * └─────────────────────────────────────┘
 * ```
 */
export const portalLayout: LayoutConfig = {
  id: "portal",
  name: "Portal",
  description: "Left sidebar navigation with top bar. Best for sites with many sections.",
  category: "app",
  icon: "layout-portal",

  // Navigation
  navPosition: "top-left",
  hasLeftSidebar: true,
  hasRightSidebar: false,

  // Auth
  allowedAuthPositions: ["top-right", "bottom-left"],
  defaultAuthPosition: "top-right",

  // WA compatibility
  waCompatible: false,

  // Grid
  gridTemplate: `
    "header header"
    "nav-left main"
    "footer footer"
  `,
  gridColumns: "240px 1fr",
  gridRows: "auto 1fr auto",
  mobileBreakpoint: "768px",
  mobileGridTemplate: `
    "header"
    "main"
    "footer"
  `,

  // Sections
  sections: [
    {
      id: "header",
      type: "header",
      name: "Header",
      gridArea: "header",
      isOptional: false,
      hideOnMobile: false,
      collapseOnMobile: false,
      mobileOrder: 1,
      allowedBlocks: null,
    },
    {
      id: "nav-left",
      type: "nav-left",
      name: "Navigation",
      gridArea: "nav-left",
      defaultWidth: "240px",
      minWidth: "200px",
      maxWidth: "320px",
      isOptional: false,
      hideOnMobile: true,
      collapseOnMobile: false,
      allowedBlocks: ["navigation-menu", "user-menu"],
    },
    {
      id: "main",
      type: "main",
      name: "Main Content",
      gridArea: "main",
      isOptional: false,
      hideOnMobile: false,
      collapseOnMobile: false,
      mobileOrder: 2,
      allowedBlocks: null,
    },
    {
      id: "footer",
      type: "footer",
      name: "Footer",
      gridArea: "footer",
      isOptional: false,
      hideOnMobile: false,
      collapseOnMobile: false,
      mobileOrder: 3,
      allowedBlocks: null,
    },
  ],
};

// ============================================================================
// Dashboard Layout
// ============================================================================

/**
 * Dashboard layout: Top bar + full-height left sidebar.
 * WA-compatible: No
 *
 * ```
 * ┌─────────────────────────────────────┐
 * │            HEADER                   │
 * ├──────────┬──────────────────────────┤
 * │          │                          │
 * │  SIDEBAR │         MAIN             │
 * │  (240px) │                          │
 * │          │                          │
 * │          │                          │
 * └──────────┴──────────────────────────┘
 * ```
 */
export const dashboardLayout: LayoutConfig = {
  id: "dashboard",
  name: "Dashboard",
  description: "Full-height sidebar with header. Best for admin interfaces and management.",
  category: "admin",
  icon: "layout-dashboard",

  // Navigation
  navPosition: "top-left",
  hasLeftSidebar: true,
  hasRightSidebar: false,

  // Auth
  allowedAuthPositions: ["top-right", "bottom-left"],
  defaultAuthPosition: "bottom-left",

  // WA compatibility
  waCompatible: false,

  // Grid
  gridTemplate: `
    "header header"
    "sidebar main"
  `,
  gridColumns: "240px 1fr",
  gridRows: "auto 1fr",
  mobileBreakpoint: "768px",
  mobileGridTemplate: `
    "header"
    "main"
  `,

  // Sections
  sections: [
    {
      id: "header",
      type: "header",
      name: "Header",
      gridArea: "header",
      isOptional: false,
      hideOnMobile: false,
      collapseOnMobile: false,
      mobileOrder: 1,
      allowedBlocks: null,
    },
    {
      id: "sidebar",
      type: "sidebar",
      name: "Sidebar",
      gridArea: "sidebar",
      defaultWidth: "240px",
      minWidth: "200px",
      maxWidth: "320px",
      isOptional: false,
      hideOnMobile: true,
      collapseOnMobile: false,
      allowedBlocks: ["navigation-menu", "user-menu", "quick-actions"],
    },
    {
      id: "main",
      type: "main",
      name: "Main Content",
      gridArea: "main",
      isOptional: false,
      hideOnMobile: false,
      collapseOnMobile: false,
      mobileOrder: 2,
      allowedBlocks: null,
    },
  ],
};

// ============================================================================
// Focus Layout
// ============================================================================

/**
 * Focus layout: Minimal chrome, centered content.
 * WA-compatible: Yes (possible but not common)
 *
 * ```
 * ┌─────────────────────────────────────┐
 * │  Logo                    [Account]  │
 * ├─────────────────────────────────────┤
 * │                                     │
 * │        MAIN (max-width: 720px)      │
 * │        centered                     │
 * │                                     │
 * ├─────────────────────────────────────┤
 * │           Minimal footer            │
 * └─────────────────────────────────────┘
 * ```
 */
export const focusLayout: LayoutConfig = {
  id: "focus",
  name: "Focus",
  description: "Minimal chrome with centered content. Best for articles, forms, and checkout flows.",
  category: "simple",
  icon: "layout-focus",

  // Navigation
  navPosition: "minimal",
  hasLeftSidebar: false,
  hasRightSidebar: false,

  // Auth
  allowedAuthPositions: ["top-right", "header"],
  defaultAuthPosition: "header",

  // WA compatibility
  waCompatible: true,

  // Grid
  gridTemplate: `
    "header"
    "main"
    "footer"
  `,
  gridColumns: "1fr",
  gridRows: "auto 1fr auto",
  mobileBreakpoint: "768px",

  // Sections
  sections: [
    {
      id: "header",
      type: "header",
      name: "Header",
      gridArea: "header",
      isOptional: false,
      hideOnMobile: false,
      collapseOnMobile: false,
      mobileOrder: 1,
      allowedBlocks: null,
    },
    {
      id: "main",
      type: "main",
      name: "Main Content",
      gridArea: "main",
      maxWidth: "720px",
      isOptional: false,
      hideOnMobile: false,
      collapseOnMobile: false,
      mobileOrder: 2,
      allowedBlocks: null,
    },
    {
      id: "footer",
      type: "footer",
      name: "Footer",
      gridArea: "footer",
      isOptional: true,
      hideOnMobile: false,
      collapseOnMobile: false,
      mobileOrder: 3,
      allowedBlocks: null,
    },
  ],
};

// ============================================================================
// Intranet Layout
// ============================================================================

/**
 * Intranet layout: Top nav + dual sidebars.
 * WA-compatible: No
 *
 * ```
 * ┌─────────────────────────────────────┐
 * │            HEADER                   │
 * ├────────┬───────────────────┬────────┤
 * │        │                   │        │
 * │  LEFT  │       MAIN        │  RIGHT │
 * │  NAV   │                   │  PANEL │
 * │        │                   │        │
 * ├────────┴───────────────────┴────────┤
 * │            FOOTER                   │
 * └─────────────────────────────────────┘
 * ```
 */
export const intranetLayout: LayoutConfig = {
  id: "intranet",
  name: "Intranet",
  description: "Dual sidebars with main content. Best for rich intranets and social platforms.",
  category: "app",
  icon: "layout-intranet",

  // Navigation
  navPosition: "top-left",
  hasLeftSidebar: true,
  hasRightSidebar: true,

  // Auth
  allowedAuthPositions: ["top-right", "bottom-left"],
  defaultAuthPosition: "bottom-left",

  // WA compatibility
  waCompatible: false,

  // Grid
  gridTemplate: `
    "header header header"
    "nav-left main panel-right"
    "footer footer footer"
  `,
  gridColumns: "240px 1fr 300px",
  gridRows: "auto 1fr auto",
  mobileBreakpoint: "768px",
  mobileGridTemplate: `
    "header"
    "main"
    "footer"
  `,

  // Sections
  sections: [
    {
      id: "header",
      type: "header",
      name: "Header",
      gridArea: "header",
      isOptional: false,
      hideOnMobile: false,
      collapseOnMobile: false,
      mobileOrder: 1,
      allowedBlocks: null,
    },
    {
      id: "nav-left",
      type: "nav-left",
      name: "Navigation",
      gridArea: "nav-left",
      defaultWidth: "240px",
      minWidth: "200px",
      maxWidth: "280px",
      isOptional: false,
      hideOnMobile: true,
      collapseOnMobile: false,
      allowedBlocks: ["navigation-menu", "user-menu"],
    },
    {
      id: "main",
      type: "main",
      name: "Main Content",
      gridArea: "main",
      isOptional: false,
      hideOnMobile: false,
      collapseOnMobile: false,
      mobileOrder: 2,
      allowedBlocks: null,
    },
    {
      id: "panel-right",
      type: "panel",
      name: "Right Panel",
      gridArea: "panel-right",
      defaultWidth: "300px",
      minWidth: "280px",
      maxWidth: "400px",
      isOptional: false,
      hideOnMobile: true,
      collapseOnMobile: false,
      allowedBlocks: ["news-feed", "calendar-mini", "activity-feed", "notifications", "quick-links"],
    },
    {
      id: "footer",
      type: "footer",
      name: "Footer",
      gridArea: "footer",
      isOptional: false,
      hideOnMobile: false,
      collapseOnMobile: false,
      mobileOrder: 3,
      allowedBlocks: null,
    },
  ],
};

// ============================================================================
// Layout Registry
// ============================================================================

/**
 * Map of all built-in layouts by type.
 */
export const LAYOUT_REGISTRY: Record<LayoutType, LayoutConfig> = {
  classic: classicLayout,
  magazine: magazineLayout,
  portal: portalLayout,
  dashboard: dashboardLayout,
  focus: focusLayout,
  intranet: intranetLayout,
};

/**
 * Get a layout configuration by type.
 */
export function getLayout(type: LayoutType): LayoutConfig {
  return LAYOUT_REGISTRY[type];
}

/**
 * Get all layout configurations.
 */
export function getAllLayouts(): LayoutConfig[] {
  return Object.values(LAYOUT_REGISTRY);
}

/**
 * Get layouts by category.
 */
export function getLayoutsByCategory(category: LayoutConfig["category"]): LayoutConfig[] {
  return Object.values(LAYOUT_REGISTRY).filter((layout) => layout.category === category);
}

/**
 * Get layouts compatible with Wild Apricot.
 */
export function getWACompatibleLayouts(): LayoutConfig[] {
  return Object.values(LAYOUT_REGISTRY).filter((layout) => layout.waCompatible);
}

/**
 * Get layouts with left sidebar.
 */
export function getLayoutsWithLeftSidebar(): LayoutConfig[] {
  return Object.values(LAYOUT_REGISTRY).filter((layout) => layout.hasLeftSidebar);
}

/**
 * Get layouts that allow a specific auth position.
 */
export function getLayoutsWithAuthPosition(position: string): LayoutConfig[] {
  return Object.values(LAYOUT_REGISTRY).filter((layout) =>
    layout.allowedAuthPositions.includes(position as never)
  );
}
