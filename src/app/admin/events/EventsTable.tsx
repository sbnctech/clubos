"use client";

import { useState, useEffect } from "react";

type AdminEventListItem = {
  id: string;
  title: string;
  category: string;
  startTime: string;
  registrationCount: number;
  waitlistedCount: number;
};

type PaginatedResponse = {
  items: AdminEventListItem[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

const PAGE_SIZE = 10;

export default function EventsTable() {
  const [events, setEvents] = useState<AdminEventListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/events?page=${page}&pageSize=${PAGE_SIZE}`
        );
        if (res.ok) {
          const data: PaginatedResponse = await res.json();
          setEvents(data.items ?? []);
          setTotalPages(data.totalPages ?? 1);
        }
      } catch {
        // Keep existing state on error
      }
      setLoading(false);
    }
    fetchEvents();
  }, [page]);

  return (
    <>
      <table
        data-test-id="admin-events-list-table"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          maxWidth: "900px",
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
              Title
            </th>
            <th
              style={{
                borderBottom: "1px solid #ccc",
                textAlign: "left",
                padding: "8px",
              }}
            >
              Category
            </th>
            <th
              style={{
                borderBottom: "1px solid #ccc",
                textAlign: "left",
                padding: "8px",
              }}
            >
              Start time
            </th>
            <th
              style={{
                borderBottom: "1px solid #ccc",
                textAlign: "left",
                padding: "8px",
              }}
            >
              Registrations
            </th>
            <th
              style={{
                borderBottom: "1px solid #ccc",
                textAlign: "left",
                padding: "8px",
              }}
            >
              Waitlisted
            </th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} data-test-id="admin-events-list-row">
              <td
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "8px",
                }}
              >
                <a
                  href={`/admin/events/${event.id}`}
                  data-test-id="admin-events-list-title-link"
                  style={{ color: "#0066cc", textDecoration: "none" }}
                >
                  {event.title}
                </a>
              </td>
              <td
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "8px",
                }}
              >
                {event.category}
              </td>
              <td
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "8px",
                }}
              >
                {event.startTime}
              </td>
              <td
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "8px",
                }}
              >
                {event.registrationCount}
              </td>
              <td
                style={{
                  borderBottom: "1px solid #eee",
                  padding: "8px",
                }}
              >
                {event.waitlistedCount}
              </td>
            </tr>
          ))}
          {!loading && events.length === 0 && (
            <tr data-test-id="admin-events-list-empty-state">
              <td
                colSpan={5}
                style={{
                  padding: "8px",
                  fontStyle: "italic",
                  color: "#666",
                }}
              >
                No events found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div
        data-test-id="admin-events-pagination"
        style={{
          marginTop: "16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <button
          data-test-id="admin-events-pagination-prev"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          style={{
            padding: "6px 12px",
            fontSize: "14px",
            cursor: page <= 1 ? "not-allowed" : "pointer",
            opacity: page <= 1 ? 0.5 : 1,
          }}
        >
          Prev
        </button>
        <span data-test-id="admin-events-pagination-label">
          Page {page} of {totalPages}
        </span>
        <button
          data-test-id="admin-events-pagination-next"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          style={{
            padding: "6px 12px",
            fontSize: "14px",
            cursor: page >= totalPages ? "not-allowed" : "pointer",
            opacity: page >= totalPages ? 0.5 : 1,
          }}
        >
          Next
        </button>
      </div>
    </>
  );
}
