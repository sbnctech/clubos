/**
 * Event Attendance API
 *
 * POST /api/v1/admin/events/:id/attendance - Mark member as attended
 *
 * Charter Principles:
 * - P1: Requires users:manage capability
 * - P7: Logs mentorship co-attendance signals
 * - N5: No data mutation without observability
 */

import { NextRequest, NextResponse } from "next/server";
import { requireCapability } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { detectAttendanceOverlap } from "@/lib/mentorship/logging";
import { z } from "zod";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const MarkAttendanceSchema = z.object({
  memberId: z.string().uuid(),
  attended: z.boolean(),
});

const BulkAttendanceSchema = z.object({
  attendees: z.array(
    z.object({
      memberId: z.string().uuid(),
      attended: z.boolean(),
    })
  ),
});

/**
 * POST /api/v1/admin/events/:id/attendance
 *
 * Marks attendance for one or more members at an event.
 *
 * Body: { memberId, attended } or { attendees: [{ memberId, attended }] }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: eventId } = await params;

  // Require users:manage capability (VP Membership and admins)
  const auth = await requireCapability(request, "users:manage");
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Handle single or bulk attendance marking
    const singleParsed = MarkAttendanceSchema.safeParse(body);
    const bulkParsed = BulkAttendanceSchema.safeParse(body);

    let attendanceUpdates: Array<{ memberId: string; attended: boolean }>;

    if (singleParsed.success) {
      attendanceUpdates = [singleParsed.data];
    } else if (bulkParsed.success) {
      attendanceUpdates = bulkParsed.data.attendees;
    } else {
      return NextResponse.json(
        {
          error: "Invalid request body",
          details: singleParsed.error.flatten(),
        },
        { status: 400 }
      );
    }

    const results: Array<{
      memberId: string;
      success: boolean;
      message: string;
    }> = [];

    for (const update of attendanceUpdates) {
      const { memberId, attended } = update;

      // Find the registration
      const registration = await prisma.eventRegistration.findFirst({
        where: {
          eventId,
          memberId,
          status: { notIn: ["CANCELLED", "REFUNDED"] },
        },
      });

      if (!registration) {
        results.push({
          memberId,
          success: false,
          message: "No registration found for this member",
        });
        continue;
      }

      if (attended) {
        // Mark as attended (CONFIRMED with confirmedAt)
        await prisma.eventRegistration.update({
          where: { id: registration.id },
          data: {
            status: "CONFIRMED",
            confirmedAt: new Date(),
          },
        });

        // Charter P7: Detect mentor-newbie attendance overlap for action log
        detectAttendanceOverlap(memberId, eventId).catch((err) => {
          console.error("[Attendance] Mentorship detection failed:", err);
        });

        results.push({
          memberId,
          success: true,
          message: "Marked as attended",
        });
      } else {
        // Mark as NO_SHOW
        await prisma.eventRegistration.update({
          where: { id: registration.id },
          data: {
            status: "NO_SHOW",
          },
        });

        results.push({
          memberId,
          success: true,
          message: "Marked as no-show",
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      results,
      summary: {
        total: results.length,
        success: successCount,
        failed: failureCount,
      },
      message: `Updated ${successCount} attendance records`,
    });
  } catch (error) {
    console.error("[Attendance] Error:", error);
    return NextResponse.json(
      { error: "Failed to update attendance" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/v1/admin/events/:id/attendance
 *
 * Gets attendance summary for an event.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: eventId } = await params;

  // Require registrations:view capability
  const auth = await requireCapability(request, "registrations:view");
  if (!auth.ok) return auth.response;

  try {
    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, title: true, startTime: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Get registrations with member info
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId },
      include: {
        member: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { registeredAt: "asc" },
    });

    const attendees = registrations.map((r) => ({
      memberId: r.memberId,
      memberName: `${r.member.firstName} ${r.member.lastName}`,
      email: r.member.email,
      status: r.status,
      attended: r.status === "CONFIRMED" && r.confirmedAt !== null,
      noShow: r.status === "NO_SHOW",
      registeredAt: r.registeredAt.toISOString(),
    }));

    const summary = {
      total: registrations.length,
      attended: attendees.filter((a) => a.attended).length,
      noShow: attendees.filter((a) => a.noShow).length,
      pending: attendees.filter((a) => !a.attended && !a.noShow).length,
    };

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        startTime: event.startTime.toISOString(),
      },
      attendees,
      summary,
    });
  } catch (error) {
    console.error("[Attendance] Error:", error);
    return NextResponse.json(
      { error: "Failed to get attendance" },
      { status: 500 }
    );
  }
}
