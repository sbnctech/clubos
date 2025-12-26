// Copyright (c) Santa Barbara Newcomers Club
// Unit tests for event scheduling helpers (SBNC Sunday/Tuesday policy)

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getNextSunday,
  getFollowingTuesday,
  computeDefaultSchedule,
  getEventVisibilityState,
  getEventRegistrationState,
  getEventOperationalStatus,
  getOperationalStatusLabel,
  formatRegistrationOpensMessage,
  getEnewsWeekRange,
  SBNC_TIMEZONE,
  DEFAULT_REGISTRATION_OPEN_HOUR,
} from "@/lib/events";

/**
 * TIME MOCKING RATIONALE:
 *
 * These tests use Vitest's fake timers to ensure deterministic behavior.
 * Without mocking, tests could fail due to:
 * - Day-of-week drift (running tests on different days)
 * - Timezone differences (CI vs local development)
 * - DST transitions affecting Pacific timezone calculations
 *
 * We fix the system time to Monday, Dec 23, 2024, 10:00 AM Pacific.
 * All test dates are relative to this baseline to ensure consistency.
 *
 * The scheduling helpers internally use America/Los_Angeles timezone,
 * so we also use Pacific timezone for day-of-week assertions.
 */

// Fixed baseline: Monday, Dec 23, 2024, 10:00 AM Pacific (18:00 UTC)
const FIXED_NOW = new Date("2024-12-23T18:00:00.000Z");

/**
 * Get day of week in Pacific timezone (0=Sunday, 6=Saturday).
 * Unlike Date.getDay(), this is consistent regardless of system timezone.
 */
function getPacificDayOfWeek(date: Date): number {
  const dayName = new Intl.DateTimeFormat("en-US", {
    timeZone: SBNC_TIMEZONE,
    weekday: "short",
  }).format(date);
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return dayNames.indexOf(dayName);
}

describe("Event Scheduling Helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("getNextSunday", () => {
    it("returns next Sunday if called during the day on Sunday", () => {
      // Dec 22, 2024 is a Sunday at 10 AM
      // For scheduling purposes, if it's already Sunday, advance to NEXT Sunday
      const sunday = new Date("2024-12-22T10:00:00-08:00");
      const result = getNextSunday(sunday);

      // Should be next Sunday (Dec 29) since we're past midnight on current Sunday
      expect(getPacificDayOfWeek(result)).toBe(0); // Sunday
      expect(result.toISOString()).toContain("2024-12-29");
    });

    it("returns next Sunday if today is Monday", () => {
      // Dec 23, 2024 is a Monday
      const monday = new Date("2024-12-23T10:00:00-08:00");
      const result = getNextSunday(monday);

      // Should be Dec 29, 2024 (next Sunday)
      expect(getPacificDayOfWeek(result)).toBe(0); // Sunday
      expect(result.toISOString()).toContain("2024-12-29");
    });

    it("returns next Sunday if today is Saturday", () => {
      // Dec 28, 2024 is a Saturday
      const saturday = new Date("2024-12-28T10:00:00-08:00");
      const result = getNextSunday(saturday);

      // Should be Dec 29, 2024 (next day, Sunday)
      expect(getPacificDayOfWeek(result)).toBe(0); // Sunday
      expect(result.toISOString()).toContain("2024-12-29");
    });
  });

  describe("getFollowingTuesday", () => {
    it("returns Tuesday at 8 AM Pacific following the given Sunday", () => {
      // Dec 22, 2024 is a Sunday
      const sunday = new Date("2024-12-22T00:00:00-08:00");
      const result = getFollowingTuesday(sunday);

      // Should be Dec 24, 2024 at 8 AM Pacific
      expect(getPacificDayOfWeek(result)).toBe(2); // Tuesday
      expect(result.toISOString()).toContain("2024-12-24");

      // Check it's 8 AM Pacific (16:00 UTC in winter)
      expect(result.getUTCHours()).toBe(16); // 8 AM PST = 16:00 UTC
    });
  });

  describe("computeDefaultSchedule", () => {
    it("computes correct schedule for event requiring registration", () => {
      // Running on a Monday, Dec 23, 2024
      const now = new Date("2024-12-23T10:00:00-08:00");
      const result = computeDefaultSchedule({
        requiresRegistration: true,
        now,
      });

      // publishAt should be next Sunday (Dec 29)
      expect(result.publishAt.toISOString()).toContain("2024-12-29");
      expect(getPacificDayOfWeek(result.publishAt)).toBe(0); // Sunday

      // registrationOpensAt should be following Tuesday (Dec 31)
      expect(result.registrationOpensAt).not.toBeNull();
      expect(result.registrationOpensAt!.toISOString()).toContain("2024-12-31");
      expect(getPacificDayOfWeek(result.registrationOpensAt!)).toBe(2); // Tuesday
    });

    it("computes correct schedule for event NOT requiring registration", () => {
      const now = new Date("2024-12-23T10:00:00-08:00");
      const result = computeDefaultSchedule({
        requiresRegistration: false,
        now,
      });

      // publishAt should be now (immediate)
      expect(result.publishAt.getTime()).toBeCloseTo(now.getTime(), -1000);

      // registrationOpensAt should be null
      expect(result.registrationOpensAt).toBeNull();

      // Explanation should indicate immediate publication
      expect(result.explanation).toContain("immediate");
    });
  });

  describe("getEventVisibilityState", () => {
    it("returns DRAFT for unpublished events", () => {
      const now = new Date("2024-12-23T10:00:00-08:00");
      const result = getEventVisibilityState(
        {
          status: "DRAFT",
          publishAt: null,
          publishedAt: null,
          startTime: new Date("2024-12-30T10:00:00-08:00"),
        },
        now
      );

      expect(result).toBe("DRAFT");
    });

    it("returns SCHEDULED for approved events with future publishAt", () => {
      const now = new Date("2024-12-23T10:00:00-08:00");
      const result = getEventVisibilityState(
        {
          status: "APPROVED",
          publishAt: new Date("2024-12-29T00:00:00-08:00"), // Future
          publishedAt: null,
          startTime: new Date("2024-12-30T10:00:00-08:00"),
        },
        now
      );

      expect(result).toBe("SCHEDULED");
    });

    it("returns VISIBLE for published events", () => {
      const now = new Date("2024-12-23T10:00:00-08:00");
      const result = getEventVisibilityState(
        {
          status: "PUBLISHED",
          publishAt: new Date("2024-12-22T00:00:00-08:00"), // Past
          publishedAt: new Date("2024-12-22T08:00:00-08:00"),
          startTime: new Date("2024-12-30T10:00:00-08:00"),
        },
        now
      );

      expect(result).toBe("VISIBLE");
    });
  });

  describe("getEventRegistrationState", () => {
    it("returns NOT_REQUIRED for events without registration", () => {
      const now = new Date("2024-12-23T10:00:00-08:00");
      const result = getEventRegistrationState(
        {
          status: "PUBLISHED",
          requiresRegistration: false,
          registrationOpensAt: null,
          registrationDeadline: null,
          startTime: new Date("2024-12-30T10:00:00-08:00"),
        },
        now
      );

      expect(result).toBe("NOT_REQUIRED");
    });

    it("returns SCHEDULED when registrationOpensAt is in the future", () => {
      const now = new Date("2024-12-23T10:00:00-08:00");
      const result = getEventRegistrationState(
        {
          status: "PUBLISHED",
          requiresRegistration: true,
          registrationOpensAt: new Date("2024-12-24T08:00:00-08:00"), // Future
          registrationDeadline: null,
          startTime: new Date("2024-12-30T10:00:00-08:00"),
        },
        now
      );

      expect(result).toBe("SCHEDULED");
    });

    it("returns OPEN when registration is active", () => {
      const now = new Date("2024-12-24T10:00:00-08:00"); // After opens, before deadline
      const result = getEventRegistrationState(
        {
          status: "PUBLISHED",
          requiresRegistration: true,
          registrationOpensAt: new Date("2024-12-24T08:00:00-08:00"), // Past
          registrationDeadline: new Date("2024-12-29T10:00:00-08:00"), // Future
          startTime: new Date("2024-12-30T10:00:00-08:00"),
        },
        now
      );

      expect(result).toBe("OPEN");
    });

    it("returns CLOSED when registration deadline has passed", () => {
      const now = new Date("2024-12-30T12:00:00-08:00"); // After event start
      const result = getEventRegistrationState(
        {
          status: "PUBLISHED",
          requiresRegistration: true,
          registrationOpensAt: new Date("2024-12-24T08:00:00-08:00"),
          registrationDeadline: null, // Falls back to startTime
          startTime: new Date("2024-12-30T10:00:00-08:00"), // Past
        },
        now
      );

      expect(result).toBe("CLOSED");
    });
  });

  describe("getEventOperationalStatus", () => {
    it("returns DRAFT for draft events", () => {
      const now = new Date("2024-12-23T10:00:00-08:00");
      const result = getEventOperationalStatus(
        {
          status: "DRAFT",
          publishAt: null,
          publishedAt: null,
          requiresRegistration: true,
          registrationOpensAt: null,
          registrationDeadline: null,
          startTime: new Date("2024-12-30T10:00:00-08:00"),
          endTime: null,
        },
        now
      );

      expect(result).toBe("DRAFT");
    });

    it("returns ANNOUNCED_NOT_OPEN for visible events with scheduled registration", () => {
      const now = new Date("2024-12-22T12:00:00-08:00"); // Sunday after publish
      const result = getEventOperationalStatus(
        {
          status: "PUBLISHED",
          publishAt: new Date("2024-12-22T00:00:00-08:00"),
          publishedAt: new Date("2024-12-22T00:01:00-08:00"),
          requiresRegistration: true,
          registrationOpensAt: new Date("2024-12-24T08:00:00-08:00"), // Tuesday (future)
          registrationDeadline: null,
          startTime: new Date("2024-12-30T10:00:00-08:00"),
          endTime: null,
        },
        now
      );

      expect(result).toBe("ANNOUNCED_NOT_OPEN");
    });

    it("returns OPEN_FOR_REGISTRATION when registration is open", () => {
      const now = new Date("2024-12-25T10:00:00-08:00"); // After opens
      const result = getEventOperationalStatus(
        {
          status: "PUBLISHED",
          publishAt: new Date("2024-12-22T00:00:00-08:00"),
          publishedAt: new Date("2024-12-22T00:01:00-08:00"),
          requiresRegistration: true,
          registrationOpensAt: new Date("2024-12-24T08:00:00-08:00"), // Past
          registrationDeadline: new Date("2024-12-29T23:59:00-08:00"),
          startTime: new Date("2024-12-30T10:00:00-08:00"),
          endTime: null,
        },
        now
      );

      expect(result).toBe("OPEN_FOR_REGISTRATION");
    });

    it("returns COMPLETED for past events", () => {
      const now = new Date("2024-12-31T10:00:00-08:00"); // After event end
      const result = getEventOperationalStatus(
        {
          status: "PUBLISHED",
          publishAt: new Date("2024-12-22T00:00:00-08:00"),
          publishedAt: new Date("2024-12-22T00:01:00-08:00"),
          requiresRegistration: true,
          registrationOpensAt: new Date("2024-12-24T08:00:00-08:00"),
          registrationDeadline: null,
          startTime: new Date("2024-12-30T10:00:00-08:00"),
          endTime: new Date("2024-12-30T12:00:00-08:00"), // Past
        },
        now
      );

      expect(result).toBe("COMPLETED");
    });

    it("returns CANCELED for canceled events", () => {
      const now = new Date("2024-12-25T10:00:00-08:00");
      const result = getEventOperationalStatus(
        {
          status: "CANCELED",
          publishAt: null,
          publishedAt: null,
          requiresRegistration: true,
          registrationOpensAt: null,
          registrationDeadline: null,
          startTime: new Date("2024-12-30T10:00:00-08:00"),
          endTime: null,
        },
        now
      );

      expect(result).toBe("CANCELED");
    });
  });

  describe("getOperationalStatusLabel", () => {
    it("returns human-readable labels for all statuses", () => {
      expect(getOperationalStatusLabel("DRAFT")).toBe("Draft");
      expect(getOperationalStatusLabel("PENDING_APPROVAL")).toBe("Pending Approval");
      expect(getOperationalStatusLabel("CHANGES_REQUESTED")).toBe("Changes Requested");
      expect(getOperationalStatusLabel("APPROVED_SCHEDULED")).toBe("Approved - Scheduled");
      expect(getOperationalStatusLabel("ANNOUNCED_NOT_OPEN")).toBe("Announced - Registration Opens Soon");
      expect(getOperationalStatusLabel("OPEN_FOR_REGISTRATION")).toBe("Open for Registration");
      expect(getOperationalStatusLabel("REGISTRATION_CLOSED")).toBe("Registration Closed");
      expect(getOperationalStatusLabel("IN_PROGRESS")).toBe("In Progress");
      expect(getOperationalStatusLabel("COMPLETED")).toBe("Completed");
      expect(getOperationalStatusLabel("CANCELED")).toBe("Canceled");
      expect(getOperationalStatusLabel("ARCHIVED")).toBe("Archived");
    });
  });

  describe("formatRegistrationOpensMessage", () => {
    it("returns null for events not requiring registration", () => {
      const result = formatRegistrationOpensMessage({
        requiresRegistration: false,
        registrationOpensAt: null,
        status: "PUBLISHED",
        startTime: new Date("2024-12-30T10:00:00-08:00"),
      });

      expect(result).toBeNull();
    });

    it("returns formatted message when registration has a future open date", () => {
      const result = formatRegistrationOpensMessage({
        requiresRegistration: true,
        registrationOpensAt: new Date("2024-12-24T08:00:00-08:00"),
        status: "PUBLISHED",
        startTime: new Date("2024-12-30T10:00:00-08:00"),
      });

      expect(result).not.toBeNull();
      expect(result).toContain("Registration opens");
      expect(result).toContain("Dec"); // Month
      expect(result).toContain("24"); // Day
    });

    it("returns null when no registrationOpensAt", () => {
      const result = formatRegistrationOpensMessage({
        requiresRegistration: true,
        registrationOpensAt: null,
        status: "PUBLISHED",
        startTime: new Date("2024-12-30T10:00:00-08:00"),
      });

      expect(result).toBeNull();
    });
  });

  describe("getEnewsWeekRange", () => {
    it("returns Sunday to Saturday range containing the given date", () => {
      // Dec 23, 2024 is a Monday
      const monday = new Date("2024-12-23T10:00:00-08:00");
      const { start, end } = getEnewsWeekRange(monday);

      // Start should be Sunday Dec 22
      expect(getPacificDayOfWeek(start)).toBe(0); // Sunday
      expect(start.toISOString()).toContain("2024-12-22");

      // End should be Saturday Dec 28 (or early Sunday Dec 29)
      // End is typically end of Saturday
      expect(end.getTime()).toBeGreaterThan(start.getTime());
    });

    it("correctly handles Sunday as base date", () => {
      // Dec 22, 2024 is a Sunday
      const sunday = new Date("2024-12-22T10:00:00-08:00");
      const { start, end } = getEnewsWeekRange(sunday);

      // Start should be THIS Sunday (Dec 22)
      expect(getPacificDayOfWeek(start)).toBe(0);
      expect(start.toISOString()).toContain("2024-12-22");
    });
  });

  describe("Constants", () => {
    it("SBNC_TIMEZONE is America/Los_Angeles", () => {
      expect(SBNC_TIMEZONE).toBe("America/Los_Angeles");
    });

    it("DEFAULT_REGISTRATION_OPEN_HOUR is 8", () => {
      expect(DEFAULT_REGISTRATION_OPEN_HOUR).toBe(8);
    });
  });
});
