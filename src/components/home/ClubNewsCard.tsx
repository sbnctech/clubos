/**
 * ClubNewsCard - Shows recent club announcements
 *
 * Displays club news and announcements.
 * Part of the "My SBNC" member home page curated column.
 *
 * Copyright (c) Santa Barbara Newcomers Club
 */

"use client";

import Link from "next/link";
import SectionCard from "@/components/layout/SectionCard";

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category?: string;
}

// Demo news - would come from CMS/API in production
const DEMO_NEWS: NewsItem[] = [
  {
    id: "1",
    title: "Welcome New Members!",
    excerpt: "We welcomed 12 new members at our January orientation...",
    date: "Jan 10, 2025",
    category: "Membership",
  },
  {
    id: "2",
    title: "Spring Activity Schedule Released",
    excerpt: "Check out the exciting lineup of activities for spring 2025...",
    date: "Jan 5, 2025",
    category: "Activities",
  },
];

export default function ClubNewsCard() {
  return (
    <SectionCard
      title="Club News"
      testId="club-news-card"
      headerActions={
        <Link
          href="/member/news"
          style={{
            fontSize: "var(--token-text-sm)",
            color: "var(--token-color-primary)",
            textDecoration: "none",
          }}
        >
          View All
        </Link>
      }
    >
      {DEMO_NEWS.length === 0 ? (
        <p
          style={{
            color: "var(--token-color-text-muted)",
            fontStyle: "italic",
          }}
        >
          No news at this time.
        </p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--token-space-md)",
          }}
        >
          {DEMO_NEWS.map((item) => (
            <article
              key={item.id}
              data-test-id={`news-item-${item.id}`}
              style={{
                paddingBottom: "var(--token-space-md)",
                borderBottom: "1px solid var(--token-color-border)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--token-space-sm)",
                  marginBottom: "var(--token-space-xs)",
                }}
              >
                {item.category && (
                  <span
                    style={{
                      fontSize: "var(--token-text-xs)",
                      textTransform: "uppercase",
                      color: "var(--token-color-primary)",
                      fontWeight: 600,
                    }}
                  >
                    {item.category}
                  </span>
                )}
                <span
                  style={{
                    fontSize: "var(--token-text-xs)",
                    color: "var(--token-color-text-muted)",
                  }}
                >
                  {item.date}
                </span>
              </div>
              <h3
                style={{
                  fontSize: "var(--token-text-base)",
                  fontWeight: 600,
                  color: "var(--token-color-text)",
                  marginTop: 0,
                  marginBottom: "var(--token-space-xs)",
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontSize: "var(--token-text-sm)",
                  color: "var(--token-color-text-muted)",
                  margin: 0,
                  lineHeight: "var(--token-leading-normal)",
                }}
              >
                {item.excerpt}
              </p>
            </article>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
