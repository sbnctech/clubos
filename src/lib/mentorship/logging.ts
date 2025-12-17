/**
 * Mentorship Action Logging
 *
 * Reference: docs/governance/MENTOR_ACTION_LOG_SIGNALS.md
 * Reference: docs/ORG/SBNC_BUSINESS_MODEL.md - mentorship as volunteer on-ramp
 *
 * Logs mentorship activities to the audit log for:
 * - Third-year membership decision support
 * - Flywheel health dashboard metrics
 * - Leadership visibility
 *
 * Design: Evidence, not judgment. Milestones, not metrics.
 */

import { prisma } from "@/lib/prisma";
import { AuditAction, Prisma } from "@prisma/client";

// ============================================================================
// Input Types
// ============================================================================

export interface MentorAssignmentInput {
  mentorId: string;
  mentorName: string;
  newbieId: string;
  newbieName: string;
  assignedById?: string;
}

export interface MentorEventInput {
  mentorId: string;
  mentorName: string;
  newbieId: string;
  newbieName: string;
  eventId: string;
  eventName: string;
}

// ============================================================================
// Action Logging Functions
// ============================================================================

/**
 * Log a mentor assignment.
 * Action: mentor.assigned
 */
export async function logMentorAssigned(
  input: MentorAssignmentInput
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      action: AuditAction.MENTOR_ASSIGNED,
      resourceType: "MentorAssignment",
      resourceId: input.newbieId,
      memberId: input.assignedById,
      before: Prisma.JsonNull,
      after: {
        mentorId: input.mentorId,
        mentorName: input.mentorName,
        newbieId: input.newbieId,
        newbieName: input.newbieName,
        assignedAt: new Date().toISOString(),
      },
      metadata: {
        category: "MEMBER",
        actionLabel: "mentor assigned",
        summary: `Assigned ${input.mentorName} as mentor for ${input.newbieName}`,
        objectType: "Member",
        objectId: input.newbieId,
        objectLabel: input.newbieName,
        afterState: `Mentored by ${input.mentorName}`,
      },
    },
  });

  console.log(
    `[MENTOR LOG] mentor.assigned: ${input.mentorName} -> ${input.newbieName}`
  );
}

/**
 * Log when mentor and newbie register for the same event.
 * Action: mentor_newbie.registered_same_event
 */
export async function logMentorNewbieRegistered(
  input: MentorEventInput
): Promise<void> {
  // Check for duplicate entry to avoid audit noise
  const existing = await prisma.auditLog.findFirst({
    where: {
      action: AuditAction.MENTOR_NEWBIE_SHARED_REGISTRATION,
      resourceId: input.eventId,
      metadata: {
        path: ["mentorId"],
        equals: input.mentorId,
      },
    },
  });

  if (existing) {
    // Already logged this registration overlap - avoid noise
    return;
  }

  await prisma.auditLog.create({
    data: {
      action: AuditAction.MENTOR_NEWBIE_SHARED_REGISTRATION,
      resourceType: "Event",
      resourceId: input.eventId,
      memberId: input.mentorId,
      before: Prisma.JsonNull,
      after: {
        mentorId: input.mentorId,
        mentorName: input.mentorName,
        newbieId: input.newbieId,
        newbieName: input.newbieName,
        eventId: input.eventId,
        eventName: input.eventName,
        registeredAt: new Date().toISOString(),
      },
      metadata: {
        category: "EVENT",
        actionLabel: "mentor attending with newbie",
        summary: `${input.mentorName} and ${input.newbieName} both registered for ${input.eventName}`,
        objectType: "Event",
        objectId: input.eventId,
        objectLabel: input.eventName,
        mentorId: input.mentorId,
        newbieId: input.newbieId,
        afterState: "Both registered",
      },
    },
  });

  console.log(
    `[MENTOR LOG] shared_registration: ${input.mentorName} + ${input.newbieName} @ ${input.eventName}`
  );
}

/**
 * Log when mentor and newbie both attend the same event.
 * Action: mentor_newbie.attended_same_event
 */
export async function logMentorNewbieAttended(
  input: MentorEventInput
): Promise<void> {
  // Check for duplicate entry to avoid audit noise
  const existing = await prisma.auditLog.findFirst({
    where: {
      action: AuditAction.MENTOR_NEWBIE_SHARED_ATTENDANCE,
      resourceId: input.eventId,
      metadata: {
        path: ["mentorId"],
        equals: input.mentorId,
      },
    },
  });

  if (existing) {
    // Already logged this attendance - avoid noise
    return;
  }

  await prisma.auditLog.create({
    data: {
      action: AuditAction.MENTOR_NEWBIE_SHARED_ATTENDANCE,
      resourceType: "Event",
      resourceId: input.eventId,
      memberId: input.mentorId,
      before: {
        state: "Both registered",
      },
      after: {
        mentorId: input.mentorId,
        mentorName: input.mentorName,
        newbieId: input.newbieId,
        newbieName: input.newbieName,
        eventId: input.eventId,
        eventName: input.eventName,
        attendedAt: new Date().toISOString(),
      },
      metadata: {
        category: "EVENT",
        actionLabel: "mentor accompanied newbie",
        summary: `${input.mentorName} accompanied ${input.newbieName} at ${input.eventName}`,
        objectType: "Event",
        objectId: input.eventId,
        objectLabel: input.eventName,
        mentorId: input.mentorId,
        newbieId: input.newbieId,
        beforeState: "Both registered",
        afterState: "Both attended",
      },
    },
  });

  console.log(
    `[MENTOR LOG] shared_attendance: ${input.mentorName} + ${input.newbieName} @ ${input.eventName}`
  );
}

// ============================================================================
// Detection Functions - Called on registration/attendance changes
// ============================================================================

/**
 * Check for mentor-newbie registration overlap when a member registers for an event.
 *
 * Call this after a successful registration to detect if the member's mentor
 * or newbie is also registered for the same event.
 *
 * Detection logic (from MENTOR_ACTION_LOG_SIGNALS.md):
 * ON EventRegistration.create:
 *   FOR EACH active MentorAssignment involving this member:
 *     IF partner also registered for same event:
 *       IF no existing entry for this (mentor, newbie, event) tuple:
 *         CREATE ActionLog entry
 */
export async function detectRegistrationOverlap(
  memberId: string,
  eventId: string
): Promise<void> {
  try {
    // Find all active mentor assignments involving this member
    const assignments = await prisma.mentorshipAssignment.findMany({
      where: {
        status: "ACTIVE",
        OR: [{ mentorMemberId: memberId }, { newbieMemberId: memberId }],
      },
      include: {
        mentor: { select: { id: true, firstName: true, lastName: true } },
        newbie: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (assignments.length === 0) return;

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true },
    });

    if (!event) return;

    for (const assignment of assignments) {
      const isMentor = assignment.mentorMemberId === memberId;
      const partnerId = isMentor
        ? assignment.newbieMemberId
        : assignment.mentorMemberId;

      // Check if partner is also registered for this event
      const partnerRegistration = await prisma.eventRegistration.findFirst({
        where: {
          eventId,
          memberId: partnerId,
          status: { in: ["CONFIRMED", "PENDING", "WAITLISTED"] },
        },
      });

      if (partnerRegistration) {
        // Both are registered - log the overlap
        await logMentorNewbieRegistered({
          mentorId: assignment.mentorMemberId,
          mentorName: `${assignment.mentor.firstName} ${assignment.mentor.lastName}`,
          newbieId: assignment.newbieMemberId,
          newbieName: `${assignment.newbie.firstName} ${assignment.newbie.lastName}`,
          eventId: event.id,
          eventName: event.title,
        });
      }
    }
  } catch (error) {
    // Log but don't fail - detection failure shouldn't break registration
    console.error("[MENTOR LOG] Failed to detect registration overlap:", error);
  }
}

/**
 * Check for mentor-newbie attendance overlap when attendance is confirmed.
 *
 * Call this after marking a member as attended to detect if their mentor
 * or newbie also attended the same event.
 *
 * Detection logic (from MENTOR_ACTION_LOG_SIGNALS.md):
 * ON attendance marked:
 *   FOR EACH active MentorAssignment involving this member:
 *     IF partner also marked attended for same event:
 *       IF no existing entry for this (mentor, newbie, event) tuple:
 *         CREATE ActionLog entry
 */
export async function detectAttendanceOverlap(
  memberId: string,
  eventId: string
): Promise<void> {
  try {
    // Find all active mentor assignments involving this member
    const assignments = await prisma.mentorshipAssignment.findMany({
      where: {
        status: "ACTIVE",
        OR: [{ mentorMemberId: memberId }, { newbieMemberId: memberId }],
      },
      include: {
        mentor: { select: { id: true, firstName: true, lastName: true } },
        newbie: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    if (assignments.length === 0) return;

    // Get event details
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true },
    });

    if (!event) return;

    for (const assignment of assignments) {
      const isMentor = assignment.mentorMemberId === memberId;
      const partnerId = isMentor
        ? assignment.newbieMemberId
        : assignment.mentorMemberId;

      // Check if partner also attended this event (CONFIRMED status = attended)
      const partnerRegistration = await prisma.eventRegistration.findFirst({
        where: {
          eventId,
          memberId: partnerId,
          status: "CONFIRMED",
          confirmedAt: { not: null },
        },
      });

      if (partnerRegistration) {
        // Both attended - log the overlap
        await logMentorNewbieAttended({
          mentorId: assignment.mentorMemberId,
          mentorName: `${assignment.mentor.firstName} ${assignment.mentor.lastName}`,
          newbieId: assignment.newbieMemberId,
          newbieName: `${assignment.newbie.firstName} ${assignment.newbie.lastName}`,
          eventId: event.id,
          eventName: event.title,
        });
      }
    }
  } catch (error) {
    // Log but don't fail - detection failure shouldn't break attendance marking
    console.error("[MENTOR LOG] Failed to detect attendance overlap:", error);
  }
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Query mentorship activity for a member.
 * Used for third-year membership decision support.
 */
export async function getMemberMentorshipActivity(
  memberId: string
): Promise<MentorshipActivitySummary> {
  const logs = await prisma.auditLog.findMany({
    where: {
      OR: [
        // Member was the mentor (performed the action)
        {
          action: {
            in: [
              AuditAction.MENTOR_ASSIGNED,
              AuditAction.MENTOR_NEWBIE_SHARED_REGISTRATION,
              AuditAction.MENTOR_NEWBIE_SHARED_ATTENDANCE,
            ],
          },
          memberId: memberId,
        },
        // Member was the mentor (in metadata)
        {
          action: {
            in: [
              AuditAction.MENTOR_NEWBIE_SHARED_REGISTRATION,
              AuditAction.MENTOR_NEWBIE_SHARED_ATTENDANCE,
            ],
          },
          metadata: {
            path: ["mentorId"],
            equals: memberId,
          },
        },
        // Member was assigned as mentee
        {
          action: AuditAction.MENTOR_ASSIGNED,
          resourceId: memberId,
        },
        // Member was the newbie in shared events
        {
          action: {
            in: [
              AuditAction.MENTOR_NEWBIE_SHARED_REGISTRATION,
              AuditAction.MENTOR_NEWBIE_SHARED_ATTENDANCE,
            ],
          },
          metadata: {
            path: ["newbieId"],
            equals: memberId,
          },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      action: true,
      metadata: true,
      createdAt: true,
    },
  });

  const assignments = logs.filter(
    (l) => l.action === AuditAction.MENTOR_ASSIGNED
  );
  const attendances = logs.filter(
    (l) => l.action === AuditAction.MENTOR_NEWBIE_SHARED_ATTENDANCE
  );

  return {
    totalAssignments: assignments.length,
    totalCoAttendances: attendances.length,
    lastActivity: logs[0]?.createdAt ?? null,
    activities: logs.slice(0, 10).map((l) => ({
      action: l.action,
      summary: (l.metadata as Record<string, string>)?.summary ?? "",
      date: l.createdAt,
    })),
  };
}

export interface MentorshipActivitySummary {
  totalAssignments: number;
  totalCoAttendances: number;
  lastActivity: Date | null;
  activities: Array<{
    action: string;
    summary: string;
    date: Date;
  }>;
}
