"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

type EventSummary = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  startTime: string;
  capacity: number | null;
  registeredCount: number;
  spotsRemaining: number | null;
  isWaitlistOpen: boolean;
};

type EventsResponse = {
  events: EventSummary[];
  pagination: { page: number; totalPages: number; hasNext: boolean; hasPrev: boolean };
  categories: string[];
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit"
  });
}

export default function PublicEventsPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [pagination, setPagination] = useState<EventsResponse["pagination"] | null>(null);

  const fetchEvents = useCallback(async (cat: string | null = null, page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "12" });
    if (cat) params.set("category", cat);
    const res = await fetch(`/api/v1/events?${params}`);
    if (res.ok) {
      const data: EventsResponse = await res.json();
      setEvents(data.events);
      setCategories(data.categories);
      setPagination(data.pagination);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchEvents(selectedCategory); }, [fetchEvents, selectedCategory]);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 20px" }}>
      <header style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, fontWeight: 700, color: "#1f2937", marginBottom: 12 }}>Upcoming Events</h1>
        <p style={{ fontSize: 18, color: "#6b7280" }}>Join us for social gatherings and community events</p>
      </header>

      {categories.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 32 }}>
          <button onClick={() => setSelectedCategory(null)} style={{ padding: "8px 16px", fontSize: 14, border: "1px solid #e5e7eb", borderRadius: 20, backgroundColor: selectedCategory === null ? "#2563eb" : "#fff", color: selectedCategory === null ? "#fff" : "#374151", cursor: "pointer" }}>All</button>
          {categories.map(c => (
            <button key={c} onClick={() => setSelectedCategory(c)} style={{ padding: "8px 16px", fontSize: 14, border: "1px solid #e5e7eb", borderRadius: 20, backgroundColor: selectedCategory === c ? "#2563eb" : "#fff", color: selectedCategory === c ? "#fff" : "#374151", cursor: "pointer" }}>{c}</button>
          ))}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#6b7280" }}>Loading...</div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80, color: "#6b7280" }}>No upcoming events</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
          {events.map(e => (
            <div key={e.id} style={{ backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #e5e7eb" }}>
              <div style={{ height: 140, backgroundColor: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, opacity: 0.5 }}>&#128197;</div>
              <div style={{ padding: 20 }}>
                {e.category && <span style={{ display: "inline-block", padding: "4px 10px", fontSize: 12, fontWeight: 500, backgroundColor: "#e0e7ff", color: "#4338ca", borderRadius: 12, marginBottom: 12 }}>{e.category}</span>}
                <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1f2937", marginBottom: 12 }}>{e.title}</h3>
                <div style={{ fontSize: 14, color: "#6b7280", marginBottom: 12 }}>
                  <div>&#128197; {formatDate(e.startTime)}</div>
                  {e.location && <div>&#128205; {e.location}</div>}
                </div>
                <div style={{ display: "flex", gap: 16, marginBottom: 12, padding: 12, backgroundColor: "#f9fafb", borderRadius: 8 }}>
                  <div style={{ flex: 1, textAlign: "center" }}><span style={{ display: "block", fontSize: 11, color: "#6b7280", textTransform: "uppercase" }}>Member</span><span style={{ fontSize: 16, fontWeight: 600 }}>Free</span></div>
                  <div style={{ flex: 1, textAlign: "center" }}><span style={{ display: "block", fontSize: 11, color: "#6b7280", textTransform: "uppercase" }}>Non-Member</span><span style={{ fontSize: 16, fontWeight: 600 }}>$15</span></div>
                </div>
                {e.spotsRemaining !== null && (
                  <div style={{ marginBottom: 16, fontSize: 13, textAlign: "center", color: e.spotsRemaining === 0 ? "#dc2626" : e.spotsRemaining <= 5 ? "#d97706" : "#059669" }}>
                    {e.spotsRemaining === 0 ? (e.isWaitlistOpen ? "Waitlist Open" : "Full") : e.spotsRemaining <= 5 ? `Only ${e.spotsRemaining} spots left!` : `${e.spotsRemaining} spots available`}
                  </div>
                )}
                <Link href={`/events/${e.id}`} style={{ display: "block", padding: "12px 20px", fontSize: 14, fontWeight: 600, textAlign: "center", backgroundColor: "#2563eb", color: "#fff", borderRadius: 8, textDecoration: "none" }}>
                  {e.spotsRemaining === 0 ? "Join Waitlist" : "Register"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 40 }}>
          <button onClick={() => fetchEvents(selectedCategory, pagination.page - 1)} disabled={!pagination.hasPrev} style={{ padding: "10px 20px", border: "1px solid #e5e7eb", borderRadius: 8, opacity: pagination.hasPrev ? 1 : 0.5 }}>Previous</button>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <button onClick={() => fetchEvents(selectedCategory, pagination.page + 1)} disabled={!pagination.hasNext} style={{ padding: "10px 20px", border: "1px solid #e5e7eb", borderRadius: 8, opacity: pagination.hasNext ? 1 : 0.5 }}>Next</button>
        </div>
      )}
    </div>
  );
}
