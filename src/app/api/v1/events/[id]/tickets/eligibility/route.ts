import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { apiSuccess, errors } from "@/lib/api";
import { evaluateAllTicketEligibility } from "@/server/eligibility/eligibility";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/events/:id/tickets/eligibility
 *
 * Returns ticket eligibility for all ticket types for the current session user.
 * Requires authentication.
 *
 * Response:
 * {
 *   eventId: string,
 *   memberId: string,
 *   ticketTypes: Array<{
 *     code: string,
 *     name: string,
 *     eligibility: {
 *       allowed: boolean,
 *       reasonCode: string,
 *       reasonDetail?: string
 *     }
 *   }>
 * }
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: eventId } = await params;

  // Authenticate request
  const authResult = await requireAuth(request);
  if (!authResult.ok) {
    return authResult.response;
  }

  const { memberId } = authResult.context;

  try {
    const result = await evaluateAllTicketEligibility(memberId, eventId);

    return apiSuccess(result);
  } catch (error) {
    console.error("Error evaluating ticket eligibility:", error);
    return errors.internal("Failed to evaluate ticket eligibility");
  }
}
