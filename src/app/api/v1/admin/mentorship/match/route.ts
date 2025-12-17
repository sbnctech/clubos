/**
 * Mentorship Match API
 *
 * POST /api/v1/admin/mentorship/match - Create a mentor-newbie match
 *
 * Reference: docs/ORG/SBNC_BUSINESS_MODEL.md - mentorship as volunteer on-ramp
 *
 * Authorization: Requires mentorship:assign capability (VP Membership)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireCapability } from "@/lib/auth";
import { createMatch } from "@/lib/mentorship";

export async function POST(request: NextRequest) {
  const auth = await requireCapability(request, "mentorship:assign");
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();

    // Validate required fields
    const { newbieMemberId, mentorMemberId, notes } = body;

    if (!newbieMemberId || typeof newbieMemberId !== "string") {
      return NextResponse.json(
        { error: "newbieMemberId is required and must be a string" },
        { status: 400 }
      );
    }

    if (!mentorMemberId || typeof mentorMemberId !== "string") {
      return NextResponse.json(
        { error: "mentorMemberId is required and must be a string" },
        { status: 400 }
      );
    }

    const result = await createMatch({
      newbieMemberId,
      mentorMemberId,
      createdByMemberId: auth.context.memberId,
      notes: notes ?? undefined,
    });

    if (!result.success) {
      // Map error codes to HTTP status codes
      const statusMap: Record<string, number> = {
        NEWBIE_ALREADY_MATCHED: 409,
        MENTOR_NOT_ELIGIBLE: 422,
        MENTOR_AT_CAPACITY: 422,
        SAME_MEMBER: 400,
      };

      return NextResponse.json(
        { error: result.message, code: result.code },
        { status: statusMap[result.code] ?? 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        assignmentId: result.assignmentId,
        message: `Successfully matched ${result.mentorName} with ${result.newbieName}`,
        newbieName: result.newbieName,
        mentorName: result.mentorName,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating mentorship match:", error);
    return NextResponse.json(
      { error: "Failed to create mentorship match" },
      { status: 500 }
    );
  }
}
