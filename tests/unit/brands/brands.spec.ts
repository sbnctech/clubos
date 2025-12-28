/**
 * Brand System Tests
 *
 * Comprehensive tests for brand types, validation, and customer brands.
 *
 * Copyright (c) Santa Barbara Newcomers Club
 */

import { describe, it, expect } from "vitest";
import { defaultBrand } from "@/lib/brands/defaults";
import { sbncBrand } from "@/lib/brands/customers/sbnc";
import { gardenClubBrand } from "@/lib/brands/customers/garden-club";
import {
  checkColorContrast,
  validateLogoDimensions,
  getBrandCompleteness,
} from "@/lib/brands/validate";

describe("Brand System", () => {
  describe("Default Brand", () => {
    it("has required identity fields", () => {
      expect(defaultBrand.identity.logo.url).toBeDefined();
      expect(defaultBrand.identity.bug.url).toBeDefined();
      expect(defaultBrand.identity.colors.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it("has voice configuration", () => {
      expect(defaultBrand.voice.tone).toBeDefined();
      expect(defaultBrand.voice.terminology.member).toBeDefined();
    });

    it("has chatbot configuration", () => {
      expect(defaultBrand.chatbot.name).toBeDefined();
      expect(defaultBrand.chatbot.suggestedPrompts.length).toBeGreaterThan(0);
    });

    it("has valid color format for all colors", () => {
      const { colors } = defaultBrand.identity;
      expect(colors.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(colors.primaryHover).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(colors.secondary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(colors.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it("has required fields", () => {
      expect(defaultBrand.id).toBeDefined();
      expect(defaultBrand.name).toBeDefined();
      expect(defaultBrand.themeId).toBeDefined();
    });
  });

  describe("SBNC Brand", () => {
    it("has SBNC-specific values", () => {
      expect(sbncBrand.name).toContain("Santa Barbara");
      expect(sbncBrand.chatbot.name).toBe("Sandy");
      expect(sbncBrand.voice.terminology.event).toBe("activity");
    });

    it("has required fields", () => {
      expect(sbncBrand.id).toBe("sbnc");
      expect(sbncBrand.clubId).toBe("sbnc");
      expect(sbncBrand.themeId).toBe("modern");
    });

    it("has coastal blue primary color", () => {
      expect(sbncBrand.identity.colors.primary).toBe("#1E40AF");
    });

    it("has correct logo path", () => {
      expect(sbncBrand.identity.logo.url).toBe("/brands/sbnc/logo.svg");
    });

    it("has Sandy chatbot with suggested prompts", () => {
      expect(sbncBrand.chatbot.name).toBe("Sandy");
      expect(sbncBrand.chatbot.suggestedPrompts.length).toBeGreaterThanOrEqual(3);
    });

    it("has communication settings", () => {
      expect(sbncBrand.communication.emailFromName).toBeDefined();
      expect(sbncBrand.communication.emailReplyTo).toBeDefined();
    });
  });

  describe("Garden Club Brand", () => {
    it("has Garden Club-specific values", () => {
      expect(gardenClubBrand.name).toContain("Garden");
      expect(gardenClubBrand.chatbot.name).toBe("Rose");
      expect(gardenClubBrand.voice.tone).toBe("formal");
    });

    it("has required fields", () => {
      expect(gardenClubBrand.id).toBe("garden-club");
      expect(gardenClubBrand.clubId).toBe("garden-club");
      expect(gardenClubBrand.themeId).toBe("classic");
    });

    it("has green primary color", () => {
      expect(gardenClubBrand.identity.colors.primary).toBe("#16A34A");
    });

    it("uses formal terminology", () => {
      expect(gardenClubBrand.voice.terminology.event).toBe("gathering");
    });

    it("has Rose chatbot", () => {
      expect(gardenClubBrand.chatbot.name).toBe("Rose");
      expect(gardenClubBrand.chatbot.personality).toContain("plant");
    });
  });

  describe("Color Contrast Validation", () => {
    it("detects good contrast (white on black)", () => {
      const result = checkColorContrast("#FFFFFF", "#000000");
      expect(result.passesAA).toBe(true);
      expect(result.passesAAA).toBe(true);
    });

    it("detects poor contrast (light gray on white)", () => {
      const result = checkColorContrast("#EEEEEE", "#FFFFFF");
      expect(result.passesAA).toBe(false);
    });

    it("calculates ratio for brand primary on white", () => {
      const result = checkColorContrast(sbncBrand.identity.colors.primary, "#FFFFFF");
      expect(result.ratio).toBeGreaterThan(0);
    });

    it("returns numeric ratio", () => {
      const result = checkColorContrast("#000000", "#FFFFFF");
      expect(typeof result.ratio).toBe("number");
      expect(result.ratio).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Logo Dimension Validation", () => {
    it("accepts valid dimensions", () => {
      const result = validateLogoDimensions(200, 60);
      expect(result.valid).toBe(true);
    });

    it("rejects too narrow", () => {
      const result = validateLogoDimensions(50, 60);
      expect(result.valid).toBe(false);
    });

    it("rejects too wide", () => {
      const result = validateLogoDimensions(500, 60);
      expect(result.valid).toBe(false);
    });

    it("accepts default brand logo dimensions", () => {
      const { width, height } = defaultBrand.identity.logo;
      const result = validateLogoDimensions(width, height);
      expect(result.valid).toBe(true);
    });

    it("returns message for invalid dimensions", () => {
      const result = validateLogoDimensions(50, 60);
      expect(result.message).toBeDefined();
    });
  });

  describe("Brand Completeness", () => {
    it("calculates completeness score", () => {
      const result = getBrandCompleteness(defaultBrand);
      expect(result.percent).toBeGreaterThanOrEqual(0);
      expect(result.percent).toBeLessThanOrEqual(100);
    });

    it("returns missing fields array", () => {
      const result = getBrandCompleteness(defaultBrand);
      expect(Array.isArray(result.missing)).toBe(true);
    });

    it("SBNC brand has completeness score", () => {
      const result = getBrandCompleteness(sbncBrand);
      expect(result.percent).toBeGreaterThanOrEqual(0);
      expect(typeof result.percent).toBe("number");
    });
  });

  describe("Brand Consistency", () => {
    it("all brands have same structure", () => {
      const brands = [defaultBrand, sbncBrand, gardenClubBrand];
      for (const brand of brands) {
        expect(brand).toHaveProperty("id");
        expect(brand).toHaveProperty("identity");
        expect(brand).toHaveProperty("voice");
        expect(brand).toHaveProperty("chatbot");
        expect(brand).toHaveProperty("communication");
      }
    });

    it("all brands have unique IDs", () => {
      const ids = [defaultBrand.id, sbncBrand.id, gardenClubBrand.id];
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("all brands have valid fonts defined", () => {
      const brands = [defaultBrand, sbncBrand, gardenClubBrand];
      for (const brand of brands) {
        expect(brand.identity.fonts.heading).toBeDefined();
        expect(brand.identity.fonts.body).toBeDefined();
      }
    });
  });
});
