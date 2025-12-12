/**
 * Mock registrations data for development and testing.
 * This replaces database queries until the database layer is stable.
 */

export type RegistrationStatus = "REGISTERED" | "WAITLISTED" | "CANCELLED";

export type MockRegistration = {
  id: string;
  memberId: string;
  eventId: string;
  status: RegistrationStatus;
  registeredAt: string;
};

const mockRegistrations: MockRegistration[] = [
  {
    id: "r1",
    memberId: "m1",
    eventId: "e1",
    status: "REGISTERED",
    registeredAt: "2025-05-20T14:30:00.000Z",
  },
  {
    id: "r2",
    memberId: "m2",
    eventId: "e2",
    status: "WAITLISTED",
    registeredAt: "2025-05-28T09:15:00.000Z",
  },
];

export function listRegistrations(): MockRegistration[] {
  return mockRegistrations;
}

export function getRegistrationById(id: string): MockRegistration | undefined {
  return mockRegistrations.find((r) => r.id === id);
}

export function countByStatus(status: RegistrationStatus): number {
  return mockRegistrations.filter((r) => r.status === status).length;
}

export function getRegistrationsByMemberId(memberId: string): MockRegistration[] {
  return mockRegistrations.filter((r) => r.memberId === memberId);
}

export function countMemberRegistrations(memberId: string): number {
  return mockRegistrations.filter((r) => r.memberId === memberId).length;
}

export function countMemberWaitlisted(memberId: string): number {
  return mockRegistrations.filter(
    (r) => r.memberId === memberId && r.status === "WAITLISTED"
  ).length;
}

export function countEventRegistrations(eventId: string): number {
  return mockRegistrations.filter((r) => r.eventId === eventId).length;
}

export function countEventWaitlisted(eventId: string): number {
  return mockRegistrations.filter(
    (r) => r.eventId === eventId && r.status === "WAITLISTED"
  ).length;
}
