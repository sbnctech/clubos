/**
 * Section Renderer
 *
 * Renders a section containing multiple blocks.
 * Handles section layout, spacing, and block ordering.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 *
 * @see src/lib/blocks/types.ts
 */

import { type BaseBlock, type BlockRenderContext } from "@/lib/blocks";
import { BlockComponent } from "./BlockComponent";

// ============================================================================
// Types
// ============================================================================

export interface Section {
  /** Unique section identifier */
  id: string;

  /** Section name (for admin/editor) */
  name?: string;

  /** Section order */
  order: number;

  /** Layout hint */
  layout?: "full-width" | "contained" | "narrow";

  /** Blocks in this section */
  blocks: BaseBlock[];

  /** Section metadata */
  meta?: {
    className?: string;
    style?: Record<string, string>;
    backgroundColor?: string;
    padding?: "none" | "sm" | "md" | "lg" | "xl";
  };
}

export interface SectionRendererProps {
  /** The section to render */
  section: Section;

  /** Render context */
  context: BlockRenderContext;

  /** Custom className */
  className?: string;

  /** Block click handler (for edit mode) */
  onBlockClick?: (blockId: string) => void;

  /** Currently selected block ID (for edit mode) */
  selectedBlockId?: string;
}

// ============================================================================
// Layout Styles
// ============================================================================

const LAYOUT_STYLES: Record<string, React.CSSProperties> = {
  "full-width": {
    width: "100%",
  },
  contained: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 var(--spacing-md, 16px)",
  },
  narrow: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "0 var(--spacing-md, 16px)",
  },
};

const PADDING_STYLES: Record<string, string> = {
  none: "0",
  sm: "var(--spacing-sm, 8px) 0",
  md: "var(--spacing-md, 16px) 0",
  lg: "var(--spacing-lg, 24px) 0",
  xl: "var(--spacing-xl, 48px) 0",
};

// ============================================================================
// Section Renderer Component
// ============================================================================

/**
 * Renders a section with its blocks.
 */
export function SectionRenderer({
  section,
  context,
  className,
  onBlockClick,
  selectedBlockId,
}: SectionRendererProps) {
  // Sort blocks by order if they have an order property
  const sortedBlocks = [...section.blocks].sort((a, b) => {
    // Use version as a fallback for order since BaseBlock doesn't have order
    const orderA = (a as BaseBlock & { order?: number }).order ?? a.version;
    const orderB = (b as BaseBlock & { order?: number }).order ?? b.version;
    return orderA - orderB;
  });

  // Build section styles
  const layoutStyle = LAYOUT_STYLES[section.layout || "contained"];
  const paddingStyle = PADDING_STYLES[section.meta?.padding || "md"];

  const sectionStyle: React.CSSProperties = {
    ...layoutStyle,
    padding: paddingStyle,
    backgroundColor: section.meta?.backgroundColor,
    ...(section.meta?.style as React.CSSProperties),
  };

  return (
    <section
      data-test-id="page-section"
      data-section-id={section.id}
      data-section-name={section.name}
      className={[section.meta?.className, className].filter(Boolean).join(" ") || undefined}
      style={sectionStyle}
    >
      {sortedBlocks.map((block) => (
        <BlockComponent
          key={block.id}
          block={block}
          context={context}
          onClick={onBlockClick ? () => onBlockClick(block.id) : undefined}
          isSelected={selectedBlockId === block.id}
        />
      ))}
    </section>
  );
}

export default SectionRenderer;
