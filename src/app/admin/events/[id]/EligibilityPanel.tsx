"use client";

import { useEffect, useState } from "react";

/**
 * Feature flag for eligibility panel visibility.
 * Set NEXT_PUBLIC_FEATURE_ELIGIBILITY_PANEL=1 in environment to enable.
 */
const FEATURE_FLAG_ENABLED =
  typeof window !== "undefined" &&
  (process.env.NEXT_PUBLIC_FEATURE_ELIGIBILITY_PANEL === "1" ||
    process.env.NODE_ENV === "development");

type TicketEligibility = {
  code: string;
  name: string;
  eligibility: {
    allowed: boolean;
    reasonCode: string;
    reasonDetail?: string;
  };
};

type EligibilityData = {
  eventId: string;
  memberId: string;
  ticketTypes: TicketEligibility[];
};

type PanelState =
  | { status: "hidden" }
  | { status: "loading" }
  | { status: "unavailable"; message: string }
  | { status: "loaded"; data: EligibilityData; timestamp: string };

interface EligibilityPanelProps {
  eventId: string;
}

/**
 * Read-only eligibility panel for admin event detail page.
 * Displays ticket eligibility decisions for the current admin user.
 * Fails open with "Eligibility unavailable" if endpoint fails.
 */
export function EligibilityPanel({ eventId }: EligibilityPanelProps) {
  // Initialize state based on feature flag
  const initialState: PanelState = FEATURE_FLAG_ENABLED
    ? { status: "loading" }
    : { status: "hidden" };
  const [state, setState] = useState<PanelState>(initialState);

  useEffect(() => {
    if (!FEATURE_FLAG_ENABLED) {
      return;
    }

    fetch(`/api/v1/events/${eventId}/tickets/eligibility`)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`HTTP ${res.status}: ${text.slice(0, 100)}`);
        }
        return res.json();
      })
      .then((data: EligibilityData) => {
        setState({
          status: "loaded",
          data,
          timestamp: new Date().toISOString(),
        });
      })
      .catch((err) => {
        console.warn("Eligibility panel fetch failed:", err);
        setState({
          status: "unavailable",
          message: err instanceof Error ? err.message : "Unknown error",
        });
      });
  }, [eventId]);

  // Hidden state - render nothing
  if (state.status === "hidden") {
    return null;
  }

  return (
    <div
      data-test-id="admin-eligibility-panel"
      style={{
        marginTop: "24px",
        padding: "16px",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        backgroundColor: "#fafafa",
      }}
    >
      <h3
        style={{
          fontSize: "16px",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        Ticket Eligibility
        <span
          style={{
            fontSize: "11px",
            padding: "2px 6px",
            backgroundColor: "#e3f2fd",
            color: "#1565c0",
            borderRadius: "4px",
          }}
        >
          read-only
        </span>
      </h3>

      {state.status === "loading" && (
        <p
          data-test-id="admin-eligibility-loading"
          style={{ color: "#666", fontStyle: "italic" }}
        >
          Loading eligibility...
        </p>
      )}

      {state.status === "unavailable" && (
        <div
          data-test-id="admin-eligibility-unavailable"
          style={{
            padding: "12px",
            backgroundColor: "#fff3e0",
            border: "1px solid #ffcc80",
            borderRadius: "4px",
            color: "#e65100",
          }}
        >
          <strong>Eligibility unavailable</strong>
          <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>
            {state.message}
          </p>
        </div>
      )}

      {state.status === "loaded" && (
        <div data-test-id="admin-eligibility-results">
          <p style={{ fontSize: "12px", color: "#666", marginBottom: "12px" }}>
            Computed: {new Date(state.timestamp).toLocaleString()}
          </p>

          {state.data.ticketTypes.length === 0 ? (
            <p style={{ fontStyle: "italic", color: "#666" }}>
              No ticket types configured for this event.
            </p>
          ) : (
            <table
              data-test-id="admin-eligibility-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      borderBottom: "1px solid #ddd",
                      textAlign: "left",
                      padding: "6px 8px",
                      fontWeight: 600,
                    }}
                  >
                    Ticket Type
                  </th>
                  <th
                    style={{
                      borderBottom: "1px solid #ddd",
                      textAlign: "center",
                      padding: "6px 8px",
                      fontWeight: 600,
                      width: "80px",
                    }}
                  >
                    Decision
                  </th>
                  <th
                    style={{
                      borderBottom: "1px solid #ddd",
                      textAlign: "left",
                      padding: "6px 8px",
                      fontWeight: 600,
                    }}
                  >
                    Reason
                  </th>
                </tr>
              </thead>
              <tbody>
                {state.data.ticketTypes.map((tt) => (
                  <tr key={tt.code} data-test-id="admin-eligibility-row">
                    <td
                      style={{
                        borderBottom: "1px solid #eee",
                        padding: "6px 8px",
                      }}
                    >
                      <div>{tt.name}</div>
                      <div style={{ fontSize: "11px", color: "#999" }}>
                        {tt.code}
                      </div>
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #eee",
                        padding: "6px 8px",
                        textAlign: "center",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          backgroundColor: tt.eligibility.allowed
                            ? "#e8f5e9"
                            : "#ffebee",
                          color: tt.eligibility.allowed ? "#2e7d32" : "#c62828",
                        }}
                      >
                        {tt.eligibility.allowed ? "Allow" : "Deny"}
                      </span>
                    </td>
                    <td
                      style={{
                        borderBottom: "1px solid #eee",
                        padding: "6px 8px",
                      }}
                    >
                      <code
                        style={{
                          fontSize: "11px",
                          backgroundColor: "#f5f5f5",
                          padding: "2px 4px",
                          borderRadius: "2px",
                          fontFamily: "monospace",
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
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
