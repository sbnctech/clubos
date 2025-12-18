/**
 * MembershipStatusCard - Shows membership status and alerts
 *
 * Displays renewal status, expiration warnings, and quick actions.
 * Part of the "My SBNC" member home page utility column.
 *
 * Copyright (c) Santa Barbara Newcomers Club
 */

"use client";

import Link from "next/link";
import SectionCard from "@/components/layout/SectionCard";

type MembershipStatus = "active" | "expiring" | "expired" | "pending";

interface MembershipStatusCardProps {
  /** Current membership status */
  status?: MembershipStatus;
  /** Membership expiration date */
  expiresAt?: string;
  /** Member since date */
  memberSince?: string;
}

const statusConfig: Record<MembershipStatus, {
  label: string;
  color: string;
  bgColor: string;
}> = {
  active: {
    label: "Active",
    color: "var(--token-color-success)",
    bgColor: "#dcfce7",
  },
  expiring: {
    label: "Expiring Soon",
    color: "var(--token-color-warning)",
    bgColor: "#fef3c7",
  },
  expired: {
    label: "Expired",
    color: "var(--token-color-danger)",
    bgColor: "#fee2e2",
  },
  pending: {
    label: "Pending",
    color: "var(--token-color-text-muted)",
    bgColor: "#f3f4f6",
  },
};

export default function MembershipStatusCard({
  status = "active",
  expiresAt = "March 31, 2025",
  memberSince = "2022",
}: MembershipStatusCardProps) {
  const config = statusConfig[status];
  const showRenewButton = status === "expiring" || status === "expired";

  return (
    <SectionCard
      title="Membership"
      testId="membership-status-card"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--token-space-sm)" }}>
        {/* Status badge */}
        <div style={{ display: "flex", alignItems: "center", gap: "var(--token-space-sm)" }}>
          <span
            data-test-id="membership-status-badge"
            style={{
              display: "inline-block",
              padding: "2px 8px",
              backgroundColor: config.bgColor,
              color: config.color,
              borderRadius: "var(--token-radius-lg)",
              fontSize: "var(--token-text-sm)",
              fontWeight: 600,
            }}
          >
            {config.label}
          </span>
          <span
            style={{
              fontSize: "var(--token-text-sm)",
              color: "var(--token-color-text-muted)",
            }}
          >
            Member since {memberSince}
          </span>
        </div>

        {/* Expiration info */}
        <div
          style={{
            fontSize: "var(--token-text-sm)",
            color: status === "expiring" ? config.color : "var(--token-color-text-muted)",
          }}
        >
          {status === "expired" ? "Expired on" : "Expires"}: {expiresAt}
        </div>

        {/* Renew button */}
        {showRenewButton && (
          <Link
            href="/member/renew"
            data-test-id="membership-renew-button"
            style={{
              display: "inline-block",
              padding: "var(--token-space-xs) var(--token-space-md)",
              backgroundColor: "var(--token-color-primary)",
              color: "#fff",
              borderRadius: "var(--token-radius-lg)",
              fontSize: "var(--token-text-sm)",
              textDecoration: "none",
              textAlign: "center",
              marginTop: "var(--token-space-xs)",
            }}
          >
            Renew Membership
          </Link>
        )}
      </div>
    </SectionCard>
  );
}
