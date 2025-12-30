/**
 * Text Block Schemas
 *
 * Schemas for text-based blocks: text, heading, paragraph, list, quote, code.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

import { z } from "zod";
import { type BlockDefinition } from "../types";
import { createBlockSchema, createBlockSchemaWithComplexData } from "./helpers";

// Note: createBlockSchemaWithComplexData used for listBlockSchema due to recursive type

// ============================================================================
// Text Block
// ============================================================================

export const textBlockDataSchema = z.object({
  /** Rich text content (HTML or serialized editor state) */
  content: z.string().default(""),

  /** Text alignment */
  align: z.enum(["left", "center", "right", "justify"]).default("left"),
});

export type TextBlockData = z.infer<typeof textBlockDataSchema>;

export const textBlockSchema = createBlockSchema("text", textBlockDataSchema);

export type TextBlock = z.infer<typeof textBlockSchema>;

export const textBlockDefinition: BlockDefinition<TextBlock> = {
  type: "text",
  name: "Text",
  description: "Rich text content with formatting",
  category: "text",
  icon: "type",
  schema: textBlockSchema,
  defaultData: { content: "", align: "left" },
  isContainer: false,
  emailCompatible: true,
  keywords: ["text", "paragraph", "content", "write"],
  version: 1,
};

// ============================================================================
// Heading Block
// ============================================================================

export const headingBlockDataSchema = z.object({
  /** Heading text */
  text: z.string().default(""),

  /** Heading level (1-6) */
  level: z.number().int().min(1).max(6).default(2),

  /** Text alignment */
  align: z.enum(["left", "center", "right"]).default("left"),
});

export type HeadingBlockData = z.infer<typeof headingBlockDataSchema>;

export const headingBlockSchema = createBlockSchema("heading", headingBlockDataSchema);

export type HeadingBlock = z.infer<typeof headingBlockSchema>;

export const headingBlockDefinition: BlockDefinition<HeadingBlock> = {
  type: "heading",
  name: "Heading",
  description: "Section heading (H1-H6)",
  category: "text",
  icon: "heading",
  schema: headingBlockSchema,
  defaultData: { text: "", level: 2, align: "left" },
  isContainer: false,
  emailCompatible: true,
  keywords: ["heading", "title", "h1", "h2", "h3", "section"],
  version: 1,
};

// ============================================================================
// Paragraph Block
// ============================================================================

export const paragraphBlockDataSchema = z.object({
  /** Paragraph text (plain or with inline formatting) */
  text: z.string().default(""),

  /** Text alignment */
  align: z.enum(["left", "center", "right", "justify"]).default("left"),

  /** Drop cap style */
  dropCap: z.boolean().default(false),
});

export type ParagraphBlockData = z.infer<typeof paragraphBlockDataSchema>;

export const paragraphBlockSchema = createBlockSchema("paragraph", paragraphBlockDataSchema);

export type ParagraphBlock = z.infer<typeof paragraphBlockSchema>;

export const paragraphBlockDefinition: BlockDefinition<ParagraphBlock> = {
  type: "paragraph",
  name: "Paragraph",
  description: "Simple text paragraph",
  category: "text",
  icon: "align-left",
  schema: paragraphBlockSchema,
  defaultData: { text: "", align: "left", dropCap: false },
  isContainer: false,
  emailCompatible: true,
  keywords: ["paragraph", "text", "body"],
  version: 1,
};

// ============================================================================
// List Block
// ============================================================================

/** List item type for recursive reference */
interface ListItemType {
  text: string;
  children?: ListItemType[];
}

export const listItemSchema: z.ZodType<ListItemType> = z.lazy(() =>
  z.object({
    /** List item text */
    text: z.string(),

    /** Nested items */
    children: z.array(listItemSchema).optional(),
  })
);

export type ListItem = z.infer<typeof listItemSchema>;

export const listBlockDataSchema = z.object({
  /** List style */
  style: z.enum(["bullet", "numbered", "check"]).default("bullet"),

  /** List items */
  items: z.array(listItemSchema).default([]),
});

export type ListBlockData = z.infer<typeof listBlockDataSchema>;

export const listBlockSchema = createBlockSchemaWithComplexData("list", listBlockDataSchema);

export type ListBlock = z.infer<typeof listBlockSchema>;

export const listBlockDefinition: BlockDefinition<ListBlock> = {
  type: "list",
  name: "List",
  description: "Bulleted, numbered, or checklist",
  category: "text",
  icon: "list",
  schema: listBlockSchema,
  defaultData: { style: "bullet", items: [] },
  isContainer: false,
  emailCompatible: true,
  keywords: ["list", "bullet", "numbered", "checklist", "todo"],
  version: 1,
};

// ============================================================================
// Quote Block
// ============================================================================

export const quoteBlockDataSchema = z.object({
  /** Quote text */
  text: z.string().default(""),

  /** Attribution/citation */
  citation: z.string().optional(),

  /** Citation URL */
  citationUrl: z.string().url().optional(),

  /** Quote style */
  style: z.enum(["default", "large", "bordered"]).default("default"),
});

export type QuoteBlockData = z.infer<typeof quoteBlockDataSchema>;

export const quoteBlockSchema = createBlockSchema("quote", quoteBlockDataSchema);

export type QuoteBlock = z.infer<typeof quoteBlockSchema>;

export const quoteBlockDefinition: BlockDefinition<QuoteBlock> = {
  type: "quote",
  name: "Quote",
  description: "Blockquote with optional citation",
  category: "text",
  icon: "quote",
  schema: quoteBlockSchema,
  defaultData: { text: "", style: "default" },
  isContainer: false,
  emailCompatible: true,
  keywords: ["quote", "blockquote", "citation", "testimonial"],
  version: 1,
};

// ============================================================================
// Code Block
// ============================================================================

export const codeBlockDataSchema = z.object({
  /** Code content */
  code: z.string().default(""),

  /** Programming language */
  language: z.string().default("plaintext"),

  /** Show line numbers */
  lineNumbers: z.boolean().default(true),

  /** Highlight specific lines */
  highlightLines: z.array(z.number().int().positive()).optional(),

  /** Caption/filename */
  caption: z.string().optional(),
});

export type CodeBlockData = z.infer<typeof codeBlockDataSchema>;

export const codeBlockSchema = createBlockSchema("code", codeBlockDataSchema);

export type CodeBlock = z.infer<typeof codeBlockSchema>;

export const codeBlockDefinition: BlockDefinition<CodeBlock> = {
  type: "code",
  name: "Code",
  description: "Code block with syntax highlighting",
  category: "text",
  icon: "code",
  schema: codeBlockSchema,
  defaultData: { code: "", language: "plaintext", lineNumbers: true },
  isContainer: false,
  emailCompatible: false, // Code blocks don't render well in email
  keywords: ["code", "snippet", "programming", "syntax"],
  version: 1,
};

// ============================================================================
// Exports
// ============================================================================

export const textBlockDefinitions = [
  textBlockDefinition,
  headingBlockDefinition,
  paragraphBlockDefinition,
  listBlockDefinition,
  quoteBlockDefinition,
  codeBlockDefinition,
];
