"use client";

/**
 * Mentorship Card - VP Membership Dashboard Component
 *
 * Shows unmatched newbies, available mentors, and active assignments.
 * VP Membership can create matches; President has read-only view (if enabled).
 *
 * Reference: docs/ORG/SBNC_BUSINESS_MODEL.md - mentorship as volunteer on-ramp
 */

import { useState, useEffect, useCallback } from "react";

interface UnmatchedNewbie {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  daysSinceJoin: number;
  membershipStatus: string;
  hasRegisteredForEvent: boolean;
}

interface AvailableMentor {
  id: string;
  name: string;
  email: string;
  activeAssignmentCount: number;
  lastAssignmentDate: string | null;
  availableSlots: number;
}

interface ActiveAssignment {
  id: string;
  createdAt: string;
  newbie: { id: string; name: string; email: string };
  mentor: { id: string; name: string; email: string };
  createdByName: string | null;
  notes: string | null;
}

interface DashboardData {
  unmatchedNewbies: UnmatchedNewbie[];
  availableMentors: AvailableMentor[];
  activeAssignments: ActiveAssignment[];
  canCreateMatch: boolean;
  summary: {
    unmatchedCount: number;
    availableMentorCount: number;
    activeAssignmentCount: number;
  };
}

export default function MentorshipCard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNewbie, setSelectedNewbie] = useState<UnmatchedNewbie | null>(null);
  const [selectedMentor, setSelectedMentor] = useState<AvailableMentor | null>(null);
  const [matchNotes, setMatchNotes] = useState("");
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/mentorship/dashboard", {
        headers: {
          "x-admin-test-token": "dev-admin-token",
        },
      });

      if (!res.ok) {
        if (res.status === 403) {
          setError("You do not have permission to view mentorship data");
          return;
        }
        throw new Error("Failed to fetch mentorship data");
      }

      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load mentorship data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateMatch = async () => {
    if (!selectedNewbie || !selectedMentor) return;

    setMatching(true);
    setMatchResult(null);

    try {
      const res = await fetch("/api/v1/admin/mentorship/match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-test-token": "dev-admin-token",
        },
        body: JSON.stringify({
          newbieMemberId: selectedNewbie.id,
          mentorMemberId: selectedMentor.id,
          notes: matchNotes || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setMatchResult({ success: false, message: json.error || "Failed to create match" });
        return;
      }

      setMatchResult({ success: true, message: json.message });
      setSelectedNewbie(null);
      setSelectedMentor(null);
      setMatchNotes("");
      // Refresh data
      fetchData();
    } catch (err) {
      setMatchResult({
        success: false,
        message: err instanceof Error ? err.message : "Failed to create match",
      });
    } finally {
      setMatching(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "16px", border: "1px solid #e0e0e0", borderRadius: "8px", marginBottom: "24px" }}>
        <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Mentorship Program</h3>
        <p>Loading mentorship data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "16px", border: "1px solid #e0e0e0", borderRadius: "8px", marginBottom: "24px" }}>
        <h3 style={{ marginTop: 0, marginBottom: "16px" }}>Mentorship Program</h3>
        <p style={{ color: "#c62828" }}>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { unmatchedNewbies, availableMentors, activeAssignments, canCreateMatch, summary } = data;

  return (
    <div
      data-test-id="mentorship-card"
      style={{
        padding: "16px",
        border: "1px solid #e0e0e0",
        borderRadius: "8px",
        marginBottom: "24px",
        backgroundColor: "#fafafa",
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: "16px" }}>
        Mentorship Program
        {!canCreateMatch && (
          <span style={{ fontSize: "12px", color: "#666", marginLeft: "8px" }}>(View Only)</span>
        )}
      </h3>

      {/* Summary Stats */}
      <div style={{ display: "flex", gap: "24px", marginBottom: "16px" }}>
        <div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{summary.unmatchedCount}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>Awaiting Mentor</div>
        </div>
        <div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{summary.availableMentorCount}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>Available Mentors</div>
        </div>
        <div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{summary.activeAssignmentCount}</div>
          <div style={{ fontSize: "12px", color: "#666" }}>Active Pairs</div>
        </div>
      </div>

      {/* Match Result */}
      {matchResult && (
        <div
          style={{
            padding: "12px",
            marginBottom: "16px",
            borderRadius: "4px",
            backgroundColor: matchResult.success ? "#e8f5e9" : "#ffebee",
            color: matchResult.success ? "#2e7d32" : "#c62828",
          }}
        >
          {matchResult.message}
        </div>
      )}

      {/* Match Creation UI - only for VP Membership */}
      {canCreateMatch && (
        <div style={{ marginBottom: "24px" }}>
          <h4 style={{ marginBottom: "12px" }}>Create Match</h4>

          <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
            {/* Newbie Selection */}
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "4px" }}>
                Select Newbie
              </label>
              <select
                value={selectedNewbie?.id ?? ""}
                onChange={(e) => {
                  const newbie = unmatchedNewbies.find((n) => n.id === e.target.value);
                  setSelectedNewbie(newbie ?? null);
                }}
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              >
                <option value="">-- Select a newbie --</option>
                {unmatchedNewbies.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name} ({n.daysSinceJoin} days)
                  </option>
                ))}
              </select>
              {selectedNewbie && (
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
                  <div>Email: {selectedNewbie.email}</div>
                  <div>Status: {selectedNewbie.membershipStatus}</div>
                  <div>Event registration: {selectedNewbie.hasRegisteredForEvent ? "Yes" : "No"}</div>
                </div>
              )}
            </div>

            {/* Mentor Selection */}
            <div style={{ flex: 1 }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "4px" }}>
                Select Mentor
              </label>
              <select
                value={selectedMentor?.id ?? ""}
                onChange={(e) => {
                  const mentor = availableMentors.find((m) => m.id === e.target.value);
                  setSelectedMentor(mentor ?? null);
                }}
                style={{ width: "100%", padding: "8px", fontSize: "14px" }}
              >
                <option value="">-- Select a mentor --</option>
                {availableMentors.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.availableSlots} slot{m.availableSlots !== 1 ? "s" : ""} available)
                  </option>
                ))}
              </select>
              {selectedMentor && (
                <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
                  <div>Email: {selectedMentor.email}</div>
                  <div>Current assignments: {selectedMentor.activeAssignmentCount}</div>
                </div>
              )}
            </div>
          </div>

          {/* Notes and Submit */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "bold", marginBottom: "4px" }}>
              Notes (optional)
            </label>
            <input
              type="text"
              value={matchNotes}
              onChange={(e) => setMatchNotes(e.target.value)}
              placeholder="e.g., Both interested in hiking"
              style={{ width: "100%", padding: "8px", fontSize: "14px" }}
            />
          </div>

          <button
            onClick={handleCreateMatch}
            disabled={!selectedNewbie || !selectedMentor || matching}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              backgroundColor: selectedNewbie && selectedMentor ? "#1976d2" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: selectedNewbie && selectedMentor ? "pointer" : "not-allowed",
            }}
          >
            {matching ? "Creating Match..." : "Create Match"}
          </button>
        </div>
      )}

      {/* Unmatched Newbies List */}
      <div style={{ marginBottom: "24px" }}>
        <h4 style={{ marginBottom: "8px" }}>Newbies Awaiting Mentor ({unmatchedNewbies.length})</h4>
        {unmatchedNewbies.length === 0 ? (
          <p style={{ color: "#666", fontStyle: "italic" }}>No unmatched newbies</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #ddd" }}>Name</th>
                <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #ddd" }}>Days</th>
                <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #ddd" }}>Event?</th>
              </tr>
            </thead>
            <tbody>
              {unmatchedNewbies.slice(0, 10).map((n) => (
                <tr key={n.id}>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{n.name}</td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{n.daysSinceJoin}</td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                    {n.hasRegisteredForEvent ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Active Assignments */}
      <div>
        <h4 style={{ marginBottom: "8px" }}>Active Mentor Pairs ({activeAssignments.length})</h4>
        {activeAssignments.length === 0 ? (
          <p style={{ color: "#666", fontStyle: "italic" }}>No active assignments</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #ddd" }}>Mentor</th>
                <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #ddd" }}>Newbie</th>
                <th style={{ textAlign: "left", padding: "8px", borderBottom: "1px solid #ddd" }}>Matched</th>
              </tr>
            </thead>
            <tbody>
              {activeAssignments.slice(0, 10).map((a) => (
                <tr key={a.id}>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{a.mentor.name}</td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>{a.newbie.name}</td>
                  <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
