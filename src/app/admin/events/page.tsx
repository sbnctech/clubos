import Link from "next/link";
import EventsTable from "./EventsTable";

export default function AdminEventsListPage() {
  return (
    <div data-test-id="admin-events-list-root" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div>
          <h1 style={{ fontSize: "24px", margin: "0 0 8px 0" }}>Events explorer</h1>
          <p style={{ margin: 0, color: "#6b7280" }}>
            Browse all club events and view their registration details.
          </p>
        </div>
        <Link
          href="/admin/events/new"
          data-test-id="admin-events-new-button"
          style={{
            display: "inline-block",
            padding: "10px 20px",
            backgroundColor: "#16a34a",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          + New Event
        </Link>
      </div>

      <div
        data-test-id="admin-events-export"
        style={{ marginBottom: "16px" }}
      >
        <a
          href="/api/admin/export/events"
          download
          data-test-id="admin-events-export-button"
          style={{
            display: "inline-block",
            padding: "8px 16px",
            backgroundColor: "#0066cc",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        >
          Download events.csv
        </a>
      </div>

      <EventsTable />
    </div>
  );
}
