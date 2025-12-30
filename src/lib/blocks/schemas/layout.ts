/**
 * Layout Block Schemas
 *
 * Schemas for layout blocks: columns, divider, spacer, card, accordion, tabs, carousel.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

import { z } from "zod";
import { type BaseBlock, type BlockDefinition } from "../types";
import { createBlockSchema, createBlockSchemaWithComplexData } from "./helpers";

// ============================================================================
// Columns Block
// ============================================================================

/** Column type for recursive reference */
interface ColumnType {
  width: string;
  blocks: BaseBlock[];
  verticalAlign: "top" | "center" | "bottom" | "stretch";
  backgroundColor?: string;
  padding?: string;
}

export const columnSchema: z.ZodType<ColumnType> = z.lazy(() =>
  z.object({
    /** Column width (CSS value or fraction) */
    width: z.string().default("1fr"),

    /** Column content (block IDs or inline blocks) */
    blocks: z.array(z.lazy((): z.ZodType<BaseBlock> => z.any())).default([]),

    /** Vertical alignment */
    verticalAlign: z.enum(["top", "center", "bottom", "stretch"]).default("top"),

    /** Background color (token reference) */
    backgroundColor: z.string().optional(),

    /** Padding */
    padding: z.string().optional(),
  })
);

export type Column = z.infer<typeof columnSchema>;

export const columnsBlockDataSchema = z.object({
  /** Column definitions */
  columns: z.array(columnSchema).min(1).max(6).default([
    { width: "1fr", blocks: [], verticalAlign: "top" },
    { width: "1fr", blocks: [], verticalAlign: "top" },
  ]),

  /** Gap between columns */
  gap: z.enum(["none", "sm", "md", "lg", "xl"]).default("md"),

  /** Stack on mobile */
  stackOnMobile: z.boolean().default(true),

  /** Reverse order on mobile */
  reverseOnMobile: z.boolean().default(false),

  /** Vertical alignment */
  verticalAlign: z.enum(["top", "center", "bottom", "stretch"]).default("top"),
});

export type ColumnsBlockData = z.infer<typeof columnsBlockDataSchema>;

export const columnsBlockSchema = createBlockSchemaWithComplexData(
  "columns",
  columnsBlockDataSchema
);

export type ColumnsBlock = z.infer<typeof columnsBlockSchema>;

export const columnsBlockDefinition: BlockDefinition<ColumnsBlock> = {
  type: "columns",
  name: "Columns",
  description: "Multi-column layout",
  category: "layout",
  icon: "columns",
  schema: columnsBlockSchema,
  defaultData: {
    columns: [
      { width: "1fr", blocks: [], verticalAlign: "top" },
      { width: "1fr", blocks: [], verticalAlign: "top" },
    ],
    gap: "md",
    stackOnMobile: true,
    reverseOnMobile: false,
    verticalAlign: "top",
  },
  isContainer: true,
  allowedChildren: undefined, // All block types allowed
  emailCompatible: true, // Basic columns work in email
  keywords: ["columns", "layout", "grid", "side-by-side"],
  version: 1,
};

// ============================================================================
// Divider Block
// ============================================================================

export const dividerBlockDataSchema = z.object({
  /** Divider style */
  style: z.enum(["solid", "dashed", "dotted", "gradient"]).default("solid"),

  /** Divider thickness */
  thickness: z.enum(["thin", "medium", "thick"]).default("thin"),

  /** Divider color (token reference) */
  color: z.string().optional(),

  /** Divider width */
  width: z.enum(["full", "wide", "medium", "narrow"]).default("full"),

  /** Alignment */
  align: z.enum(["left", "center", "right"]).default("center"),

  /** Vertical margin */
  margin: z.enum(["none", "sm", "md", "lg", "xl"]).default("md"),
});

export type DividerBlockData = z.infer<typeof dividerBlockDataSchema>;

export const dividerBlockSchema = createBlockSchema("divider", dividerBlockDataSchema);

export type DividerBlock = z.infer<typeof dividerBlockSchema>;

export const dividerBlockDefinition: BlockDefinition<DividerBlock> = {
  type: "divider",
  name: "Divider",
  description: "Horizontal line separator",
  category: "layout",
  icon: "minus",
  schema: dividerBlockSchema,
  defaultData: {
    style: "solid",
    thickness: "thin",
    width: "full",
    align: "center",
    margin: "md",
  },
  isContainer: false,
  emailCompatible: true,
  keywords: ["divider", "line", "separator", "hr"],
  version: 1,
};

// ============================================================================
// Spacer Block
// ============================================================================

export const spacerBlockDataSchema = z.object({
  /** Spacer height */
  height: z.enum(["xs", "sm", "md", "lg", "xl", "2xl"]).default("md"),

  /** Custom height (CSS value) */
  customHeight: z.string().optional(),

  /** Hide on mobile */
  hideOnMobile: z.boolean().default(false),
});

export type SpacerBlockData = z.infer<typeof spacerBlockDataSchema>;

export const spacerBlockSchema = createBlockSchema("spacer", spacerBlockDataSchema);

export type SpacerBlock = z.infer<typeof spacerBlockSchema>;

export const spacerBlockDefinition: BlockDefinition<SpacerBlock> = {
  type: "spacer",
  name: "Spacer",
  description: "Vertical whitespace",
  category: "layout",
  icon: "move-vertical",
  schema: spacerBlockSchema,
  defaultData: {
    height: "md",
    hideOnMobile: false,
  },
  isContainer: false,
  emailCompatible: true,
  keywords: ["spacer", "space", "whitespace", "gap"],
  version: 1,
};

// ============================================================================
// Card Block
// ============================================================================

export const cardBlockDataSchema = z.object({
  /** Card content blocks */
  blocks: z.array(z.lazy((): z.ZodType<BaseBlock> => z.any())).default([]),

  /** Card title */
  title: z.string().optional(),

  /** Card subtitle */
  subtitle: z.string().optional(),

  /** Header image URL */
  headerImage: z.string().url().optional(),

  /** Background color */
  backgroundColor: z.string().optional(),

  /** Border */
  border: z.boolean().default(true),

  /** Shadow */
  shadow: z.enum(["none", "sm", "md", "lg"]).default("sm"),

  /** Border radius */
  borderRadius: z.enum(["none", "sm", "md", "lg"]).default("md"),

  /** Padding */
  padding: z.enum(["none", "sm", "md", "lg"]).default("md"),

  /** Link URL (makes entire card clickable) */
  link: z.string().url().optional(),
});

export type CardBlockData = z.infer<typeof cardBlockDataSchema>;

export const cardBlockSchema = createBlockSchemaWithComplexData("card", cardBlockDataSchema);

export type CardBlock = z.infer<typeof cardBlockSchema>;

export const cardBlockDefinition: BlockDefinition<CardBlock> = {
  type: "card",
  name: "Card",
  description: "Content card with optional header",
  category: "layout",
  icon: "square",
  schema: cardBlockSchema,
  defaultData: {
    blocks: [],
    border: true,
    shadow: "sm",
    borderRadius: "md",
    padding: "md",
  },
  isContainer: true,
  emailCompatible: true, // Basic cards work in email
  keywords: ["card", "box", "container", "panel"],
  version: 1,
};

// ============================================================================
// Accordion Block
// ============================================================================

/** Accordion item type for recursive reference */
interface AccordionItemType {
  id: string;
  title: string;
  blocks: BaseBlock[];
  defaultOpen: boolean;
}

export const accordionItemSchema: z.ZodType<AccordionItemType> = z.lazy(() =>
  z.object({
    /** Item ID */
    id: z.string(),

    /** Item title */
    title: z.string(),

    /** Item content blocks */
    blocks: z.array(z.lazy((): z.ZodType<BaseBlock> => z.any())).default([]),

    /** Initially expanded */
    defaultOpen: z.boolean().default(false),
  })
);

export type AccordionItem = z.infer<typeof accordionItemSchema>;

export const accordionBlockDataSchema = z.object({
  /** Accordion items */
  items: z.array(accordionItemSchema).default([]),

  /** Allow multiple open */
  allowMultiple: z.boolean().default(false),

  /** Icon position */
  iconPosition: z.enum(["left", "right"]).default("right"),

  /** Border style */
  bordered: z.boolean().default(true),

  /** Separator between items */
  separated: z.boolean().default(false),
});

export type AccordionBlockData = z.infer<typeof accordionBlockDataSchema>;

export const accordionBlockSchema = createBlockSchemaWithComplexData(
  "accordion",
  accordionBlockDataSchema
);

export type AccordionBlock = z.infer<typeof accordionBlockSchema>;

export const accordionBlockDefinition: BlockDefinition<AccordionBlock> = {
  type: "accordion",
  name: "Accordion",
  description: "Collapsible content sections",
  category: "layout",
  icon: "chevrons-down",
  schema: accordionBlockSchema,
  defaultData: {
    items: [],
    allowMultiple: false,
    iconPosition: "right",
    bordered: true,
    separated: false,
  },
  isContainer: true,
  emailCompatible: false, // Accordions don't work in email
  keywords: ["accordion", "collapse", "expand", "faq"],
  version: 1,
};

// ============================================================================
// Tabs Block
// ============================================================================

/** Tab item type for recursive reference */
interface TabItemType {
  id: string;
  label: string;
  icon?: string;
  blocks: BaseBlock[];
}

export const tabItemSchema: z.ZodType<TabItemType> = z.lazy(() =>
  z.object({
    /** Tab ID */
    id: z.string(),

    /** Tab label */
    label: z.string(),

    /** Tab icon */
    icon: z.string().optional(),

    /** Tab content blocks */
    blocks: z.array(z.lazy((): z.ZodType<BaseBlock> => z.any())).default([]),
  })
);

export type TabItem = z.infer<typeof tabItemSchema>;

export const tabsBlockDataSchema = z.object({
  /** Tab items */
  tabs: z.array(tabItemSchema).default([]),

  /** Default active tab ID */
  defaultTab: z.string().optional(),

  /** Tab alignment */
  align: z.enum(["left", "center", "right", "stretch"]).default("left"),

  /** Tab style */
  style: z.enum(["default", "pills", "underline", "enclosed"]).default("default"),

  /** Tab size */
  size: z.enum(["sm", "md", "lg"]).default("md"),
});

export type TabsBlockData = z.infer<typeof tabsBlockDataSchema>;

export const tabsBlockSchema = createBlockSchemaWithComplexData("tabs", tabsBlockDataSchema);

export type TabsBlock = z.infer<typeof tabsBlockSchema>;

export const tabsBlockDefinition: BlockDefinition<TabsBlock> = {
  type: "tabs",
  name: "Tabs",
  description: "Tabbed content sections",
  category: "layout",
  icon: "layout-list",
  schema: tabsBlockSchema,
  defaultData: {
    tabs: [],
    align: "left",
    style: "default",
    size: "md",
  },
  isContainer: true,
  emailCompatible: false, // Tabs don't work in email
  keywords: ["tabs", "tabbed", "sections"],
  version: 1,
};

// ============================================================================
// Carousel Block
// ============================================================================

/** Carousel slide type for recursive reference */
interface CarouselSlideType {
  id: string;
  blocks: BaseBlock[];
  backgroundImage?: string;
  backgroundColor?: string;
}

export const carouselSlideSchema: z.ZodType<CarouselSlideType> = z.lazy(() =>
  z.object({
    /** Slide ID */
    id: z.string(),

    /** Slide content blocks */
    blocks: z.array(z.lazy((): z.ZodType<BaseBlock> => z.any())).default([]),

    /** Background image */
    backgroundImage: z.string().url().optional(),

    /** Background color */
    backgroundColor: z.string().optional(),
  })
);

export type CarouselSlide = z.infer<typeof carouselSlideSchema>;

export const carouselBlockDataSchema = z.object({
  /** Carousel slides */
  slides: z.array(carouselSlideSchema).default([]),

  /** Autoplay */
  autoplay: z.boolean().default(false),

  /** Autoplay interval (ms) */
  interval: z.number().int().positive().default(5000),

  /** Show navigation arrows */
  showArrows: z.boolean().default(true),

  /** Show dots/indicators */
  showDots: z.boolean().default(true),

  /** Enable infinite loop */
  infinite: z.boolean().default(true),

  /** Slides to show */
  slidesToShow: z.number().int().min(1).max(6).default(1),

  /** Aspect ratio */
  aspectRatio: z.enum(["16:9", "4:3", "1:1", "auto"]).default("16:9"),
});

export type CarouselBlockData = z.infer<typeof carouselBlockDataSchema>;

export const carouselBlockSchema = createBlockSchemaWithComplexData(
  "carousel",
  carouselBlockDataSchema
);

export type CarouselBlock = z.infer<typeof carouselBlockSchema>;

export const carouselBlockDefinition: BlockDefinition<CarouselBlock> = {
  type: "carousel",
  name: "Carousel",
  description: "Sliding content carousel",
  category: "layout",
  icon: "presentation",
  schema: carouselBlockSchema,
  defaultData: {
    slides: [],
    autoplay: false,
    interval: 5000,
    showArrows: true,
    showDots: true,
    infinite: true,
    slidesToShow: 1,
    aspectRatio: "16:9",
  },
  isContainer: true,
  emailCompatible: false, // Carousels don't work in email
  keywords: ["carousel", "slider", "slideshow"],
  version: 1,
};

// ============================================================================
// Exports
// ============================================================================

export const layoutBlockDefinitions = [
  columnsBlockDefinition,
  dividerBlockDefinition,
  spacerBlockDefinition,
  cardBlockDefinition,
  accordionBlockDefinition,
  tabsBlockDefinition,
  carouselBlockDefinition,
];
