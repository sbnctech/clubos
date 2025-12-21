"use client";

/**
 * Demo Scenario Cards
 *
 * Shows quick-access cards for demo scenarios organized by category:
 * - Officer Roles (President, VP Activities, etc.)
 * - Lifecycle States (Active Newbie, Lapsed, etc.)
 * - Event States (Upcoming, Full, Draft, etc.)
 *
 * Each card links to a real entity in the database for demonstration.
 */

import { useState, useEffect } from "react";
import Link from "next/link";

// ============================================================================
// Types
// ============================================================================

type LifecycleScenario = {
  category: "lifecycle";
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

type RoleScenario = {
  category: "role";
  id: string;
  role: string;
  label: string;
  description: string;
  member: {
    id: string;
    name: string;
    email: string;
    committee: string;
    roleTitle: string;
  } | null;
  deepLink: string | null;
  demoNotes: string;
};

type EventScenario = {
  category: "event";
  id: string;
  eventState: string;
  label: string;
  description: string;
  event: {
    id: string;
    title: string;
    category: string | null;
    startTime: string;
    isPublished: boolean;
    capacity: number | null;
    registrationCount: number;
    waitlistCount: number;
  } | null;
  deepLink: string | null;
  demoNotes: string;
};

type Scenario = LifecycleScenario | RoleScenario | EventScenario;

type ScenariosResponse = {
  scenarios: Scenario[];
  summary: {
    total: number;
    available: number;
    missing: number;
    byCategory: {
      lifecycle: { total: number; available: number };
      role: { total: number; available: number };
      event: { total: number; available: number };
    };
  };
};

// ============================================================================
// Color Schemes
// ============================================================================

const LIFECYCLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  active_newbie: { bg: "#e8f5e9", text: "#2e7d32", border: "#4caf50" },
  active_member: { bg: "#e3f2fd", text: "#1565c0", border: "#2196f3" },
  active_extended: { bg: "#f3e5f5", text: "#7b1fa2", border: "#9c27b0" },
  offer_extended: { bg: "#fff3e0", text: "#e65100", border: "#ff9800" },
  pending_new: { bg: "#fff8e1", text: "#f57f17", border: "#ffc107" },
  lapsed: { bg: "#fafafa", text: "#616161", border: "#9e9e9e" },
  suspended: { bg: "#ffebee", text: "#c62828", border: "#f44336" },
  unknown: { bg: "#fce4ec", text: "#ad1457", border: "#e91e63" },
};

const ROLE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  president: { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
  "vp-activities": { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
  secretary: { bg: "#fae8ff", text: "#86198f", border: "#d946ef" },
  parliamentarian: { bg: "#fef2f2", text: "#991b1b", border: "#ef4444" },
  "event-chair": { bg: "#dcfce7", text: "#166534", border: "#22c55e" },
  webmaster: { bg: "#e0e7ff", text: "#3730a3", border: "#6366f1" },
};

const EVENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  upcoming_open: { bg: "#d1fae5", text: "#065f46", border: "#10b981" },
  upcoming_full: { bg: "#fef3c7", text: "#92400e", border: "#f59e0b" },
  past_completed: { bg: "#e5e7eb", text: "#374151", border: "#6b7280" },
  draft_unpublished: { bg: "#fef2f2", text: "#991b1b", border: "#ef4444" },
  unlimited_capacity: { bg: "#dbeafe", text: "#1e40af", border: "#3b82f6" },
};

// ============================================================================
// Component
// ============================================================================

export default function DemoScenarioCards() {
  const [data, setData] = useState<ScenariosResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    roles: true,
    lifecycle: true,
    events: true,
  });

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

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Demo Scenarios</h2>
        </div>
        <div style={styles.loading}>Loading scenarios...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Demo Scenarios</h2>
        </div>
        <div style={styles.error}>Error: {error}</div>
      </div>
    );
  }

  if (!data) return null;

  // Group scenarios by category
  const roleScenarios = data.scenarios.filter(
    (s): s is RoleScenario => s.category === "role"
  );
  const lifecycleScenarios = data.scenarios.filter(
    (s): s is LifecycleScenario => s.category === "lifecycle"
  );
  const eventScenarios = data.scenarios.filter(
    (s): s is EventScenario => s.category === "event"
  );

  return (
    <div style={styles.container} data-test-id="demo-scenario-cards">
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Demo Scenarios</h2>
          <p style={styles.subtitle}>
            Click any card to jump directly to a demo entity
          </p>
        </div>
        <div style={styles.summaryBadge}>
          {data.summary.available}/{data.summary.total} available
        </div>
      </div>

      {/* Seed Script Notice */}
      {data.summary.missing > 0 && (
        <div style={styles.seedNotice}>
          <strong>Missing {data.summary.missing} scenarios.</strong> Run the seed script:
          <code style={styles.seedCommand}>
            npx tsx scripts/demo/seed_demo_scenarios.ts
          </code>
        </div>
      )}

      {/* Officer Roles Section */}
      <ScenarioSection
        title="Officer Roles"
        subtitle="Demo members with specific club roles"
        expanded={expandedSections.roles}
        onToggle={() => toggleSection("roles")}
        count={`${data.summary.byCategory.role.available}/${data.summary.byCategory.role.total}`}
        accentColor="#6366f1"
      >
        <div style={styles.grid}>
          {roleScenarios.map((scenario) => (
            <RoleCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      </ScenarioSection>

      {/* Lifecycle States Section */}
      <ScenarioSection
        title="Lifecycle States"
        subtitle="Members demonstrating each lifecycle state"
        expanded={expandedSections.lifecycle}
        onToggle={() => toggleSection("lifecycle")}
        count={`${data.summary.byCategory.lifecycle.available}/${data.summary.byCategory.lifecycle.total}`}
        accentColor="#10b981"
      >
        <div style={styles.grid}>
          {lifecycleScenarios.map((scenario) => (
            <LifecycleCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      </ScenarioSection>

      {/* Event States Section */}
      <ScenarioSection
        title="Event States"
        subtitle="Events in different states for demo"
        expanded={expandedSections.events}
        onToggle={() => toggleSection("events")}
        count={`${data.summary.byCategory.event.available}/${data.summary.byCategory.event.total}`}
        accentColor="#f59e0b"
      >
        <div style={styles.grid}>
          {eventScenarios.map((scenario) => (
            <EventCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      </ScenarioSection>
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

function ScenarioSection({
  title,
  subtitle,
  expanded,
  onToggle,
  count,
  accentColor,
  children,
}: {
  title: string;
  subtitle: string;
  expanded: boolean;
  onToggle: () => void;
  count: string;
  accentColor: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ ...styles.section, borderLeftColor: accentColor }}>
      <div
        style={styles.sectionHeader}
        onClick={onToggle}
        role="button"
        tabIndex={0}
      >
        <div>
          <h3 style={styles.sectionTitle}>
            {title}
            <span style={styles.expandIcon}>{expanded ? "▼" : "▶"}</span>
          </h3>
          <span style={styles.sectionSubtitle}>{subtitle}</span>
        </div>
        <span style={{ ...styles.countBadge, backgroundColor: accentColor }}>
          {count}
        </span>
      </div>
      {expanded && <div style={styles.sectionContent}>{children}</div>}
    </div>
  );
}

function RoleCard({ scenario }: { scenario: RoleScenario }) {
  const colors = ROLE_COLORS[scenario.role] ?? { bg: "#f5f5f5", text: "#666", border: "#ccc" };
  const isAvailable = scenario.member !== null;

  return (
    <div
      style={{
        ...styles.card,
        borderLeftColor: colors.border,
        opacity: isAvailable ? 1 : 0.5,
      }}
      data-test-id={`scenario-${scenario.id}`}
    >
      <div style={styles.cardHeader}>
        <span
          style={{
            ...styles.badge,
            backgroundColor: colors.bg,
            color: colors.text,
          }}
        >
          {scenario.label}
        </span>
      </div>

      <p style={styles.cardDescription}>{scenario.description}</p>

      {scenario.member ? (
        <div style={styles.entityInfo}>
          <div style={styles.entityName}>{scenario.member.name}</div>
          <div style={styles.entityMeta}>
            {scenario.member.committee} &middot; {scenario.member.roleTitle}
          </div>
        </div>
      ) : (
        <div style={styles.noEntity}>No demo member found</div>
      )}

      <div style={styles.cardFooter}>
        <span style={styles.demoNotes}>{scenario.demoNotes}</span>
        {scenario.deepLink && (
          <Link href={scenario.deepLink} style={styles.deepLink}>
            View &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}

function LifecycleCard({ scenario }: { scenario: LifecycleScenario }) {
  const colors = LIFECYCLE_COLORS[scenario.state] ?? LIFECYCLE_COLORS.unknown;
  const isAvailable = scenario.member !== null;

  return (
    <div
      style={{
        ...styles.card,
        borderLeftColor: colors.border,
        opacity: isAvailable ? 1 : 0.5,
      }}
      data-test-id={`scenario-${scenario.id}`}
    >
      <div style={styles.cardHeader}>
        <span
          style={{
            ...styles.badge,
            backgroundColor: colors.bg,
            color: colors.text,
          }}
        >
          {scenario.label}
        </span>
      </div>

      <p style={styles.cardDescription}>{scenario.description}</p>

      {scenario.member ? (
        <div style={styles.entityInfo}>
          <div style={styles.entityName}>{scenario.member.name}</div>
          <div style={styles.entityMeta}>
            {scenario.member.status}
            {scenario.member.tier && ` &middot; ${scenario.member.tier}`}
            {" &middot; "}
            {scenario.member.daysSinceJoin} days
          </div>
        </div>
      ) : (
        <div style={styles.noEntity}>No matching member</div>
      )}

      <div style={styles.cardFooter}>
        <span style={styles.demoNotes}>{scenario.demoNotes}</span>
        {scenario.deepLink && (
          <Link href={scenario.deepLink} style={styles.deepLink}>
            View &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}

function EventCard({ scenario }: { scenario: EventScenario }) {
  const colors = EVENT_COLORS[scenario.eventState] ?? { bg: "#f5f5f5", text: "#666", border: "#ccc" };
  const isAvailable = scenario.event !== null;

  return (
    <div
      style={{
        ...styles.card,
        borderLeftColor: colors.border,
        opacity: isAvailable ? 1 : 0.5,
      }}
      data-test-id={`scenario-${scenario.id}`}
    >
      <div style={styles.cardHeader}>
        <span
          style={{
            ...styles.badge,
            backgroundColor: colors.bg,
            color: colors.text,
          }}
        >
          {scenario.label}
        </span>
      </div>

      <p style={styles.cardDescription}>{scenario.description}</p>

      {scenario.event ? (
        <div style={styles.entityInfo}>
          <div style={styles.entityName}>{scenario.event.title}</div>
          <div style={styles.entityMeta}>
            {scenario.event.category ?? "General"}
            {scenario.event.capacity && (
              <>
                {" &middot; "}
                {scenario.event.registrationCount}/{scenario.event.capacity}
              </>
            )}
            {!scenario.event.isPublished && " &middot; DRAFT"}
          </div>
        </div>
      ) : (
        <div style={styles.noEntity}>No matching event</div>
      )}

      <div style={styles.cardFooter}>
        <span style={styles.demoNotes}>{scenario.demoNotes}</span>
        {scenario.deepLink && (
          <Link href={scenario.deepLink} style={styles.deepLink}>
            View &rarr;
          </Link>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: "32px",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    backgroundColor: "#fff",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
  },
  title: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 600,
    color: "#1f2937",
  },
  subtitle: {
    margin: "4px 0 0 0",
    fontSize: "14px",
    color: "#6b7280",
  },
  summaryBadge: {
    padding: "6px 14px",
    backgroundColor: "#e0e7ff",
    color: "#4338ca",
    borderRadius: "16px",
    fontSize: "14px",
    fontWeight: 500,
  },
  seedNotice: {
    margin: "16px 24px",
    padding: "12px 16px",
    backgroundColor: "#fef3c7",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#92400e",
  },
  seedCommand: {
    display: "block",
    marginTop: "8px",
    padding: "8px 12px",
    backgroundColor: "#fff",
    borderRadius: "4px",
    fontFamily: "monospace",
    fontSize: "12px",
  },
  section: {
    margin: "16px 24px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    borderLeft: "4px solid #6366f1",
    overflow: "hidden",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    backgroundColor: "#fafafa",
    cursor: "pointer",
    userSelect: "none",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 600,
    color: "#374151",
  },
  expandIcon: {
    marginLeft: "8px",
    fontSize: "11px",
    color: "#9ca3af",
  },
  sectionSubtitle: {
    fontSize: "12px",
    color: "#6b7280",
  },
  countBadge: {
    padding: "4px 10px",
    color: "#fff",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: 500,
  },
  sectionContent: {
    padding: "16px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "12px",
  },
  card: {
    padding: "14px",
    backgroundColor: "#fafafa",
    borderRadius: "8px",
    borderLeft: "4px solid #ddd",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badge: {
    padding: "4px 10px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: 500,
  },
  cardDescription: {
    margin: 0,
    fontSize: "12px",
    color: "#6b7280",
    lineHeight: 1.4,
  },
  entityInfo: {
    padding: "8px 10px",
    backgroundColor: "#fff",
    borderRadius: "4px",
    border: "1px solid #e5e7eb",
  },
  entityName: {
    fontSize: "13px",
    fontWeight: 500,
    color: "#374151",
  },
  entityMeta: {
    fontSize: "11px",
    color: "#6b7280",
    marginTop: "2px",
  },
  noEntity: {
    padding: "8px 10px",
    backgroundColor: "#f5f5f5",
    borderRadius: "4px",
    fontSize: "12px",
    color: "#9ca3af",
    fontStyle: "italic",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: "auto",
  },
  demoNotes: {
    fontSize: "11px",
    color: "#9ca3af",
    fontStyle: "italic",
    flex: 1,
  },
  deepLink: {
    fontSize: "12px",
    color: "#4338ca",
    textDecoration: "none",
    fontWeight: 500,
    whiteSpace: "nowrap",
  },
  loading: {
    padding: "40px",
    textAlign: "center",
    color: "#6b7280",
  },
  error: {
    padding: "20px",
    margin: "16px",
    color: "#c62828",
    backgroundColor: "#ffebee",
    borderRadius: "8px",
  },
};
