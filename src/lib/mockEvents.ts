/**
 * Mock events data for development and testing.
 * This replaces database queries until the database layer is stable.
 */

export type MockEvent = {
  id: string;
  title: string;
  category: string;
  startTime: string;
};

const mockEvents: MockEvent[] = [
  {
    id: "e1",
    title: "Welcome Hike",
    category: "Outdoors",
    startTime: "2025-06-01T09:00:00Z",
  },
  {
    id: "e2",
    title: "Wine Mixer",
    category: "Social",
    startTime: "2025-06-05T18:00:00Z",
  },
];

export function listEvents(): MockEvent[] {
  return mockEvents;
}

export function getEventById(id: string): MockEvent | undefined {
  return mockEvents.find((e) => e.id === id);
}
