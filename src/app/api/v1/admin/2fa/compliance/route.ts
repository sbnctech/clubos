/**
 * GET /api/v1/admin/2fa/compliance
 *
 * Admin dashboard for 2FA compliance reporting.
 *
 * Shows:
 * - List of compliant users (with 2FA enabled)
 * - List of non-compliant users (requiring but not having 2FA)
 * - Overall compliance rate
 *
 * Charter Principles:
 * - P7: Observability - gives leadership visibility into security posture
 */

import { NextRequest, NextResponse } from "next/server";
import { requireCapability } from "@/lib/auth";
import { get2FAComplianceReport, get2FARequirementsSummary } from "@/lib/auth/2fa";

export async function GET(request: NextRequest) {
  // Require admin capability
  const auth = await requireCapability(request, "users:manage");
  if (!auth.ok) return auth.response;

  // Get compliance report
  const report = await get2FAComplianceReport();
  const requirements = get2FARequirementsSummary();

  return NextResponse.json({
    compliance: {
      totalRequiring: report.totalRequiring,
      compliantCount: report.compliant.length,
      nonCompliantCount: report.nonCompliant.length,
      complianceRate: Math.round(report.complianceRate * 100),
      complianceRatePercent: `${Math.round(report.complianceRate * 100)}%`,
    },
    compliantUsers: report.compliant.map((u) => ({
      memberId: u.memberId,
      email: u.email,
      enrolledAt: u.enrolledAt.toISOString(),
    })),
    nonCompliantUsers: report.nonCompliant.map((u) => ({
      memberId: u.memberId,
      email: u.email,
      role: u.role,
    })),
    roleRequirements: requirements.filter((r) => r.requires2FA).map((r) => ({
      role: r.role,
      requiringCapabilities: r.requiringCapabilities,
    })),
  });
}
