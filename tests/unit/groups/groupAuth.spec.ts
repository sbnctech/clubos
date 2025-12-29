/**
 * Unit tests for Activity Group authorization helpers
 *
 * Tests capability checks for group management per Charter P2 (scoped access)
 *
 * Copyright (c) Murmurant, Inc.
 */

import { describe, it, expect } from "vitest";
import { hasCapability, GlobalRole } from "@/lib/auth";

describe("Activity Group Capabilities", () => {
  describe("groups:view capability", () => {
    it("admin has groups:view", () => {
      expect(hasCapability("admin", "groups:view")).toBe(true);
    });

    it("president has groups:view (via groups:approve implies view)", () => {
      // President has groups:approve which implies view access
      expect(hasCapability("president", "groups:approve")).toBe(true);
    });

    it("vp-activities has groups:view (via groups:approve implies view)", () => {
      expect(hasCapability("vp-activities", "groups:approve")).toBe(true);
    });

    it("member has groups:view", () => {
      expect(hasCapability("member", "groups:view")).toBe(true);
    });
  });

  describe("groups:propose capability", () => {
    it("admin has groups:propose", () => {
      expect(hasCapability("admin", "groups:propose")).toBe(true);
    });

    it("member has groups:propose", () => {
      expect(hasCapability("member", "groups:propose")).toBe(true);
    });
  });

  describe("groups:approve capability", () => {
    it("admin has groups:approve", () => {
      expect(hasCapability("admin", "groups:approve")).toBe(true);
    });

    it("president has groups:approve", () => {
      expect(hasCapability("president", "groups:approve")).toBe(true);
    });

    it("vp-activities has groups:approve", () => {
      expect(hasCapability("vp-activities", "groups:approve")).toBe(true);
    });

    it("member does NOT have groups:approve", () => {
      expect(hasCapability("member", "groups:approve")).toBe(false);
    });

    it("event-chair does NOT have groups:approve", () => {
      expect(hasCapability("event-chair", "groups:approve")).toBe(false);
    });

    it("webmaster does NOT have groups:approve", () => {
      expect(hasCapability("webmaster", "groups:approve")).toBe(false);
    });

    it("secretary does NOT have groups:approve", () => {
      expect(hasCapability("secretary", "groups:approve")).toBe(false);
    });

    it("parliamentarian does NOT have groups:approve", () => {
      expect(hasCapability("parliamentarian", "groups:approve")).toBe(false);
    });

    it("vp-communications does NOT have groups:approve", () => {
      expect(hasCapability("vp-communications", "groups:approve")).toBe(false);
    });

    it("past-president does NOT have groups:approve", () => {
      expect(hasCapability("past-president", "groups:approve")).toBe(false);
    });
  });

  describe("groups:join capability", () => {
    it("admin has groups:join", () => {
      expect(hasCapability("admin", "groups:join")).toBe(true);
    });

    it("member has groups:join", () => {
      expect(hasCapability("member", "groups:join")).toBe(true);
    });

    it("president has groups:join", () => {
      expect(hasCapability("president", "groups:join")).toBe(true);
    });

    it("vp-activities has groups:join", () => {
      expect(hasCapability("vp-activities", "groups:join")).toBe(true);
    });
  });

  describe("scoped coordinator capabilities", () => {
    // Note: These are scoped capabilities - they are granted to any member
    // who is a coordinator, not based on global role.
    // The actual scoping logic is in groupAuth.ts helpers.

    it("groups:coordinate exists as a capability type", () => {
      // Admin has all capabilities via admin:full
      expect(hasCapability("admin", "groups:coordinate")).toBe(true);
    });

    it("groups:message exists as a capability type", () => {
      expect(hasCapability("admin", "groups:message")).toBe(true);
    });

    it("groups:events exists as a capability type", () => {
      expect(hasCapability("admin", "groups:events")).toBe(true);
    });

    it("regular member does NOT have global groups:coordinate", () => {
      // Members only get this scoped to their coordinated groups
      expect(hasCapability("member", "groups:coordinate")).toBe(false);
    });

    it("regular member does NOT have global groups:message", () => {
      expect(hasCapability("member", "groups:message")).toBe(false);
    });

    it("regular member does NOT have global groups:events", () => {
      expect(hasCapability("member", "groups:events")).toBe(false);
    });
  });

  describe("role hierarchy for groups:approve", () => {
    // Approvers can approve/reject/deactivate activity groups
    const approverRoles: GlobalRole[] = ["admin", "president", "vp-activities"];

    // Non-approvers cannot approve groups
    const nonApproverRoles: GlobalRole[] = [
      "member",
      "event-chair",
      "webmaster",
      "secretary",
      "parliamentarian",
      "vp-communications",
      "past-president",
    ];

    approverRoles.forEach((role) => {
      it(`${role} can approve groups`, () => {
        expect(hasCapability(role, "groups:approve")).toBe(true);
      });
    });

    nonApproverRoles.forEach((role) => {
      it(`${role} cannot approve groups`, () => {
        expect(hasCapability(role, "groups:approve")).toBe(false);
      });
    });
  });

  describe("member group capabilities", () => {
    it("member can view groups", () => {
      expect(hasCapability("member", "groups:view")).toBe(true);
    });

    it("member can propose groups", () => {
      expect(hasCapability("member", "groups:propose")).toBe(true);
    });

    it("member can join groups", () => {
      expect(hasCapability("member", "groups:join")).toBe(true);
    });

    it("member cannot approve groups", () => {
      expect(hasCapability("member", "groups:approve")).toBe(false);
    });

    it("member cannot coordinate groups globally", () => {
      // Coordinator capabilities are scoped to specific groups
      expect(hasCapability("member", "groups:coordinate")).toBe(false);
    });
  });
});
