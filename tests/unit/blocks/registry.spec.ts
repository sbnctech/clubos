/**
 * Block Registry Tests
 *
 * Tests for the block registry and schema validation.
 */

import { describe, it, expect } from "vitest";
import {
  allBlockDefinitions,
  blockRegistry,
  getBlockDefinition,
  requireBlockDefinition,
  getBlockDefinitionsByCategory,
  getEmailCompatibleBlockDefinitions,
  getContainerBlockDefinitions,
  isEmailCompatible,
  isContainerBlock,
  searchBlockDefinitions,
  createDefaultBlock,
  createBlock,
  validateBlock,
  validateBlocks,
  filterBlocksForEmail,
  getAllowedChildTypes,
  isChildTypeAllowed,
} from "@/lib/blocks";

describe("Block Registry", () => {
  describe("allBlockDefinitions", () => {
    it("should contain all expected block types", () => {
      const types = allBlockDefinitions.map((def) => def.type);

      // Text blocks
      expect(types).toContain("text");
      expect(types).toContain("heading");
      expect(types).toContain("paragraph");
      expect(types).toContain("list");
      expect(types).toContain("quote");
      expect(types).toContain("code");

      // Media blocks
      expect(types).toContain("image");
      expect(types).toContain("gallery");
      expect(types).toContain("video");
      expect(types).toContain("audio");
      expect(types).toContain("file");

      // Layout blocks
      expect(types).toContain("columns");
      expect(types).toContain("divider");
      expect(types).toContain("spacer");
      expect(types).toContain("card");
      expect(types).toContain("accordion");
      expect(types).toContain("tabs");
      expect(types).toContain("carousel");

      // Interactive blocks
      expect(types).toContain("button");
      expect(types).toContain("button-group");
      expect(types).toContain("form");
      expect(types).toContain("interactive-calendar");
      expect(types).toContain("map");
      expect(types).toContain("search");

      // Embed blocks
      expect(types).toContain("html");
      expect(types).toContain("iframe");
      expect(types).toContain("social-embed");

      // Navigation blocks
      expect(types).toContain("menu");
      expect(types).toContain("breadcrumb");
      expect(types).toContain("table-of-contents");

      // Data blocks
      expect(types).toContain("table");
      expect(types).toContain("placeholder");
    });

    it("should have unique block types", () => {
      const types = allBlockDefinitions.map((def) => def.type);
      const uniqueTypes = [...new Set(types)];
      expect(types.length).toBe(uniqueTypes.length);
    });
  });

  describe("blockRegistry", () => {
    it("should provide indexed access to block definitions", () => {
      expect(blockRegistry.text).toBeDefined();
      expect(blockRegistry.text.type).toBe("text");
      expect(blockRegistry.heading).toBeDefined();
      expect(blockRegistry.image).toBeDefined();
    });
  });

  describe("getBlockDefinition", () => {
    it("should return definition for valid type", () => {
      const def = getBlockDefinition("text");
      expect(def).toBeDefined();
      expect(def?.type).toBe("text");
      expect(def?.name).toBe("Text");
    });

    it("should return undefined for invalid type", () => {
      // @ts-expect-error - testing invalid type
      const def = getBlockDefinition("invalid-type");
      expect(def).toBeUndefined();
    });
  });

  describe("requireBlockDefinition", () => {
    it("should return definition for valid type", () => {
      const def = requireBlockDefinition("heading");
      expect(def.type).toBe("heading");
    });

    it("should throw for invalid type", () => {
      expect(() => {
        // @ts-expect-error - testing invalid type
        requireBlockDefinition("invalid-type");
      }).toThrow("Unknown block type");
    });
  });

  describe("getBlockDefinitionsByCategory", () => {
    it("should return text blocks", () => {
      const defs = getBlockDefinitionsByCategory("text");
      expect(defs.length).toBeGreaterThan(0);
      expect(defs.every((d) => d.category === "text")).toBe(true);
      expect(defs.map((d) => d.type)).toContain("heading");
    });

    it("should return media blocks", () => {
      const defs = getBlockDefinitionsByCategory("media");
      expect(defs.length).toBeGreaterThan(0);
      expect(defs.every((d) => d.category === "media")).toBe(true);
      expect(defs.map((d) => d.type)).toContain("image");
    });

    it("should return layout blocks", () => {
      const defs = getBlockDefinitionsByCategory("layout");
      expect(defs.length).toBeGreaterThan(0);
      expect(defs.every((d) => d.category === "layout")).toBe(true);
      expect(defs.map((d) => d.type)).toContain("columns");
    });
  });

  describe("getEmailCompatibleBlockDefinitions", () => {
    it("should return only email-compatible blocks", () => {
      const defs = getEmailCompatibleBlockDefinitions();
      expect(defs.every((d) => d.emailCompatible)).toBe(true);
    });

    it("should include text, image, and button blocks", () => {
      const types = getEmailCompatibleBlockDefinitions().map((d) => d.type);
      expect(types).toContain("text");
      expect(types).toContain("heading");
      expect(types).toContain("image");
      expect(types).toContain("button");
    });

    it("should exclude video, audio, form blocks", () => {
      const types = getEmailCompatibleBlockDefinitions().map((d) => d.type);
      expect(types).not.toContain("video");
      expect(types).not.toContain("audio");
      expect(types).not.toContain("form");
    });
  });

  describe("getContainerBlockDefinitions", () => {
    it("should return only container blocks", () => {
      const defs = getContainerBlockDefinitions();
      expect(defs.every((d) => d.isContainer)).toBe(true);
    });

    it("should include columns, card, accordion, tabs, carousel", () => {
      const types = getContainerBlockDefinitions().map((d) => d.type);
      expect(types).toContain("columns");
      expect(types).toContain("card");
      expect(types).toContain("accordion");
      expect(types).toContain("tabs");
      expect(types).toContain("carousel");
    });
  });

  describe("isEmailCompatible", () => {
    it("should return true for email-compatible blocks", () => {
      expect(isEmailCompatible("text")).toBe(true);
      expect(isEmailCompatible("heading")).toBe(true);
      expect(isEmailCompatible("image")).toBe(true);
      expect(isEmailCompatible("button")).toBe(true);
    });

    it("should return false for non-email-compatible blocks", () => {
      expect(isEmailCompatible("video")).toBe(false);
      expect(isEmailCompatible("form")).toBe(false);
      expect(isEmailCompatible("carousel")).toBe(false);
    });
  });

  describe("isContainerBlock", () => {
    it("should return true for container blocks", () => {
      expect(isContainerBlock("columns")).toBe(true);
      expect(isContainerBlock("card")).toBe(true);
      expect(isContainerBlock("tabs")).toBe(true);
    });

    it("should return false for non-container blocks", () => {
      expect(isContainerBlock("text")).toBe(false);
      expect(isContainerBlock("image")).toBe(false);
      expect(isContainerBlock("button")).toBe(false);
    });
  });

  describe("searchBlockDefinitions", () => {
    it("should find blocks by name", () => {
      const results = searchBlockDefinitions("text");
      expect(results.length).toBeGreaterThan(0);
      expect(results.some((d) => d.type === "text")).toBe(true);
    });

    it("should find blocks by keyword", () => {
      const results = searchBlockDefinitions("youtube");
      expect(results.some((d) => d.type === "video")).toBe(true);
    });

    it("should find blocks by description", () => {
      const results = searchBlockDefinitions("call-to-action");
      expect(results.some((d) => d.type === "button")).toBe(true);
    });

    it("should be case-insensitive", () => {
      const results = searchBlockDefinitions("IMAGE");
      expect(results.some((d) => d.type === "image")).toBe(true);
    });
  });
});

describe("Block Creation", () => {
  describe("createDefaultBlock", () => {
    it("should create a block with default data", () => {
      const block = createDefaultBlock("text");
      expect(block.type).toBe("text");
      expect(block.id).toBeDefined();
      expect(block.version).toBe(1);
      expect(block.data).toEqual({ content: "", align: "left" });
    });

    it("should create a heading block with defaults", () => {
      const block = createDefaultBlock("heading");
      expect(block.type).toBe("heading");
      expect(block.data).toEqual({ text: "", level: 2, align: "left" });
    });

    it("should use provided ID", () => {
      const block = createDefaultBlock("text", "custom-id");
      expect(block.id).toBe("custom-id");
    });

    it("should throw for invalid type", () => {
      expect(() => {
        // @ts-expect-error - testing invalid type
        createDefaultBlock("invalid-type");
      }).toThrow();
    });
  });

  describe("createBlock", () => {
    it("should create a block with custom data", () => {
      const block = createBlock("heading", { text: "Hello World", level: 1 });
      expect(block.type).toBe("heading");
      expect(block.data).toMatchObject({ text: "Hello World", level: 1 });
    });

    it("should merge with defaults", () => {
      const block = createBlock("heading", { text: "Hello" });
      expect(block.data).toMatchObject({ text: "Hello", level: 2, align: "left" });
    });

    it("should use provided ID", () => {
      const block = createBlock("text", { content: "Test" }, "my-custom-id");
      expect(block.id).toBe("my-custom-id");
    });
  });
});

describe("Block Validation", () => {
  describe("validateBlock", () => {
    it("should validate a valid text block", () => {
      const block = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        type: "text",
        version: 1,
        data: { content: "Hello", align: "left" },
        meta: {},
      };
      const result = validateBlock(block);
      expect(result.success).toBe(true);
    });

    it("should reject block without type", () => {
      const block = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        version: 1,
        data: {},
        meta: {},
      };
      const result = validateBlock(block);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContain("Block must have a type");
      }
    });

    it("should reject non-object", () => {
      const result = validateBlock("not an object");
      expect(result.success).toBe(false);
    });

    it("should reject unknown block type", () => {
      const block = {
        id: "550e8400-e29b-41d4-a716-446655440000",
        type: "unknown-type",
        version: 1,
        data: {},
        meta: {},
      };
      const result = validateBlock(block);
      expect(result.success).toBe(false);
    });
  });

  describe("validateBlocks", () => {
    it("should validate an array of valid blocks", () => {
      const blocks = [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          type: "text",
          version: 1,
          data: { content: "Hello", align: "left" },
          meta: {},
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440001",
          type: "heading",
          version: 1,
          data: { text: "Title", level: 2, align: "left" },
          meta: {},
        },
      ];
      const result = validateBlocks(blocks);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.length).toBe(2);
      }
    });

    it("should report errors for invalid blocks", () => {
      const blocks = [
        {
          id: "550e8400-e29b-41d4-a716-446655440000",
          type: "text",
          version: 1,
          data: { content: "Hello", align: "left" },
          meta: {},
        },
        {
          // Missing type
          id: "550e8400-e29b-41d4-a716-446655440001",
          version: 1,
          data: {},
          meta: {},
        },
      ];
      const result = validateBlocks(blocks);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some((e) => e.includes("Block 1"))).toBe(true);
      }
    });
  });
});

describe("Block Filtering", () => {
  describe("filterBlocksForEmail", () => {
    it("should keep email-compatible blocks", () => {
      const blocks = [
        createDefaultBlock("text"),
        createDefaultBlock("heading"),
        createDefaultBlock("image"),
      ];
      const filtered = filterBlocksForEmail(blocks);
      expect(filtered.length).toBe(3);
    });

    it("should remove non-email-compatible blocks", () => {
      const blocks = [
        createDefaultBlock("text"),
        createDefaultBlock("video"),
        createDefaultBlock("form"),
      ];
      const filtered = filterBlocksForEmail(blocks);
      expect(filtered.length).toBe(1);
      expect(filtered[0].type).toBe("text");
    });
  });

  describe("getAllowedChildTypes", () => {
    it("should return undefined for containers allowing all types", () => {
      // Columns allows all block types (allowedChildren undefined)
      const allowed = getAllowedChildTypes("columns");
      expect(allowed).toBeUndefined();
    });

    it("should return undefined for non-container blocks", () => {
      const allowed = getAllowedChildTypes("text");
      expect(allowed).toBeUndefined();
    });
  });

  describe("isChildTypeAllowed", () => {
    it("should return true when all children allowed", () => {
      expect(isChildTypeAllowed("columns", "text")).toBe(true);
      expect(isChildTypeAllowed("columns", "image")).toBe(true);
    });

    it("should return true for non-container parents", () => {
      // Non-containers don't restrict children (they don't have children)
      expect(isChildTypeAllowed("text", "heading")).toBe(true);
    });
  });
});

describe("Block Definition Properties", () => {
  it("all definitions should have required properties", () => {
    for (const def of allBlockDefinitions) {
      expect(def.type).toBeDefined();
      expect(def.name).toBeDefined();
      expect(def.description).toBeDefined();
      expect(def.category).toBeDefined();
      expect(def.icon).toBeDefined();
      expect(def.schema).toBeDefined();
      expect(def.defaultData).toBeDefined();
      expect(typeof def.isContainer).toBe("boolean");
      expect(typeof def.emailCompatible).toBe("boolean");
      expect(Array.isArray(def.keywords)).toBe(true);
      expect(def.version).toBe(1);
    }
  });

  it("all definitions should have non-empty keywords", () => {
    for (const def of allBlockDefinitions) {
      expect(def.keywords.length).toBeGreaterThan(0);
    }
  });
});
