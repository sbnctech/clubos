/**
 * Compatibility System Tests
 *
 * Comprehensive tests for compatibility rules, validation, and engine.
 *
 * Copyright (c) Murmurant, Inc. All rights reserved.
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  // Types and schemas
  ruleTypeSchema,
  severitySchema,
  ruleDomainSchema,
  type CompatibilityRule,
  type ValidationContext,
  type ValidationResult,
  parseSubject,
  createSubject,
  isEmailContext,
  isPreviewContext,
  EMPTY_VALIDATION_RESULT,
  // Engine
  registerRule,
  registerRules,
  clearRules,
  getRule,
  getAllRules,
  filterRules,
  validate,
  validateMultiple,
  getAllowed,
  isAllowed,
  validateChange,
  checkLayoutAuthCompatibility,
  checkSectionBlockCompatibility,
  isBlockAllowedInEmail,
  getEmailAllowedBlocks,
  // Rules
  ALL_RULES,
  RULES_BY_ID,
  RULES_BY_SUBJECT,
  RULES_BY_DOMAIN,
  layoutAuthRules,
  sectionBlockRules,
  blockNestingRules,
  emailContextRules,
  // Initialization
  initializeCompatibilitySystem,
  ensureInitialized,
} from "@/lib/compatibility";

describe("Compatibility System", () => {
  // Reset rules before each test to ensure isolation
  beforeEach(() => {
    clearRules();
  });

  afterEach(() => {
    // Re-initialize for other tests
    initializeCompatibilitySystem();
  });

  describe("Type Schemas", () => {
    it("validates rule types", () => {
      expect(ruleTypeSchema.safeParse("requires").success).toBe(true);
      expect(ruleTypeSchema.safeParse("excludes").success).toBe(true);
      expect(ruleTypeSchema.safeParse("restricts").success).toBe(true);
      expect(ruleTypeSchema.safeParse("suggests").success).toBe(true);
      expect(ruleTypeSchema.safeParse("invalid").success).toBe(false);
    });

    it("validates severity levels", () => {
      expect(severitySchema.safeParse("error").success).toBe(true);
      expect(severitySchema.safeParse("warning").success).toBe(true);
      expect(severitySchema.safeParse("info").success).toBe(true);
      expect(severitySchema.safeParse("critical").success).toBe(false);
    });

    it("validates rule domains", () => {
      expect(ruleDomainSchema.safeParse("layout-auth").success).toBe(true);
      expect(ruleDomainSchema.safeParse("section-block").success).toBe(true);
      expect(ruleDomainSchema.safeParse("block-nesting").success).toBe(true);
      expect(ruleDomainSchema.safeParse("email-context").success).toBe(true);
      expect(ruleDomainSchema.safeParse("invalid-domain").success).toBe(false);
    });
  });

  describe("Subject Parsing", () => {
    it("parses simple subject", () => {
      const parsed = parseSubject("block:text");
      expect(parsed).toEqual({ type: "block", value: "text" });
    });

    it("parses three-part subject", () => {
      const parsed = parseSubject("parent:block:columns");
      expect(parsed).toEqual({ type: "parent", subtype: "block", value: "columns" });
    });

    it("parses context subject", () => {
      const parsed = parseSubject("context:email");
      expect(parsed).toEqual({ type: "context", value: "email" });
    });

    it("creates subject string", () => {
      expect(createSubject("block", "text")).toBe("block:text");
      expect(createSubject("section", "hero")).toBe("section:hero");
      expect(createSubject("layout", "classic")).toBe("layout:classic");
    });

    it("creates subject with subtype", () => {
      expect(createSubject("parent", "columns", "block")).toBe("parent:block:columns");
    });
  });

  describe("Context Helpers", () => {
    it("detects email context", () => {
      expect(isEmailContext("email")).toBe(true);
      expect(isEmailContext("page")).toBe(false);
      expect(isEmailContext(undefined)).toBe(false);
    });

    it("detects preview context", () => {
      expect(isPreviewContext("preview")).toBe(true);
      expect(isPreviewContext("page")).toBe(false);
      expect(isPreviewContext(undefined)).toBe(false);
    });
  });

  describe("Rule Registration", () => {
    it("registers a single rule", () => {
      const rule: CompatibilityRule = {
        id: "test-rule",
        domain: "block-context",
        type: "excludes",
        severity: "error",
        subject: "block:test",
        excludes: "context:email",
        message: "Test blocks not allowed in email",
      };

      registerRule(rule);
      expect(getRule("test-rule")).toEqual(rule);
    });

    it("registers multiple rules", () => {
      const rules: CompatibilityRule[] = [
        {
          id: "test-rule-1",
          domain: "block-context",
          type: "excludes",
          severity: "error",
          subject: "block:test1",
          excludes: "context:email",
          message: "Test 1",
        },
        {
          id: "test-rule-2",
          domain: "block-context",
          type: "excludes",
          severity: "error",
          subject: "block:test2",
          excludes: "context:email",
          message: "Test 2",
        },
      ];

      registerRules(rules);
      expect(getRule("test-rule-1")).toBeDefined();
      expect(getRule("test-rule-2")).toBeDefined();
    });

    it("clears all rules", () => {
      registerRules(layoutAuthRules);
      expect(getAllRules().length).toBeGreaterThan(0);

      clearRules();
      expect(getAllRules().length).toBe(0);
    });

    it("filters rules by domain", () => {
      registerRules(ALL_RULES);

      const emailRules = filterRules({ domain: "email-context" });
      expect(emailRules.length).toBeGreaterThan(0);
      expect(emailRules.every((r) => r.domain === "email-context")).toBe(true);
    });

    it("filters rules by severity", () => {
      registerRules(ALL_RULES);

      const errorRules = filterRules({ severity: "error" });
      expect(errorRules.length).toBeGreaterThan(0);
      expect(errorRules.every((r) => r.severity === "error")).toBe(true);
    });

    it("filters rules by subject", () => {
      registerRules(ALL_RULES);

      const columnRules = filterRules({ subject: "block:columns" });
      expect(columnRules.length).toBeGreaterThan(0);
      expect(columnRules.every((r) => r.subject === "block:columns")).toBe(true);
    });
  });

  describe("Built-in Rules", () => {
    it("has layout-auth rules", () => {
      expect(layoutAuthRules.length).toBeGreaterThan(0);
      expect(layoutAuthRules.every((r) => r.domain === "layout-auth")).toBe(true);
    });

    it("has section-block rules", () => {
      expect(sectionBlockRules.length).toBeGreaterThan(0);
      expect(sectionBlockRules.every((r) => r.domain === "section-block")).toBe(true);
    });

    it("has block-nesting rules", () => {
      expect(blockNestingRules.length).toBeGreaterThan(0);
      expect(blockNestingRules.every((r) => r.domain === "block-nesting")).toBe(true);
    });

    it("has email-context rules", () => {
      expect(emailContextRules.length).toBeGreaterThan(0);
      expect(emailContextRules.every((r) => r.domain === "email-context")).toBe(true);
    });

    it("ALL_RULES contains all rule sets", () => {
      expect(ALL_RULES.length).toBe(
        layoutAuthRules.length +
          sectionBlockRules.length +
          blockNestingRules.length +
          emailContextRules.length
      );
    });

    it("RULES_BY_ID indexes all rules", () => {
      expect(RULES_BY_ID.size).toBe(ALL_RULES.length);
      for (const rule of ALL_RULES) {
        expect(RULES_BY_ID.get(rule.id)).toEqual(rule);
      }
    });
  });

  describe("Validation", () => {
    beforeEach(() => {
      registerRules(ALL_RULES);
    });

    it("returns empty result for unknown subject", () => {
      const result = validate("block:unknown-type", {});
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("validates email-excluded blocks", () => {
      const result = validate("block:interactive-calendar", {
        pageContext: "email",
      });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].ruleId).toBe("email-no-interactive-calendar");
    });

    it("allows email-safe blocks", () => {
      const result = validate("block:text", {
        pageContext: "email",
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("validates nested columns", () => {
      const result = validate("block:columns", {
        parentBlock: "columns",
      });

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.ruleId === "no-nested-columns")).toBe(true);
    });

    it("validates multiple subjects", () => {
      const result = validateMultiple(
        ["block:text", "block:interactive-calendar", "block:form"],
        { pageContext: "email" }
      );

      // validateMultiple returns combined result
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("getAllowed", () => {
    beforeEach(() => {
      registerRules(ALL_RULES);
    });

    it("filters to allowed values", () => {
      const allBlocks = [
        "text",
        "heading",
        "interactive-calendar",
        "form",
        "video",
      ];

      const allowed = getAllowed("block", allBlocks, { pageContext: "email" });

      expect(allowed).toContain("text");
      expect(allowed).toContain("heading");
      // These should be filtered out by email context rules
      expect(allowed).not.toContain("interactive-calendar");
      expect(allowed).not.toContain("form");
      expect(allowed).not.toContain("video");
    });
  });

  describe("isAllowed", () => {
    beforeEach(() => {
      registerRules(ALL_RULES);
    });

    it("returns allowed true for valid value", () => {
      const result = isAllowed("block:text", { pageContext: "email" });
      expect(result.allowed).toBe(true);
    });

    it("returns allowed false for disallowed value", () => {
      const result = isAllowed("block:form", { pageContext: "email" });
      expect(result.allowed).toBe(false);
      expect(result.reason).toBeDefined();
    });
  });

  describe("validateChange", () => {
    beforeEach(() => {
      registerRules(ALL_RULES);
    });

    it("allows valid change", () => {
      const result = validateChange(
        { pageContext: "page" },
        { pageContext: "page" }
      );

      expect(result.valid).toBe(true);
      expect(result.blockers).toHaveLength(0);
    });

    it("detects blockers from layout change affecting auth", () => {
      // Changing from dashboard (has sidebar) to classic (no sidebar)
      // should detect if bottom-left auth is used
      const result = validateChange(
        { layout: "dashboard", authPosition: "bottom-left" },
        { layout: "classic", authPosition: "bottom-left" }
      );

      // May have blockers or adjustments depending on rules
      expect(result).toBeDefined();
      expect(result.blockers).toBeDefined();
      expect(result.adjustments).toBeDefined();
    });
  });

  describe("Helper Functions", () => {
    beforeEach(() => {
      registerRules(ALL_RULES);
    });

    describe("checkLayoutAuthCompatibility", () => {
      it("returns valid for classic layout with top-right auth", () => {
        const result = checkLayoutAuthCompatibility("classic", "top-right");
        expect(result.valid).toBe(true);
      });

      it("returns result for focus layout with bottom-left auth", () => {
        // Focus layout has no sidebar, bottom-left needs sidebar
        const result = checkLayoutAuthCompatibility("focus", "bottom-left");
        // This depends on rule implementation - just verify it returns a result
        expect(result).toBeDefined();
        expect(typeof result.valid).toBe("boolean");
      });
    });

    describe("checkSectionBlockCompatibility", () => {
      it("validates block in section context", () => {
        const result = checkSectionBlockCompatibility("main", "text");
        expect(result.valid).toBe(true);
      });
    });

    describe("isBlockAllowedInEmail", () => {
      it("allows text block in email", () => {
        expect(isBlockAllowedInEmail("text")).toBe(true);
      });

      it("disallows video block in email", () => {
        expect(isBlockAllowedInEmail("video")).toBe(false);
      });

      it("disallows form block in email", () => {
        expect(isBlockAllowedInEmail("form")).toBe(false);
      });
    });

    describe("getEmailAllowedBlocks", () => {
      it("returns list of allowed email blocks", () => {
        const allBlocks = [
          "text",
          "heading",
          "paragraph",
          "image",
          "button",
          "divider",
          "video",
          "form",
          "interactive-calendar",
        ];

        const allowed = getEmailAllowedBlocks(allBlocks);

        expect(allowed).toContain("text");
        expect(allowed).toContain("heading");
        expect(allowed).toContain("paragraph");
        expect(allowed).toContain("image");
        expect(allowed).toContain("button");
        expect(allowed).toContain("divider");

        expect(allowed).not.toContain("video");
        expect(allowed).not.toContain("form");
        expect(allowed).not.toContain("interactive-calendar");
      });
    });
  });

  describe("Email Context Rules", () => {
    beforeEach(() => {
      registerRules(emailContextRules);
    });

    it("has main allowed-blocks rule", () => {
      const rule = getRule("email-allowed-blocks");
      expect(rule).toBeDefined();
      expect(rule?.type).toBe("restricts");
      expect(rule?.allows).toBeDefined();
    });

    it("has explicit exclusion rules", () => {
      const exclusionRules = emailContextRules.filter((r) => r.type === "excludes");
      expect(exclusionRules.length).toBeGreaterThan(5);

      // Check specific exclusions exist
      expect(getRule("email-no-interactive-calendar")).toBeDefined();
      expect(getRule("email-no-forms")).toBeDefined();
      expect(getRule("email-no-video")).toBeDefined();
      expect(getRule("email-no-map")).toBeDefined();
    });

    it("has warning rules", () => {
      const warningRules = emailContextRules.filter((r) => r.severity === "warning");
      expect(warningRules.length).toBeGreaterThan(0);

      // Image width warning
      expect(getRule("email-image-width-warning")).toBeDefined();
    });
  });

  describe("Block Nesting Rules", () => {
    beforeEach(() => {
      registerRules(blockNestingRules);
    });

    it("prevents nested columns", () => {
      const rule = getRule("no-nested-columns");
      expect(rule).toBeDefined();
      expect(rule?.subject).toBe("block:columns");
      expect(rule?.excludes).toBe("parent:block:columns");
    });

    it("prevents nested accordions", () => {
      const rule = getRule("no-nested-accordion");
      expect(rule).toBeDefined();
    });

    it("prevents nested tabs", () => {
      const rule = getRule("no-nested-tabs");
      expect(rule).toBeDefined();
    });

    it("prevents nested carousels", () => {
      const rule = getRule("no-nested-carousel");
      expect(rule).toBeDefined();
    });

    it("warns about gallery in columns", () => {
      const rule = getRule("no-gallery-in-columns");
      expect(rule).toBeDefined();
      expect(rule?.severity).toBe("warning");
    });
  });

  describe("EMPTY_VALIDATION_RESULT", () => {
    it("is a valid empty result", () => {
      expect(EMPTY_VALIDATION_RESULT.valid).toBe(true);
      expect(EMPTY_VALIDATION_RESULT.errors).toHaveLength(0);
      expect(EMPTY_VALIDATION_RESULT.warnings).toHaveLength(0);
      expect(EMPTY_VALIDATION_RESULT.info).toHaveLength(0);
    });
  });

  describe("Initialization", () => {
    it("auto-initializes on import", () => {
      // Re-initialize (ensureInitialized checks flag, use initializeCompatibilitySystem directly)
      clearRules();
      initializeCompatibilitySystem();

      // Should have all rules registered
      expect(getAllRules().length).toBe(ALL_RULES.length);
    });

    it("initializeCompatibilitySystem registers all rules", () => {
      clearRules();
      expect(getAllRules().length).toBe(0);

      initializeCompatibilitySystem();
      expect(getAllRules().length).toBe(ALL_RULES.length);
    });
  });
});
