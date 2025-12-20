/**
 * MySBNCContent - Client component for My SBNC page content
 *
 * Renders the two-column layout with role-aware gadgets.
 * This is a client component to handle interactive elements.
 *
 * Features:
 * - Profile data fetched and shared with child components
 * - Role-aware officer gadgets
 *
 * Copyright (c) Santa Barbara Newcomers Club
 */

"use client";

import { useState, useEffect } from "react";
import { TwoColumnStripe } from "@/components/stripes";
import {
  MyNextThingsCard,
  MyRolesCard,
  MembershipStatusCard,
  MyProfileCard,
  PhotoStreamCard,
  ClubNewsCard,
  OfficerGadgetSelector,
} from "@/components/home";
import type { GlobalRole } from "@/lib/auth";
import type { ProfileResponse } from "@/lib/profile";

interface MySBNCContentProps {
  effectiveRole: GlobalRole;
}

export function MySBNCContent({ effectiveRole }: MySBNCContentProps) {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const showOfficerGadgets = effectiveRole !== "member";

  // Fetch profile on mount for child components
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/v1/me/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
        }
      } catch {
        // Silent fail - cards will use defaults
      }
    }
    fetchProfile();
  }, []);

  return (
    <TwoColumnStripe
      testId="my-sbnc-content"
      padding="md"
      ratio="equal"
      gap="lg"
      left={
        <>
          {/* Utility Column - Dense, actionable content */}
          <MyProfileCard
            firstName={profile?.firstName}
            lastName={profile?.lastName}
            email={profile?.email}
            membershipStatus={profile?.membershipStatus?.label}
            membershipTier={profile?.membershipTier?.name}
            memberSince={profile?.memberSince}
          />
          <MyNextThingsCard />
          <MembershipStatusCard />

          {/* Role card only if user has a role */}
          {showOfficerGadgets && <MyRolesCard role={effectiveRole} />}

          {/* Role-specific officer gadget */}
          {showOfficerGadgets && <OfficerGadgetSelector role={effectiveRole} />}
        </>
      }
      right={
        <>
          {/* Curated Column - Social, engaging content */}
          <PhotoStreamCard />
          <ClubNewsCard />

          {/* Committees section (placeholder) */}
          <CommitteesCard />
        </>
      }
    />
  );
}

// ============================================================================
// Committees Card - Shows member's committee memberships
// ============================================================================

interface CommitteeFromAPI {
  id: string;
  committeeName: string;
  roleName: string;
  isActive: boolean;
}

function CommitteesCard() {
  const [committees, setCommittees] = useState<CommitteeFromAPI[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCommittees() {
      try {
        const response = await fetch("/api/v1/me/committees");
        if (response.status === 401) {
          setCommittees([]);
          return;
        }
        if (!response.ok) throw new Error("Failed to load");
        const data = await response.json();
        setCommittees(data.committees || []);
      } catch {
        setCommittees([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCommittees();
  }, []);

  return (
    <div
      data-test-id="committees-card"
      style={{
        backgroundColor: "var(--token-color-surface)",
        border: "1px solid var(--token-color-border)",
        borderRadius: "var(--token-radius-lg)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "var(--token-space-md)",
          borderBottom: "1px solid var(--token-color-border)",
        }}
      >
        <h2
          style={{
            fontSize: "var(--token-text-lg)",
            fontWeight: "var(--token-weight-semibold)",
            color: "var(--token-color-text)",
            margin: 0,
          }}
        >
          My Committees
        </h2>
      </div>
      <div style={{ padding: "var(--token-space-md)" }}>
        {loading ? (
          <p style={{ color: "var(--token-color-text-muted)", margin: 0 }}>
            Loading...
          </p>
        ) : committees.length === 0 ? (
          <p
            style={{
              color: "var(--token-color-text-muted)",
              fontStyle: "italic",
              margin: 0,
              textAlign: "center",
            }}
          >
            Not a member of any committees yet
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--token-space-sm)",
            }}
          >
            {committees.map((committee) => (
              <div
                key={committee.id}
                data-test-id={`committee-${committee.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "var(--token-space-sm)",
                  padding: "var(--token-space-sm)",
                  backgroundColor: "var(--token-color-surface-2)",
                  borderRadius: "var(--token-radius-lg)",
                }}
              >
                <span style={{ fontWeight: 500 }}>{committee.committeeName}</span>
                <span
                  style={{
                    fontSize: "var(--token-text-xs)",
                    color: "var(--token-color-text-muted)",
                  }}
                >
                  {committee.roleName}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
