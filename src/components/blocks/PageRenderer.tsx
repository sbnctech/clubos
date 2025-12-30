/**
 * Page Renderer
 *
 * Renders a complete page from sections and blocks.
 * Supports both the new Zod-validated block system and legacy blocks.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 *
 * @see src/lib/blocks/types.ts
 */

import { type BaseBlock, type BlockRenderContext } from "@/lib/blocks";
import { SectionRenderer, type Section } from "./SectionRenderer";

// ============================================================================
// Types
// ============================================================================

/**
 * Page content structure using the new block system.
 */
export interface PageContent {
  /** Schema version for migrations */
  schemaVersion: number;

  /** Page sections */
  sections: Section[];

  /** Optional theme CSS */
  themeCss?: string;
}

/**
 * Legacy page content structure (for backward compatibility).
 */
export interface LegacyPageContent {
  schemaVersion: number;
  blocks: Array<BaseBlock & { order: number }>;
  themeCss?: string;
}

export interface PageRendererProps {
  /** Page content (supports both new and legacy formats) */
  content: PageContent | LegacyPageContent;

  /** Render context */
  context?: Partial<BlockRenderContext>;

  /** Custom className for the page wrapper */
  className?: string;

  /** Block click handler (for edit mode) */
  onBlockClick?: (blockId: string) => void;

  /** Currently selected block ID (for edit mode) */
  selectedBlockId?: string;
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Check if content is in the legacy format.
 */
function isLegacyContent(content: PageContent | LegacyPageContent): content is LegacyPageContent {
  return "blocks" in content && !("sections" in content);
}

/**
 * Convert legacy content to the new sections format.
 */
function normalizeLegacyContent(legacy: LegacyPageContent): PageContent {
  // Create a single section containing all blocks
  const section: Section = {
    id: "main",
    name: "Main Content",
    order: 0,
    layout: "contained",
    blocks: legacy.blocks.map((block) => ({
      ...block,
      // Ensure version is set
      version: block.version || 1,
      // Ensure meta is set
      meta: block.meta || {},
    })),
  };

  return {
    schemaVersion: legacy.schemaVersion,
    sections: [section],
    themeCss: legacy.themeCss,
  };
}

/**
 * Create default render context.
 */
function createDefaultContext(overrides?: Partial<BlockRenderContext>): BlockRenderContext {
  return {
    pageContext: "page",
    isEditing: false,
    depth: 0,
    interactive: true,
    ...overrides,
  };
}

// ============================================================================
// Page Renderer Component
// ============================================================================

/**
 * Renders a complete page from sections and blocks.
 *
 * @example
 * ```tsx
 * <PageRenderer
 *   content={pageContent}
 *   context={{ pageContext: "preview" }}
 * />
 * ```
 */
export function PageRenderer({
  content,
  context: contextOverrides,
  className,
  onBlockClick,
  selectedBlockId,
}: PageRendererProps) {
  // Normalize content to new format
  const normalizedContent = isLegacyContent(content)
    ? normalizeLegacyContent(content)
    : content;

  // Build render context
  const context = createDefaultContext(contextOverrides);

  // Sort sections by order
  const sortedSections = [...normalizedContent.sections].sort(
    (a, b) => a.order - b.order
  );

  return (
    <div data-test-id="page-content" className={className}>
      {/* Inject theme CSS if provided */}
      {normalizedContent.themeCss && (
        <style dangerouslySetInnerHTML={{ __html: normalizedContent.themeCss }} />
      )}

      {/* Render sections */}
      {sortedSections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          context={context}
          onBlockClick={onBlockClick}
          selectedBlockId={selectedBlockId}
        />
      ))}
    </div>
  );
}

/**
 * Email-specific page renderer that filters out incompatible blocks.
 */
export function EmailPageRenderer({
  content,
  context: contextOverrides,
  className,
}: Omit<PageRendererProps, "onBlockClick" | "selectedBlockId">) {
  // Force email context
  const emailContext = createDefaultContext({
    ...contextOverrides,
    pageContext: "email",
    interactive: false,
  });

  // Normalize content
  const normalizedContent = isLegacyContent(content)
    ? normalizeLegacyContent(content)
    : content;

  // Filter sections to remove email-incompatible blocks
  const filteredSections = normalizedContent.sections.map((section) => ({
    ...section,
    blocks: section.blocks.filter((block) => {
      // Check if block has hideInEmail visibility setting
      if (block.meta?.visibility?.hideInEmail) {
        return false;
      }
      // Allow all blocks that don't explicitly hide in email
      // The BlockComponent will handle unknown types gracefully
      return true;
    }),
  }));

  // Sort sections by order
  const sortedSections = [...filteredSections].sort((a, b) => a.order - b.order);

  return (
    <div data-test-id="email-content" className={className}>
      {sortedSections.map((section) => (
        <SectionRenderer
          key={section.id}
          section={section}
          context={emailContext}
        />
      ))}
    </div>
  );
}

export default PageRenderer;
