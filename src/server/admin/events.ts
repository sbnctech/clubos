/**
 * Server-side admin event queries.
 *
 * IMPORTANT: These functions are for use in Server Components ONLY.
 * They query Prisma directly and do NOT go through /api/admin/* routes.
 *
 * Why? Server Components cannot propagate auth headers to internal API routes,
 * so fetching from /api/admin/* would fail with "Unauthorized". Always use
 * Prisma queries directly for server-side data fetching.
 */

import { prisma } from "@/lib/prisma";

// UUID validation regex
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validates that a string is a valid UUID format.
 */
export function isValidUuid(id: string): boolean {
  return UUID_REGEX.test(id);
}

/**
 * Admin event with registration details.
 */
export type AdminEventDetail = {
  id: string;
  title: string;
  category: string;
  startTime: string;
  registrations: Array<{
    id: string;
    memberId: string;
    memberName: string;
    status: string;
    registeredAt: string;
  }>;
};

/**
 * Fetches a single event with its registrations for admin display.
 * Returns null if the event is not found or the ID is invalid.
 */
export async function getAdminEventById(
  id: string
): Promise<AdminEventDetail | null> {
  if (!isValidUuid(id)) {
    return null;
  }

  const dbEvent = await prisma.event.findUnique({
    where: { id },
    include: {
      registrations: {
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: {
          registeredAt: "asc",
        },
      },
    },
  });

  if (!dbEvent) {
    return null;
  }

  return {
    id: dbEvent.id,
    title: dbEvent.title,
    category: dbEvent.category ?? "",
    startTime: dbEvent.startTime.toISOString(),
    registrations: dbEvent.registrations.map((r) => ({
      id: r.id,
      memberId: r.memberId,
      memberName: `${r.member.firstName} ${r.member.lastName}`,
      status: r.status,
      registeredAt: r.registeredAt.toISOString(),
    })),
  };
}
