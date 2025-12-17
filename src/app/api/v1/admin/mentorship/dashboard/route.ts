/**
 * Mentorship Dashboard API
 *
 * GET /api/v1/admin/mentorship/dashboard - Get mentorship dashboard data
 *
 * Returns:
 * - Unmatched newbies list
 * - Available mentors list
 * - Active assignments
 *
 * Reference: docs/ORG/SBNC_BUSINESS_MODEL.md - mentorship as volunteer on-ramp
 *
 * Authorization: Requires mentorship:view capability (VP Membership, President, Admin)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireCapability, hasCapability } from "@/lib/auth";
import {
  getUnmatchedNewbies,
  getAvailableMentors,
  getActiveAssignments,
} from "@/lib/mentorship";

export async function GET(request: NextRequest) {
  const auth = await requireCapability(request, "mentorship:view");
  if (!auth.ok) return auth.response;

  try {
    const [unmatchedNewbies, availableMentors, activeAssignments] =
      await Promise.all([
        getUnmatchedNewbies(),
        getAvailableMentors(),
        getActiveAssignments(),
      ]);

    // Check if user can create matches (VP Membership only)
    const canCreateMatch = hasCapability(
      auth.context.globalRole,
      "mentorship:assign"
    );

    return NextResponse.json({
      unmatchedNewbies,
      availableMentors,
      activeAssignments,
      canCreateMatch,
      summary: {
        unmatchedCount: unmatchedNewbies.length,
        availableMentorCount: availableMentors.length,
        activeAssignmentCount: activeAssignments.length,
      },
    });
  } catch (error) {
    console.error("Error fetching mentorship dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch mentorship dashboard" },
      { status: 500 }
    );
  }
}
