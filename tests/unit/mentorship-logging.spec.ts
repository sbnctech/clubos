/**
 * Mentorship Action Logging Unit Tests
 *
 * Tests the action log entries for mentorship lifecycle events.
 *
 * Charter Principles:
 * - P7: Observability is a product feature - verify logs are created
 * - N5: No data mutation without audit logs
 *
 * Reference: docs/governance/MENTOR_ACTION_LOG_SIGNALS.md
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock prisma before imports
vi.mock("@/lib/prisma", () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    mentorshipAssignment: {
      findMany: vi.fn(),
    },
    event: {
      findUnique: vi.fn(),
    },
    eventRegistration: {
      findFirst: vi.fn(),
    },
  },
}));

import { prisma } from "@/lib/prisma";
import {
  logMentorAssigned,
  logMentorNewbieRegistered,
  logMentorNewbieAttended,
  detectRegistrationOverlap,
  detectAttendanceOverlap,
  getMemberMentorshipActivity,
} from "@/lib/mentorship/logging";

const mockPrisma = prisma as unknown as {
  auditLog: {
    create: ReturnType<typeof vi.fn>;
    findFirst: ReturnType<typeof vi.fn>;
    findMany: ReturnType<typeof vi.fn>;
  };
  mentorshipAssignment: {
    findMany: ReturnType<typeof vi.fn>;
  };
  event: {
    findUnique: ReturnType<typeof vi.fn>;
  };
  eventRegistration: {
    findFirst: ReturnType<typeof vi.fn>;
  };
};

describe("logMentorAssigned", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates audit log entry with correct action type", async () => {
    mockPrisma.auditLog.create.mockResolvedValue({ id: "log-1" });

    await logMentorAssigned({
      mentorId: "mentor-uuid",
      mentorName: "Jane Smith",
      newbieId: "newbie-uuid",
      newbieName: "Tom Chen",
      assignedById: "admin-uuid",
    });

    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "MENTOR_ASSIGNED",
        resourceType: "MentorAssignment",
        resourceId: "newbie-uuid",
        memberId: "admin-uuid",
      }),
    });
  });

  it("includes human-readable summary in metadata", async () => {
    mockPrisma.auditLog.create.mockResolvedValue({ id: "log-1" });

    await logMentorAssigned({
      mentorId: "mentor-uuid",
      mentorName: "Jane Smith",
      newbieId: "newbie-uuid",
      newbieName: "Tom Chen",
    });

    const createCall = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(createCall.data.metadata.summary).toBe(
      "Assigned Jane Smith as mentor for Tom Chen"
    );
    expect(createCall.data.metadata.category).toBe("MEMBER");
    expect(createCall.data.metadata.actionLabel).toBe("mentor assigned");
  });

  it("records mentor and newbie info in after state", async () => {
    mockPrisma.auditLog.create.mockResolvedValue({ id: "log-1" });

    await logMentorAssigned({
      mentorId: "mentor-uuid",
      mentorName: "Jane Smith",
      newbieId: "newbie-uuid",
      newbieName: "Tom Chen",
    });

    const createCall = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(createCall.data.after).toMatchObject({
      mentorId: "mentor-uuid",
      mentorName: "Jane Smith",
      newbieId: "newbie-uuid",
      newbieName: "Tom Chen",
    });
  });
});

describe("logMentorNewbieRegistered", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates audit log for shared registration", async () => {
    mockPrisma.auditLog.findFirst.mockResolvedValue(null); // No existing entry
    mockPrisma.auditLog.create.mockResolvedValue({ id: "log-1" });

    await logMentorNewbieRegistered({
      mentorId: "mentor-uuid",
      mentorName: "Jane Smith",
      newbieId: "newbie-uuid",
      newbieName: "Tom Chen",
      eventId: "event-uuid",
      eventName: "Summer Wine Tasting",
    });

    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "MENTOR_NEWBIE_SHARED_REGISTRATION",
        resourceType: "Event",
        resourceId: "event-uuid",
      }),
    });
  });

  it("avoids duplicate entries (no audit noise)", async () => {
    // Simulate existing entry
    mockPrisma.auditLog.findFirst.mockResolvedValue({ id: "existing-log" });

    await logMentorNewbieRegistered({
      mentorId: "mentor-uuid",
      mentorName: "Jane Smith",
      newbieId: "newbie-uuid",
      newbieName: "Tom Chen",
      eventId: "event-uuid",
      eventName: "Summer Wine Tasting",
    });

    expect(mockPrisma.auditLog.create).not.toHaveBeenCalled();
  });

  it("includes human-readable summary", async () => {
    mockPrisma.auditLog.findFirst.mockResolvedValue(null);
    mockPrisma.auditLog.create.mockResolvedValue({ id: "log-1" });

    await logMentorNewbieRegistered({
      mentorId: "mentor-uuid",
      mentorName: "Jane Smith",
      newbieId: "newbie-uuid",
      newbieName: "Tom Chen",
      eventId: "event-uuid",
      eventName: "Summer Wine Tasting",
    });

    const createCall = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(createCall.data.metadata.summary).toBe(
      "Jane Smith and Tom Chen both registered for Summer Wine Tasting"
    );
    expect(createCall.data.metadata.afterState).toBe("Both registered");
  });
});

describe("logMentorNewbieAttended", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates audit log for shared attendance", async () => {
    mockPrisma.auditLog.findFirst.mockResolvedValue(null);
    mockPrisma.auditLog.create.mockResolvedValue({ id: "log-1" });

    await logMentorNewbieAttended({
      mentorId: "mentor-uuid",
      mentorName: "Jane Smith",
      newbieId: "newbie-uuid",
      newbieName: "Tom Chen",
      eventId: "event-uuid",
      eventName: "Summer Wine Tasting",
    });

    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "MENTOR_NEWBIE_SHARED_ATTENDANCE",
        resourceType: "Event",
        resourceId: "event-uuid",
      }),
    });
  });

  it("includes before/after state for audit clarity", async () => {
    mockPrisma.auditLog.findFirst.mockResolvedValue(null);
    mockPrisma.auditLog.create.mockResolvedValue({ id: "log-1" });

    await logMentorNewbieAttended({
      mentorId: "mentor-uuid",
      mentorName: "Jane Smith",
      newbieId: "newbie-uuid",
      newbieName: "Tom Chen",
      eventId: "event-uuid",
      eventName: "Summer Wine Tasting",
    });

    const createCall = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(createCall.data.before.state).toBe("Both registered");
    expect(createCall.data.metadata.beforeState).toBe("Both registered");
    expect(createCall.data.metadata.afterState).toBe("Both attended");
  });

  it("includes mentorship summary for leadership display", async () => {
    mockPrisma.auditLog.findFirst.mockResolvedValue(null);
    mockPrisma.auditLog.create.mockResolvedValue({ id: "log-1" });

    await logMentorNewbieAttended({
      mentorId: "mentor-uuid",
      mentorName: "Jane Smith",
      newbieId: "newbie-uuid",
      newbieName: "Tom Chen",
      eventId: "event-uuid",
      eventName: "Summer Wine Tasting",
    });

    const createCall = mockPrisma.auditLog.create.mock.calls[0][0];
    expect(createCall.data.metadata.summary).toBe(
      "Jane Smith accompanied Tom Chen at Summer Wine Tasting"
    );
  });
});

describe("detectRegistrationOverlap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing when member has no active mentorship assignments", async () => {
    mockPrisma.mentorshipAssignment.findMany.mockResolvedValue([]);

    await detectRegistrationOverlap("member-uuid", "event-uuid");

    expect(mockPrisma.event.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.auditLog.create).not.toHaveBeenCalled();
  });

  it("detects overlap when mentor and newbie both register", async () => {
    mockPrisma.mentorshipAssignment.findMany.mockResolvedValue([
      {
        mentorMemberId: "mentor-uuid",
        newbieMemberId: "newbie-uuid",
        mentor: { id: "mentor-uuid", firstName: "Jane", lastName: "Smith" },
        newbie: { id: "newbie-uuid", firstName: "Tom", lastName: "Chen" },
      },
    ]);
    mockPrisma.event.findUnique.mockResolvedValue({
      id: "event-uuid",
      title: "Summer Wine Tasting",
    });
    mockPrisma.eventRegistration.findFirst.mockResolvedValue({
      id: "reg-uuid",
      status: "CONFIRMED",
    });
    mockPrisma.auditLog.findFirst.mockResolvedValue(null);
    mockPrisma.auditLog.create.mockResolvedValue({ id: "log-1" });

    // Member registering is the newbie, check if mentor is also registered
    await detectRegistrationOverlap("newbie-uuid", "event-uuid");

    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
  });

  it("does not log when partner is not registered", async () => {
    mockPrisma.mentorshipAssignment.findMany.mockResolvedValue([
      {
        mentorMemberId: "mentor-uuid",
        newbieMemberId: "newbie-uuid",
        mentor: { id: "mentor-uuid", firstName: "Jane", lastName: "Smith" },
        newbie: { id: "newbie-uuid", firstName: "Tom", lastName: "Chen" },
      },
    ]);
    mockPrisma.event.findUnique.mockResolvedValue({
      id: "event-uuid",
      title: "Summer Wine Tasting",
    });
    mockPrisma.eventRegistration.findFirst.mockResolvedValue(null); // Partner not registered

    await detectRegistrationOverlap("newbie-uuid", "event-uuid");

    expect(mockPrisma.auditLog.create).not.toHaveBeenCalled();
  });
});

describe("detectAttendanceOverlap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does nothing when member has no active mentorship assignments", async () => {
    mockPrisma.mentorshipAssignment.findMany.mockResolvedValue([]);

    await detectAttendanceOverlap("member-uuid", "event-uuid");

    expect(mockPrisma.event.findUnique).not.toHaveBeenCalled();
    expect(mockPrisma.auditLog.create).not.toHaveBeenCalled();
  });

  it("detects overlap when mentor and newbie both attend", async () => {
    mockPrisma.mentorshipAssignment.findMany.mockResolvedValue([
      {
        mentorMemberId: "mentor-uuid",
        newbieMemberId: "newbie-uuid",
        mentor: { id: "mentor-uuid", firstName: "Jane", lastName: "Smith" },
        newbie: { id: "newbie-uuid", firstName: "Tom", lastName: "Chen" },
      },
    ]);
    mockPrisma.event.findUnique.mockResolvedValue({
      id: "event-uuid",
      title: "Summer Wine Tasting",
    });
    mockPrisma.eventRegistration.findFirst.mockResolvedValue({
      id: "reg-uuid",
      status: "CONFIRMED",
      confirmedAt: new Date(),
    });
    mockPrisma.auditLog.findFirst.mockResolvedValue(null);
    mockPrisma.auditLog.create.mockResolvedValue({ id: "log-1" });

    await detectAttendanceOverlap("mentor-uuid", "event-uuid");

    expect(mockPrisma.auditLog.create).toHaveBeenCalled();
  });

  it("does not log when partner did not attend", async () => {
    mockPrisma.mentorshipAssignment.findMany.mockResolvedValue([
      {
        mentorMemberId: "mentor-uuid",
        newbieMemberId: "newbie-uuid",
        mentor: { id: "mentor-uuid", firstName: "Jane", lastName: "Smith" },
        newbie: { id: "newbie-uuid", firstName: "Tom", lastName: "Chen" },
      },
    ]);
    mockPrisma.event.findUnique.mockResolvedValue({
      id: "event-uuid",
      title: "Summer Wine Tasting",
    });
    mockPrisma.eventRegistration.findFirst.mockResolvedValue(null); // Partner not attended

    await detectAttendanceOverlap("mentor-uuid", "event-uuid");

    expect(mockPrisma.auditLog.create).not.toHaveBeenCalled();
  });
});

describe("getMemberMentorshipActivity", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns summary of mentorship activities", async () => {
    const now = new Date();
    mockPrisma.auditLog.findMany.mockResolvedValue([
      {
        action: "MENTOR_ASSIGNED",
        metadata: { summary: "Assigned Jane as mentor for Tom" },
        createdAt: now,
      },
      {
        action: "MENTOR_NEWBIE_SHARED_ATTENDANCE",
        metadata: { summary: "Jane accompanied Tom at Wine Tasting" },
        createdAt: now,
      },
    ]);

    const result = await getMemberMentorshipActivity("member-uuid");

    expect(result.totalAssignments).toBe(1);
    expect(result.totalCoAttendances).toBe(1);
    expect(result.activities).toHaveLength(2);
  });

  it("returns empty summary when no activities exist", async () => {
    mockPrisma.auditLog.findMany.mockResolvedValue([]);

    const result = await getMemberMentorshipActivity("member-uuid");

    expect(result.totalAssignments).toBe(0);
    expect(result.totalCoAttendances).toBe(0);
    expect(result.lastActivity).toBeNull();
    expect(result.activities).toHaveLength(0);
  });

  it("extracts human-readable summaries for leadership display", async () => {
    const now = new Date();
    mockPrisma.auditLog.findMany.mockResolvedValue([
      {
        action: "MENTOR_NEWBIE_SHARED_ATTENDANCE",
        metadata: {
          summary: "Jane Smith accompanied Tom Chen at Summer Wine Tasting",
        },
        createdAt: now,
      },
    ]);

    const result = await getMemberMentorshipActivity("member-uuid");

    expect(result.activities[0].summary).toBe(
      "Jane Smith accompanied Tom Chen at Summer Wine Tasting"
    );
  });
});
