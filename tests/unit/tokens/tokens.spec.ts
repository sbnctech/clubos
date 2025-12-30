/**
 * Token System Tests
 *
 * Comprehensive tests for design token types, validation, and CSS generation.
 *
 * Copyright (c) Murmurant, Inc. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import {
  tokenSetSchema,
  colorTokensSchema,
  validateTokenSet,
  isValidTokenSet,
  isValidHexColor,
} from "@/lib/tokens/schema";
import {
  defaultTokenSet,
  defaultColorTokens,
  defaultTypographyTokens,
  defaultSpacingTokens,
  defaultShapeTokens,
  defaultAnimationTokens,
  warmColorTokens,
  coolColorTokens,
  neutralColorTokens,
} from "@/lib/tokens/defaults";
import {
  generateCssVariables,
  generateCssRuleText,
  generateCssText,
  generateStyleObject,
  mergeTokens,
  tokenVar,
  parseTokenVariable,
} from "@/lib/tokens/generator";

describe("Token System", () => {
  describe("Token Schema Validation", () => {
    it("validates default token set", () => {
      const result = tokenSetSchema.safeParse(defaultTokenSet);
      expect(result.success).toBe(true);
    });

    it("validates color tokens", () => {
      const result = colorTokensSchema.safeParse(defaultColorTokens);
      expect(result.success).toBe(true);
    });

    it("rejects invalid hex colors", () => {
      const invalidColors = {
        ...defaultColorTokens,
        primary: "not-a-color",
      };
      const result = colorTokensSchema.safeParse(invalidColors);
      expect(result.success).toBe(false);
    });

    it("rejects missing required tokens", () => {
      const incomplete = {
        color: defaultColorTokens,
        // missing typography, spacing, shape, animation
      };
      const result = tokenSetSchema.safeParse(incomplete);
      expect(result.success).toBe(false);
    });
  });

  describe("Default Tokens", () => {
    it("has all required color tokens", () => {
      expect(defaultColorTokens.primary).toBeDefined();
      expect(defaultColorTokens.secondary).toBeDefined();
      expect(defaultColorTokens.background).toBeDefined();
      expect(defaultColorTokens.text).toBeDefined();
      expect(defaultColorTokens.success).toBeDefined();
      expect(defaultColorTokens.error).toBeDefined();
    });

    it("has valid hex colors for all color tokens", () => {
      for (const [key, value] of Object.entries(defaultColorTokens)) {
        expect(isValidHexColor(value)).toBe(true);
      }
    });

    it("has all required typography tokens", () => {
      expect(defaultTypographyTokens.fontHeading).toBeDefined();
      expect(defaultTypographyTokens.fontBody).toBeDefined();
      expect(defaultTypographyTokens.fontSizeBase).toBeDefined();
      expect(defaultTypographyTokens.lineHeightBase).toBeDefined();
    });

    it("has all required spacing tokens", () => {
      expect(defaultSpacingTokens.space0).toBeDefined();
      expect(defaultSpacingTokens.space1).toBeDefined();
      expect(defaultSpacingTokens.space4).toBeDefined();
      expect(defaultSpacingTokens.space8).toBeDefined();
    });

    it("has all required shape tokens", () => {
      expect(defaultShapeTokens.radiusNone).toBeDefined();
      expect(defaultShapeTokens.radiusMd).toBeDefined();
      expect(defaultShapeTokens.shadowSm).toBeDefined();
    });

    it("has all required animation tokens", () => {
      expect(defaultAnimationTokens.durationBase).toBeDefined();
      expect(defaultAnimationTokens.easeDefault).toBeDefined();
    });
  });

  describe("Color Presets", () => {
    it("warm colors are valid", () => {
      const result = colorTokensSchema.safeParse(warmColorTokens);
      expect(result.success).toBe(true);
    });

    it("cool colors are valid", () => {
      const result = colorTokensSchema.safeParse(coolColorTokens);
      expect(result.success).toBe(true);
    });

    it("neutral colors are valid", () => {
      const result = colorTokensSchema.safeParse(neutralColorTokens);
      expect(result.success).toBe(true);
    });

    it("presets have different primary colors", () => {
      expect(warmColorTokens.primary).not.toBe(defaultColorTokens.primary);
      expect(coolColorTokens.primary).not.toBe(defaultColorTokens.primary);
      expect(neutralColorTokens.primary).not.toBe(defaultColorTokens.primary);
    });
  });

  describe("CSS Variable Generation", () => {
    it("generates CSS variables from token set", () => {
      const variables = generateCssVariables(defaultTokenSet);
      expect(variables.size).toBeGreaterThan(0);
    });

    it("generates correct variable names", () => {
      const variables = generateCssVariables(defaultTokenSet);
      expect(variables.has("--token-color-primary")).toBe(true);
      expect(variables.has("--token-typography-font-heading")).toBe(true);
      expect(variables.has("--token-spacing-space4")).toBe(true);
    });

    it("generates correct variable values", () => {
      const variables = generateCssVariables(defaultTokenSet);
      expect(variables.get("--token-color-primary")).toBe(defaultColorTokens.primary);
    });

    it("generates CSS rule text", () => {
      const css = generateCssRuleText(defaultTokenSet);
      expect(css).toContain(":root {");
      expect(css).toContain("--token-color-primary:");
      expect(css).toContain("}");
    });

    it("generates CSS text with comments", () => {
      const css = generateCssText(defaultTokenSet);
      expect(css).toContain("/* Color Tokens */");
      expect(css).toContain("/* Typography Tokens */");
    });

    it("generates style object for React", () => {
      const style = generateStyleObject(defaultTokenSet);
      expect(style["--token-color-primary"]).toBe(defaultColorTokens.primary);
    });
  });

  describe("Token Merging", () => {
    it("merges partial tokens with defaults", () => {
      const overrides = {
        color: { primary: "#FF0000" },
      };
      const merged = mergeTokens(overrides);
      expect(merged.color.primary).toBe("#FF0000");
      expect(merged.color.secondary).toBe(defaultColorTokens.secondary);
    });

    it("preserves non-overridden categories", () => {
      const overrides = {
        color: { primary: "#FF0000" },
      };
      const merged = mergeTokens(overrides);
      expect(merged.typography).toEqual(defaultTypographyTokens);
      expect(merged.spacing).toEqual(defaultSpacingTokens);
    });

    it("can merge all categories", () => {
      const overrides = {
        color: { primary: "#FF0000" },
        typography: { fontHeading: "Georgia" },
        spacing: { space1: "0.3rem" },
        shape: { radiusMd: "12px" },
        animation: { durationBase: "150ms" },
      };
      const merged = mergeTokens(overrides);
      expect(merged.color.primary).toBe("#FF0000");
      expect(merged.typography.fontHeading).toBe("Georgia");
      expect(merged.spacing.space1).toBe("0.3rem");
      expect(merged.shape.radiusMd).toBe("12px");
      expect(merged.animation.durationBase).toBe("150ms");
    });
  });

  describe("Token Utilities", () => {
    it("generates var() reference", () => {
      const ref = tokenVar("color", "primary");
      expect(ref).toBe("var(--token-color-primary)");
    });

    it("generates var() with fallback", () => {
      const ref = tokenVar("color", "primary", "#000");
      expect(ref).toBe("var(--token-color-primary, #000)");
    });

    it("parses token variable reference", () => {
      const parsed = parseTokenVariable("var(--token-color-primary)");
      expect(parsed).toEqual({ category: "color", key: "primary" });
    });

    it("parses token variable with fallback", () => {
      const parsed = parseTokenVariable("var(--token-color-primary, #000)");
      expect(parsed).toEqual({ category: "color", key: "primary" });
    });

    it("returns null for invalid variable reference", () => {
      const parsed = parseTokenVariable("not-a-var");
      expect(parsed).toBeNull();
    });
  });

  describe("Validation Functions", () => {
    it("validateTokenSet returns valid token set", () => {
      const validated = validateTokenSet(defaultTokenSet);
      expect(validated).toEqual(defaultTokenSet);
    });

    it("validateTokenSet throws on invalid input", () => {
      expect(() => validateTokenSet({})).toThrow();
    });

    it("isValidTokenSet returns true for valid input", () => {
      expect(isValidTokenSet(defaultTokenSet)).toBe(true);
    });

    it("isValidTokenSet returns false for invalid input", () => {
      expect(isValidTokenSet({})).toBe(false);
    });

    it("isValidHexColor validates hex colors", () => {
      expect(isValidHexColor("#FF0000")).toBe(true);
      expect(isValidHexColor("#f00")).toBe(true);
      expect(isValidHexColor("red")).toBe(false);
      expect(isValidHexColor("FF0000")).toBe(false);
    });
  });
});
