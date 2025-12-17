/**
 * Mentorship Eligibility Unit Tests
 *
 * Tests the eligibility checking logic for mentorship assignments.
 *
 * Charter Principles:
 * - P2: Default deny - mentor must opt-in
 * - P4: No hidden rules - all criteria are explicit and tested
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma before imports
vi.mock("@/lib/prisma", () => ({
  prisma: {
    systemSetting: {
      findUnique: vi.fn(),
    },
    member: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    mentorshipAssignment: {
      findFirst: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  getMentorMaxAssignments,
  checkMentorEligibility,
  checkNewbieEligibility,
  validateMatch,
} from "@/lib/mentorship/eligibility";

const mockPrisma = prisma as unknown as {
  systemSetting: {
    findUnique: ReturnType<typeof vi.fn>;
  };
  member: {
    findUnique: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
  mentorshipAssignment: {
    findFirst: ReturnType<typeof vi.fn>;
  };
};

describe("getMentorMaxAssignments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns default of 1 when no setting exists", async () => {
    mockPrisma.systemSetting.findUnique.mockResolvedValue(null);

    const result = await getMentorMaxAssignments();

    expect(result).toBe(1);
  });

  it("returns configured value from SystemSetting", async () => {
    mockPrisma.systemSetting.findUnique.mockResolvedValue({
      key: "MENTOR_MAX_ACTIVE_ASSIGNMENTS",
      value: "3",
    });

    const result = await getMentorMaxAssignments();

    expect(result).toBe(3);
  });

  it("returns default for invalid setting value", async () => {
    mockPrisma.systemSetting.findUnique.mockResolvedValue({
      key: "MENTOR_MAX_ACTIVE_ASSIGNMENTS",
      value: "invalid",
    });

    const result = await getMentorMaxAssignments();

    expect(result).toBe(1);
  });

  it("returns default for zero or negative value", async () => {
    mockPrisma.systemSetting.findUnique.mockResolvedValue({
      key: "MENTOR_MAX_ACTIVE_ASSIGNMENTS",
      value: "0",
    });

    const result = await getMentorMaxAssignments();

    expect(result).toBe(1);
  });
});

describe("checkMentorEligibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: max 1 assignment
    mockPrisma.systemSetting.findUnique.mockResolvedValue(null);
  });

  it("returns ineligible for non-existent member", async () => {
    mockPrisma.member.findUnique.mockResolvedValue(null);

    const result = await checkMentorEligibility("non-existent-id");

    expect(result.isEligible).toBe(false);
    expect(result.reason).toBe("Member not found");
  });

  it("returns ineligible when agreedToMentor is false", async () => {
    mockPrisma.member.findUnique.mockResolvedValue({
      id: "mentor-1",
      agreedToMentor: false,
      mentorshipAsMentor: [],
    });

    const result = await checkMentorEligibility("mentor-1");

    expect(result.isEligible).toBe(false);
    expect(result.reason).toBe("Member has not opted into mentoring");
  });

  it("returns ineligible when at capacity", async () => {
    mockPrisma.member.findUnique.mockResolvedValue({
      id: "mentor-1",
      agreedToMentor: true,
      mentorshipAsMentor: [{ id: "assignment-1" }], // Already has 1 assignment
    });

    const result = await checkMentorEligibility("mentor-1");

    expect(result.isEligible).toBe(false);
    expect(result.reason).toContain("at capacity");
    expect(result.currentLoad).toBe(1);
    expect(result.maxCapacity).toBe(1);
    expect(result.availableSlots).toBe(0);
  });

  it("returns eligible when has capacity", async () => {
    mockPrisma.member.findUnique.mockResolvedValue({
      id: "mentor-1",
      agreedToMentor: true,
      mentorshipAsMentor: [], // No active assignments
    });

    const result = await checkMentorEligibility("mentor-1");

    expect(result.isEligible).toBe(true);
    expect(result.currentLoad).toBe(0);
    expect(result.maxCapacity).toBe(1);
    expect(result.availableSlots).toBe(1);
  });

  it("respects custom max capacity from SystemSetting", async () => {
    mockPrisma.systemSetting.findUnique.mockResolvedValue({
      key: "MENTOR_MAX_ACTIVE_ASSIGNMENTS",
      value: "3",
    });
    mockPrisma.member.findUnique.mockResolvedValue({
      id: "mentor-1",
      agreedToMentor: true,
      mentorshipAsMentor: [{ id: "a1" }, { id: "a2" }], // 2 active
    });

    const result = await checkMentorEligibility("mentor-1");

    expect(result.isEligible).toBe(true);
    expect(result.currentLoad).toBe(2);
    expect(result.maxCapacity).toBe(3);
    expect(result.availableSlots).toBe(1);
  });
});

describe("checkNewbieEligibility", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns ineligible for non-existent member", async () => {
    mockPrisma.member.findUnique.mockResolvedValue(null);

    const result = await checkNewbieEligibility("non-existent-id");

    expect(result.isEligible).toBe(false);
    expect(result.reason).toBe("Member not found");
  });

  it("returns ineligible when already has active mentor", async () => {
    mockPrisma.member.findUnique.mockResolvedValue({
      id: "newbie-1",
      mentorshipAsNewbie: [
        {
          id: "assignment-1",
          mentor: {
            id: "mentor-1",
            firstName: "Jane",
            lastName: "Doe",
          },
        },
      ],
    });

    const result = await checkNewbieEligibility("newbie-1");

    expect(result.isEligible).toBe(false);
    expect(result.hasActiveMentor).toBe(true);
    expect(result.currentMentorName).toBe("Jane Doe");
    expect(result.reason).toContain("Already has active mentor");
  });

  it("returns eligible when no active assignment", async () => {
    mockPrisma.member.findUnique.mockResolvedValue({
      id: "newbie-1",
      mentorshipAsNewbie: [],
    });

    const result = await checkNewbieEligibility("newbie-1");

    expect(result.isEligible).toBe(true);
    expect(result.hasActiveMentor).toBe(false);
  });
});

describe("validateMatch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.systemSetting.findUnique.mockResolvedValue(null);
  });

  it("rejects self-assignment", async () => {
    mockPrisma.member.findUnique.mockResolvedValue({
      id: "member-1",
      agreedToMentor: true,
      mentorshipAsMentor: [],
      mentorshipAsNewbie: [],
    });

    const result = await validateMatch("member-1", "member-1");

    expect(result.canMatch).toBe(false);
    expect(result.errors).toContain("Cannot assign member as their own mentor");
  });

  it("returns canMatch=true for valid mentor-newbie pair", async () => {
    // Use mockImplementation to handle parallel calls correctly
    mockPrisma.member.findUnique.mockImplementation(
      async ({ where }: { where: { id: string } }) => {
        if (where.id === "mentor-1") {
          return { id: "mentor-1", agreedToMentor: true, mentorshipAsMentor: [] };
        }
        if (where.id === "newbie-1") {
          return { id: "newbie-1", mentorshipAsNewbie: [] };
        }
        return null;
      }
    );

    const result = await validateMatch("mentor-1", "newbie-1");

    expect(result.canMatch).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.mentorEligibility.isEligible).toBe(true);
    expect(result.newbieEligibility.isEligible).toBe(true);
  });

  it("collects all validation errors", async () => {
    // Use mockImplementation to handle parallel calls correctly
    mockPrisma.member.findUnique.mockImplementation(
      async ({ where }: { where: { id: string } }) => {
        if (where.id === "mentor-1") {
          return { id: "mentor-1", agreedToMentor: false, mentorshipAsMentor: [] };
        }
        if (where.id === "newbie-1") {
          return {
            id: "newbie-1",
            mentorshipAsNewbie: [
              {
                id: "existing",
                mentor: { id: "other-mentor", firstName: "Existing", lastName: "Mentor" },
              },
            ],
          };
        }
        return null;
      }
    );

    const result = await validateMatch("mentor-1", "newbie-1");

    expect(result.canMatch).toBe(false);
    expect(result.errors.length).toBeGreaterThan(1);
    expect(result.errors.some((e) => e.includes("opted into"))).toBe(true);
    expect(result.errors.some((e) => e.includes("Already has"))).toBe(true);
  });
});
