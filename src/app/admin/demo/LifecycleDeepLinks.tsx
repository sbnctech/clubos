"use client";

/**
 * Lifecycle Deep Links Panel
 *
 * Shows quick links to members demonstrating each lifecycle state.
 * Used in the demo dashboard for showcasing the lifecycle explainer.
 */

import { useState, useEffect } from "react";
import Link from "next/link";

type Scenario = {
  id: string;
  state: string;
  label: string;
  description: string;
  member: {
    id: string;
    name: string;
    email: string;
    status: string;
    tier: string | null;
    joinedAt: string;
    daysSinceJoin: number;
  } | null;
  deepLink: string | null;
  demoNotes: string;
};

type ScenariosResponse = {
  scenarios: Scenario[];
  summary: {
    total: number;
    available: number;
    missing: number;
  };
};

const STATE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  active_newbie: { bg: "#e8f5e9", text: "#2e7d32", border: "#4caf50" },
  active_member: { bg: "#e3f2fd", text: "#1565c0", border: "#2196f3" },
  active_extended: { bg: "#f3e5f5", text: "#7b1fa2", border: "#9c27b0" },
  offer_extended: { bg: "#fff3e0", text: "#e65100", border: "#ff9800" },
  pending_new: { bg: "#fff8e1", text: "#f57f17", border: "#ffc107" },
  lapsed: { bg: "#fafafa", text: "#616161", border: "#9e9e9e" },
  suspended: { bg: "#ffebee", text: "#c62828", border: "#f44336" },
  unknown: { bg: "#fce4ec", text: "#ad1457", border: "#e91e63" },
  not_a_member: { bg: "#eceff1", text: "#546e7a", border: "#78909c" },
};

export default function LifecycleDeepLinks() {
  const [data, setData] = useState<ScenariosResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    async function fetchScenarios() {
      try {
        const res = await fetch("/api/admin/demo/scenarios");
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchScenarios();
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>Lifecycle Demo Scenarios</h3>
        </div>
        <div style={styles.loading}>Loading scenarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>Lifecycle Demo Scenarios</h3>
        </div>
        <div style={styles.error}>Error: {error}</div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div style={styles.container} data-test-id="lifecycle-deep-links">
      <div
        style={styles.header}
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
      >
        <div style={styles.headerLeft}>
          <h3 style={styles.title}>
            Lifecycle Demo Scenarios
            <span style={styles.expandIcon}>{expanded ? "▼" : "▶"}</span>
          </h3>
          <span style={styles.subtitle}>
            Deep links to members in each lifecycle state
          </span>
        </div>
        <div style={styles.badge}>
          {data.summary.available}/{data.summary.total} available
        </div>
      </div>

      {expanded && (
        <div style={styles.content}>
          <p style={styles.intro}>
            Click any scenario to jump directly to a member demonstrating that lifecycle state.
            The lifecycle explainer panel will show how the state was determined.
          </p>

          <div style={styles.grid}>
            {data.scenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>

          {data.summary.missing > 0 && (
            <div style={styles.missingNote}>
              <strong>Note:</strong> {data.summary.missing} scenario(s) have no matching
              members in the database. Run the WA sync or seed script to populate demo data.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ScenarioCard({ scenario }: { scenario: Scenario }) {
  const colors = STATE_COLORS[scenario.state] ?? STATE_COLORS.unknown;
  const isAvailable = scenario.member !== null;

  return (
    <div
      style={{
        ...styles.card,
        borderLeftColor: colors.border,
        opacity: isAvailable ? 1 : 0.6,
      }}
      data-test-id={`scenario-${scenario.id}`}
    >
      <div style={styles.cardHeader}>
        <span
          style={{
            ...styles.stateBadge,
            backgroundColor: colors.bg,
            color: colors.text,
          }}
        >
          {scenario.label}
        </span>
      </div>

      <p style={styles.cardDescription}>{scenario.description}</p>

      {scenario.member ? (
        <div style={styles.memberInfo}>
          <div style={styles.memberName}>{scenario.member.name}</div>
          <div style={styles.memberMeta}>
            {scenario.member.status}
            {scenario.member.tier && ` · ${scenario.member.tier}`}
            {" · "}
            {scenario.member.daysSinceJoin} days since join
          </div>
        </div>
      ) : (
        <div style={styles.noMember}>No matching member found</div>
      )}

      <div style={styles.cardFooter}>
        <div style={styles.demoNotes}>{scenario.demoNotes}</div>
        {scenario.deepLink && (
          <Link href={scenario.deepLink} style={styles.deepLink}>
            View Member →
          </Link>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: "24px",
    border: "2px solid #6366f1",
    borderRadius: "8px",
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    backgroundColor: "#eef2ff",
    cursor: "pointer",
    userSelect: "none",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  title: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 600,
    color: "#4338ca",
  },
  expandIcon: {
    marginLeft: "8px",
    fontSize: "12px",
    color: "#6366f1",
  },
  subtitle: {
    fontSize: "13px",
    color: "#6366f1",
  },
  badge: {
    padding: "4px 12px",
    backgroundColor: "#c7d2fe",
    color: "#4338ca",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: 500,
  },
  content: {
    padding: "20px",
  },
  intro: {
    margin: "0 0 16px 0",
    fontSize: "14px",
    color: "#666",
    lineHeight: 1.5,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px",
  },
  card: {
    padding: "16px",
    backgroundColor: "#fafafa",
    borderRadius: "8px",
    borderLeft: "4px solid #ddd",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stateBadge: {
    padding: "4px 10px",
    borderRadius: "4px",
    fontSize: "13px",
    fontWeight: 500,
  },
  cardDescription: {
    margin: 0,
    fontSize: "13px",
    color: "#666",
  },
  memberInfo: {
    padding: "8px 12px",
    backgroundColor: "#fff",
    borderRadius: "4px",
    border: "1px solid #e5e7eb",
  },
  memberName: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#333",
  },
  memberMeta: {
    fontSize: "12px",
    color: "#666",
    marginTop: "2px",
  },
  noMember: {
    padding: "8px 12px",
    backgroundColor: "#f8f8f8",
    borderRadius: "4px",
    fontSize: "13px",
    color: "#999",
    fontStyle: "italic",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: "auto",
  },
  demoNotes: {
    fontSize: "12px",
    color: "#888",
    fontStyle: "italic",
    flex: 1,
  },
  deepLink: {
    fontSize: "13px",
    color: "#4338ca",
    textDecoration: "none",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  missingNote: {
    marginTop: "16px",
    padding: "12px",
    backgroundColor: "#fff7ed",
    borderRadius: "4px",
    fontSize: "13px",
    color: "#9a3412",
  },
  loading: {
    padding: "20px",
    textAlign: "center",
    color: "#666",
  },
  error: {
    padding: "20px",
    color: "#c62828",
    backgroundColor: "#ffebee",
  },
};
