/**
 * Unit tests for tier-aware capability gating.
 *
 * Charter N6: Tests for permission boundaries.
 * Issue #252: Capability gating for tiered features.
 *
 * Copyright (c) Murmurant, Inc.
 */

import { describe, it, expect } from "vitest";
import {
  hasTier,
  getTierPriority,
  isActiveMemberTier,
  contextHasTier,
  type MembershipTierCode,
  type TieredAuthContext,
} from "@/lib/tiers";

describe("Tier Priority System", () => {
  describe("getTierPriority", () => {
    it("returns 0 for null tier (fail closed)", () => {
      expect(getTierPriority(null)).toBe(0);
    });

    it("returns 0 for undefined tier (fail closed)", () => {
      expect(getTierPriority(undefined)).toBe(0);
    });

    it("returns 0 for unknown tier code (fail closed)", () => {
      expect(getTierPriority("UNKNOWN_TIER")).toBe(0);
    });

    it("assigns low priority to non-member states", () => {
      expect(getTierPriority("PROSPECT")).toBe(1);
      expect(getTierPriority("LAPSED")).toBe(1);
      expect(getTierPriority("ALUMNI")).toBe(2);
    });

    it("assigns ascending priorities to active member tiers", () => {
      const newcomer = getTierPriority("NEWCOMER");
      const firstYear = getTierPriority("FIRST_YEAR");
      const secondYear = getTierPriority("SECOND_YEAR");
      const thirdYearPlus = getTierPriority("THIRD_YEAR_PLUS");

      expect(newcomer).toBeLessThan(firstYear);
      expect(firstYear).toBeLessThan(secondYear);
      expect(secondYear).toBeLessThan(thirdYearPlus);
    });

    it("places EXTENDED tier between SECOND_YEAR and THIRD_YEAR_PLUS", () => {
      const extended = getTierPriority("EXTENDED");
      const secondYear = getTierPriority("SECOND_YEAR");
      const thirdYearPlus = getTierPriority("THIRD_YEAR_PLUS");

      expect(extended).toBeGreaterThan(secondYear);
      expect(extended).toBeLessThan(thirdYearPlus);
    });
  });

  describe("hasTier", () => {
    it("returns false for null member tier (fail closed)", () => {
      expect(hasTier(null, "NEWCOMER")).toBe(false);
    });

    it("returns false for undefined member tier (fail closed)", () => {
      expect(hasTier(undefined, "NEWCOMER")).toBe(false);
    });

    it("returns false for unknown member tier (fail closed)", () => {
      expect(hasTier("UNKNOWN", "NEWCOMER")).toBe(false);
    });

    it("returns true when member tier equals required tier", () => {
      expect(hasTier("NEWCOMER", "NEWCOMER")).toBe(true);
      expect(hasTier("FIRST_YEAR", "FIRST_YEAR")).toBe(true);
    });

    it("returns true when member tier exceeds required tier", () => {
      expect(hasTier("FIRST_YEAR", "NEWCOMER")).toBe(true);
      expect(hasTier("SECOND_YEAR", "NEWCOMER")).toBe(true);
      expect(hasTier("THIRD_YEAR_PLUS", "FIRST_YEAR")).toBe(true);
    });

    it("returns false when member tier is below required tier", () => {
      expect(hasTier("NEWCOMER", "FIRST_YEAR")).toBe(false);
      expect(hasTier("FIRST_YEAR", "SECOND_YEAR")).toBe(false);
      expect(hasTier("PROSPECT", "NEWCOMER")).toBe(false);
    });

    it("handles non-member states correctly", () => {
      // PROSPECT can access PROSPECT-level features
      expect(hasTier("PROSPECT", "PROSPECT")).toBe(true);

      // PROSPECT cannot access member-level features
      expect(hasTier("PROSPECT", "NEWCOMER")).toBe(false);

      // ALUMNI has slightly higher access than PROSPECT
      expect(hasTier("ALUMNI", "PROSPECT")).toBe(true);
      expect(hasTier("ALUMNI", "NEWCOMER")).toBe(false);
    });

    it("handles LAPSED tier correctly", () => {
      expect(hasTier("LAPSED", "PROSPECT")).toBe(true);
      expect(hasTier("LAPSED", "NEWCOMER")).toBe(false);
    });
  });

  describe("isActiveMemberTier", () => {
    it("returns false for null tier", () => {
      expect(isActiveMemberTier(null)).toBe(false);
    });

    it("returns false for undefined tier", () => {
      expect(isActiveMemberTier(undefined)).toBe(false);
    });

    it("returns false for non-member states", () => {
      expect(isActiveMemberTier("PROSPECT")).toBe(false);
      expect(isActiveMemberTier("LAPSED")).toBe(false);
      expect(isActiveMemberTier("ALUMNI")).toBe(false);
    });

    it("returns true for active member tiers", () => {
      expect(isActiveMemberTier("NEWCOMER")).toBe(true);
      expect(isActiveMemberTier("FIRST_YEAR")).toBe(true);
      expect(isActiveMemberTier("SECOND_YEAR")).toBe(true);
      expect(isActiveMemberTier("THIRD_YEAR_PLUS")).toBe(true);
      expect(isActiveMemberTier("EXTENDED")).toBe(true);
    });

    it("returns false for unknown tier codes", () => {
      expect(isActiveMemberTier("UNKNOWN")).toBe(false);
    });
  });

  describe("contextHasTier", () => {
    const createContext = (tierCode: string | null): TieredAuthContext => ({
      memberId: "test-member-id",
      email: "test@example.com",
      globalRole: "member",
      memberTierCode: tierCode,
      memberTierName: tierCode ? `${tierCode} Member` : null,
    });

    it("returns true when context tier meets requirement", () => {
      const context = createContext("FIRST_YEAR");
      expect(contextHasTier(context, "NEWCOMER")).toBe(true);
      expect(contextHasTier(context, "FIRST_YEAR")).toBe(true);
    });

    it("returns false when context tier is insufficient", () => {
      const context = createContext("NEWCOMER");
      expect(contextHasTier(context, "FIRST_YEAR")).toBe(false);
    });

    it("returns false when context has no tier (fail closed)", () => {
      const context = createContext(null);
      expect(contextHasTier(context, "NEWCOMER")).toBe(false);
    });
  });
});

describe("Tier Gating Business Rules", () => {
  describe("Tier hierarchy is strictly ordered", () => {
    const tiers: MembershipTierCode[] = [
      "PROSPECT",
      "NEWCOMER",
      "FIRST_YEAR",
      "SECOND_YEAR",
      "THIRD_YEAR_PLUS",
    ];

    it("each tier has higher priority than the previous", () => {
      for (let i = 1; i < tiers.length; i++) {
        const current = getTierPriority(tiers[i]);
        const previous = getTierPriority(tiers[i - 1]);
        expect(current).toBeGreaterThan(previous);
      }
    });

    it("higher tiers always grant access to lower tier features", () => {
      for (let i = 0; i < tiers.length; i++) {
        for (let j = 0; j <= i; j++) {
          expect(hasTier(tiers[i], tiers[j])).toBe(true);
        }
      }
    });

    it("lower tiers never grant access to higher tier features", () => {
      for (let i = 0; i < tiers.length; i++) {
        for (let j = i + 1; j < tiers.length; j++) {
          expect(hasTier(tiers[i], tiers[j])).toBe(false);
        }
      }
    });
  });

  describe("Fail closed behavior", () => {
    it("never grants access when tier is unknown", () => {
      const unknownTiers = [null, undefined, "", "INVALID", "null", "undefined"];

      for (const tier of unknownTiers) {
        expect(hasTier(tier, "PROSPECT")).toBe(false);
        expect(hasTier(tier, "NEWCOMER")).toBe(false);
        expect(hasTier(tier, "FIRST_YEAR")).toBe(false);
      }
    });

    it("unknown tier priority is always 0", () => {
      const unknownTiers = [null, undefined, "", "INVALID", "null", "undefined"];

      for (const tier of unknownTiers) {
        expect(getTierPriority(tier as string | null | undefined)).toBe(0);
      }
    });
  });

  describe("Legacy tier codes are supported", () => {
    it("EXTENDED tier is treated as active member", () => {
      expect(isActiveMemberTier("EXTENDED")).toBe(true);
    });

    it("EXTENDED can access NEWCOMER and FIRST_YEAR features", () => {
      expect(hasTier("EXTENDED", "NEWCOMER")).toBe(true);
      expect(hasTier("EXTENDED", "FIRST_YEAR")).toBe(true);
      expect(hasTier("EXTENDED", "SECOND_YEAR")).toBe(true);
    });
  });
});
