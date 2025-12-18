/**
 * View Context Tests
 *
 * Tests for the view-as/viewer simulation functionality.
 *
 * Copyright (c) Santa Barbara Newcomers Club
 */

import { describe, it, expect } from "vitest";
import {
  buildViewContext,
  VIEW_MODE_CONFIG,
  getAvailableViewModes,
  type ViewMode,
} from "@/lib/view-context";

describe("View Context", () => {
  describe("buildViewContext", () => {
    it("creates context for actual user mode", () => {
      const context = buildViewContext("actual");

      expect(context.mode).toBe("actual");
      expect(context.isSimulated).toBe(false);
      expect(context.simulatedRole).toBeNull();
      expect(context.canSeeMemberContent).toBe(true);
    });

    it("creates context for public mode", () => {
      const context = buildViewContext("public");

      expect(context.mode).toBe("public");
      expect(context.isSimulated).toBe(true);
      expect(context.simulatedRole).toBeNull();
      expect(context.canSeeMemberContent).toBe(false);
      expect(context.canSeeOfficerGadgets).toBe(false);
    });

    it("creates context for member mode", () => {
      const context = buildViewContext("member");

      expect(context.mode).toBe("member");
      expect(context.isSimulated).toBe(true);
      expect(context.simulatedRole).toBe("member");
      expect(context.canSeeMemberContent).toBe(true);
      expect(context.canSeeOfficerGadgets).toBe(false);
    });

    it("creates context for president mode", () => {
      const context = buildViewContext("president");

      expect(context.mode).toBe("president");
      expect(context.isSimulated).toBe(true);
      expect(context.simulatedRole).toBe("president");
      expect(context.canSeeMemberContent).toBe(true);
      expect(context.canSeeOfficerGadgets).toBe(true);
    });

    it("creates context for tech-lead mode", () => {
      const context = buildViewContext("tech-lead");

      expect(context.mode).toBe("tech-lead");
      expect(context.isSimulated).toBe(true);
      expect(context.simulatedRole).toBe("admin");
      expect(context.canSeeMemberContent).toBe(true);
      expect(context.canSeeOfficerGadgets).toBe(true);
    });

    it("creates context for event-chair mode", () => {
      const context = buildViewContext("event-chair");

      expect(context.mode).toBe("event-chair");
      expect(context.isSimulated).toBe(true);
      expect(context.simulatedRole).toBe("event-chair");
      expect(context.canSeeMemberContent).toBe(true);
      expect(context.canSeeOfficerGadgets).toBe(true);
    });

    it("falls back to actual for unknown mode", () => {
      // @ts-expect-error Testing invalid input
      const context = buildViewContext("unknown-mode");

      expect(context.mode).toBe("unknown-mode");
      // Should use actual config as fallback
      expect(context.canSeeMemberContent).toBe(true);
    });
  });

  describe("VIEW_MODE_CONFIG", () => {
    it("has configuration for all view modes", () => {
      const modes: ViewMode[] = [
        "actual",
        "public",
        "member",
        "event-chair",
        "vp-membership",
        "president",
        "tech-lead",
      ];

      modes.forEach((mode) => {
        expect(VIEW_MODE_CONFIG[mode]).toBeDefined();
        expect(VIEW_MODE_CONFIG[mode].label).toBeTruthy();
      });
    });

    it("public mode cannot see member content", () => {
      expect(VIEW_MODE_CONFIG.public.canSeeMemberContent).toBe(false);
      expect(VIEW_MODE_CONFIG.public.canSeeOfficerGadgets).toBe(false);
    });

    it("member mode can see member content but not officer gadgets", () => {
      expect(VIEW_MODE_CONFIG.member.canSeeMemberContent).toBe(true);
      expect(VIEW_MODE_CONFIG.member.canSeeOfficerGadgets).toBe(false);
    });

    it("officer modes can see both member content and officer gadgets", () => {
      const officerModes: ViewMode[] = [
        "event-chair",
        "vp-membership",
        "president",
        "tech-lead",
      ];

      officerModes.forEach((mode) => {
        expect(VIEW_MODE_CONFIG[mode].canSeeMemberContent).toBe(true);
        expect(VIEW_MODE_CONFIG[mode].canSeeOfficerGadgets).toBe(true);
      });
    });
  });

  describe("getAvailableViewModes", () => {
    it("returns all available view modes", () => {
      const modes = getAvailableViewModes();

      expect(modes.length).toBe(7);
      expect(modes.map((m) => m.value)).toContain("actual");
      expect(modes.map((m) => m.value)).toContain("public");
      expect(modes.map((m) => m.value)).toContain("member");
      expect(modes.map((m) => m.value)).toContain("president");
      expect(modes.map((m) => m.value)).toContain("tech-lead");
    });

    it("each mode has a label", () => {
      const modes = getAvailableViewModes();

      modes.forEach((mode) => {
        expect(mode.label).toBeTruthy();
        expect(typeof mode.label).toBe("string");
      });
    });
  });

  describe("role-based rendering logic", () => {
    it("public view should not render member-only content", () => {
      const context = buildViewContext("public");

      // This is the check components use
      expect(context.canSeeMemberContent).toBe(false);
    });

    it("member view should render member content but not officer gadgets", () => {
      const context = buildViewContext("member");

      expect(context.canSeeMemberContent).toBe(true);
      expect(context.canSeeOfficerGadgets).toBe(false);
    });

    it("officer view should render both member content and officer gadgets", () => {
      const context = buildViewContext("president");

      expect(context.canSeeMemberContent).toBe(true);
      expect(context.canSeeOfficerGadgets).toBe(true);
    });
  });
});

describe("View Mode Security", () => {
  it("simulated modes are clearly marked", () => {
    const publicContext = buildViewContext("public");
    const memberContext = buildViewContext("member");
    const actualContext = buildViewContext("actual");

    expect(publicContext.isSimulated).toBe(true);
    expect(memberContext.isSimulated).toBe(true);
    expect(actualContext.isSimulated).toBe(false);
  });

  it("isSimulated is true for all non-actual modes", () => {
    const modes: ViewMode[] = [
      "public",
      "member",
      "event-chair",
      "vp-membership",
      "president",
      "tech-lead",
    ];

    modes.forEach((mode) => {
      const context = buildViewContext(mode);
      expect(context.isSimulated).toBe(true);
    });
  });
});
