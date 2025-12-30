/**
 * Data Block Schemas
 *
 * Schemas for data blocks: table, placeholder.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

import { z } from "zod";
import { type BlockDefinition } from "../types";
import { createBlockSchema } from "./helpers";

// ============================================================================
// Table Block
// ============================================================================

export const tableCellSchema = z.object({
  /** Cell content (text or HTML) */
  content: z.string().default(""),

  /** Cell type */
  type: z.enum(["text", "number", "date", "link", "image", "html"]).default("text"),

  /** Horizontal alignment */
  align: z.enum(["left", "center", "right"]).optional(),

  /** Vertical alignment */
  verticalAlign: z.enum(["top", "middle", "bottom"]).optional(),

  /** Column span */
  colspan: z.number().int().positive().optional(),

  /** Row span */
  rowspan: z.number().int().positive().optional(),

  /** Is header cell */
  isHeader: z.boolean().default(false),

  /** Link URL (for link type) */
  url: z.string().url().optional(),

  /** Image URL (for image type) */
  imageUrl: z.string().url().optional(),
});

export type TableCell = z.infer<typeof tableCellSchema>;

export const tableRowSchema = z.object({
  /** Row cells */
  cells: z.array(tableCellSchema).default([]),

  /** Is header row */
  isHeader: z.boolean().default(false),

  /** Is footer row */
  isFooter: z.boolean().default(false),
});

export type TableRow = z.infer<typeof tableRowSchema>;

export const tableColumnSchema = z.object({
  /** Column ID */
  id: z.string(),

  /** Column header text */
  header: z.string(),

  /** Column width (CSS value) */
  width: z.string().optional(),

  /** Minimum width */
  minWidth: z.string().optional(),

  /** Column alignment */
  align: z.enum(["left", "center", "right"]).default("left"),

  /** Is sortable */
  sortable: z.boolean().default(false),

  /** Data type (for sorting) */
  dataType: z.enum(["text", "number", "date"]).default("text"),
});

export type TableColumn = z.infer<typeof tableColumnSchema>;

export const tableBlockDataSchema = z.object({
  /** Table caption */
  caption: z.string().optional(),

  /** Column definitions */
  columns: z.array(tableColumnSchema).default([]),

  /** Table rows */
  rows: z.array(tableRowSchema).default([]),

  /** Has header row */
  hasHeader: z.boolean().default(true),

  /** Has footer row */
  hasFooter: z.boolean().default(false),

  /** Striped rows */
  striped: z.boolean().default(true),

  /** Bordered */
  bordered: z.boolean().default(true),

  /** Hoverable rows */
  hoverable: z.boolean().default(true),

  /** Compact/dense */
  compact: z.boolean().default(false),

  /** Responsive (horizontal scroll on mobile) */
  responsive: z.boolean().default(true),

  /** Sticky header */
  stickyHeader: z.boolean().default(false),

  /** Sortable columns */
  sortable: z.boolean().default(false),

  /** Default sort column ID */
  defaultSortColumn: z.string().optional(),

  /** Default sort direction */
  defaultSortDirection: z.enum(["asc", "desc"]).default("asc"),
});

export type TableBlockData = z.infer<typeof tableBlockDataSchema>;

export const tableBlockSchema = createBlockSchema("table", tableBlockDataSchema);

export type TableBlock = z.infer<typeof tableBlockSchema>;

export const tableBlockDefinition: BlockDefinition<TableBlock> = {
  type: "table",
  name: "Table",
  description: "Data table with rows and columns",
  category: "data",
  icon: "table",
  schema: tableBlockSchema,
  defaultData: {
    columns: [],
    rows: [],
    hasHeader: true,
    hasFooter: false,
    striped: true,
    bordered: true,
    hoverable: true,
    compact: false,
    responsive: true,
    stickyHeader: false,
    sortable: false,
    defaultSortDirection: "asc",
  },
  isContainer: false,
  emailCompatible: true, // Basic tables work in email
  keywords: ["table", "data", "grid", "spreadsheet"],
  version: 1,
};

// ============================================================================
// Placeholder Block
// ============================================================================

export const placeholderBlockDataSchema = z.object({
  /** Placeholder message */
  message: z.string().default("Content coming soon"),

  /** Placeholder height */
  height: z.string().default("200px"),

  /** Icon name */
  icon: z.string().optional(),

  /** Background style */
  style: z.enum(["default", "dashed", "dots", "subtle"]).default("dashed"),

  /** Show in preview mode only */
  previewOnly: z.boolean().default(true),
});

export type PlaceholderBlockData = z.infer<typeof placeholderBlockDataSchema>;

export const placeholderBlockSchema = createBlockSchema("placeholder", placeholderBlockDataSchema);

export type PlaceholderBlock = z.infer<typeof placeholderBlockSchema>;

export const placeholderBlockDefinition: BlockDefinition<PlaceholderBlock> = {
  type: "placeholder",
  name: "Placeholder",
  description: "Temporary placeholder content",
  category: "custom",
  icon: "box-select",
  schema: placeholderBlockSchema,
  defaultData: {
    message: "Content coming soon",
    height: "200px",
    style: "dashed",
    previewOnly: true,
  },
  isContainer: false,
  emailCompatible: false, // Placeholders shouldn't appear in email
  keywords: ["placeholder", "empty", "coming soon"],
  version: 1,
};

// ============================================================================
// Exports
// ============================================================================

export const dataBlockDefinitions = [tableBlockDefinition, placeholderBlockDefinition];
