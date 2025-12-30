/**
 * Block System Types
 *
 * Core type definitions for the block-based content system.
 * Blocks are the atomic units of page content.
 *
 * Charter: P4 (no hidden rules), P6 (human-first UI), P8 (stable contracts)
 *
 * @see docs/projects/PAGE_PRESENTATION_SYSTEM.md
 */

import { z } from "zod";

// ============================================================================
// Block Categories
// ============================================================================

/**
 * Block categories for organization and filtering.
 */
export const blockCategorySchema = z.enum([
  "text", // Text-based blocks (headings, paragraphs, lists)
  "media", // Media blocks (images, video, audio, gallery)
  "layout", // Layout blocks (columns, divider, spacer)
  "interactive", // Interactive blocks (form, calendar, map)
  "embed", // Embedded content (iframe, social, code)
  "navigation", // Navigation blocks (menu, breadcrumb, toc)
  "data", // Data display blocks (table, chart)
  "custom", // Custom/plugin blocks
]);

export type BlockCategory = z.infer<typeof blockCategorySchema>;

// ============================================================================
// Block Type Enum
// ============================================================================

/**
 * All built-in block types.
 */
export const blockTypeSchema = z.enum([
  // Text blocks
  "text",
  "heading",
  "paragraph",
  "list",
  "quote",
  "code",

  // Media blocks
  "image",
  "gallery",
  "video",
  "audio",
  "file",

  // Layout blocks
  "columns",
  "divider",
  "spacer",
  "card",
  "accordion",
  "tabs",
  "carousel",

  // Interactive blocks
  "button",
  "button-group",
  "form",
  "interactive-calendar",
  "map",
  "search",

  // Embed blocks
  "html",
  "iframe",
  "social-embed",

  // Navigation blocks
  "menu",
  "breadcrumb",
  "table-of-contents",

  // Data blocks
  "table",

  // Special blocks
  "placeholder",
]);

export type BlockType = z.infer<typeof blockTypeSchema>;

// ============================================================================
// Block ID
// ============================================================================

/**
 * Block ID schema - UUID format.
 */
export const blockIdSchema = z.string().uuid();

export type BlockId = z.infer<typeof blockIdSchema>;

// ============================================================================
// Base Block Schema
// ============================================================================

/**
 * Base block type (for recursive reference).
 */
export interface BaseBlock {
  /** Unique block identifier */
  id: string;
  /** Block type */
  type: BlockType;
  /** Block version for migrations */
  version: number;
  /** Block-specific data (varies by type) */
  data: Record<string, unknown>;
  /** Block metadata */
  meta: {
    className?: string;
    style?: Record<string, string>;
    anchor?: string;
    visibility?: {
      hideOnMobile?: boolean;
      hideOnDesktop?: boolean;
      hideInEmail?: boolean;
    };
    animation?: {
      type?: string;
      delay?: number;
      duration?: number;
    };
  };
  /** Children blocks (for container blocks like columns) */
  children?: BaseBlock[];
}

/**
 * Common properties for all blocks.
 */
export const baseBlockSchema: z.ZodType<BaseBlock> = z.lazy(() =>
  z.object({
    /** Unique block identifier */
    id: blockIdSchema,

    /** Block type */
    type: blockTypeSchema,

    /** Block version for migrations */
    version: z.number().int().positive().default(1),

    /** Block-specific data (varies by type) */
    data: z.record(z.string(), z.unknown()).default({}),

    /** Block metadata */
    meta: z
      .object({
        /** Custom CSS classes */
        className: z.string().optional(),

        /** Inline styles (design tokens preferred) */
        style: z.record(z.string(), z.string()).optional(),

        /** Anchor ID for linking */
        anchor: z.string().optional(),

        /** Visibility settings */
        visibility: z
          .object({
            hideOnMobile: z.boolean().default(false),
            hideOnDesktop: z.boolean().default(false),
            hideInEmail: z.boolean().default(false),
          })
          .optional(),

        /** Animation settings */
        animation: z
          .object({
            type: z.string().optional(),
            delay: z.number().optional(),
            duration: z.number().optional(),
          })
          .optional(),
      })
      .default({}),

    /** Children blocks (for container blocks like columns) */
    children: z.array(baseBlockSchema).optional(),
  })
);

// ============================================================================
// Block Definition
// ============================================================================

/**
 * Block definition for the registry.
 */
export interface BlockDefinition<T extends BaseBlock = BaseBlock> {
  /** Block type identifier */
  type: BlockType;

  /** Display name */
  name: string;

  /** Description */
  description: string;

  /** Category */
  category: BlockCategory;

  /** Icon name */
  icon: string;

  /** Zod schema for this block type */
  schema: z.ZodType<T>;

  /** Default data for new blocks */
  defaultData: Record<string, unknown>;

  /** Whether block can contain children */
  isContainer: boolean;

  /** Allowed child block types (for containers) */
  allowedChildren?: BlockType[];

  /** Whether block is allowed in email context */
  emailCompatible: boolean;

  /** Keywords for search */
  keywords: string[];

  /** Block version */
  version: number;
}

// ============================================================================
// Block Render Context
// ============================================================================

/**
 * Context passed to block renderers.
 */
export interface BlockRenderContext {
  /** Page context (page, email, preview) */
  pageContext: "page" | "email" | "preview";

  /** Whether in edit mode */
  isEditing: boolean;

  /** Parent block type (if nested) */
  parentBlockType?: BlockType;

  /** Depth level for nested blocks */
  depth: number;

  /** Brand ID for theming */
  brandId?: string;

  /** Whether to render interactive elements */
  interactive: boolean;
}

// ============================================================================
// Block Renderer Props
// ============================================================================

/**
 * Props for block renderer components.
 */
export interface BlockRendererProps<T extends BaseBlock = BaseBlock> {
  /** The block to render */
  block: T;

  /** Render context */
  context: BlockRenderContext;

  /** Custom className */
  className?: string;

  /** Click handler (for edit mode) */
  onClick?: () => void;

  /** Whether block is selected (edit mode) */
  isSelected?: boolean;
}

// ============================================================================
// Block List
// ============================================================================

/**
 * A list of blocks (for sections).
 */
export const blockListSchema = z.array(baseBlockSchema);

export type BlockList = z.infer<typeof blockListSchema>;

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Extract the data type for a specific block type.
 */
export type BlockData<T extends BlockType> = T extends keyof BlockDataMap
  ? BlockDataMap[T]
  : Record<string, unknown>;

/**
 * Block data map - filled in by individual block schemas.
 * Uses placeholder type to satisfy ESLint no-empty-object-type rule.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BlockDataMap {
  // Will be extended by individual block schema files via declaration merging
}

/**
 * Type-safe block creation helper.
 */
export function createBlock<T extends BlockType>(
  type: T,
  data: BlockData<T>,
  id?: string
): BaseBlock {
  return {
    id: id ?? crypto.randomUUID(),
    type,
    version: 1,
    data,
    meta: {},
  };
}

// ============================================================================
// Constants
// ============================================================================

/**
 * All block types organized by category.
 */
export const BLOCK_TYPES_BY_CATEGORY: Record<BlockCategory, BlockType[]> = {
  text: ["text", "heading", "paragraph", "list", "quote", "code"],
  media: ["image", "gallery", "video", "audio", "file"],
  layout: ["columns", "divider", "spacer", "card", "accordion", "tabs", "carousel"],
  interactive: ["button", "button-group", "form", "interactive-calendar", "map", "search"],
  embed: ["html", "iframe", "social-embed"],
  navigation: ["menu", "breadcrumb", "table-of-contents"],
  data: ["table"],
  custom: ["placeholder"],
};

/**
 * Block types that are containers (can have children).
 */
export const CONTAINER_BLOCK_TYPES: BlockType[] = [
  "columns",
  "card",
  "accordion",
  "tabs",
  "carousel",
];

/**
 * Block types that are NOT allowed in email.
 */
export const EMAIL_EXCLUDED_BLOCK_TYPES: BlockType[] = [
  "video",
  "audio",
  "form",
  "interactive-calendar",
  "map",
  "search",
  "iframe",
  "tabs",
  "carousel",
  "accordion",
  "table-of-contents",
];

/**
 * Block types that are allowed in email.
 */
export const EMAIL_COMPATIBLE_BLOCK_TYPES: BlockType[] = [
  "text",
  "heading",
  "paragraph",
  "list",
  "quote",
  "image",
  "button",
  "button-group",
  "divider",
  "spacer",
  "columns",
  "table",
  "html",
];
