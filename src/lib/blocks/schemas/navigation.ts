/**
 * Navigation Block Schemas
 *
 * Schemas for navigation blocks: menu, breadcrumb, table-of-contents.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

import { z } from "zod";
import { type BlockDefinition } from "../types";
import { createBlockSchema, createBlockSchemaWithComplexData } from "./helpers";

// ============================================================================
// Menu Block
// ============================================================================

/** Menu item type for recursive reference */
interface MenuItemType {
  id: string;
  label: string;
  url?: string;
  newTab?: boolean;
  icon?: string;
  children?: MenuItemType[];
  highlighted?: boolean;
  badge?: string;
}

export const menuItemSchema: z.ZodType<MenuItemType> = z.lazy(() =>
  z.object({
    /** Item ID */
    id: z.string(),

    /** Display label */
    label: z.string(),

    /** Link URL */
    url: z.string().optional(),

    /** Open in new tab */
    newTab: z.boolean().default(false),

    /** Icon name */
    icon: z.string().optional(),

    /** Submenu items */
    children: z.array(menuItemSchema).optional(),

    /** Whether item is highlighted/active */
    highlighted: z.boolean().default(false),

    /** Badge text (e.g., "New") */
    badge: z.string().optional(),
  })
);

export type MenuItem = z.infer<typeof menuItemSchema>;

export const menuBlockDataSchema = z.object({
  /** Menu items */
  items: z.array(menuItemSchema).default([]),

  /** Menu orientation */
  orientation: z.enum(["horizontal", "vertical"]).default("horizontal"),

  /** Menu style */
  style: z.enum(["default", "pills", "underline", "minimal"]).default("default"),

  /** Size */
  size: z.enum(["sm", "md", "lg"]).default("md"),

  /** Alignment */
  align: z.enum(["left", "center", "right", "stretch"]).default("left"),

  /** Show icons */
  showIcons: z.boolean().default(true),

  /** Collapse to hamburger on mobile */
  collapseOnMobile: z.boolean().default(true),

  /** Dropdown behavior */
  dropdownTrigger: z.enum(["hover", "click"]).default("hover"),
});

export type MenuBlockData = z.infer<typeof menuBlockDataSchema>;

export const menuBlockSchema = createBlockSchemaWithComplexData("menu", menuBlockDataSchema);

export type MenuBlock = z.infer<typeof menuBlockSchema>;

export const menuBlockDefinition: BlockDefinition<MenuBlock> = {
  type: "menu",
  name: "Menu",
  description: "Navigation menu",
  category: "navigation",
  icon: "menu",
  schema: menuBlockSchema,
  defaultData: {
    items: [],
    orientation: "horizontal",
    style: "default",
    size: "md",
    align: "left",
    showIcons: true,
    collapseOnMobile: true,
    dropdownTrigger: "hover",
  },
  isContainer: false,
  emailCompatible: false, // Interactive menus don't work in email
  keywords: ["menu", "navigation", "nav", "links"],
  version: 1,
};

// ============================================================================
// Breadcrumb Block
// ============================================================================

export const breadcrumbItemSchema = z.object({
  /** Item label */
  label: z.string(),

  /** Item URL (optional for current page) */
  url: z.string().optional(),

  /** Icon name */
  icon: z.string().optional(),
});

export type BreadcrumbItem = z.infer<typeof breadcrumbItemSchema>;

export const breadcrumbBlockDataSchema = z.object({
  /** Breadcrumb items */
  items: z.array(breadcrumbItemSchema).default([]),

  /** Separator style */
  separator: z.enum(["slash", "chevron", "arrow", "dot"]).default("chevron"),

  /** Size */
  size: z.enum(["sm", "md", "lg"]).default("md"),

  /** Show home icon */
  showHomeIcon: z.boolean().default(true),

  /** Auto-generate from page hierarchy */
  autoGenerate: z.boolean().default(false),

  /** Max items to show (collapse middle) */
  maxItems: z.number().int().positive().optional(),
});

export type BreadcrumbBlockData = z.infer<typeof breadcrumbBlockDataSchema>;

export const breadcrumbBlockSchema = createBlockSchema("breadcrumb", breadcrumbBlockDataSchema);

export type BreadcrumbBlock = z.infer<typeof breadcrumbBlockSchema>;

export const breadcrumbBlockDefinition: BlockDefinition<BreadcrumbBlock> = {
  type: "breadcrumb",
  name: "Breadcrumb",
  description: "Navigation breadcrumb trail",
  category: "navigation",
  icon: "chevrons-right",
  schema: breadcrumbBlockSchema,
  defaultData: {
    items: [],
    separator: "chevron",
    size: "md",
    showHomeIcon: true,
    autoGenerate: false,
  },
  isContainer: false,
  emailCompatible: false, // Breadcrumbs don't make sense in email
  keywords: ["breadcrumb", "navigation", "trail", "path"],
  version: 1,
};

// ============================================================================
// Table of Contents Block
// ============================================================================

export const tableOfContentsBlockDataSchema = z.object({
  /** Heading levels to include */
  levels: z.array(z.number().int().min(1).max(6)).default([2, 3]),

  /** Title text */
  title: z.string().default("Table of Contents"),

  /** Show title */
  showTitle: z.boolean().default(true),

  /** List style */
  listStyle: z.enum(["none", "bullet", "numbered"]).default("none"),

  /** Indentation style */
  indented: z.boolean().default(true),

  /** Smooth scroll to anchors */
  smoothScroll: z.boolean().default(true),

  /** Sticky position */
  sticky: z.boolean().default(false),

  /** Sticky top offset */
  stickyOffset: z.string().default("80px"),

  /** Collapsible sections */
  collapsible: z.boolean().default(false),

  /** Max depth to show */
  maxDepth: z.number().int().min(1).max(6).default(3),

  /** Border style */
  bordered: z.boolean().default(true),
});

export type TableOfContentsBlockData = z.infer<typeof tableOfContentsBlockDataSchema>;

export const tableOfContentsBlockSchema = createBlockSchema(
  "table-of-contents",
  tableOfContentsBlockDataSchema
);

export type TableOfContentsBlock = z.infer<typeof tableOfContentsBlockSchema>;

export const tableOfContentsBlockDefinition: BlockDefinition<TableOfContentsBlock> = {
  type: "table-of-contents",
  name: "Table of Contents",
  description: "Auto-generated page outline",
  category: "navigation",
  icon: "list-tree",
  schema: tableOfContentsBlockSchema,
  defaultData: {
    levels: [2, 3],
    title: "Table of Contents",
    showTitle: true,
    listStyle: "none",
    indented: true,
    smoothScroll: true,
    sticky: false,
    stickyOffset: "80px",
    collapsible: false,
    maxDepth: 3,
    bordered: true,
  },
  isContainer: false,
  emailCompatible: false, // TOC with anchors doesn't work in email
  keywords: ["toc", "table of contents", "outline", "headings"],
  version: 1,
};

// ============================================================================
// Exports
// ============================================================================

export const navigationBlockDefinitions = [
  menuBlockDefinition,
  breadcrumbBlockDefinition,
  tableOfContentsBlockDefinition,
];
