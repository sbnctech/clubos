"use client";

/**
 * UpcomingEventsGadget - Displays upcoming club events with real data.
 *
 * Fetches from /api/v1/events and shows the next few upcoming events.
 * Links to event detail pages for more info.
 * Includes quick registration buttons for one-click signup.
 *
 * Props:
 *   slot - Optional layout slot hint (primary, secondary, sidebar)
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { GadgetProps } from "./types";
import { formatClubDate } from "@/lib/timezone";

interface EventFromAPI {
  id: string;
  title: string;
  startTime: string;
  category: string | null;
  spotsRemaining: number | null;
  isWaitlistOpen: boolean;
}

interface MyRegistration {
  eventId: string;
  status: string;
}

export default function UpcomingEventsGadget({ slot }: GadgetProps) {
  const [events, setEvents] = useState<EventFromAPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myRegistrations, setMyRegistrations] = useState<MyRegistration[]>([]);
  const [registering, setRegistering] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Fetch events and registrations
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch events (public)
        const eventsRes = await fetch("/api/v1/events?limit=5");
        if (!eventsRes.ok) throw new Error("Failed to load events");
        const eventsData = await eventsRes.json();
        setEvents(eventsData.events);

        // Fetch member's registrations (may 401 if not logged in)
        const regsRes = await fetch("/api/v1/me/registrations");
        if (regsRes.ok) {
          setIsLoggedIn(true);
          const regsData = await regsRes.json();
          setMyRegistrations(
            regsData.registrations.map((r: { eventId: string; status: string }) => ({
              eventId: r.eventId,
              status: r.status,
            }))
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading events");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Quick register handler
  const handleRegister = useCallback(async (eventId: string) => {
    setRegistering(eventId);
    try {
      const res = await fetch(`/api/v1/events/${eventId}/register`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setMyRegistrations((prev) => [
          ...prev,
          { eventId, status: data.status },
        ]);
      } else if (res.status === 401) {
        // Not logged in - redirect to login
        window.location.href = "/login?returnTo=" + encodeURIComponent(window.location.pathname);
      } else {
        const data = await res.json();
        alert(data.message || "Registration failed");
      }
    } catch {
      alert("Registration failed. Please try again.");
    } finally {
      setRegistering(null);
    }
  }, []);

  // Check if member is registered for an event
  const getRegistrationStatus = (eventId: string): string | null => {
    const reg = myRegistrations.find((r) => r.eventId === eventId);
    return reg ? reg.status : null;
  };

  const getAvailabilityText = (event: EventFromAPI) => {
    if (event.isWaitlistOpen) return "Waitlist open";
    if (event.spotsRemaining === null) return "Open";
    if (event.spotsRemaining === 0) return "Full";
    return `${event.spotsRemaining} spots`;
  };

  const getAvailabilityColor = (event: EventFromAPI) => {
    if (event.isWaitlistOpen || event.spotsRemaining === 0) return "#dc2626";
    if (event.spotsRemaining !== null && event.spotsRemaining <= 3) return "#ea580c";
    return "#16a34a";
  };

  return (
    <div data-test-id="gadget-upcoming-events" data-slot={slot}>
      {loading && (
        <p style={{ color: "#6b7280", margin: 0 }}>Loading events...</p>
      )}

      {error && (
        <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>
      )}

      {!loading && !error && events.length === 0 && (
        <p style={{ color: "#6b7280", fontStyle: "italic", margin: 0 }}>
          No upcoming events at this time.
        </p>
      )}

      {!loading && !error && events.length > 0 && (
        <>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {events.map((event) => {
              const regStatus = getRegistrationStatus(event.id);
              const isRegistering = registering === event.id;
              const canRegister = !regStatus && (event.spotsRemaining === null || event.spotsRemaining > 0 || event.isWaitlistOpen);

              return (
                <li
                  key={event.id}
                  data-test-id="upcoming-event-item"
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  {/* Row: event info and action */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                    {/* Event details - clickable link */}
                    <Link
                      href={`/events/${event.id}`}
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      {/* Event title */}
                      <div style={{ fontWeight: 500, color: "#1f2937" }}>
                        {event.title}
                      </div>

                      {/* Event date */}
                      <div style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
                        {formatClubDate(new Date(event.startTime))}
                      </div>
                    </Link>

                    {/* Action area: registration status or button */}
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      {regStatus ? (
                        // Already registered - show status badge
                        <span
                          data-test-id="event-registration-status"
                          style={{
                            display: "inline-block",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: 500,
                            backgroundColor: regStatus === "WAITLISTED" ? "#fef3c7" : "#d1fae5",
                            color: regStatus === "WAITLISTED" ? "#92400e" : "#065f46",
                          }}
                        >
                          {regStatus === "WAITLISTED" ? "Waitlisted" : "Registered"}
                        </span>
                      ) : canRegister && isLoggedIn ? (
                        // Can register - show button
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleRegister(event.id);
                          }}
                          disabled={isRegistering}
                          data-test-id="event-register-button"
                          style={{
                            padding: "6px 14px",
                            borderRadius: "8px",
                            border: "none",
                            background: isRegistering
                              ? "#9ca3af"
                              : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "#ffffff",
                            fontSize: "13px",
                            fontWeight: 500,
                            cursor: isRegistering ? "not-allowed" : "pointer",
                            transition: "opacity 0.2s",
                          }}
                        >
                          {isRegistering ? "..." : event.isWaitlistOpen ? "Join Waitlist" : "Register"}
                        </button>
                      ) : (
                        // Not logged in or event full - show availability
                        <span
                          style={{
                            color: getAvailabilityColor(event),
                            fontWeight: 500,
                            fontSize: "12px",
                          }}
                        >
                          {getAvailabilityText(event)}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* View all link */}
          <div style={{ marginTop: "12px", textAlign: "center" }}>
            <Link
              href="/events"
              style={{
                color: "var(--token-color-primary)",
                fontSize: "14px",
                fontWeight: 500,
                textDecoration: "none",
              }}
            >
              View all events →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
