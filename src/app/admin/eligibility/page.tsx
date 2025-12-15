"use client";

import { useState } from "react";

type TicketEligibility = {
  code: string;
  name: string;
  eligibility: {
    allowed: boolean;
    reasonCode: string;
    reasonDetail?: string;
  };
};

type MemberEligibility = {
  id: string;
  name: string;
  email: string;
  ticketTypes: TicketEligibility[];
};

type EligibilityResponse = {
  event: {
    id: string;
    title: string;
    startTime: string;
  };
  members: MemberEligibility[];
};

export default function AdminEligibilityPage() {
  const [eventId, setEventId] = useState("");
  const [memberId, setMemberId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EligibilityResponse | null>(null);

  async function handleLookup() {
    if (!eventId.trim()) {
      setError("Event ID is required");
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const params = new URLSearchParams({ eventId: eventId.trim() });
      if (memberId.trim()) {
        params.set("memberId", memberId.trim());
      }

      const res = await fetch(`/api/admin/eligibility?${params}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.message || "Failed to fetch eligibility");
        return;
      }

      setData(json);
    } catch (err) {
      setError("Network error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div data-test-id="admin-eligibility-root" style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "12px" }}>
        Eligibility Viewer
      </h1>
      <p style={{ marginBottom: "16px", color: "#666" }}>
        Read-only view of ticket eligibility by event and member.
      </p>

      <div
        style={{
          marginBottom: "24px",
          padding: "16px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          maxWidth: "500px",
        }}
      >
        <div style={{ marginBottom: "12px" }}>
          <label
            htmlFor="eventId"
            style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}
          >
            Event ID *
          </label>
          <input
            id="eventId"
            data-test-id="admin-eligibility-event-id"
            type="text"
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            placeholder="Enter event ID"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label
            htmlFor="memberId"
            style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}
          >
            Member ID (optional)
          </label>
          <input
            id="memberId"
            data-test-id="admin-eligibility-member-id"
            type="text"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            placeholder="Leave empty for all members"
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
        </div>

        <button
          data-test-id="admin-eligibility-lookup-btn"
          onClick={handleLookup}
          disabled={loading}
          style={{
            padding: "8px 16px",
            backgroundColor: loading ? "#999" : "#0066cc",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "14px",
          }}
        >
          {loading ? "Loading..." : "Lookup Eligibility"}
        </button>
      </div>

      {error && (
        <div
          data-test-id="admin-eligibility-error"
          style={{
            padding: "12px",
            backgroundColor: "#fee",
            border: "1px solid #fcc",
            borderRadius: "4px",
            color: "#c00",
            marginBottom: "16px",
          }}
        >
          {error}
        </div>
      )}

      {data && (
        <div data-test-id="admin-eligibility-results">
          <h2 style={{ fontSize: "18px", marginBottom: "8px" }}>
            {data.event.title}
          </h2>
          <p style={{ marginBottom: "16px", color: "#666", fontSize: "14px" }}>
            Start: {new Date(data.event.startTime).toLocaleString()}
          </p>

          {data.members.length === 0 ? (
            <p style={{ fontStyle: "italic", color: "#666" }}>
              No members found.
            </p>
          ) : (
            <table
              data-test-id="admin-eligibility-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      borderBottom: "2px solid #ccc",
                      textAlign: "left",
                      padding: "8px",
                    }}
                  >
                    Member
                  </th>
                  <th
                    style={{
                      borderBottom: "2px solid #ccc",
                      textAlign: "left",
                      padding: "8px",
                    }}
                  >
                    Ticket Type
                  </th>
                  <th
                    style={{
                      borderBottom: "2px solid #ccc",
                      textAlign: "center",
                      padding: "8px",
                    }}
                  >
                    Allowed
                  </th>
                  <th
                    style={{
                      borderBottom: "2px solid #ccc",
                      textAlign: "left",
                      padding: "8px",
                    }}
                  >
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.members.flatMap((member) =>
                  member.ticketTypes.map((tt, idx) => (
                    <tr
                      key={`${member.id}-${tt.code}`}
                      data-test-id="admin-eligibility-row"
                    >
                      {idx === 0 ? (
                        <td
                          rowSpan={member.ticketTypes.length}
                          style={{
                            borderBottom: "1px solid #eee",
                            padding: "8px",
                            verticalAlign: "top",
                          }}
                        >
                          <div style={{ fontWeight: 500 }}>{member.name}</div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            {member.email}
                          </div>
                        </td>
                      ) : null}
                      <td
                        style={{
                          borderBottom: "1px solid #eee",
                          padding: "8px",
                        }}
                      >
                        {tt.name}
                        <span
                          style={{
                            marginLeft: "8px",
                            fontSize: "11px",
                            color: "#999",
                          }}
                        >
                          ({tt.code})
                        </span>
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #eee",
                          padding: "8px",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 500,
                            backgroundColor: tt.eligibility.allowed
                              ? "#e6f4ea"
                              : "#fce8e6",
                            color: tt.eligibility.allowed ? "#137333" : "#c5221f",
                          }}
                        >
                          {tt.eligibility.allowed ? "Yes" : "No"}
                        </span>
                      </td>
                      <td
                        style={{
                          borderBottom: "1px solid #eee",
                          padding: "8px",
                        }}
                      >
                        <code
                          style={{
                            fontSize: "12px",
                            backgroundColor: "#f5f5f5",
                            padding: "2px 4px",
                            borderRadius: "2px",
                          }}
                        >
                          {tt.eligibility.reasonCode}
                        </code>
                        {tt.eligibility.reasonDetail && (
                          <div
                            style={{
                              marginTop: "4px",
                              fontSize: "12px",
                              color: "#666",
                            }}
                          >
                            {tt.eligibility.reasonDetail}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
