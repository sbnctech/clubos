/**
 * UpcomingEventsGadget - Displays upcoming club events.
 *
 * This is a shell component that will later fetch and display
 * real event data. For now it shows mock placeholder content.
 *
 * Future work:
 *   - Add useUpcomingEvents() hook to fetch real data
 *   - Add loading and error states
 *   - Add "Register" button for each event
 *
 * Props:
 *   slot - Optional layout slot hint (primary, secondary, sidebar)
 */

import { GadgetProps, EventSummary } from "./types";

// Mock data for the shell version.
// This will be replaced with real API data via a fetch hook.
const MOCK_EVENTS: EventSummary[] = [
  { id: "e1", title: "Welcome Hike", date: "Jan 15, 2025", spotsAvailable: 8 },
  { id: "e2", title: "Wine Mixer", date: "Jan 22, 2025", spotsAvailable: 3 },
  { id: "e3", title: "Book Club", date: "Feb 1, 2025", spotsAvailable: 12 },
];

export default function UpcomingEventsGadget({ slot }: GadgetProps) {
  // TODO: Replace with useUpcomingEvents() hook
  const events = MOCK_EVENTS;

  return (
    <div data-test-id="gadget-upcoming-events" data-slot={slot}>
      {/* Event list - currently showing mock data */}
      {events.length === 0 ? (
        <p style={{ color: "#6b7280", fontStyle: "italic", margin: 0 }}>
          No upcoming events at this time.
        </p>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {events.map((event) => (
            <li
              key={event.id}
              data-test-id="upcoming-event-item"
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              {/* Event title */}
              <div style={{ fontWeight: 500, color: "#1f2937" }}>
                {event.title}
              </div>

              {/* Event details: date and availability */}
              <div
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  marginTop: "4px",
                }}
              >
                {event.date} - {event.spotsAvailable} spots available
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
