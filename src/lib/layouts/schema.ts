/**
 * Layout System Schema
 *
 * Layouts define the structural skeleton of pages: navigation position,
 * sections, grid, sidebars, etc. Separate from Theme (appearance).
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 *
 * @see docs/projects/PAGE_PRESENTATION_SYSTEM.md
 * @see docs/design/LAYOUT_CONCEPTS.md
 */

import { z } from "zod";

// ============================================================================
// Layout Type Enum
// ============================================================================

/**
 * Built-in layout types.
 *
 * - classic: Simple top nav, no sidebars (WA-compatible)
 * - magazine: Top nav + right sidebar (WA cannot do this)
 * - portal: Top nav + left sidebar nav (WA cannot do this)
 * - dashboard: Top nav + left sidebar (admin-style)
 * - focus: Minimal chrome, centered content (articles, forms)
 * - intranet: Top nav + dual sidebars (rich intranet)
 */
export const layoutTypeSchema = z.enum([
  "classic",
  "magazine",
  "portal",
  "dashboard",
  "focus",
  "intranet",
]);

export type LayoutType = z.infer<typeof layoutTypeSchema>;

// ============================================================================
// Navigation Position Enum
// ============================================================================

export const navPositionSchema = z.enum([
  "top", // Horizontal top navigation bar
  "left", // Vertical left sidebar navigation
  "top-left", // Both top bar and left sidebar
  "minimal", // Logo + account only
  "none", // No navigation (for embedded content)
]);

export type NavPosition = z.infer<typeof navPositionSchema>;

// ============================================================================
// Auth Position Enum
// ============================================================================

/**
 * Where the auth status / user menu appears.
 *
 * - top-right: Traditional web app placement
 * - bottom-left: Modern app-style sidebar (Linear, Notion)
 * - header: In the header bar (alongside logo)
 */
export const authPositionSchema = z.enum([
  "top-right",
  "bottom-left",
  "header",
]);

export type AuthPosition = z.infer<typeof authPositionSchema>;

// ============================================================================
// Section Schema
// ============================================================================

/**
 * Section types for layout zones.
 */
export const sectionTypeSchema = z.enum([
  "header", // Site header with logo/nav
  "hero", // Full-width hero area
  "main", // Primary content area
  "sidebar", // Sidebar content (left or right)
  "panel", // Secondary panel (right side)
  "footer", // Site footer
  "nav-left", // Left navigation sidebar
  "nav-right", // Right navigation/panel
]);

export type SectionType = z.infer<typeof sectionTypeSchema>;

/**
 * Section configuration for a layout.
 */
export const sectionConfigSchema = z.object({
  id: z.string().min(1).describe("Unique section identifier"),
  type: sectionTypeSchema.describe("Section type"),
  name: z.string().min(1).describe("Display name (e.g., 'Main Content')"),

  // Grid placement
  gridArea: z.string().describe("CSS grid-area name"),

  // Size constraints
  minWidth: z.string().optional().describe("Minimum width (CSS value)"),
  maxWidth: z.string().optional().describe("Maximum width (CSS value)"),
  defaultWidth: z.string().optional().describe("Default width (CSS value)"),

  // Block restrictions (null = all blocks allowed)
  allowedBlocks: z
    .array(z.string())
    .nullable()
    .optional()
    .describe("Allowed block types (null = all)"),
  maxBlocks: z.number().optional().describe("Maximum number of blocks"),

  // Responsive behavior
  hideOnMobile: z.boolean().default(false).describe("Hide on mobile devices"),
  mobileOrder: z.number().optional().describe("Order in mobile stack"),
  collapseOnMobile: z
    .boolean()
    .default(false)
    .describe("Collapse to accordion on mobile"),

  // Optional
  isOptional: z.boolean().default(false).describe("Section can be empty"),
  defaultContent: z
    .unknown()
    .optional()
    .describe("Default content when section is created"),
});

export type SectionConfig = z.infer<typeof sectionConfigSchema>;

// ============================================================================
// Layout Configuration Schema
// ============================================================================

/**
 * Complete layout configuration.
 */
export const layoutConfigSchema = z.object({
  // Identity
  id: layoutTypeSchema.describe("Layout type identifier"),
  name: z.string().min(1).max(50).describe("Display name"),
  description: z.string().optional().describe("Layout description"),

  // Navigation
  navPosition: navPositionSchema.describe("Primary navigation position"),
  hasLeftSidebar: z.boolean().describe("Whether layout has left sidebar"),
  hasRightSidebar: z.boolean().describe("Whether layout has right sidebar"),

  // Auth
  allowedAuthPositions: z
    .array(authPositionSchema)
    .min(1)
    .describe("Allowed auth UI positions"),
  defaultAuthPosition: authPositionSchema.describe("Default auth position"),

  // Sections
  sections: z.array(sectionConfigSchema).min(1).describe("Layout sections"),

  // CSS Grid
  gridTemplate: z.string().describe("CSS grid-template-areas"),
  gridColumns: z.string().describe("CSS grid-template-columns"),
  gridRows: z.string().optional().describe("CSS grid-template-rows"),

  // Responsive
  mobileBreakpoint: z.string().default("768px").describe("Mobile breakpoint"),
  mobileGridTemplate: z
    .string()
    .optional()
    .describe("Mobile grid-template-areas"),

  // Wild Apricot compatibility
  waCompatible: z.boolean().describe("Can be replicated in Wild Apricot"),

  // Metadata
  category: z
    .enum(["simple", "content", "app", "admin"])
    .describe("Layout category for organization"),
  icon: z.string().optional().describe("Icon name for layout picker"),
});

export type LayoutConfig = z.infer<typeof layoutConfigSchema>;

// ============================================================================
// Layout Metadata Schema (for database/storage)
// ============================================================================

/**
 * Layout metadata stored in database.
 * Extends the built-in layouts with custom overrides.
 */
export const layoutMetadataSchema = z.object({
  // Identity
  layoutType: layoutTypeSchema,
  brandId: z.string().optional().describe("Brand this layout belongs to"),

  // Overrides
  authPosition: authPositionSchema.optional(),
  customGridTemplate: z.string().optional(),
  sectionOverrides: z
    .record(z.string(), sectionConfigSchema.partial())
    .optional(),

  // Timestamps
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type LayoutMetadata = z.infer<typeof layoutMetadataSchema>;

// ============================================================================
// Type Guards and Validation
// ============================================================================

export function isValidLayoutType(value: unknown): value is LayoutType {
  return layoutTypeSchema.safeParse(value).success;
}

export function isValidNavPosition(value: unknown): value is NavPosition {
  return navPositionSchema.safeParse(value).success;
}

export function isValidAuthPosition(value: unknown): value is AuthPosition {
  return authPositionSchema.safeParse(value).success;
}

export function validateLayoutConfig(config: unknown): LayoutConfig {
  return layoutConfigSchema.parse(config);
}

export function isValidLayoutConfig(config: unknown): config is LayoutConfig {
  return layoutConfigSchema.safeParse(config).success;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * All layout types for iteration.
 */
export const LAYOUT_TYPES: LayoutType[] = [
  "classic",
  "magazine",
  "portal",
  "dashboard",
  "focus",
  "intranet",
];

/**
 * Layout types that Wild Apricot cannot replicate.
 */
export const NON_WA_LAYOUTS: LayoutType[] = [
  "magazine",
  "portal",
  "dashboard",
  "intranet",
];

/**
 * Layout types that have left sidebars (for compatibility checks).
 */
export const LAYOUTS_WITH_LEFT_SIDEBAR: LayoutType[] = [
  "portal",
  "dashboard",
  "intranet",
];

/**
 * Layout types that have right sidebars.
 */
export const LAYOUTS_WITH_RIGHT_SIDEBAR: LayoutType[] = [
  "magazine",
  "intranet",
];
