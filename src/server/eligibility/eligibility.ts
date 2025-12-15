/**
 * Eligibility Engine v1
 *
 * Server-side service to evaluate ticket eligibility for members.
 * Checks membership status, committee membership, and eligibility overrides.
 */

import { prisma } from "@/lib/prisma";

/**
 * Reason codes returned by the eligibility engine.
 * These are stable strings for API consumers.
 */
export type EligibilityReasonCode =
  | "ALLOWED"
  | "NOT_LOGGED_IN"
  | "MEMBER_NOT_FOUND"
  | "EVENT_NOT_FOUND"
  | "TICKET_TYPE_NOT_FOUND"
  | "NOT_MEMBER_ON_EVENT_DATE"
  | "NEWBIE_TO_NEWCOMER_ALLOWED"
  | "WRONG_MEMBER_LEVEL"
  | "NOT_IN_SPONSORING_COMMITTEE"
  | "NOT_IN_WORKING_COMMITTEE"
  | "OVERRIDE_ALLOWED"
  | "OVERRIDE_DENIED";

/**
 * Result of evaluating ticket eligibility.
 */
export interface EligibilityResult {
  allowed: boolean;
  reasonCode: EligibilityReasonCode;
  reasonDetail?: string;
}

/**
 * Input parameters for eligibility evaluation.
 */
export interface EligibilityInput {
  memberId: string | null;
  eventId: string;
  ticketTypeCode: string;
  asOfDate?: Date;
}

/**
 * Ticket type constraint configuration stored in TicketType.constraints JSON.
 */
export interface TicketConstraints {
  requiresMembership?: boolean;
  allowedMemberStatuses?: string[];
  requiresSponsorCommittee?: boolean;
  requiresWorkingCommittee?: boolean;
}

/**
 * Default constraints for known ticket type codes.
 * These can be overridden by the constraints JSON in TicketType.
 */
const DEFAULT_CONSTRAINTS: Record<string, TicketConstraints> = {
  MEMBER_STANDARD: {
    requiresMembership: true,
  },
  SPONSOR_COMMITTEE: {
    requiresMembership: true,
    requiresSponsorCommittee: true,
  },
  WORKING_COMMITTEE: {
    requiresMembership: true,
    requiresWorkingCommittee: true,
  },
};

/**
 * Main entry point for evaluating ticket eligibility.
 *
 * Checks in order:
 * 1. Member logged in
 * 2. Eligibility override (allow/deny)
 * 3. Membership status on event date
 * 4. Newbie/Newcomer special case
 * 5. Committee-based requirements
 */
export async function evaluateTicketEligibility(
  input: EligibilityInput
): Promise<EligibilityResult> {
  const { memberId, eventId, ticketTypeCode, asOfDate } = input;

  // Check if member is logged in
  if (!memberId) {
    return {
      allowed: false,
      reasonCode: "NOT_LOGGED_IN",
      reasonDetail: "User must be logged in to check ticket eligibility",
    };
  }

  // Fetch event with its ticket types and sponsorships
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      ticketTypes: true,
      sponsorships: {
        include: {
          committee: true,
        },
      },
      eligibilityOverrides: {
        where: { memberId },
      },
    },
  });

  if (!event) {
    return {
      allowed: false,
      reasonCode: "EVENT_NOT_FOUND",
      reasonDetail: `Event ${eventId} not found`,
    };
  }

  // Find the ticket type
  const ticketType = event.ticketTypes.find((tt) => tt.code === ticketTypeCode);
  if (!ticketType) {
    return {
      allowed: false,
      reasonCode: "TICKET_TYPE_NOT_FOUND",
      reasonDetail: `Ticket type ${ticketTypeCode} not found for event`,
    };
  }

  // Check for eligibility override first
  const override = event.eligibilityOverrides.find(
    (o) => o.ticketTypeId === ticketType.id
  );
  if (override) {
    if (override.allow) {
      return {
        allowed: true,
        reasonCode: "OVERRIDE_ALLOWED",
        reasonDetail: override.reason || "Eligibility override granted",
      };
    } else {
      return {
        allowed: false,
        reasonCode: "OVERRIDE_DENIED",
        reasonDetail: override.reason || "Eligibility override denied",
      };
    }
  }

  // Fetch member with membership status
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      membershipStatus: true,
      committeeMemberships: {
        include: {
          committee: true,
        },
      },
    },
  });

  if (!member) {
    return {
      allowed: false,
      reasonCode: "MEMBER_NOT_FOUND",
      reasonDetail: `Member ${memberId} not found`,
    };
  }

  // Determine the date to check membership as of
  const checkDate = asOfDate || event.startTime;

  // Get constraints for this ticket type
  const storedConstraints = (ticketType.constraints as TicketConstraints) || {};
  const defaultConstraints = DEFAULT_CONSTRAINTS[ticketType.code] || {};
  const constraints: TicketConstraints = {
    ...defaultConstraints,
    ...storedConstraints,
  };

  // Check membership requirement
  if (constraints.requiresMembership) {
    const membershipResult = checkMembershipOnDate(
      member,
      checkDate,
      constraints.allowedMemberStatuses
    );
    if (!membershipResult.allowed) {
      return membershipResult;
    }
  }

  // Check sponsor committee requirement
  if (constraints.requiresSponsorCommittee) {
    const sponsorResult = checkSponsorCommitteeMembership(
      member.committeeMemberships,
      event.sponsorships,
      checkDate
    );
    if (!sponsorResult.allowed) {
      return sponsorResult;
    }
  }

  // Check working committee requirement
  if (constraints.requiresWorkingCommittee) {
    const workingResult = checkWorkingCommitteeMembership(
      member.committeeMemberships,
      checkDate
    );
    if (!workingResult.allowed) {
      return workingResult;
    }
  }

  return {
    allowed: true,
    reasonCode: "ALLOWED",
    reasonDetail: "Member is eligible for this ticket type",
  };
}

/**
 * Check if member has active membership on the given date.
 * Handles special case: Newbie (NEWCOMER status) can buy Newcomer tickets,
 * but non-Newcomers cannot buy Newcomer-only tickets.
 */
function checkMembershipOnDate(
  member: {
    joinedAt: Date;
    membershipStatus: { code: string; isActive: boolean };
  },
  checkDate: Date,
  allowedStatuses?: string[]
): EligibilityResult {
  const status = member.membershipStatus;

  // Check if member status is active
  if (!status.isActive) {
    return {
      allowed: false,
      reasonCode: "NOT_MEMBER_ON_EVENT_DATE",
      reasonDetail: `Member status '${status.code}' is not active`,
    };
  }

  // If specific statuses are required, check them
  if (allowedStatuses && allowedStatuses.length > 0) {
    // Special case: NEWCOMER tickets
    if (
      allowedStatuses.includes("NEWCOMER") &&
      !allowedStatuses.includes("EXTENDED")
    ) {
      // This is a Newcomer-only ticket
      if (status.code === "NEWCOMER") {
        return {
          allowed: true,
          reasonCode: "NEWBIE_TO_NEWCOMER_ALLOWED",
          reasonDetail: "Newcomer member eligible for Newcomer ticket",
        };
      } else {
        return {
          allowed: false,
          reasonCode: "WRONG_MEMBER_LEVEL",
          reasonDetail: `Ticket requires NEWCOMER status, member has ${status.code}`,
        };
      }
    }

    // General status check
    if (!allowedStatuses.includes(status.code)) {
      return {
        allowed: false,
        reasonCode: "WRONG_MEMBER_LEVEL",
        reasonDetail: `Ticket requires one of [${allowedStatuses.join(", ")}], member has ${status.code}`,
      };
    }
  }

  // Suppress unused variable warning for checkDate
  // In future, this could be used to check historical membership status
  void checkDate;

  return {
    allowed: true,
    reasonCode: "ALLOWED",
  };
}

/**
 * Check if member is in any sponsoring or co-sponsoring committee for the event.
 */
function checkSponsorCommitteeMembership(
  memberships: Array<{
    committeeId: string;
    startDate: Date;
    endDate: Date | null;
    committee: { id: string; name: string };
  }>,
  sponsorships: Array<{
    committeeId: string;
    isPrimary: boolean;
    committee: { id: string; name: string };
  }>,
  checkDate: Date
): EligibilityResult {
  // Get all sponsor committee IDs (primary and co-sponsors)
  const sponsorCommitteeIds = sponsorships.map((s) => s.committeeId);

  if (sponsorCommitteeIds.length === 0) {
    return {
      allowed: false,
      reasonCode: "NOT_IN_SPONSORING_COMMITTEE",
      reasonDetail: "Event has no sponsoring committees configured",
    };
  }

  // Check if member is in any sponsor committee on the check date
  const activeInSponsor = memberships.some((m) => {
    const isInSponsorCommittee = sponsorCommitteeIds.includes(m.committeeId);
    const isActiveOnDate =
      m.startDate <= checkDate && (m.endDate === null || m.endDate >= checkDate);
    return isInSponsorCommittee && isActiveOnDate;
  });

  if (!activeInSponsor) {
    const sponsorNames = sponsorships.map((s) => s.committee.name).join(", ");
    return {
      allowed: false,
      reasonCode: "NOT_IN_SPONSORING_COMMITTEE",
      reasonDetail: `Member not in sponsoring committee(s): ${sponsorNames}`,
    };
  }

  return {
    allowed: true,
    reasonCode: "ALLOWED",
  };
}

/**
 * Check if member is in any committee (for working committee tickets).
 * By default, any committee membership qualifies.
 */
function checkWorkingCommitteeMembership(
  memberships: Array<{
    committeeId: string;
    startDate: Date;
    endDate: Date | null;
    committee: { id: string; name: string };
  }>,
  checkDate: Date
): EligibilityResult {
  // Check if member is in any committee on the check date
  const activeInAnyCommittee = memberships.some((m) => {
    const isActiveOnDate =
      m.startDate <= checkDate && (m.endDate === null || m.endDate >= checkDate);
    return isActiveOnDate;
  });

  if (!activeInAnyCommittee) {
    return {
      allowed: false,
      reasonCode: "NOT_IN_WORKING_COMMITTEE",
      reasonDetail: "Member not in any committee",
    };
  }

  return {
    allowed: true,
    reasonCode: "ALLOWED",
  };
}

/**
 * Evaluate eligibility for all ticket types for an event.
 * Used by the API endpoint.
 */
export async function evaluateAllTicketEligibility(
  memberId: string | null,
  eventId: string
): Promise<{
  eventId: string;
  memberId: string | null;
  ticketTypes: Array<{
    code: string;
    name: string;
    eligibility: EligibilityResult;
  }>;
}> {
  // Fetch event with ticket types
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      ticketTypes: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!event) {
    return {
      eventId,
      memberId,
      ticketTypes: [],
    };
  }

  // Evaluate eligibility for each ticket type
  const results = await Promise.all(
    event.ticketTypes.map(async (tt) => {
      const eligibility = await evaluateTicketEligibility({
        memberId,
        eventId,
        ticketTypeCode: tt.code,
        asOfDate: event.startTime,
      });
      return {
        code: tt.code,
        name: tt.name,
        eligibility,
      };
    })
  );

  return {
    eventId,
    memberId,
    ticketTypes: results,
  };
}
