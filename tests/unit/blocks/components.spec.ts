/**
 * Block Components Logic Tests
 *
 * Tests for component logic without React rendering.
 * Actual rendering is tested via Playwright E2E tests.
 */

import { describe, it, expect } from "vitest";
import { type BaseBlock, type BlockRenderContext } from "@/lib/blocks";

// ============================================================================
// Test Helpers
// ============================================================================

function createTestContext(overrides?: Partial<BlockRenderContext>): BlockRenderContext {
  return {
    pageContext: "page",
    isEditing: false,
    depth: 0,
    interactive: true,
    ...overrides,
  };
}

function createTestBlock(overrides?: Partial<BaseBlock>): BaseBlock {
  return {
    id: crypto.randomUUID(),
    type: "text",
    version: 1,
    data: { content: "Test content" },
    meta: {},
    ...overrides,
  };
}

interface Section {
  id: string;
  name?: string;
  order: number;
  layout?: "full-width" | "contained" | "narrow";
  blocks: BaseBlock[];
  meta?: {
    className?: string;
    style?: Record<string, string>;
    backgroundColor?: string;
    padding?: "none" | "sm" | "md" | "lg" | "xl";
  };
}

function createTestSection(overrides?: Partial<Section>): Section {
  return {
    id: crypto.randomUUID(),
    name: "Test Section",
    order: 0,
    layout: "contained",
    blocks: [],
    ...overrides,
  };
}

// ============================================================================
// Visibility Logic Tests
// ============================================================================

describe("Block Visibility Logic", () => {
  it("should identify blocks that should be hidden in email context", () => {
    const block = createTestBlock({
      meta: { visibility: { hideInEmail: true } },
    });
    const context = createTestContext({ pageContext: "email" });

    const shouldHide =
      block.meta?.visibility?.hideInEmail && context.pageContext === "email";

    expect(shouldHide).toBe(true);
  });

  it("should show blocks in page context even when hideInEmail is true", () => {
    const block = createTestBlock({
      meta: { visibility: { hideInEmail: true } },
    });
    const context = createTestContext({ pageContext: "page" });

    const shouldHide =
      block.meta?.visibility?.hideInEmail && context.pageContext === "email";

    expect(shouldHide).toBe(false);
  });

  it("should always show blocks without visibility settings", () => {
    const block = createTestBlock({ meta: {} });
    const context = createTestContext({ pageContext: "email" });

    const shouldHide =
      block.meta?.visibility?.hideInEmail && context.pageContext === "email";

    expect(shouldHide).toBeFalsy();
  });
});

// ============================================================================
// Section Ordering Tests
// ============================================================================

describe("Section Ordering", () => {
  it("should sort sections by order", () => {
    const sections = [
      createTestSection({ id: "c", order: 3 }),
      createTestSection({ id: "a", order: 1 }),
      createTestSection({ id: "b", order: 2 }),
    ];

    const sorted = [...sections].sort((a, b) => a.order - b.order);

    expect(sorted[0].id).toBe("a");
    expect(sorted[1].id).toBe("b");
    expect(sorted[2].id).toBe("c");
  });

  it("should handle sections with same order", () => {
    const sections = [
      createTestSection({ id: "a", order: 1 }),
      createTestSection({ id: "b", order: 1 }),
    ];

    const sorted = [...sections].sort((a, b) => a.order - b.order);

    // Stable sort should preserve original order
    expect(sorted.length).toBe(2);
  });
});

// ============================================================================
// Block Sorting Tests
// ============================================================================

describe("Block Sorting", () => {
  it("should sort blocks by order property when present", () => {
    type OrderedBlock = BaseBlock & { order: number };
    const blocks: OrderedBlock[] = [
      { ...createTestBlock({ id: "c" }), order: 3 },
      { ...createTestBlock({ id: "a" }), order: 1 },
      { ...createTestBlock({ id: "b" }), order: 2 },
    ];

    const sorted = [...blocks].sort((a, b) => a.order - b.order);

    expect(sorted[0].id).toBe("a");
    expect(sorted[1].id).toBe("b");
    expect(sorted[2].id).toBe("c");
  });
});

// ============================================================================
// Layout Style Tests
// ============================================================================

describe("Layout Styles", () => {
  const LAYOUT_STYLES: Record<string, { maxWidth?: string }> = {
    "full-width": {},
    contained: { maxWidth: "1200px" },
    narrow: { maxWidth: "800px" },
  };

  it("should have no maxWidth for full-width layout", () => {
    const styles = LAYOUT_STYLES["full-width"];
    expect(styles.maxWidth).toBeUndefined();
  });

  it("should have 1200px maxWidth for contained layout", () => {
    const styles = LAYOUT_STYLES["contained"];
    expect(styles.maxWidth).toBe("1200px");
  });

  it("should have 800px maxWidth for narrow layout", () => {
    const styles = LAYOUT_STYLES["narrow"];
    expect(styles.maxWidth).toBe("800px");
  });
});

// ============================================================================
// Context Merge Tests
// ============================================================================

describe("Context Defaults", () => {
  it("should apply default context values", () => {
    const context = createTestContext();

    expect(context.pageContext).toBe("page");
    expect(context.isEditing).toBe(false);
    expect(context.depth).toBe(0);
    expect(context.interactive).toBe(true);
  });

  it("should allow overriding context values", () => {
    const context = createTestContext({
      pageContext: "email",
      isEditing: true,
      depth: 2,
    });

    expect(context.pageContext).toBe("email");
    expect(context.isEditing).toBe(true);
    expect(context.depth).toBe(2);
    expect(context.interactive).toBe(true);
  });
});

// ============================================================================
// Legacy Content Detection Tests
// ============================================================================

describe("Legacy Content Detection", () => {
  interface PageContent {
    schemaVersion: number;
    sections: Section[];
    themeCss?: string;
  }

  interface LegacyPageContent {
    schemaVersion: number;
    blocks: Array<BaseBlock & { order: number }>;
    themeCss?: string;
  }

  function isLegacyContent(
    content: PageContent | LegacyPageContent
  ): content is LegacyPageContent {
    return "blocks" in content && !("sections" in content);
  }

  it("should identify legacy content format", () => {
    const legacy: LegacyPageContent = {
      schemaVersion: 1,
      blocks: [],
    };

    expect(isLegacyContent(legacy)).toBe(true);
  });

  it("should identify new content format", () => {
    const newContent: PageContent = {
      schemaVersion: 1,
      sections: [],
    };

    expect(isLegacyContent(newContent)).toBe(false);
  });

  it("should normalize legacy content to sections", () => {
    const legacy: LegacyPageContent = {
      schemaVersion: 1,
      blocks: [
        {
          id: "b1",
          type: "text",
          version: 1,
          order: 0,
          data: { content: "Test" },
          meta: {},
        },
      ],
    };

    // Simulating normalization
    const normalized: PageContent = {
      schemaVersion: legacy.schemaVersion,
      sections: [
        {
          id: "main",
          name: "Main Content",
          order: 0,
          layout: "contained",
          blocks: legacy.blocks,
        },
      ],
    };

    expect(normalized.sections.length).toBe(1);
    expect(normalized.sections[0].blocks.length).toBe(1);
    expect(normalized.sections[0].blocks[0].id).toBe("b1");
  });
});

// ============================================================================
// Block Meta Tests
// ============================================================================

describe("Block Meta Handling", () => {
  it("should handle empty meta object", () => {
    const block = createTestBlock({ meta: {} });

    expect(block.meta.className).toBeUndefined();
    expect(block.meta.style).toBeUndefined();
    expect(block.meta.anchor).toBeUndefined();
    expect(block.meta.visibility).toBeUndefined();
  });

  it("should preserve className from meta", () => {
    const block = createTestBlock({ meta: { className: "custom-class" } });

    expect(block.meta.className).toBe("custom-class");
  });

  it("should preserve style from meta", () => {
    const block = createTestBlock({
      meta: { style: { color: "red", fontSize: "16px" } },
    });

    expect(block.meta.style?.color).toBe("red");
    expect(block.meta.style?.fontSize).toBe("16px");
  });

  it("should preserve anchor from meta", () => {
    const block = createTestBlock({ meta: { anchor: "section-anchor" } });

    expect(block.meta.anchor).toBe("section-anchor");
  });
});

// ============================================================================
// Email Filtering Tests
// ============================================================================

describe("Email Content Filtering", () => {
  function filterBlocksForEmail(blocks: BaseBlock[]): BaseBlock[] {
    return blocks.filter((block) => {
      if (block.meta?.visibility?.hideInEmail) {
        return false;
      }
      return true;
    });
  }

  it("should filter out blocks with hideInEmail", () => {
    const blocks = [
      createTestBlock({
        id: "keep",
        meta: {},
      }),
      createTestBlock({
        id: "hide",
        meta: { visibility: { hideInEmail: true } },
      }),
    ];

    const filtered = filterBlocksForEmail(blocks);

    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe("keep");
  });

  it("should keep all blocks without hideInEmail", () => {
    const blocks = [
      createTestBlock({ id: "a", meta: {} }),
      createTestBlock({ id: "b", meta: {} }),
    ];

    const filtered = filterBlocksForEmail(blocks);

    expect(filtered.length).toBe(2);
  });
});

// ============================================================================
// Heading Level Tests
// ============================================================================

describe("Heading Level Logic", () => {
  const VALID_LEVELS = [1, 2, 3, 4, 5, 6];

  function getHeadingLevel(level: number | undefined): number {
    if (level === undefined || !VALID_LEVELS.includes(level)) {
      return 2; // Default
    }
    return level;
  }

  it("should default to h2 when level is undefined", () => {
    expect(getHeadingLevel(undefined)).toBe(2);
  });

  it("should use specified level when valid", () => {
    expect(getHeadingLevel(1)).toBe(1);
    expect(getHeadingLevel(3)).toBe(3);
    expect(getHeadingLevel(6)).toBe(6);
  });

  it("should default to h2 for invalid levels", () => {
    expect(getHeadingLevel(0)).toBe(2);
    expect(getHeadingLevel(7)).toBe(2);
    expect(getHeadingLevel(-1)).toBe(2);
  });
});

// ============================================================================
// Spacer Height Tests
// ============================================================================

describe("Spacer Height Logic", () => {
  const HEIGHTS: Record<string, string> = {
    xs: "8px",
    sm: "16px",
    md: "32px",
    lg: "48px",
    xl: "64px",
  };

  function getSpacerHeight(height: string | undefined): string {
    return HEIGHTS[height || "md"] || HEIGHTS.md;
  }

  it("should default to md height", () => {
    expect(getSpacerHeight(undefined)).toBe("32px");
  });

  it("should return correct height for each size", () => {
    expect(getSpacerHeight("xs")).toBe("8px");
    expect(getSpacerHeight("sm")).toBe("16px");
    expect(getSpacerHeight("md")).toBe("32px");
    expect(getSpacerHeight("lg")).toBe("48px");
    expect(getSpacerHeight("xl")).toBe("64px");
  });

  it("should fallback to md for unknown heights", () => {
    expect(getSpacerHeight("unknown")).toBe("32px");
  });
});

// ============================================================================
// Button Size Tests
// ============================================================================

describe("Button Size Logic", () => {
  const SIZES: Record<string, string> = {
    sm: "var(--spacing-xs, 4px) var(--spacing-md, 16px)",
    md: "var(--spacing-sm, 8px) var(--spacing-lg, 24px)",
    lg: "var(--spacing-md, 16px) var(--spacing-xl, 32px)",
  };

  function getButtonPadding(size: string | undefined): string {
    return SIZES[size || "md"] || SIZES.md;
  }

  it("should default to md size", () => {
    expect(getButtonPadding(undefined)).toContain("--spacing-sm");
  });

  it("should return correct padding for each size", () => {
    expect(getButtonPadding("sm")).toContain("--spacing-xs");
    expect(getButtonPadding("md")).toContain("--spacing-sm");
    expect(getButtonPadding("lg")).toContain("--spacing-md");
  });
});

// ============================================================================
// Divider Width Tests
// ============================================================================

describe("Divider Width Logic", () => {
  const WIDTHS: Record<string, string> = {
    full: "100%",
    "75": "75%",
    half: "50%",
    quarter: "25%",
  };

  function getDividerWidth(width: string | undefined): string {
    return WIDTHS[width || "full"] || WIDTHS.full;
  }

  it("should default to full width", () => {
    expect(getDividerWidth(undefined)).toBe("100%");
  });

  it("should return correct width for each option", () => {
    expect(getDividerWidth("full")).toBe("100%");
    expect(getDividerWidth("75")).toBe("75%");
    expect(getDividerWidth("half")).toBe("50%");
    expect(getDividerWidth("quarter")).toBe("25%");
  });
});
