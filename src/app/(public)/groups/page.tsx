/**
 * Public Activity Groups Directory
 *
 * Displays approved activity groups to prospective and current members.
 * Non-authenticated visitors can browse groups to see what's available.
 *
 * Charter: P6 (human-first language), P7 (observability)
 *
 * Copyright (c) Murmurant, Inc.
 */

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Activity Groups | Santa Barbara Newcomers Club",
  description:
    "Browse our activity groups - from hiking and wine tasting to book clubs and bridge. Find your community within our community.",
};

interface GroupWithMembers {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string | null;
  schedule: string | null;
  imageEmoji: string | null;
  members: Array<{
    role: string;
    member: {
      firstName: string;
      lastName: string;
    };
  }>;
}

function getCategoryColor(category: string | null): { bg: string; text: string } {
  switch (category) {
    case "Arts & Culture":
      return { bg: "bg-amber-100", text: "text-amber-800" };
    case "Outdoor":
      return { bg: "bg-green-100", text: "text-green-800" };
    case "Social":
      return { bg: "bg-blue-100", text: "text-blue-800" };
    case "Games":
      return { bg: "bg-indigo-100", text: "text-indigo-800" };
    case "Hobbies":
      return { bg: "bg-pink-100", text: "text-pink-800" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-800" };
  }
}

export default async function PublicGroupsPage() {
  // Fetch approved, public groups
  const groups = await prisma.activityGroup.findMany({
    where: {
      status: "APPROVED",
      isPublic: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      category: true,
      schedule: true,
      imageEmoji: true,
      members: {
        where: { leftAt: null },
        select: {
          role: true,
          member: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  // Get unique categories for display
  const categories = [...new Set(groups.map((g) => g.category).filter(Boolean))].sort();

  return (
    <div data-theme="sbnc" className="min-h-screen bg-[var(--token-color-background)]">
      {/* Header */}
      <header className="bg-[var(--token-color-surface)] border-b border-[var(--token-color-border)] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--token-color-primary)] flex items-center justify-center">
              <span className="text-white font-bold text-lg">SB</span>
            </div>
            <div>
              <h1 className="font-semibold text-[var(--token-color-text)]">
                Santa Barbara Newcomers Club
              </h1>
              <p className="text-sm text-[var(--token-color-text-muted)]">Making friends since 1962</p>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/events"
              className="text-[var(--token-color-text-muted)] hover:text-[var(--token-color-text)]"
            >
              Events
            </Link>
            <Link
              href="/about"
              className="text-[var(--token-color-text-muted)] hover:text-[var(--token-color-text)]"
            >
              About
            </Link>
            <Link
              href="/join"
              className="px-4 py-2 bg-[var(--token-color-primary)] text-white rounded-lg font-medium hover:bg-[var(--token-color-primary-hover)]"
            >
              Join Us
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section
        data-test-id="groups-hero"
        className="bg-gradient-to-br from-[#1a365d] to-[#2c5282] text-white py-16 px-6"
      >
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Activity Groups</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Find your community within our community. From hiking trails to book discussions,
            there&apos;s a group for every interest.
          </p>
        </div>
      </section>

      {/* Groups List */}
      <section data-test-id="groups-list" className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          {groups.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🌟</div>
              <h2 className="text-2xl font-semibold text-[var(--token-color-text)] mb-2">
                Groups Coming Soon
              </h2>
              <p className="text-[var(--token-color-text-muted)] max-w-md mx-auto">
                We&apos;re setting up our activity groups. Join the club to be the first to know
                when they&apos;re available!
              </p>
              <Link
                href="/join"
                className="inline-block mt-6 px-6 py-3 bg-[var(--token-color-primary)] text-white font-medium rounded-lg hover:bg-[var(--token-color-primary-hover)]"
              >
                Become a Member
              </Link>
            </div>
          ) : (
            <>
              {/* Category Summary */}
              {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8 justify-center">
                  {categories.map((cat) => {
                    const colors = getCategoryColor(cat);
                    const count = groups.filter((g) => g.category === cat).length;
                    return (
                      <span
                        key={cat}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}
                      >
                        {cat} ({count})
                      </span>
                    );
                  })}
                </div>
              )}

              <div className="text-center text-[var(--token-color-text-muted)] mb-8">
                {groups.length} active group{groups.length !== 1 ? "s" : ""}
              </div>

              {/* Groups Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(groups as GroupWithMembers[]).map((group) => {
                  const coordinator = group.members.find((m) => m.role === "COORDINATOR");
                  const memberCount = group.members.length;
                  const colors = getCategoryColor(group.category);

                  return (
                    <div
                      key={group.id}
                      data-test-id={`group-card-${group.slug}`}
                      className="bg-[var(--token-color-surface)] rounded-xl border border-[var(--token-color-border)] overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                          <span className="text-3xl">{group.imageEmoji || "👥"}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg text-[var(--token-color-text)] truncate">
                              {group.name}
                            </h3>
                            {group.category && (
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${colors.bg} ${colors.text}`}
                              >
                                {group.category}
                              </span>
                            )}
                          </div>
                        </div>

                        {group.description && (
                          <p className="text-sm text-[var(--token-color-text-muted)] mb-4 line-clamp-3">
                            {group.description}
                          </p>
                        )}

                        <div className="space-y-2 text-sm">
                          {group.schedule && (
                            <div className="flex items-center gap-2 text-[var(--token-color-text-muted)]">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span>{group.schedule}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-[var(--token-color-text-muted)]">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span>{memberCount} member{memberCount !== 1 ? "s" : ""}</span>
                          </div>
                          {coordinator && (
                            <div className="flex items-center gap-2 text-[var(--token-color-text-muted)]">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              <span>
                                {coordinator.member.firstName} {coordinator.member.lastName}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Join CTA */}
      <section className="py-16 px-6 bg-[var(--token-color-primary)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Want to Join a Group?</h2>
          <p className="text-xl text-white/90 mb-8">
            Become a member to join any of our activity groups and connect with others who share
            your interests.
          </p>
          <Link
            href="/join"
            data-test-id="groups-join-cta"
            className="inline-block px-8 py-4 bg-white text-[var(--token-color-primary)] font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            Become a Member
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--token-color-border)] bg-[var(--token-color-surface)] py-8 px-6">
        <div className="max-w-5xl mx-auto text-center text-sm text-[var(--token-color-text-muted)]">
          <p>&copy; {new Date().getFullYear()} Santa Barbara Newcomers Club. All rights reserved.</p>
          <p className="mt-2">Making friends since 1962</p>
        </div>
      </footer>
    </div>
  );
}
