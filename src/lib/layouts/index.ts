/**
 * Layout System
 *
 * Layouts define the structural skeleton of pages: navigation position,
 * sections, grid, sidebars, etc. Separate from Theme (appearance).
 *
 * @see docs/projects/PAGE_PRESENTATION_SYSTEM.md
 */

// Schema and types
export {
  // Schemas
  layoutTypeSchema,
  navPositionSchema,
  authPositionSchema,
  sectionTypeSchema,
  sectionConfigSchema,
  layoutConfigSchema,
  layoutMetadataSchema,
  // Types
  type LayoutType,
  type NavPosition,
  type AuthPosition,
  type SectionType,
  type SectionConfig,
  type LayoutConfig,
  type LayoutMetadata,
  // Type guards
  isValidLayoutType,
  isValidNavPosition,
  isValidAuthPosition,
  validateLayoutConfig,
  isValidLayoutConfig,
  // Constants
  LAYOUT_TYPES,
  NON_WA_LAYOUTS,
  LAYOUTS_WITH_LEFT_SIDEBAR,
  LAYOUTS_WITH_RIGHT_SIDEBAR,
} from "./schema";

// Registry
export {
  // Individual layouts
  classicLayout,
  magazineLayout,
  portalLayout,
  dashboardLayout,
  focusLayout,
  intranetLayout,
  // Registry
  LAYOUT_REGISTRY,
  getLayout,
  getAllLayouts,
  getLayoutsByCategory,
  getWACompatibleLayouts,
  getLayoutsWithLeftSidebar,
  getLayoutsWithAuthPosition,
} from "./registry";
