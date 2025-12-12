/**
 * Mock members data for development and testing.
 * This replaces Prisma queries until the database layer is stable.
 */

export type MockMember = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  joinedAt: string;
  status: "ACTIVE" | "INACTIVE";
};

const mockMembers: MockMember[] = [
  {
    id: "m1",
    firstName: "Alice",
    lastName: "Johnson",
    email: "alice@example.com",
    phone: "555-123-4567",
    joinedAt: "2024-01-15T00:00:00.000Z",
    status: "ACTIVE",
  },
  {
    id: "m2",
    firstName: "Bob",
    lastName: "Smith",
    email: "bob@example.com",
    phone: "555-987-6543",
    joinedAt: "2024-03-22T00:00:00.000Z",
    status: "ACTIVE",
  },
];

export function getActiveMembers(): MockMember[] {
  return mockMembers.filter((m) => m.status === "ACTIVE");
}

export function getMemberById(id: string): MockMember | undefined {
  return mockMembers.find((m) => m.id === id);
}
