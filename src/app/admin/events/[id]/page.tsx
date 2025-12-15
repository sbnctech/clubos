import { notFound } from "next/navigation";
import Link from "next/link";

/**
 * Check if admin eligibility visibility is enabled.
 * Set FEATURE_ELIGIBILITY_ADMIN=1 in environment to enable.
 */
function isEligibilityAdminEnabled(): boolean {
  return process.env.FEATURE_ELIGIBILITY_ADMIN === "1";
}

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "http://localhost:3000";
}

type Event = {
  id: string;
  title: string;
  category: string;
  startTime: string;
};

type Registration = {
  id: string;
  memberId: string;
  memberName: string;
  status: string;
  registeredAt: string;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params;
  const base = getBaseUrl();
  const res = await fetch(`${base}/api/admin/events/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    return (
      <div data-test-id="admin-event-detail-error" style={{ padding: "20px" }}>
        <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>Error</h1>
        <p>Failed to load event details.</p>
      </div>
    );
  }

  const data = await res.json();
  const event: Event = data.event;
  const registrations: Registration[] = data.registrations ?? [];

  return (
    <div data-test-id="admin-event-detail-root" style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>{event.title}</h1>

      <div style={{ marginBottom: "24px" }}>
        <div style={{ marginBottom: "8px" }}>
          <strong>Category:</strong>{" "}
          <span data-test-id="admin-event-detail-category">{event.category}</span>
        </div>
        <div style={{ marginBottom: "8px" }}>
          <strong>Start time:</strong>{" "}
          <span data-test-id="admin-event-detail-start-time">{event.startTime}</span>
        </div>
      </div>

      {isEligibilityAdminEnabled() && (
        <div
          data-test-id="admin-event-eligibility-panel"
          style={{
            marginBottom: "24px",
            padding: "12px 16px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
          }}
        >
          <strong>Eligibility</strong>
          <p style={{ margin: "8px 0", fontSize: "14px", color: "#666" }}>
            View ticket eligibility status for members attending this event.
          </p>
          <Link
            href={`/admin/eligibility?eventId=${event.id}`}
            data-test-id="admin-event-eligibility-link"
            style={{
              display: "inline-block",
              padding: "6px 12px",
              backgroundColor: "#0066cc",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          >
            View Eligibility
          </Link>
        </div>
      )}

      <h2 style={{ fontSize: "18px", marginBottom: "12px" }}>Registrations</h2>

      <table
        data-test-id="admin-event-detail-registrations-table"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          maxWidth: "600px",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                borderBottom: "1px solid #ccc",
                textAlign: "left",
                padding: "8px",
              }}
            >
              Member
            </th>
            <th
              style={{
                borderBottom: "1px solid #ccc",
                textAlign: "left",
                padding: "8px",
              }}
            >
              Status
            </th>
            <th
              style={{
                borderBottom: "1px solid #ccc",
                textAlign: "left",
                padding: "8px",
              }}
            >
              Registered at
            </th>
          </tr>
        </thead>
        <tbody>
          {registrations.map((reg) => (
            <tr key={reg.id} data-test-id="admin-event-detail-registration-row">
              <td
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "8px",
                }}
              >
                {reg.memberName}
              </td>
              <td
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "8px",
                }}
              >
                {reg.status}
              </td>
              <td
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "8px",
                }}
              >
                {reg.registeredAt}
              </td>
            </tr>
          ))}
          {registrations.length === 0 && (
            <tr>
              <td
                colSpan={3}
                data-test-id="admin-event-detail-empty"
                style={{
                  padding: "8px",
                  fontStyle: "italic",
                  color: "#666",
                }}
              >
                No registrations found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
