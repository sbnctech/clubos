/**
 * Mentorship Matching Service
 *
 * Reference: docs/ORG/SBNC_BUSINESS_MODEL.md - mentorship as volunteer on-ramp
 *
 * Handles mentor-newbie matching with:
 * - Duplicate prevention (one active assignment per newbie)
 * - Capacity limits (configurable max assignments per mentor)
 * - Audit logging
 */

import { prisma } from "@/lib/prisma";
import { AuditAction, MentorshipAssignmentStatus, Prisma } from "@prisma/client";

// Default max active assignments per mentor (configurable)
const DEFAULT_MAX_ACTIVE_ASSIGNMENTS = 1;

export interface CreateMatchInput {
  newbieMemberId: string;
  mentorMemberId: string;
  createdByMemberId?: string;
  notes?: string;
}

export interface CreateMatchResult {
  success: true;
  assignmentId: string;
  newbieName: string;
  newbieEmail: string;
  mentorName: string;
  mentorEmail: string;
}

export interface CreateMatchError {
  success: false;
  code: "NEWBIE_ALREADY_MATCHED" | "MENTOR_NOT_ELIGIBLE" | "MENTOR_AT_CAPACITY" | "SAME_MEMBER";
  message: string;
}

/**
 * Create a mentorship match between a newbie and mentor.
 *
 * Validations:
 * - Newbie must not have an ACTIVE assignment
 * - Mentor must have agreedToMentor = true
 * - Mentor must be under capacity limit
 * - Newbie and mentor cannot be the same person
 */
export async function createMatch(
  input: CreateMatchInput
): Promise<CreateMatchResult | CreateMatchError> {
  const { newbieMemberId, mentorMemberId, createdByMemberId, notes } = input;

  // Prevent self-matching
  if (newbieMemberId === mentorMemberId) {
    return {
      success: false,
      code: "SAME_MEMBER",
      message: "A member cannot be their own mentor",
    };
  }

  // Use transaction to ensure atomicity
  return await prisma.$transaction(async (tx) => {
    // Check if newbie already has an ACTIVE assignment
    const existingAssignment = await tx.mentorshipAssignment.findFirst({
      where: {
        newbieMemberId,
        status: MentorshipAssignmentStatus.ACTIVE,
      },
    });

    if (existingAssignment) {
      return {
        success: false as const,
        code: "NEWBIE_ALREADY_MATCHED" as const,
        message: "This newbie already has an active mentor assignment",
      };
    }

    // Check mentor eligibility
    const mentor = await tx.member.findUnique({
      where: { id: mentorMemberId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        agreedToMentor: true,
        _count: {
          select: {
            mentorshipAsMentor: {
              where: { status: MentorshipAssignmentStatus.ACTIVE },
            },
          },
        },
      },
    });

    if (!mentor) {
      return {
        success: false as const,
        code: "MENTOR_NOT_ELIGIBLE" as const,
        message: "Mentor not found",
      };
    }

    if (!mentor.agreedToMentor) {
      return {
        success: false as const,
        code: "MENTOR_NOT_ELIGIBLE" as const,
        message: "This member has not agreed to be a mentor",
      };
    }

    // Check capacity
    const maxAssignments = await getMaxActiveAssignments();
    if (mentor._count.mentorshipAsMentor >= maxAssignments) {
      return {
        success: false as const,
        code: "MENTOR_AT_CAPACITY" as const,
        message: `This mentor has reached the maximum of ${maxAssignments} active assignment(s)`,
      };
    }

    // Get newbie info
    const newbie = await tx.member.findUnique({
      where: { id: newbieMemberId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
      },
    });

    if (!newbie) {
      return {
        success: false as const,
        code: "MENTOR_NOT_ELIGIBLE" as const,
        message: "Newbie not found",
      };
    }

    // Create the assignment
    const assignment = await tx.mentorshipAssignment.create({
      data: {
        newbieMemberId,
        mentorMemberId,
        createdByMemberId,
        notes,
        status: MentorshipAssignmentStatus.ACTIVE,
      },
    });

    const newbieName = `${newbie.firstName} ${newbie.lastName}`;
    const mentorName = `${mentor.firstName} ${mentor.lastName}`;

    // Create audit log entry
    await tx.auditLog.create({
      data: {
        action: AuditAction.MENTOR_ASSIGNED,
        resourceType: "MentorshipAssignment",
        resourceId: assignment.id,
        memberId: createdByMemberId,
        before: Prisma.JsonNull,
        after: {
          newbieMemberId,
          newbieName,
          mentorMemberId,
          mentorName,
          assignedAt: assignment.createdAt.toISOString(),
        },
        metadata: {
          summary: `Assigned ${mentorName} as mentor for ${newbieName}`,
          objectType: "MentorshipAssignment",
          objectId: assignment.id,
          objectLabel: `${mentorName} → ${newbieName}`,
        },
      },
    });

    return {
      success: true as const,
      assignmentId: assignment.id,
      newbieName,
      newbieEmail: newbie.email,
      mentorName,
      mentorEmail: mentor.email,
    };
  });
}

/**
 * End a mentorship assignment.
 */
export async function endAssignment(
  assignmentId: string,
  endedByMemberId?: string
): Promise<{ success: boolean; message?: string }> {
  const assignment = await prisma.mentorshipAssignment.findUnique({
    where: { id: assignmentId },
    include: {
      newbie: { select: { firstName: true, lastName: true } },
      mentor: { select: { firstName: true, lastName: true } },
    },
  });

  if (!assignment) {
    return { success: false, message: "Assignment not found" };
  }

  if (assignment.status !== MentorshipAssignmentStatus.ACTIVE) {
    return { success: false, message: "Assignment is not active" };
  }

  await prisma.$transaction(async (tx) => {
    await tx.mentorshipAssignment.update({
      where: { id: assignmentId },
      data: {
        status: MentorshipAssignmentStatus.ENDED,
        endedAt: new Date(),
      },
    });

    const newbieName = `${assignment.newbie.firstName} ${assignment.newbie.lastName}`;
    const mentorName = `${assignment.mentor.firstName} ${assignment.mentor.lastName}`;

    await tx.auditLog.create({
      data: {
        action: AuditAction.MENTOR_ENDED,
        resourceType: "MentorshipAssignment",
        resourceId: assignmentId,
        memberId: endedByMemberId,
        before: {
          status: MentorshipAssignmentStatus.ACTIVE,
        },
        after: {
          status: MentorshipAssignmentStatus.ENDED,
          endedAt: new Date().toISOString(),
        },
        metadata: {
          summary: `Ended mentorship: ${mentorName} → ${newbieName}`,
          objectType: "MentorshipAssignment",
          objectId: assignmentId,
          objectLabel: `${mentorName} → ${newbieName}`,
        },
      },
    });
  });

  return { success: true };
}

/**
 * Get the max active assignments setting from SystemSetting table.
 */
async function getMaxActiveAssignments(): Promise<number> {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: "MENTOR_MAX_ACTIVE_ASSIGNMENTS" },
  });

  if (setting?.value) {
    const parsed = parseInt(setting.value, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return DEFAULT_MAX_ACTIVE_ASSIGNMENTS;
}

/**
 * Get unmatched newbies (members without an active mentor assignment).
 */
export async function getUnmatchedNewbies() {
  // Get newbie membership status codes
  // Assuming "NEWBIE" or similar status indicates new members
  const newbies = await prisma.member.findMany({
    where: {
      mentorshipAsNewbie: {
        none: {
          status: MentorshipAssignmentStatus.ACTIVE,
        },
      },
      // Only recent joiners (last 90 days) or those with newbie status
      OR: [
        {
          joinedAt: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          },
        },
        {
          membershipStatus: {
            code: { in: ["NEWBIE", "NEW", "FIRST_YEAR"] },
          },
        },
      ],
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      joinedAt: true,
      membershipStatus: {
        select: { code: true, label: true },
      },
      eventRegistrations: {
        select: { id: true },
        take: 1,
      },
    },
    orderBy: { joinedAt: "asc" }, // Longest waiting first
  });

  return newbies.map((n) => ({
    id: n.id,
    name: `${n.firstName} ${n.lastName}`,
    email: n.email,
    joinedAt: n.joinedAt,
    daysSinceJoin: Math.floor(
      (Date.now() - n.joinedAt.getTime()) / (24 * 60 * 60 * 1000)
    ),
    membershipStatus: n.membershipStatus.label,
    hasRegisteredForEvent: n.eventRegistrations.length > 0,
  }));
}

/**
 * Get available mentors (agreed to mentor and under capacity).
 */
export async function getAvailableMentors() {
  const maxAssignments = await getMaxActiveAssignments();

  const mentors = await prisma.member.findMany({
    where: {
      agreedToMentor: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      joinedAt: true,
      _count: {
        select: {
          mentorshipAsMentor: {
            where: { status: MentorshipAssignmentStatus.ACTIVE },
          },
        },
      },
      mentorshipAsMentor: {
        where: { status: MentorshipAssignmentStatus.ACTIVE },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
    orderBy: { lastName: "asc" },
  });

  return mentors
    .filter((m) => m._count.mentorshipAsMentor < maxAssignments)
    .map((m) => ({
      id: m.id,
      name: `${m.firstName} ${m.lastName}`,
      email: m.email,
      activeAssignmentCount: m._count.mentorshipAsMentor,
      lastAssignmentDate: m.mentorshipAsMentor[0]?.createdAt ?? null,
      availableSlots: maxAssignments - m._count.mentorshipAsMentor,
    }));
}

/**
 * Get active assignments for dashboard display.
 */
export async function getActiveAssignments() {
  const assignments = await prisma.mentorshipAssignment.findMany({
    where: { status: MentorshipAssignmentStatus.ACTIVE },
    include: {
      newbie: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      mentor: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      createdBy: {
        select: { firstName: true, lastName: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return assignments.map((a) => ({
    id: a.id,
    createdAt: a.createdAt,
    newbie: {
      id: a.newbie.id,
      name: `${a.newbie.firstName} ${a.newbie.lastName}`,
      email: a.newbie.email,
    },
    mentor: {
      id: a.mentor.id,
      name: `${a.mentor.firstName} ${a.mentor.lastName}`,
      email: a.mentor.email,
    },
    createdByName: a.createdBy
      ? `${a.createdBy.firstName} ${a.createdBy.lastName}`
      : null,
    notes: a.notes,
  }));
}
