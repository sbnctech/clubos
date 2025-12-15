"use client";
import { useEffect, useState } from "react";

const FEATURE_ENABLED = typeof window !== "undefined" && (process.env.NEXT_PUBLIC_FEATURE_KPI_PANEL === "1" || process.env.NODE_ENV === "development");

type KpiStatus = "green" | "yellow" | "red";
type KpiCategory = "membership" | "events" | "finance" | "operations";
type KpiRole = "admin" | "vp" | "treasurer" | "board" | "all";

type Kpi = {
  id: string;
  label: string;
  value: string | number;
  status: KpiStatus;
  category: KpiCategory;
  roleVisibility: KpiRole[];
  detail?: string;
};

type PanelState =
  | { status: "disabled" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "loaded"; kpis: Kpi[]; generatedAt: string };

const CATEGORY_LABELS: Record<KpiCategory, string> = {
  membership: "Membership",
  events: "Events",
  finance: "Finance",
  operations: "Operations",
};

const STATUS_COLORS: Record<KpiStatus, { bg: string; text: string; border: string }> = {
  green: { bg: "#e8f5e9", text: "#2e7d32", border: "#a5d6a7" },
  yellow: { bg: "#fff8e1", text: "#f57f17", border: "#ffe082" },
  red: { bg: "#ffebee", text: "#c62828", border: "#ef9a9a" },
};

const ROLE_OPTIONS: { value: KpiRole | "auto"; label: string }[] = [
  { value: "auto", label: "Auto (by role)" },
  { value: "all", label: "All Roles" },
  { value: "admin", label: "Admin" },
  { value: "vp", label: "VP" },
  { value: "treasurer", label: "Treasurer" },
  { value: "board", label: "Board" },
];

export default function OrganizationalHealthPanel() {
  const initialState: PanelState = FEATURE_ENABLED ? { status: "loading" } : { status: "disabled" };
  const [state, setState] = useState<PanelState>(initialState);
  const [showGreen, setShowGreen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<KpiRole | "auto">("auto");

  useEffect(() => {
    if (!FEATURE_ENABLED) return;
    fetch("/api/v1/admin/kpis")
      .then(async (res) => {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then((data) => {
        setState({ status: "loaded", kpis: data.kpis ?? [], generatedAt: data.generatedAt ?? "" });
      })
      .catch((err) => {
        setState({ status: "error", message: err instanceof Error ? err.message : "Unknown error" });
      });
  }, []);

  if (state.status === "disabled") return null;

  if (state.status === "loading") {
    return (
      <div data-test-id="org-health-panel-loading" style={{ padding: "16px", color: "#666", fontStyle: "italic" }}>
        Loading organizational health...
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div data-test-id="org-health-panel-error" style={{ padding: "16px", backgroundColor: "#fff3e0", border: "1px solid #ffcc80", borderRadius: "4px", color: "#e65100" }}>
        <strong>KPI Panel Unavailable</strong>
        <p style={{ margin: "8px 0 0 0", fontSize: "14px" }}>{state.message}</p>
      </div>
    );
  }

  const { kpis, generatedAt } = state;
  const effectiveRole = roleFilter === "auto" ? "all" : roleFilter;
  const filteredKpis = kpis.filter((k) => k.roleVisibility.includes("all") || k.roleVisibility.includes(effectiveRole));
  const visibleKpis = showGreen ? filteredKpis : filteredKpis.filter((k) => k.status !== "green");
  const grouped = visibleKpis.reduce<Record<KpiCategory, Kpi[]>>((acc, kpi) => {
    if (!acc[kpi.category]) acc[kpi.category] = [];
    acc[kpi.category].push(kpi);
    return acc;
  }, {} as Record<KpiCategory, Kpi[]>);
  const categories = Object.keys(grouped) as KpiCategory[];
  const redCount = filteredKpis.filter((k) => k.status === "red").length;
  const yellowCount = filteredKpis.filter((k) => k.status === "yellow").length;
  const greenCount = filteredKpis.filter((k) => k.status === "green").length;

  return (
    <div data-test-id="org-health-panel" style={{ backgroundColor: "#fafafa", border: "1px solid #e0e0e0", borderRadius: "8px", padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>Organizational Health</h3>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <select data-test-id="org-health-role-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as KpiRole | "auto")} style={{ padding: "4px 8px", fontSize: "12px", borderRadius: "4px", border: "1px solid #ccc" }}>
            {ROLE_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
          </select>
          <label style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
            <input type="checkbox" checked={showGreen} onChange={(e) => setShowGreen(e.target.checked)} data-test-id="org-health-show-green" />
            Show all
          </label>
        </div>
      </div>
      <div data-test-id="org-health-summary" style={{ display: "flex", gap: "16px", marginBottom: "16px", fontSize: "13px" }}>
        {redCount > 0 && <span style={{ color: STATUS_COLORS.red.text, fontWeight: 600 }}>{redCount} critical</span>}
        {yellowCount > 0 && <span style={{ color: STATUS_COLORS.yellow.text, fontWeight: 600 }}>{yellowCount} warning</span>}
        {greenCount > 0 && <span style={{ color: STATUS_COLORS.green.text }}>{greenCount} healthy</span>}
        {filteredKpis.length === 0 && <span style={{ color: "#999", fontStyle: "italic" }}>No KPIs available</span>}
      </div>
      {categories.length === 0 && !showGreen && filteredKpis.length > 0 && (
        <div style={{ padding: "12px", textAlign: "center", color: "#4caf50", fontSize: "14px" }}>All systems healthy. Toggle &quot;Show all&quot; to view details.</div>
      )}
      {categories.map((cat) => (
        <div key={cat} style={{ marginBottom: "12px" }}>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "13px", fontWeight: 600, color: "#555", textTransform: "uppercase", letterSpacing: "0.5px" }}>{CATEGORY_LABELS[cat]}</h4>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {grouped[cat].map((kpi) => (
              <div key={kpi.id} data-test-id={"kpi-tile-" + kpi.id} title={kpi.detail} style={{ backgroundColor: STATUS_COLORS[kpi.status].bg, border: "1px solid " + STATUS_COLORS[kpi.status].border, borderRadius: "6px", padding: "8px 12px", minWidth: "140px" }}>
                <div style={{ fontSize: "11px", color: "#666", marginBottom: "2px" }}>{kpi.label}</div>
                <div style={{ fontSize: "18px", fontWeight: 600, color: STATUS_COLORS[kpi.status].text }}>{kpi.value}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {generatedAt && (<div style={{ marginTop: "12px", fontSize: "11px", color: "#999", textAlign: "right" }}>Updated: {new Date(generatedAt).toLocaleString()}</div>)}
    </div>
  );
}
