/**
 * Admin summary aggregation for dashboard stats.
 * Uses in-memory mock data until database layer is stable.
 */

import { getActiveMembers } from "./mockMembers";
import { listEvents } from "./mockEvents";
import { listRegistrations, countByStatus } from "./mockRegistrations";

export type AdminSummary = {
  totalActiveMembers: number;
  totalEvents: number;
  totalRegistrations: number;
  totalWaitlistedRegistrations: number;
};

export function getAdminSummary(): AdminSummary {
  const activeMembers = getActiveMembers();
  const events = listEvents();
  const registrations = listRegistrations();
  const waitlistedCount = countByStatus("WAITLISTED");

  return {
    totalActiveMembers: activeMembers.length,
    totalEvents: events.length,
    totalRegistrations: registrations.length,
    totalWaitlistedRegistrations: waitlistedCount,
  };
}
