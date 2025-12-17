/**
 * Mentorship Eligibility Checking
 *
 * Reference: docs/governance/MENTOR_ACTION_LOG_SIGNALS.md
 *
 * Functions to check mentor/newbie eligibility for assignment.
 * Used for validation before creating matches.
 *
 * Charter Principles:
 * - P2: Default deny - mentor must opt-in
 * - P4: No hidden rules - all criteria explicit
 */

import { prisma } from "@/lib/prisma";
import { MentorshipAssignmentStatus } from "@prisma/client";

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_MAX_ACTIVE_ASSIGNMENTS = 1;

/**
 * Get the maximum active assignments per mentor.
 * Reads from SystemSetting table if available, defaults to 1.
 */
export async function getMentorMaxAssignments(): Promise<number> {
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

// ============================================================================
// Eligibility Types
// ============================================================================

export interface MentorEligibilityResult {
  isEligible: boolean;
  reason?: string;
  currentLoad?: number;
  maxCapacity?: number;
  availableSlots?: number;
}

export interface NewbieEligibilityResult {
  isEligible: boolean;
  reason?: string;
  hasActiveMentor?: boolean;
  currentMentorName?: string;
}

export interface MatchValidationResult {
  canMatch: boolean;
  errors: string[];
  mentorEligibility: MentorEligibilityResult;
  newbieEligibility: NewbieEligibilityResult;
}

// ============================================================================
// Eligibility Functions
// ============================================================================

/**
 * Check if a member is eligible to be a mentor.
 * Requirements:
 * - Member exists
 * - agreedToMentor = true (opt-in required)
 * - Under capacity limit
 */
export async function checkMentorEligibility(
  mentorId: string
): Promise<MentorEligibilityResult> {
  const maxCapacity = await getMentorMaxAssignments();

  const member = await prisma.member.findUnique({
    where: { id: mentorId },
    select: {
      id: true,
      agreedToMentor: true,
      mentorshipAsMentor: {
        where: { status: MentorshipAssignmentStatus.ACTIVE },
        select: { id: true },
      },
    },
  });

  if (!member) {
    return { isEligible: false, reason: "Member not found" };
  }

  if (!member.agreedToMentor) {
    return { isEligible: false, reason: "Member has not opted into mentoring" };
  }

  const currentLoad = member.mentorshipAsMentor.length;
  const availableSlots = maxCapacity - currentLoad;

  if (currentLoad >= maxCapacity) {
    return {
      isEligible: false,
      reason: `Mentor is at capacity (${currentLoad}/${maxCapacity})`,
      currentLoad,
      maxCapacity,
      availableSlots: 0,
    };
  }

  return {
    isEligible: true,
    currentLoad,
    maxCapacity,
    availableSlots,
  };
}

/**
 * Check if a member is eligible to receive a mentor.
 * Requirements:
 * - Member exists
 * - Does not have an ACTIVE mentor assignment
 */
export async function checkNewbieEligibility(
  newbieId: string
): Promise<NewbieEligibilityResult> {
  const member = await prisma.member.findUnique({
    where: { id: newbieId },
    select: {
      id: true,
      mentorshipAsNewbie: {
        where: { status: MentorshipAssignmentStatus.ACTIVE },
        select: {
          id: true,
          mentor: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      },
    },
  });

  if (!member) {
    return { isEligible: false, reason: "Member not found" };
  }

  if (member.mentorshipAsNewbie.length > 0) {
    const currentMentor = member.mentorshipAsNewbie[0].mentor;
    return {
      isEligible: false,
      reason: `Already has active mentor: ${currentMentor.firstName} ${currentMentor.lastName}`,
      hasActiveMentor: true,
      currentMentorName: `${currentMentor.firstName} ${currentMentor.lastName}`,
    };
  }

  return { isEligible: true, hasActiveMentor: false };
}

/**
 * Validate that a mentor-newbie match can be created.
 * Checks both parties' eligibility and prevents self-assignment.
 */
export async function validateMatch(
  mentorId: string,
  newbieId: string
): Promise<MatchValidationResult> {
  const errors: string[] = [];

  // Prevent self-assignment
  if (mentorId === newbieId) {
    const emptyResult: MentorEligibilityResult = {
      isEligible: false,
      reason: "Same member",
    };
    return {
      canMatch: false,
      errors: ["Cannot assign member as their own mentor"],
      mentorEligibility: emptyResult,
      newbieEligibility: { isEligible: false, reason: "Same member" },
    };
  }

  // Check both eligibilities
  const [mentorEligibility, newbieEligibility] = await Promise.all([
    checkMentorEligibility(mentorId),
    checkNewbieEligibility(newbieId),
  ]);

  if (!mentorEligibility.isEligible && mentorEligibility.reason) {
    errors.push(mentorEligibility.reason);
  }

  if (!newbieEligibility.isEligible && newbieEligibility.reason) {
    errors.push(newbieEligibility.reason);
  }

  return {
    canMatch: mentorEligibility.isEligible && newbieEligibility.isEligible,
    errors,
    mentorEligibility,
    newbieEligibility,
  };
}

// ============================================================================
// Query Functions for Dashboard
// ============================================================================

/**
 * Get available mentors (opted-in with available capacity).
 */
export async function getAvailableMentors() {
  const maxCapacity = await getMentorMaxAssignments();

  const mentors = await prisma.member.findMany({
    where: {
      agreedToMentor: true,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      mentorshipAsMentor: {
        where: { status: MentorshipAssignmentStatus.ACTIVE },
        select: { id: true },
      },
    },
  });

  // Filter to those with available capacity
  return mentors
    .filter((m) => m.mentorshipAsMentor.length < maxCapacity)
    .map((m) => ({
      id: m.id,
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      currentLoad: m.mentorshipAsMentor.length,
      maxCapacity,
      availableSlots: maxCapacity - m.mentorshipAsMentor.length,
    }));
}

/**
 * Get newbies without an active mentor assignment.
 */
export async function getUnassignedNewbies() {
  const newbies = await prisma.member.findMany({
    where: {
      mentorshipAsNewbie: {
        none: { status: MentorshipAssignmentStatus.ACTIVE },
      },
      // Only recent joiners (last 90 days)
      joinedAt: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      },
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
    },
    orderBy: { joinedAt: "asc" }, // Longest waiting first
  });

  return newbies.map((n) => ({
    id: n.id,
    firstName: n.firstName,
    lastName: n.lastName,
    email: n.email,
    joinedAt: n.joinedAt,
    membershipStatus: n.membershipStatus?.label ?? "Unknown",
  }));
}
