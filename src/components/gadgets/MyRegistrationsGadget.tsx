/**
 * MyRegistrationsGadget - Displays the member's event registrations.
 *
 * This is a shell component that will later fetch and display
 * real registration data. For now it shows mock placeholder content.
 *
 * Future work:
 *   - Add useMyRegistrations() hook to fetch real data
 *   - Add loading and error states
 *   - Add "Cancel" or "View" actions for each registration
 *
 * Props:
 *   slot - Optional layout slot hint (primary, secondary, sidebar)
 */

import { GadgetProps, RegistrationSummary } from "./types";

// Mock data for the shell version.
// This will be replaced with real API data via a fetch hook.
const MOCK_REGISTRATIONS: RegistrationSummary[] = [
  {
    id: "r1",
    eventId: "e1",
    eventTitle: "Welcome Hike",
    eventDate: "Jan 15, 2025",
    status: "REGISTERED",
  },
  {
    id: "r2",
    eventId: "e2",
    eventTitle: "Wine Mixer",
    eventDate: "Jan 22, 2025",
    status: "WAITLISTED",
  },
];

export default function MyRegistrationsGadget({ slot }: GadgetProps) {
  // TODO: Replace with useMyRegistrations() hook
  const registrations = MOCK_REGISTRATIONS;

  return (
    <div data-test-id="gadget-my-registrations" data-slot={slot}>
      {/* Registration list - currently showing mock data */}
      {registrations.length === 0 ? (
        <p style={{ color: "#6b7280", fontStyle: "italic", margin: 0 }}>
          You have not registered for any events yet.
        </p>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {registrations.map((reg) => (
            <li
              key={reg.id}
              data-test-id="registration-item"
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              {/* Row: event title and status badge */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {/* Event title */}
                <span style={{ fontWeight: 500, color: "#1f2937" }}>
                  {reg.eventTitle}
                </span>

                {/* Status badge with color coding */}
                <span
                  data-test-id="registration-status"
                  style={{
                    fontSize: "12px",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    backgroundColor:
                      reg.status === "REGISTERED"
                        ? "#d1fae5"
                        : reg.status === "WAITLISTED"
                        ? "#fef3c7"
                        : "#fee2e2",
                    color:
                      reg.status === "REGISTERED"
                        ? "#065f46"
                        : reg.status === "WAITLISTED"
                        ? "#92400e"
                        : "#991b1b",
                  }}
                >
                  {reg.status}
                </span>
              </div>

              {/* Event date */}
              <div
                style={{
                  fontSize: "14px",
                  color: "#6b7280",
                  marginTop: "4px",
                }}
              >
                {reg.eventDate}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
