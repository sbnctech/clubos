"use client";

import Link from "next/link";
import React from "react";

type ApiEvent = {
  id: string;
  title: string;
  category?: string | null;
  startTime?: string | null;
};

export default function EventsTable() {
  const [events, setEvents] = React.useState<ApiEvent[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/events", { cache: "no-store" });
        if (!res.ok) throw new Error("HTTP " + res.status);

        const json = await res.json();
        const list = Array.isArray(json?.events) ? (json.events as ApiEvent[]) : [];

        if (!cancelled) setEvents(list);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div data-test-id="admin-events-list-root" style={{ padding: "20px" }}>
      <h1 style={{ margin: "0 0 8px 0" }}>Events explorer</h1>
      <p style={{ marginTop: 0 }}>Browse all club events and view their registration details.</p>

      {error ? (
        <div role="alert" style={{ margin: "12px 0" }}>
          Failed to load events: {error}
        </div>
      ) : null}

      <div data-test-id="admin-events-list-table">
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Title</th>
              <th align="left">Category</th>
              <th align="left">Start time</th>
              <th align="left">Registrations</th>
              <th align="left">Waitlisted</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>Loading…</td>
              </tr>
            ) : events.length === 0 ? (
              <tr data-test-id="admin-events-list-empty-state">
                <td colSpan={5}>
                  <em>No events found.</em>
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={e.id} data-test-id="admin-events-list-row">
                  <td>
                    <Link
                      href={`/admin/events/${e.id}`}
                      data-test-id="admin-events-list-title-link"
                    >
                      {e.title}
                    </Link>
                  </td>
                  <td>{e.category || ""}</td>
                  <td>{e.startTime ? new Date(e.startTime).toLocaleString() : ""}</td>
                  <td>0</td>
                  <td>0</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div data-test-id="admin-events-pagination" style={{ marginTop: "12px" }}>
        <button data-test-id="admin-events-pagination-prev" disabled>
          Prev
        </button>
        <span data-test-id="admin-events-pagination-label" style={{ margin: "0 12px" }}>
          Page 1 of 1
        </span>
        <button data-test-id="admin-events-pagination-next" disabled>
          Next
        </button>
      </div>
    </div>
  );
}
