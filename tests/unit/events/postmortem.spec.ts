/**
 * Unit tests for postmortem status derivation
 *
 * Tests the server-side logic for determining postmortem completion status.
 * See docs/events/EVENT_POSTMORTEM.md for completion criteria definition.
 *
 * Copyright (c) Santa Barbara Newcomers Club
 */

import { describe, it, expect } from "vitest";
import {
  derivePostmortemStatus,
  checkPostmortemCompletion,
  getPostmortemStatusLabel,
  getPostmortemCTAText,
  type PostmortemCompletionStatus,
} from "@/lib/events/postmortem";

describe("Event Postmortem Status", () => {
  describe("derivePostmortemStatus", () => {
    describe("NOT_STARTED", () => {
      it("returns NOT_STARTED when postmortem is null", () => {
        expect(derivePostmortemStatus(null)).toBe("NOT_STARTED");
      });

      it("returns NOT_STARTED when postmortem is undefined", () => {
        expect(derivePostmortemStatus(undefined)).toBe("NOT_STARTED");
      });
    });

    describe("IN_PROGRESS", () => {
      it("returns IN_PROGRESS when only whatWorked is filled", () => {
        const postmortem = {
          whatWorked: "The venue was great",
          whatDidNot: null,
          whatToChangeNextTime: null,
          attendanceRating: null,
          logisticsRating: null,
          satisfactionRating: null,
        };
        expect(derivePostmortemStatus(postmortem)).toBe("IN_PROGRESS");
      });

      it("returns IN_PROGRESS when only rating is filled", () => {
        const postmortem = {
          whatWorked: null,
          whatDidNot: null,
          whatToChangeNextTime: null,
          attendanceRating: 4,
          logisticsRating: null,
          satisfactionRating: null,
        };
        expect(derivePostmortemStatus(postmortem)).toBe("IN_PROGRESS");
      });

      it("returns IN_PROGRESS when all fields are empty strings", () => {
        const postmortem = {
          whatWorked: "",
          whatDidNot: "",
          whatToChangeNextTime: "",
          attendanceRating: null,
          logisticsRating: null,
          satisfactionRating: null,
        };
        expect(derivePostmortemStatus(postmortem)).toBe("IN_PROGRESS");
      });

      it("returns IN_PROGRESS when fields are whitespace only", () => {
        const postmortem = {
          whatWorked: "   ",
          whatDidNot: "\t\n",
          whatToChangeNextTime: "  ",
          attendanceRating: 5,
          logisticsRating: null,
          satisfactionRating: null,
        };
        expect(derivePostmortemStatus(postmortem)).toBe("IN_PROGRESS");
      });
    });

    describe("COMPLETE", () => {
      it("returns COMPLETE when whatWorked and attendanceRating are filled", () => {
        const postmortem = {
          whatWorked: "The venue was great",
          whatDidNot: null,
          whatToChangeNextTime: null,
          attendanceRating: 4,
          logisticsRating: null,
          satisfactionRating: null,
        };
        expect(derivePostmortemStatus(postmortem)).toBe("COMPLETE");
      });

      it("returns COMPLETE when whatDidNot and logisticsRating are filled", () => {
        const postmortem = {
          whatWorked: null,
          whatDidNot: "Parking was difficult",
          whatToChangeNextTime: null,
          attendanceRating: null,
          logisticsRating: 3,
          satisfactionRating: null,
        };
        expect(derivePostmortemStatus(postmortem)).toBe("COMPLETE");
      });

      it("returns COMPLETE when whatToChangeNextTime and satisfactionRating are filled", () => {
        const postmortem = {
          whatWorked: null,
          whatDidNot: null,
          whatToChangeNextTime: "Book earlier next time",
          attendanceRating: null,
          logisticsRating: null,
          satisfactionRating: 5,
        };
        expect(derivePostmortemStatus(postmortem)).toBe("COMPLETE");
      });

      it("returns COMPLETE when all fields are filled", () => {
        const postmortem = {
          whatWorked: "Great turnout, excellent food",
          whatDidNot: "A/V equipment had issues",
          whatToChangeNextTime: "Book tech support ahead of time",
          attendanceRating: 5,
          logisticsRating: 3,
          satisfactionRating: 4,
        };
        expect(derivePostmortemStatus(postmortem)).toBe("COMPLETE");
      });

      it("returns COMPLETE with multiple retrospective notes and one rating", () => {
        const postmortem = {
          whatWorked: "Good attendance",
          whatDidNot: "Late start",
          whatToChangeNextTime: "Start on time",
          attendanceRating: null,
          logisticsRating: null,
          satisfactionRating: 4,
        };
        expect(derivePostmortemStatus(postmortem)).toBe("COMPLETE");
      });
    });

    describe("edge cases", () => {
      it("handles rating value of 0 as a valid rating", () => {
        // Note: 0 is likely not a valid rating (1-5), but the logic treats non-null as filled
        const postmortem = {
          whatWorked: "Something worked",
          whatDidNot: null,
          whatToChangeNextTime: null,
          attendanceRating: 0,
          logisticsRating: null,
          satisfactionRating: null,
        };
        // This technically should be COMPLETE because 0 !== null
        // In practice, UI validation should prevent 0 ratings
        expect(derivePostmortemStatus(postmortem)).toBe("COMPLETE");
      });
    });
  });

  describe("checkPostmortemCompletion", () => {
    it("returns all false for null postmortem", () => {
      const result = checkPostmortemCompletion(null);
      expect(result).toEqual({
        hasRetrospectiveNotes: false,
        hasRating: false,
        isComplete: false,
      });
    });

    it("detects retrospective notes correctly", () => {
      const postmortem = {
        whatWorked: "This worked",
        whatDidNot: null,
        whatToChangeNextTime: null,
        attendanceRating: null,
        logisticsRating: null,
        satisfactionRating: null,
      };
      const result = checkPostmortemCompletion(postmortem);
      expect(result.hasRetrospectiveNotes).toBe(true);
      expect(result.hasRating).toBe(false);
      expect(result.isComplete).toBe(false);
    });

    it("detects ratings correctly", () => {
      const postmortem = {
        whatWorked: null,
        whatDidNot: null,
        whatToChangeNextTime: null,
        attendanceRating: 4,
        logisticsRating: null,
        satisfactionRating: null,
      };
      const result = checkPostmortemCompletion(postmortem);
      expect(result.hasRetrospectiveNotes).toBe(false);
      expect(result.hasRating).toBe(true);
      expect(result.isComplete).toBe(false);
    });

    it("detects complete postmortem correctly", () => {
      const postmortem = {
        whatWorked: "Great event",
        whatDidNot: null,
        whatToChangeNextTime: null,
        attendanceRating: 5,
        logisticsRating: null,
        satisfactionRating: null,
      };
      const result = checkPostmortemCompletion(postmortem);
      expect(result.hasRetrospectiveNotes).toBe(true);
      expect(result.hasRating).toBe(true);
      expect(result.isComplete).toBe(true);
    });
  });

  describe("getPostmortemStatusLabel", () => {
    const testCases: [PostmortemCompletionStatus, string][] = [
      ["NOT_STARTED", "Not started"],
      ["IN_PROGRESS", "In progress"],
      ["COMPLETE", "Complete"],
    ];

    testCases.forEach(([status, expected]) => {
      it(`returns "${expected}" for ${status}`, () => {
        expect(getPostmortemStatusLabel(status)).toBe(expected);
      });
    });
  });

  describe("getPostmortemCTAText", () => {
    const testCases: [PostmortemCompletionStatus, string][] = [
      ["NOT_STARTED", "Start post-mortem"],
      ["IN_PROGRESS", "Complete post-mortem"],
      ["COMPLETE", "View post-mortem"],
    ];

    testCases.forEach(([status, expected]) => {
      it(`returns "${expected}" for ${status}`, () => {
        expect(getPostmortemCTAText(status)).toBe(expected);
      });
    });
  });
});
