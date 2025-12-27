// Copyright (c) Santa Barbara Newcomers Club
// Interest groups page - browse and join club interest groups

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { formatClubDateShort } from "@/lib/timezone";

interface InterestGroup {
  id: string;
  name: string;
  description: string;
  schedule: string;
  memberCount: number;
  coordinator: string;
  coordinatorEmail: string;
  category: string;
  nextMeeting?: string;
  imageEmoji: string;
}

interface GroupEvent {
  id: string;
  groupId: string;
  title: string;
  date: string;
  location: string;
}

// Mock interest groups data
const interestGroups: InterestGroup[] = [
  {
    id: "grp-book-club",
    name: "Book Club",
    description: "Monthly book discussions featuring fiction, non-fiction, and memoir. We read a diverse selection chosen by member vote each month.",
    schedule: "3rd Wednesday of each month, 2:00 PM",
    memberCount: 28,
    coordinator: "Margaret Thompson",
    coordinatorEmail: "margaret@example.com",
    category: "Arts & Culture",
    nextMeeting: "2025-01-15",
    imageEmoji: "📚",
  },
  {
    id: "grp-hiking",
    name: "Hiking Group",
    description: "Explore the beautiful trails of Santa Barbara County. Hikes range from easy walks to moderate challenges, with stunning coastal and mountain views.",
    schedule: "Every Saturday, 8:00 AM",
    memberCount: 45,
    coordinator: "Robert Chen",
    coordinatorEmail: "robert@example.com",
    category: "Outdoor",
    nextMeeting: "2025-01-04",
    imageEmoji: "🥾",
  },
  {
    id: "grp-wine",
    name: "Wine Enthusiasts",
    description: "Discover Santa Barbara's world-class wine region. Monthly tastings at local wineries, educational sessions, and wine-paired dinners.",
    schedule: "2nd Friday of each month, 4:00 PM",
    memberCount: 52,
    coordinator: "Susan Martinez",
    coordinatorEmail: "susan@example.com",
    category: "Social",
    nextMeeting: "2025-01-10",
    imageEmoji: "🍷",
  },
  {
    id: "grp-bridge",
    name: "Bridge Club",
    description: "Weekly bridge games for all skill levels. Beginners welcome - we offer lessons for newcomers to the game.",
    schedule: "Tuesdays and Thursdays, 1:00 PM",
    memberCount: 24,
    coordinator: "Eleanor Davis",
    coordinatorEmail: "eleanor@example.com",
    category: "Games",
    nextMeeting: "2024-12-31",
    imageEmoji: "🃏",
  },
  {
    id: "grp-garden",
    name: "Garden Club",
    description: "Share gardening tips, tour member gardens, and learn about plants that thrive in our Mediterranean climate.",
    schedule: "1st Thursday of each month, 10:00 AM",
    memberCount: 31,
    coordinator: "Patricia Wilson",
    coordinatorEmail: "patricia@example.com",
    category: "Hobbies",
    nextMeeting: "2025-01-02",
    imageEmoji: "🌻",
  },
  {
    id: "grp-photography",
    name: "Photography Club",
    description: "Capture the beauty of Santa Barbara through your lens. Monthly photo walks, technique workshops, and show-and-tell sessions.",
    schedule: "4th Saturday of each month, 9:00 AM",
    memberCount: 19,
    coordinator: "James Anderson",
    coordinatorEmail: "james@example.com",
    category: "Arts & Culture",
    nextMeeting: "2025-01-25",
    imageEmoji: "📷",
  },
  {
    id: "grp-golf",
    name: "Golf Group",
    description: "Weekly golf outings at various Santa Barbara area courses. All skill levels welcome, from beginners to experienced players.",
    schedule: "Wednesdays, 9:00 AM",
    memberCount: 36,
    coordinator: "William Taylor",
    coordinatorEmail: "william@example.com",
    category: "Outdoor",
    nextMeeting: "2025-01-01",
    imageEmoji: "⛳",
  },
  {
    id: "grp-crafts",
    name: "Arts & Crafts",
    description: "Creative sessions featuring various crafts including knitting, painting, jewelry making, and seasonal projects.",
    schedule: "Every Friday, 10:00 AM",
    memberCount: 22,
    coordinator: "Linda Brown",
    coordinatorEmail: "linda@example.com",
    category: "Hobbies",
    nextMeeting: "2025-01-03",
    imageEmoji: "🎨",
  },
];

// Mock upcoming group events
const groupEvents: GroupEvent[] = [
  {
    id: "ge-001",
    groupId: "grp-book-club",
    title: "January Book Discussion: 'The House in the Cerulean Sea'",
    date: "2025-01-15",
    location: "Community Center Room B",
  },
  {
    id: "ge-002",
    groupId: "grp-hiking",
    title: "New Year's Day Hike: Inspiration Point",
    date: "2025-01-01",
    location: "Tunnel Road Trailhead",
  },
  {
    id: "ge-003",
    groupId: "grp-wine",
    title: "Winery Tour: Sanford Winery",
    date: "2025-01-10",
    location: "Santa Rita Hills",
  },
];

// Mock user's joined groups
const initialJoinedGroups = ["grp-book-club", "grp-hiking", "grp-wine"];

function getCategoryColor(category: string): { bg: string; text: string } {
  switch (category) {
    case "Arts & Culture":
      return { bg: "#fef3c7", text: "#92400e" };
    case "Outdoor":
      return { bg: "#dcfce7", text: "#166534" };
    case "Social":
      return { bg: "#dbeafe", text: "#1e40af" };
    case "Games":
      return { bg: "#e0e7ff", text: "#3730a3" };
    case "Hobbies":
      return { bg: "#fce7f3", text: "#9d174d" };
    default:
      return { bg: "#f3f4f6", text: "#374151" };
  }
}

interface GroupCardProps {
  group: InterestGroup;
  isMember: boolean;
  onJoin: (groupId: string) => void;
  onLeave: (groupId: string) => void;
}

function GroupCard({ group, isMember, onJoin, onLeave }: GroupCardProps) {
  const categoryColor = getCategoryColor(group.category);

  return (
    <div
      data-test-id={`group-${group.id}`}
      style={{
        backgroundColor: "white",
        borderRadius: "8px",
        border: isMember ? "2px solid #2563eb" : "1px solid #e5e7eb",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "20px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "32px" }}>{group.imageEmoji}</span>
            <div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 600,
                  color: "#1f2937",
                  margin: 0,
                }}
              >
                {group.name}
              </h3>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 500,
                  backgroundColor: categoryColor.bg,
                  color: categoryColor.text,
                  padding: "2px 8px",
                  borderRadius: "12px",
                  display: "inline-block",
                  marginTop: "4px",
                }}
              >
                {group.category}
              </span>
            </div>
          </div>
          {isMember && (
            <span
              style={{
                fontSize: "12px",
                fontWeight: 600,
                backgroundColor: "#dbeafe",
                color: "#1e40af",
                padding: "4px 10px",
                borderRadius: "12px",
              }}
            >
              Member
            </span>
          )}
        </div>

        <p
          style={{
            fontSize: "14px",
            color: "#6b7280",
            margin: "0 0 16px 0",
            lineHeight: "1.6",
          }}
        >
          {group.description}
        </p>

        <div style={{ fontSize: "14px", color: "#374151", marginBottom: "12px" }}>
          <div style={{ marginBottom: "6px" }}>
            <strong>Schedule:</strong> {group.schedule}
          </div>
          <div style={{ marginBottom: "6px" }}>
            <strong>Members:</strong> {group.memberCount}
          </div>
          <div>
            <strong>Coordinator:</strong> {group.coordinator}
          </div>
        </div>

        {group.nextMeeting && (
          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "10px 12px",
              borderRadius: "6px",
              fontSize: "14px",
              marginBottom: "16px",
            }}
          >
            <strong>Next Meeting:</strong> {formatClubDateShort(new Date(group.nextMeeting))}
          </div>
        )}

        <div style={{ display: "flex", gap: "12px" }}>
          {isMember ? (
            <>
              <Link
                href={`/groups/${group.id}`}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "white",
                  backgroundColor: "#2563eb",
                  borderRadius: "6px",
                  textDecoration: "none",
                  display: "inline-block",
                }}
              >
                View Group
              </Link>
              <button
                type="button"
                onClick={() => onLeave(group.id)}
                data-test-id={`leave-${group.id}`}
                style={{
                  padding: "8px 16px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#dc2626",
                  backgroundColor: "white",
                  border: "1px solid #fecaca",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                Leave Group
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onJoin(group.id)}
              data-test-id={`join-${group.id}`}
              style={{
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: 500,
                color: "white",
                backgroundColor: "#16a34a",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Join Group
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InterestGroupsPage() {
  const [joinedGroups, setJoinedGroups] = useState<string[]>(initialJoinedGroups);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const cats = new Set(interestGroups.map((g) => g.category));
    return ["All", ...Array.from(cats).sort()];
  }, []);

  const filteredGroups = useMemo(() => {
    if (selectedCategory === "All") return interestGroups;
    return interestGroups.filter((g) => g.category === selectedCategory);
  }, [selectedCategory]);

  const myGroups = useMemo(() => {
    return interestGroups.filter((g) => joinedGroups.includes(g.id));
  }, [joinedGroups]);

  const myUpcomingEvents = useMemo(() => {
    return groupEvents
      .filter((e) => joinedGroups.includes(e.groupId))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [joinedGroups]);

  const handleJoin = (groupId: string) => {
    setJoinedGroups((prev) => [...prev, groupId]);
  };

  const handleLeave = (groupId: string) => {
    setJoinedGroups((prev) => prev.filter((id) => id !== groupId));
  };

  return (
    <div data-test-id="interest-groups-page" style={{ maxWidth: "1000px" }}>
      <h1
        style={{
          fontSize: "28px",
          fontWeight: 700,
          marginBottom: "8px",
          color: "#1f2937",
        }}
      >
        Interest Groups
      </h1>
      <p
        style={{
          fontSize: "16px",
          color: "#6b7280",
          marginBottom: "24px",
        }}
      >
        Join groups that match your interests and connect with fellow members
      </p>

      {/* Your Groups Section */}
      {myGroups.length > 0 && (
        <section data-test-id="your-groups-section" style={{ marginBottom: "32px" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: "#1f2937",
              marginBottom: "16px",
            }}
          >
            Your Groups ({myGroups.length})
          </h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            {myGroups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  backgroundColor: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "20px",
                  textDecoration: "none",
                  color: "#1e40af",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                <span>{group.imageEmoji}</span>
                {group.name}
              </Link>
            ))}
          </div>

          {/* Upcoming Events for Your Groups */}
          {myUpcomingEvents.length > 0 && (
            <div
              style={{
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                padding: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: "12px",
                }}
              >
                Upcoming Group Events
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {myUpcomingEvents.slice(0, 3).map((event) => {
                  const group = interestGroups.find((g) => g.id === event.groupId);
                  return (
                    <div
                      key={event.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: "white",
                        padding: "12px",
                        borderRadius: "6px",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 500, color: "#1f2937" }}>
                          {event.title}
                        </div>
                        <div style={{ fontSize: "13px", color: "#6b7280" }}>
                          {group?.name} - {event.location}
                        </div>
                      </div>
                      <div
                        style={{
                          fontSize: "13px",
                          fontWeight: 500,
                          color: "#2563eb",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatClubDateShort(new Date(event.date))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Category Filter */}
      <div style={{ marginBottom: "24px" }}>
        <label
          htmlFor="category-filter"
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            color: "#374151",
            marginBottom: "6px",
          }}
        >
          Filter by Category
        </label>
        <select
          id="category-filter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          data-test-id="group-category-filter"
          style={{
            padding: "8px 12px",
            fontSize: "14px",
            border: "1px solid #d1d5db",
            borderRadius: "6px",
            backgroundColor: "white",
            minWidth: "160px",
            cursor: "pointer",
          }}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Results Count */}
      <div
        style={{
          fontSize: "14px",
          color: "#6b7280",
          marginBottom: "16px",
        }}
      >
        Showing {filteredGroups.length} group{filteredGroups.length !== 1 ? "s" : ""}
      </div>

      {/* Groups Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(420px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        {filteredGroups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            isMember={joinedGroups.includes(group.id)}
            onJoin={handleJoin}
            onLeave={handleLeave}
          />
        ))}
      </div>

      {/* Information Box */}
      <div
        style={{
          padding: "16px",
          backgroundColor: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "8px",
        }}
      >
        <h4
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "#1e40af",
            margin: "0 0 8px 0",
          }}
        >
          About Interest Groups
        </h4>
        <p
          style={{
            fontSize: "14px",
            color: "#1e3a8a",
            margin: 0,
            lineHeight: "1.5",
          }}
        >
          Interest groups are a great way to pursue hobbies and activities with fellow club members.
          Join as many groups as you like! Each group has a coordinator who organizes meetings and events.
          Contact the coordinator if you have questions about a specific group.
        </p>
      </div>
    </div>
  );
}
