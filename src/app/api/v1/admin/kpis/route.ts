import { NextRequest, NextResponse } from "next/server";
import { requireVPOrAdmin } from "@/lib/eventAuth";

export type KpiStatus = "green" | "yellow" | "red";
export type KpiCategory = "membership" | "events" | "finance" | "operations";
export type KpiRole = "admin" | "vp" | "treasurer" | "board" | "all";

export type Kpi = {
  id: string;
  label: string;
  value: string | number;
  status: KpiStatus;
  category: KpiCategory;
  roleVisibility: KpiRole[];
  detail?: string;
};

export type KpisResponse = {
  kpis: Kpi[];
  generatedAt: string;
};

export async function GET(req: NextRequest) {
  const auth = await requireVPOrAdmin(req);
  if (!auth.ok) return auth.response;

  const kpis: Kpi[] = [
    { id: "mem-active", label: "Active Members", value: 127, status: "green", category: "membership", roleVisibility: ["all"] },
    { id: "mem-pending-renewal", label: "Pending Renewals", value: 12, status: "yellow", category: "membership", roleVisibility: ["admin", "vp"], detail: "12 members due in next 30 days" },
    { id: "mem-lapsed", label: "Lapsed (30+ days)", value: 3, status: "red", category: "membership", roleVisibility: ["admin", "vp"], detail: "Requires outreach" },
    { id: "evt-upcoming", label: "Upcoming Events", value: 8, status: "green", category: "events", roleVisibility: ["all"] },
    { id: "evt-no-chair", label: "Events Without Chair", value: 2, status: "yellow", category: "events", roleVisibility: ["admin", "vp"], detail: "Wine Tasting, Book Club" },
    { id: "evt-low-registration", label: "Low Registration (<25%)", value: 1, status: "red", category: "events", roleVisibility: ["admin", "vp", "board"], detail: "Board Meeting - Feb 15" },
    { id: "fin-balance", label: "Account Balance", value: "$12,450", status: "green", category: "finance", roleVisibility: ["admin", "treasurer", "board"] },
    { id: "fin-outstanding", label: "Outstanding Invoices", value: 0, status: "green", category: "finance", roleVisibility: ["admin", "treasurer"] },
    { id: "fin-unreconciled", label: "Unreconciled Transactions", value: 4, status: "yellow", category: "finance", roleVisibility: ["admin", "treasurer"], detail: "Last sync: 3 days ago" },
    { id: "ops-email-queue", label: "Email Queue", value: 0, status: "green", category: "operations", roleVisibility: ["admin"] },
    { id: "ops-failed-jobs", label: "Failed Background Jobs", value: 0, status: "green", category: "operations", roleVisibility: ["admin"] },
    { id: "ops-db-health", label: "Database Health", value: "OK", status: "green", category: "operations", roleVisibility: ["admin"] },
  ];

  const response: KpisResponse = { kpis, generatedAt: new Date().toISOString() };
  return NextResponse.json(response);
}
