import GadgetHost from "@/components/gadgets/GadgetHost";

/**
 * MyClubPage - The member dashboard home page.
 *
 * URL: /member
 *
 * This page serves as the main landing page for authenticated club members.
 * It displays gadgets that show personalized information about upcoming
 * events and the member's current registrations.
 *
 * LAYOUT STRUCTURE:
 * -----------------
 * The page uses a responsive two-column grid:
 *
 *   - On wide screens (600px+): Two columns side by side
 *   - On narrow screens: Single column, stacked vertically
 *
 * Column 1 (Left/Top):
 *   - upcoming-events: Events the member can register for
 *
 * Column 2 (Right/Bottom):
 *   - my-registrations: Events the member has signed up for
 *
 * Future gadgets can be added to either column as needed.
 */

export default function MyClubPage() {
  return (
    <div data-test-id="myclub-page">
      {/* ========================================
          PAGE HEADER
          Welcome message for the member.
          ======================================== */}
      <h1
        style={{
          fontSize: "28px",
          fontWeight: 600,
          marginTop: 0,
          marginBottom: "8px",
          color: "#1f2937",
        }}
      >
        My Club
      </h1>
      <p
        style={{
          fontSize: "16px",
          color: "#6b7280",
          marginBottom: "24px",
        }}
      >
        Welcome back! Here is what is happening in your club.
      </p>

      {/* ========================================
          GADGET GRID
          Responsive two-column layout for gadgets.
          - Wide screens: side by side
          - Narrow screens: stacked
          ======================================== */}
      <div
        data-test-id="myclub-gadget-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {/* Column 1: Upcoming Events */}
        <section
          data-test-id="myclub-gadgets-primary"
          aria-label="Upcoming events"
        >
          <GadgetHost gadgetId="upcoming-events" slot="primary" />
        </section>

        {/* Column 2: My Registrations */}
        <section
          data-test-id="myclub-gadgets-secondary"
          aria-label="My registrations"
        >
          <GadgetHost gadgetId="my-registrations" slot="secondary" />
        </section>
      </div>
    </div>
  );
}
