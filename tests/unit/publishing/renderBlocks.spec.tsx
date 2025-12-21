// Copyright (c) Santa Barbara Newcomers Club
// Unit tests for block rendering

import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import type { Block } from "@/lib/publishing/blocks";
import {
  renderBlock,
  renderBlocks,
  BlockRenderer,
  renderHero,
  renderText,
  renderImage,
  renderCta,
  renderDivider,
  renderSpacer,
  renderComplexPlaceholder,
} from "@/lib/publishing/renderBlocks";

// ============================================================================
// Test Fixtures
// ============================================================================

function createBlock(
  type: string,
  data: Record<string, unknown>,
  id?: string,
  order?: number
): Block {
  return {
    id: id || `test-${type}-${Date.now()}`,
    type: type as Block["type"],
    order: order ?? 0,
    data,
  } as Block;
}

// ============================================================================
// Simple Block Rendering Tests
// ============================================================================

describe("renderBlocks", () => {
  describe("hero block", () => {
    it("renders hero with required fields", () => {
      const block = createBlock("hero", { title: "Welcome" });
      const result = renderBlock(block, "test-hero");

      expect(result.ok).toBe(true);
      if (result.ok) {
        const html = renderToString(result.element);
        expect(html).toContain("Welcome");
        expect(html).toContain('data-block-type="hero"');
        expect(html).toContain('data-testid="test-hero"');
      }
    });

    it("renders hero with all optional fields", () => {
      const block = createBlock("hero", {
        title: "Big Title",
        subtitle: "A subtitle here",
        alignment: "left",
        ctaText: "Learn More",
        ctaLink: "/about",
        ctaStyle: "primary",
      });
      const result = renderBlock(block);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const html = renderToString(result.element);
        expect(html).toContain("Big Title");
        expect(html).toContain("A subtitle here");
        expect(html).toContain("Learn More");
        expect(html).toContain('href="/about"');
      }
    });

    it("fails validation for hero without title", () => {
      const block = createBlock("hero", { subtitle: "No title" });
      const result = renderBlock(block);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("title");
        expect(result.blockType).toBe("hero");
      }
    });
  });

  describe("text block", () => {
    it("renders text content", () => {
      const block = createBlock("text", {
        content: "<p>Hello <strong>World</strong></p>",
      });
      const result = renderBlock(block, "test-text");

      expect(result.ok).toBe(true);
      if (result.ok) {
        const html = renderToString(result.element);
        expect(html).toContain("<p>Hello <strong>World</strong></p>");
        expect(html).toContain('data-block-type="text"');
      }
    });

    it("renders text with alignment", () => {
      const block = createBlock("text", {
        content: "<p>Centered</p>",
        alignment: "center",
      });
      const result = renderBlock(block);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const html = renderToString(result.element);
        expect(html).toContain("text-align:center");
      }
    });

    it("fails validation for text without content", () => {
      const block = createBlock("text", {});
      const result = renderBlock(block);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("content");
      }
    });
  });

  describe("image block", () => {
    it("renders image with required fields", () => {
      const block = createBlock("image", {
        src: "/images/photo.jpg",
        alt: "A beautiful photo",
      });
      const result = renderBlock(block, "test-image");

      expect(result.ok).toBe(true);
      if (result.ok) {
        const html = renderToString(result.element);
        expect(html).toContain('src="/images/photo.jpg"');
        expect(html).toContain('alt="A beautiful photo"');
        expect(html).toContain('data-block-type="image"');
      }
    });

    it("renders image with caption", () => {
      const block = createBlock("image", {
        src: "/img.jpg",
        alt: "Alt text",
        caption: "Image caption here",
      });
      const result = renderBlock(block);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const html = renderToString(result.element);
        expect(html).toContain("<figcaption");
        expect(html).toContain("Image caption here");
      }
    });

    it("renders image with link", () => {
      const block = createBlock("image", {
        src: "/img.jpg",
        alt: "Linked image",
        linkUrl: "/target",
      });
      const result = renderBlock(block);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const html = renderToString(result.element);
        expect(html).toContain('href="/target"');
      }
    });

    it("fails validation for image without src", () => {
      const block = createBlock("image", { alt: "No source" });
      const result = renderBlock(block);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("src");
      }
    });

    it("fails validation for image without alt", () => {
      const block = createBlock("image", { src: "/img.jpg" });
      const result = renderBlock(block);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("alt");
      }
    });
  });

  describe("cta block", () => {
    it("renders CTA with required fields", () => {
      const block = createBlock("cta", {
        text: "Click Me",
        link: "/action",
      });
      const result = renderBlock(block, "test-cta");

      expect(result.ok).toBe(true);
      if (result.ok) {
        const html = renderToString(result.element);
        expect(html).toContain("Click Me");
        expect(html).toContain('href="/action"');
        expect(html).toContain('data-block-type="cta"');
      }
    });

    it("renders CTA with different styles", () => {
      const styles = ["primary", "secondary", "outline"] as const;

      for (const style of styles) {
        const block = createBlock("cta", {
          text: "Button",
          link: "/",
          style,
        });
        const result = renderBlock(block);
        expect(result.ok).toBe(true);
      }
    });

    it("renders CTA with different sizes", () => {
      const sizes = ["small", "medium", "large"] as const;

      for (const size of sizes) {
        const block = createBlock("cta", {
          text: "Button",
          link: "/",
          size,
        });
        const result = renderBlock(block);
        expect(result.ok).toBe(true);
      }
    });

    it("fails validation for CTA without text", () => {
      const block = createBlock("cta", { link: "/" });
      const result = renderBlock(block);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("text");
      }
    });

    it("fails validation for CTA without link", () => {
      const block = createBlock("cta", { text: "Click" });
      const result = renderBlock(block);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("link");
      }
    });
  });

  describe("divider block", () => {
    it("renders divider with defaults", () => {
      const block = createBlock("divider", {});
      const result = renderBlock(block, "test-divider");

      expect(result.ok).toBe(true);
      if (result.ok) {
        const html = renderToString(result.element);
        expect(html).toContain("<hr");
        expect(html).toContain('data-block-type="divider"');
      }
    });

    it("renders divider with different styles", () => {
      const styles = ["solid", "dashed", "dotted"] as const;

      for (const style of styles) {
        const block = createBlock("divider", { style });
        const result = renderBlock(block);

        expect(result.ok).toBe(true);
        if (result.ok) {
          const html = renderToString(result.element);
          expect(html).toContain(style);
        }
      }
    });

    it("renders divider with different widths", () => {
      const widths = ["full", "half", "quarter"] as const;

      for (const width of widths) {
        const block = createBlock("divider", { width });
        const result = renderBlock(block);
        expect(result.ok).toBe(true);
      }
    });
  });

  describe("spacer block", () => {
    it("renders spacer with defaults", () => {
      const block = createBlock("spacer", {});
      const result = renderBlock(block, "test-spacer");

      expect(result.ok).toBe(true);
      if (result.ok) {
        const html = renderToString(result.element);
        expect(html).toContain('data-block-type="spacer"');
        expect(html).toContain('aria-hidden="true"');
      }
    });

    it("renders spacer with different heights", () => {
      const heights = ["small", "medium", "large"] as const;
      const expectedHeights = { small: "16px", medium: "32px", large: "64px" };

      for (const height of heights) {
        const block = createBlock("spacer", { height });
        const result = renderBlock(block);

        expect(result.ok).toBe(true);
        if (result.ok) {
          const html = renderToString(result.element);
          expect(html).toContain(expectedHeights[height]);
        }
      }
    });
  });

  // ============================================================================
  // Complex Block Placeholder Tests
  // ============================================================================

  describe("complex block placeholders", () => {
    it("renders cards as placeholder", () => {
      const block = createBlock("cards", {
        columns: 3,
        cards: [
          { title: "Card 1" },
          { title: "Card 2" },
        ],
      });
      const result = renderBlock(block, "test-cards");

      expect(result.ok).toBe(true);
      if (result.ok) {
        const html = renderToString(result.element);
        expect(html).toContain("Cards");
        expect(html).toContain("[2 items]");
        expect(html).toContain('data-block-type="cards"');
      }
    });

    it("renders event-list as placeholder", () => {
      const block = createBlock("event-list", {
        limit: 5,
        layout: "list",
      });
      const result = renderBlock(block, "test-events");

      expect(result.ok).toBe(true);
      if (result.ok) {
        const html = renderToString(result.element);
        expect(html).toContain("Event List");
        expect(html).toContain('data-block-type="event-list"');
      }
    });

    it("renders gallery as placeholder", () => {
      const block = createBlock("gallery", {
        images: [{ src: "/a.jpg", alt: "A" }, { src: "/b.jpg", alt: "B" }],
        columns: 3,
      });
      const result = renderBlock(block);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const html = renderToString(result.element);
        expect(html).toContain("Gallery");
        expect(html).toContain("[2 items]");
      }
    });

    it("renders faq as placeholder", () => {
      const block = createBlock("faq", {
        items: [
          { question: "Q1?", answer: "A1" },
        ],
      });
      const result = renderBlock(block);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const html = renderToString(result.element);
        expect(html).toContain("FAQ");
        expect(html).toContain("[1 items]");
      }
    });

    it("renders contact as placeholder", () => {
      const block = createBlock("contact", {
        recipientEmail: "test@example.com",
        submitText: "Send",
      });
      const result = renderBlock(block);

      expect(result.ok).toBe(true);
      if (result.ok) {
        const html = renderToString(result.element);
        expect(html).toContain("Contact Form");
      }
    });
  });

  // ============================================================================
  // Validation Failure Tests
  // ============================================================================

  describe("validation failures", () => {
    it("returns error for unknown block type", () => {
      const block = createBlock("unknown-type", { foo: "bar" });
      const result = renderBlock(block);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain("Unknown block type");
      }
    });

    it("returns error details with block ID and type", () => {
      const block = createBlock("hero", {}, "block-123");
      const result = renderBlock(block);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.blockId).toBe("block-123");
        expect(result.blockType).toBe("hero");
      }
    });
  });

  // ============================================================================
  // renderBlocks (multiple) Tests
  // ============================================================================

  describe("renderBlocks function", () => {
    it("renders multiple blocks in order", () => {
      const blocks = [
        createBlock("hero", { title: "Title" }, "b1", 0),
        createBlock("text", { content: "<p>Body</p>" }, "b2", 1),
        createBlock("cta", { text: "Go", link: "/" }, "b3", 2),
      ];

      const elements = renderBlocks(blocks, "test");
      expect(elements).toHaveLength(3);

      const html = elements.map((el) => renderToString(el)).join("");
      expect(html).toContain("Title");
      expect(html).toContain("<p>Body</p>");
      expect(html).toContain("Go");
    });

    it("sorts blocks by order", () => {
      const blocks = [
        createBlock("text", { content: "<p>Second</p>" }, "b1", 1),
        createBlock("text", { content: "<p>First</p>" }, "b2", 0),
        createBlock("text", { content: "<p>Third</p>" }, "b3", 2),
      ];

      const elements = renderBlocks(blocks);
      const html = elements.map((el) => renderToString(el)).join("");

      const firstPos = html.indexOf("First");
      const secondPos = html.indexOf("Second");
      const thirdPos = html.indexOf("Third");

      expect(firstPos).toBeLessThan(secondPos);
      expect(secondPos).toBeLessThan(thirdPos);
    });

    it("renders error component for invalid blocks", () => {
      const blocks = [
        createBlock("hero", { title: "Valid" }, "b1", 0),
        createBlock("hero", {}, "b2", 1), // Invalid - no title
        createBlock("text", { content: "Also valid" }, "b3", 2),
      ];

      const elements = renderBlocks(blocks);
      expect(elements).toHaveLength(3);

      const html = elements.map((el) => renderToString(el)).join("");
      expect(html).toContain("Valid");
      expect(html).toContain("Block Error");
      expect(html).toContain("Also valid");
    });

    it("handles empty block array", () => {
      const elements = renderBlocks([]);
      expect(elements).toHaveLength(0);
    });
  });

  // ============================================================================
  // BlockRenderer Component Tests
  // ============================================================================

  describe("BlockRenderer component", () => {
    it("renders blocks as component", () => {
      const blocks = [
        createBlock("hero", { title: "Component Test" }, "b1", 0),
      ];

      const html = renderToString(
        <BlockRenderer blocks={blocks} testIdPrefix="comp" />
      );

      expect(html).toContain("Component Test");
      expect(html).toContain('data-testid="comp-block-0"');
    });

    it("renders empty for no blocks", () => {
      const html = renderToString(<BlockRenderer blocks={[]} />);
      expect(html).toBe("");
    });
  });

  // ============================================================================
  // Individual Renderer Export Tests
  // ============================================================================

  describe("exported individual renderers", () => {
    it("exports renderHero", () => {
      const block = createBlock("hero", { title: "Direct" });
      const element = renderHero(block);
      const html = renderToString(element);
      expect(html).toContain("Direct");
    });

    it("exports renderText", () => {
      const block = createBlock("text", { content: "<p>Direct</p>" });
      const element = renderText(block);
      const html = renderToString(element);
      expect(html).toContain("<p>Direct</p>");
    });

    it("exports renderImage", () => {
      const block = createBlock("image", { src: "/x.jpg", alt: "X" });
      const element = renderImage(block);
      const html = renderToString(element);
      expect(html).toContain('src="/x.jpg"');
    });

    it("exports renderCta", () => {
      const block = createBlock("cta", { text: "Go", link: "/" });
      const element = renderCta(block);
      const html = renderToString(element);
      expect(html).toContain("Go");
    });

    it("exports renderDivider", () => {
      const block = createBlock("divider", {});
      const element = renderDivider(block);
      const html = renderToString(element);
      expect(html).toContain("<hr");
    });

    it("exports renderSpacer", () => {
      const block = createBlock("spacer", {});
      const element = renderSpacer(block);
      const html = renderToString(element);
      expect(html).toContain('aria-hidden="true"');
    });

    it("exports renderComplexPlaceholder", () => {
      const block = createBlock("cards", { cards: [] });
      const element = renderComplexPlaceholder(block);
      const html = renderToString(element);
      expect(html).toContain("Cards");
    });
  });
});
