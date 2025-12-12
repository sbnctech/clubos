import { NextRequest } from "next/server";
import { errors } from "@/lib/api";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/admin/events/:id/duplicate
 *
 * Creates a copy of an existing event.
 *
 * Request body: EventDuplicateRequest
 * {
 *   "title": "Welcome Hike - July",
 *   "startTime": "2025-07-01T09:00:00Z",
 *   "endTime": "2025-07-01T12:00:00Z",
 *   "status": "DRAFT"
 * }
 *
 * Response: EventDuplicateResponse (201 Created)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  // TODO: Wire - Implement event duplication
  // 1. Validate access token and require globalRole === 'admin'
  // 2. Query source event by ID
  // 3. Parse request body for overrides (title, startTime, endTime, status)
  // 4. Create new event copying all fields except:
  //    - id (new)
  //    - registrations (none)
  //    - createdAt/updatedAt (new timestamps)
  //    - Apply overrides from request body
  //    - Default title: "Original Title (Copy)"
  //    - Default status: DRAFT
  // 5. Return EventDuplicateResponse with 201 status

  void request; // Suppress unused variable warning

  return errors.internal(`POST /api/v1/admin/events/${id}/duplicate not implemented`);
}
