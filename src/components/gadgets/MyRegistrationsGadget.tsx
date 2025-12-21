"use client";

/**
 * MyRegistrationsGadget - Displays the member's event registrations with real data.
 *
 * Fetches from /api/v1/me/registrations and shows upcoming/recent registrations.
 * Links to event detail pages and shows registration status.
 *
 * Props:
 *   slot - Optional layout slot hint (primary, secondary, sidebar)
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { GadgetProps } from "./types";
import { formatClubDate } from "@/lib/timezone";

interface RegistrationFromAPI {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string | null;
  status: string;
  registeredAt: string;
  isPast: boolean;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  CONFIRMED: { bg: "#d1fae5", text: "#065f46", label: "Confirmed" },
  PENDING: { bg: "#dbeafe", text: "#1e40af", label: "Pending" },
  PENDING_PAYMENT: { bg: "#fef3c7", text: "#92400e", label: "Payment Pending" },
  WAITLISTED: { bg: "#fef3c7", text: "#92400e", label: "Waitlisted" },
  CANCELLED: { bg: "#fee2e2", text: "#991b1b", label: "Cancelled" },
};

export default function MyRegistrationsGadget({ slot }: GadgetProps) {
  const [registrations, setRegistrations] = useState<RegistrationFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRegistrations() {
      try {
        const response = await fetch("/api/v1/me/registrations");
        if (response.status === 401) {
          // Not logged in - show empty state
          setRegistrations([]);
          return;
        }
        if (!response.ok) throw new Error("Failed to load registrations");
        const data = await response.json();
        setRegistrations(data.registrations);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading registrations");
      } finally {
        setLoading(false);
      }
    }
    fetchRegistrations();
  }, []);

  const getStatusStyle = (status: string) => {
    return STATUS_STYLES[status] || { bg: "#f3f4f6", text: "#374151", label: status };
  };

  return (
    <div data-test-id="gadget-my-registrations" data-slot={slot}>
      {loading && (
        <p style={{ color: "#6b7280", margin: 0 }}>Loading registrations...</p>
      )}

      {error && (
        <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>
      )}

      {!loading && !error && registrations.length === 0 && (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <p style={{ color: "#6b7280", fontStyle: "italic", margin: 0 }}>
            You have not registered for any events yet.
          </p>
          <Link
            href="/events"
            style={{
              display: "inline-block",
              marginTop: "12px",
              color: "var(--token-color-primary)",
              fontSize: "14px",
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Browse events →
          </Link>
        </div>
      )}

      {!loading && !error && registrations.length > 0 && (
        <>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {registrations.slice(0, 5).map((reg) => {
              const statusStyle = getStatusStyle(reg.status);
              return (
                <li
                  key={reg.id}
                  data-test-id="registration-item"
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid #e5e7eb",
                    opacity: reg.isPast ? 0.6 : 1,
                  }}
                >
                  <Link
                    href={`/events/${reg.eventId}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      display: "block",
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
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          fontWeight: 500,
                        }}
                      >
                        {statusStyle.label}
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
                      {formatClubDate(new Date(reg.eventDate))}
                      {reg.isPast && (
                        <span style={{ marginLeft: "8px", fontStyle: "italic" }}>
                          (Past)
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {registrations.length > 5 && (
            <div style={{ marginTop: "12px", textAlign: "center" }}>
              <Link
                href="/my/registrations"
                style={{
                  color: "var(--token-color-primary)",
                  fontSize: "14px",
                  fontWeight: 500,
                  textDecoration: "none",
                }}
              >
                View all {registrations.length} registrations →
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
