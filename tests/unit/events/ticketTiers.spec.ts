/**
 * Unit Tests: Ticket Tier Derivations
 *
 * Tests for the pure functions in src/lib/events/ticketTiers.ts
 * Capacity is derived from ticket tiers, not a single field.
 *
 * Copyright (c) Santa Barbara Newcomers Club
 */

import { describe, expect, test } from "vitest";
import {
  computeTierMetrics,
  computeEventSummaryMetrics,
  deriveCapacityStatus,
  capacityStatusLabel,
  computeWaitlistTiming,
  computePricingSummary,
  getPriceRange,
  formatPrice,
  type TicketTierInput,
  type RegistrationInput,
  type TierMetrics,
} from "@/lib/events";

// ============================================================================
// TEST FIXTURES
// ============================================================================

const makeTier = (
  id: string,
  name: string,
  priceCents: number,
  quantity: number,
  isActive = true
): TicketTierInput => ({
  id,
  name,
  priceCents,
  quantity,
  isActive,
});

const makeReg = (
  id: string,
  ticketTierId: string | null,
  status: RegistrationInput["status"],
  registeredAt: Date = new Date()
): RegistrationInput => ({
  id,
  ticketTierId,
  status,
  registeredAt,
});

// ============================================================================
// formatPrice
// ============================================================================

describe("formatPrice", () => {
  test("returns 'Free' for 0 cents", () => {
    expect(formatPrice(0)).toBe("Free");
  });

  test("formats whole dollars without decimals", () => {
    expect(formatPrice(1000)).toBe("$10");
    expect(formatPrice(2500)).toBe("$25");
  });

  test("formats dollars with cents", () => {
    expect(formatPrice(1050)).toBe("$10.50");
    expect(formatPrice(999)).toBe("$9.99");
  });
});

// ============================================================================
// computeTierMetrics
// ============================================================================

describe("computeTierMetrics", () => {
  test("calculates metrics for tier with no registrations", () => {
    const tier = makeTier("t1", "Member", 1000, 20);
    const result = computeTierMetrics(tier, []);

    expect(result).toEqual({
      tierId: "t1",
      tierName: "Member",
      priceCents: 1000,
      quantity: 20,
      sold: 0,
      remaining: 20,
      waitlisted: 0,
      isFull: false,
      hasWaitlist: false,
    });
  });

  test("counts confirmed registrations as sold", () => {
    const tier = makeTier("t1", "Member", 1000, 20);
    const regs = [
      makeReg("r1", "t1", "CONFIRMED"),
      makeReg("r2", "t1", "CONFIRMED"),
      makeReg("r3", "t1", "PENDING_PAYMENT"),
    ];

    const result = computeTierMetrics(tier, regs);
    expect(result.sold).toBe(3);
    expect(result.remaining).toBe(17);
  });

  test("counts waitlisted registrations separately", () => {
    const tier = makeTier("t1", "Member", 1000, 2);
    const regs = [
      makeReg("r1", "t1", "CONFIRMED"),
      makeReg("r2", "t1", "CONFIRMED"),
      makeReg("r3", "t1", "WAITLISTED"),
      makeReg("r4", "t1", "WAITLISTED"),
    ];

    const result = computeTierMetrics(tier, regs);
    expect(result.sold).toBe(2);
    expect(result.waitlisted).toBe(2);
    expect(result.remaining).toBe(0);
    expect(result.isFull).toBe(true);
    expect(result.hasWaitlist).toBe(true);
  });

  test("ignores cancelled registrations", () => {
    const tier = makeTier("t1", "Member", 1000, 20);
    const regs = [
      makeReg("r1", "t1", "CONFIRMED"),
      makeReg("r2", "t1", "CANCELLED"),
      makeReg("r3", "t1", "REFUNDED"),
    ];

    const result = computeTierMetrics(tier, regs);
    expect(result.sold).toBe(1);
  });

  test("ignores registrations for other tiers", () => {
    const tier = makeTier("t1", "Member", 1000, 20);
    const regs = [
      makeReg("r1", "t1", "CONFIRMED"),
      makeReg("r2", "t2", "CONFIRMED"), // Different tier
      makeReg("r3", null, "CONFIRMED"), // No tier (legacy)
    ];

    const result = computeTierMetrics(tier, regs);
    expect(result.sold).toBe(1);
  });

  test("remaining never goes negative", () => {
    const tier = makeTier("t1", "Member", 1000, 2);
    const regs = [
      makeReg("r1", "t1", "CONFIRMED"),
      makeReg("r2", "t1", "CONFIRMED"),
      makeReg("r3", "t1", "CONFIRMED"), // Oversold
    ];

    const result = computeTierMetrics(tier, regs);
    expect(result.sold).toBe(3);
    expect(result.remaining).toBe(0); // Not negative
    expect(result.isFull).toBe(true);
  });
});

// ============================================================================
// computeEventSummaryMetrics
// ============================================================================

describe("computeEventSummaryMetrics", () => {
  test("returns UNKNOWN status for no tiers", () => {
    const result = computeEventSummaryMetrics([], []);

    expect(result.capacityStatus).toBe("UNKNOWN");
    expect(result.totalTicketsAvailable).toBe(0);
    expect(result.tierMetrics).toHaveLength(0);
  });

  test("aggregates metrics across multiple tiers", () => {
    const tiers = [
      makeTier("t1", "Member", 1000, 20),
      makeTier("t2", "Guest", 1500, 10),
    ];
    const regs = [
      makeReg("r1", "t1", "CONFIRMED"),
      makeReg("r2", "t1", "CONFIRMED"),
      makeReg("r3", "t2", "CONFIRMED"),
    ];

    const result = computeEventSummaryMetrics(tiers, regs);

    expect(result.totalTicketsAvailable).toBe(30);
    expect(result.totalTicketsSold).toBe(3);
    expect(result.totalRemaining).toBe(27);
    expect(result.capacityStatus).toBe("UNDERSUBSCRIBED");
    expect(result.tierMetrics).toHaveLength(2);
  });

  test("ignores inactive tiers", () => {
    const tiers = [
      makeTier("t1", "Member", 1000, 20, true),
      makeTier("t2", "Early Bird", 800, 10, false), // Inactive
    ];

    const result = computeEventSummaryMetrics(tiers, []);

    expect(result.totalTicketsAvailable).toBe(20);
    expect(result.tierMetrics).toHaveLength(1);
    expect(result.tierMetrics[0].tierName).toBe("Member");
  });

  test("detects FULL status", () => {
    const tiers = [makeTier("t1", "Member", 1000, 2)];
    const regs = [
      makeReg("r1", "t1", "CONFIRMED"),
      makeReg("r2", "t1", "CONFIRMED"),
    ];

    const result = computeEventSummaryMetrics(tiers, regs);

    expect(result.capacityStatus).toBe("FULL");
    expect(result.totalRemaining).toBe(0);
  });

  test("detects WAITLISTED status", () => {
    const tiers = [makeTier("t1", "Member", 1000, 2)];
    const regs = [
      makeReg("r1", "t1", "CONFIRMED"),
      makeReg("r2", "t1", "CONFIRMED"),
      makeReg("r3", "t1", "WAITLISTED"),
    ];

    const result = computeEventSummaryMetrics(tiers, regs);

    expect(result.capacityStatus).toBe("WAITLISTED");
    expect(result.totalWaitlisted).toBe(1);
  });
});

// ============================================================================
// deriveCapacityStatus
// ============================================================================

describe("deriveCapacityStatus", () => {
  const makeMetrics = (remaining: number, waitlisted: number): TierMetrics => ({
    tierId: "t1",
    tierName: "Test",
    priceCents: 1000,
    quantity: 10,
    sold: 10 - remaining,
    remaining,
    waitlisted,
    isFull: remaining === 0,
    hasWaitlist: waitlisted > 0,
  });

  test("returns WAITLISTED when any waitlist entries", () => {
    expect(deriveCapacityStatus([makeMetrics(0, 5)], 5, 0)).toBe("WAITLISTED");
    expect(deriveCapacityStatus([makeMetrics(5, 1)], 1, 5)).toBe("WAITLISTED");
  });

  test("returns FULL when no remaining and no waitlist", () => {
    expect(deriveCapacityStatus([makeMetrics(0, 0)], 0, 0)).toBe("FULL");
  });

  test("returns UNDERSUBSCRIBED when spots available", () => {
    expect(deriveCapacityStatus([makeMetrics(5, 0)], 0, 5)).toBe("UNDERSUBSCRIBED");
  });
});

describe("capacityStatusLabel", () => {
  test("returns correct labels", () => {
    expect(capacityStatusLabel("WAITLISTED")).toBe("Waitlist Active");
    expect(capacityStatusLabel("FULL")).toBe("Sold Out");
    expect(capacityStatusLabel("UNDERSUBSCRIBED")).toBe("Spots Available");
    expect(capacityStatusLabel("UNKNOWN")).toBe("Capacity Unknown");
  });
});

// ============================================================================
// computeWaitlistTiming
// ============================================================================

describe("computeWaitlistTiming", () => {
  test("returns nulls when no waitlist", () => {
    const regs = [
      makeReg("r1", "t1", "CONFIRMED"),
      makeReg("r2", "t1", "CONFIRMED"),
    ];

    const result = computeWaitlistTiming(regs);

    expect(result.waitlistStartedAt).toBeNull();
    expect(result.waitlistEndedAt).toBeNull();
    expect(result.waitlistDurationSeconds).toBeNull();
  });

  test("calculates timing for single waitlist entry", () => {
    const time = new Date("2025-01-15T10:00:00Z");
    const regs = [makeReg("r1", "t1", "WAITLISTED", time)];

    const result = computeWaitlistTiming(regs);

    expect(result.waitlistStartedAt).toEqual(time);
    expect(result.waitlistEndedAt).toEqual(time);
    expect(result.waitlistDurationSeconds).toBe(0);
  });

  test("calculates duration for multiple waitlist entries", () => {
    const start = new Date("2025-01-15T10:00:00Z");
    const end = new Date("2025-01-15T10:05:00Z"); // 5 minutes later
    const regs = [
      makeReg("r1", "t1", "WAITLISTED", start),
      makeReg("r2", "t1", "WAITLISTED", end),
    ];

    const result = computeWaitlistTiming(regs);

    expect(result.waitlistStartedAt).toEqual(start);
    expect(result.waitlistEndedAt).toEqual(end);
    expect(result.waitlistDurationSeconds).toBe(300); // 5 minutes
  });

  test("sorts by registeredAt to find first and last", () => {
    const t1 = new Date("2025-01-15T10:00:00Z");
    const t2 = new Date("2025-01-15T10:02:00Z");
    const t3 = new Date("2025-01-15T10:05:00Z");

    // Pass in unsorted order
    const regs = [
      makeReg("r2", "t1", "WAITLISTED", t2),
      makeReg("r3", "t1", "WAITLISTED", t3),
      makeReg("r1", "t1", "WAITLISTED", t1),
    ];

    const result = computeWaitlistTiming(regs);

    expect(result.waitlistStartedAt).toEqual(t1);
    expect(result.waitlistEndedAt).toEqual(t3);
    expect(result.waitlistDurationSeconds).toBe(300);
  });

  test("ignores non-waitlisted registrations", () => {
    const time = new Date("2025-01-15T10:00:00Z");
    const regs = [
      makeReg("r1", "t1", "CONFIRMED", new Date("2025-01-15T09:00:00Z")),
      makeReg("r2", "t1", "WAITLISTED", time),
      makeReg("r3", "t1", "CANCELLED", new Date("2025-01-15T11:00:00Z")),
    ];

    const result = computeWaitlistTiming(regs);

    expect(result.waitlistStartedAt).toEqual(time);
    expect(result.waitlistEndedAt).toEqual(time);
  });
});

// ============================================================================
// computePricingSummary
// ============================================================================

describe("computePricingSummary", () => {
  test("returns Free for no tiers", () => {
    const result = computePricingSummary([]);

    expect(result.isFree).toBe(true);
    expect(result.displayText).toBe("Free");
    expect(result.tiers).toHaveLength(0);
  });

  test("returns Free for all free tiers", () => {
    const tiers = [
      makeTier("t1", "Member", 0, 20),
      makeTier("t2", "Guest", 0, 10),
    ];

    const result = computePricingSummary(tiers);

    expect(result.isFree).toBe(true);
    expect(result.isMultipleTiers).toBe(true);
    expect(result.displayText).toBe("Free");
  });

  test("returns exact price for single tier", () => {
    const tiers = [makeTier("t1", "General", 1500, 20)];

    const result = computePricingSummary(tiers);

    expect(result.isFree).toBe(false);
    expect(result.isMultipleTiers).toBe(false);
    expect(result.displayText).toBe("$15");
  });

  test("returns breakdown for multiple paid tiers", () => {
    const tiers = [
      makeTier("t1", "Member", 1000, 20),
      makeTier("t2", "Guest", 1500, 10),
    ];

    const result = computePricingSummary(tiers);

    expect(result.isFree).toBe(false);
    expect(result.isMultipleTiers).toBe(true);
    expect(result.displayText).toBe("Member $10 | Guest $15");
    expect(result.tiers).toHaveLength(2);
  });

  test("sorts tiers by price in display", () => {
    const tiers = [
      makeTier("t2", "Guest", 1500, 10),
      makeTier("t1", "Member", 1000, 20),
    ];

    const result = computePricingSummary(tiers);

    // Should be sorted by price (Member first)
    expect(result.displayText).toBe("Member $10 | Guest $15");
  });

  test("ignores inactive tiers", () => {
    const tiers = [
      makeTier("t1", "Member", 1000, 20, true),
      makeTier("t2", "Early Bird", 800, 10, false), // Inactive
    ];

    const result = computePricingSummary(tiers);

    expect(result.isMultipleTiers).toBe(false);
    expect(result.displayText).toBe("$10");
  });

  test("handles mixed free and paid tiers", () => {
    const tiers = [
      makeTier("t1", "Member", 0, 20),
      makeTier("t2", "Guest", 1500, 10),
    ];

    const result = computePricingSummary(tiers);

    expect(result.isFree).toBe(false);
    expect(result.displayText).toBe("Member Free | Guest $15");
  });
});

// ============================================================================
// getPriceRange
// ============================================================================

describe("getPriceRange", () => {
  test("returns 'Free' for no tiers", () => {
    expect(getPriceRange([])).toBe("Free");
  });

  test("returns 'Free' for all free tiers", () => {
    const tiers = [
      makeTier("t1", "Member", 0, 20),
      makeTier("t2", "Guest", 0, 10),
    ];
    expect(getPriceRange(tiers)).toBe("Free");
  });

  test("returns single price for uniform pricing", () => {
    const tiers = [
      makeTier("t1", "Member", 1000, 20),
      makeTier("t2", "Guest", 1000, 10),
    ];
    expect(getPriceRange(tiers)).toBe("$10");
  });

  test("returns price range for varied pricing", () => {
    const tiers = [
      makeTier("t1", "Member", 1000, 20),
      makeTier("t2", "Guest", 1500, 10),
    ];
    expect(getPriceRange(tiers)).toBe("$10 - $15");
  });

  test("returns 'Free - $X' for mixed free and paid", () => {
    const tiers = [
      makeTier("t1", "Member", 0, 20),
      makeTier("t2", "Guest", 1500, 10),
    ];
    expect(getPriceRange(tiers)).toBe("Free - $15");
  });

  test("ignores inactive tiers", () => {
    const tiers = [
      makeTier("t1", "Member", 1000, 20, true),
      makeTier("t2", "VIP", 5000, 5, false), // Inactive
    ];
    expect(getPriceRange(tiers)).toBe("$10");
  });
});
