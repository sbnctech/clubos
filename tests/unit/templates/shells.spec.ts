/**
 * Shell System Tests
 *
 * Tests for layout shells and shell registry.
 *
 * Copyright (c) Murmurant, Inc. All rights reserved.
 */

import { describe, it, expect } from "vitest";
import {
  SHELL_REGISTRY,
  getShell,
  hasShell,
  generateClassicShellCSS,
  generateMagazineShellCSS,
  generatePortalShellCSS,
  generateDashboardShellCSS,
  generateFocusShellCSS,
  generateIntranetShellCSS,
} from "@/templates/shells";
import { LAYOUT_TYPES } from "@/lib/layouts/schema";
import type { LayoutType } from "@/lib/layouts/schema";

describe("Shell System", () => {
  describe("Shell Registry", () => {
    it("has a shell for every layout type", () => {
      for (const layoutType of LAYOUT_TYPES) {
        expect(hasShell(layoutType)).toBe(true);
        expect(SHELL_REGISTRY[layoutType]).toBeDefined();
      }
    });

    it("getShell returns shell component for valid layout", () => {
      const classicShell = getShell("classic");
      expect(classicShell).toBeDefined();
      expect(typeof classicShell).toBe("function");
    });

    it("getShell throws for invalid layout", () => {
      expect(() => getShell("invalid" as LayoutType)).toThrow(
        "No shell registered for layout type: invalid"
      );
    });

    it("hasShell returns false for invalid layout", () => {
      expect(hasShell("invalid" as LayoutType)).toBe(false);
    });

    it("registry has exactly 6 shells", () => {
      expect(Object.keys(SHELL_REGISTRY).length).toBe(6);
    });
  });

  describe("CSS Generation", () => {
    it("generates ClassicShell CSS", () => {
      const css = generateClassicShellCSS();
      expect(css).toContain(".shell-classic");
      expect(css).toContain("grid-template-areas");
      expect(css).toContain("@media");
    });

    it("generates MagazineShell CSS", () => {
      const css = generateMagazineShellCSS();
      expect(css).toContain(".shell-magazine");
      expect(css).toContain("panel");
    });

    it("generates PortalShell CSS", () => {
      const css = generatePortalShellCSS();
      expect(css).toContain(".shell-portal");
      expect(css).toContain("nav-left");
    });

    it("generates DashboardShell CSS", () => {
      const css = generateDashboardShellCSS();
      expect(css).toContain(".shell-dashboard");
      expect(css).toContain("sidebar");
    });

    it("generates FocusShell CSS", () => {
      const css = generateFocusShellCSS();
      expect(css).toContain(".shell-focus");
      expect(css).toContain("max-width");
    });

    it("generates IntranetShell CSS", () => {
      const css = generateIntranetShellCSS();
      expect(css).toContain(".shell-intranet");
      expect(css).toContain("nav-left");
      expect(css).toContain("panel");
    });

    it("all CSS generators produce valid strings", () => {
      const generators = [
        generateClassicShellCSS,
        generateMagazineShellCSS,
        generatePortalShellCSS,
        generateDashboardShellCSS,
        generateFocusShellCSS,
        generateIntranetShellCSS,
      ];

      for (const generator of generators) {
        const css = generator();
        expect(typeof css).toBe("string");
        expect(css.length).toBeGreaterThan(100);
        // Should be valid CSS (contains { and })
        expect(css).toContain("{");
        expect(css).toContain("}");
      }
    });
  });

  describe("Shell Components", () => {
    it("ClassicShell is a function component", () => {
      const Shell = getShell("classic");
      expect(typeof Shell).toBe("function");
    });

    it("MagazineShell is a function component", () => {
      const Shell = getShell("magazine");
      expect(typeof Shell).toBe("function");
    });

    it("PortalShell is a function component", () => {
      const Shell = getShell("portal");
      expect(typeof Shell).toBe("function");
    });

    it("DashboardShell is a function component", () => {
      const Shell = getShell("dashboard");
      expect(typeof Shell).toBe("function");
    });

    it("FocusShell is a function component", () => {
      const Shell = getShell("focus");
      expect(typeof Shell).toBe("function");
    });

    it("IntranetShell is a function component", () => {
      const Shell = getShell("intranet");
      expect(typeof Shell).toBe("function");
    });
  });
});
