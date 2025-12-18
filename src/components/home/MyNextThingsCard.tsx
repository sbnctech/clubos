/**
 * MyNextThingsCard - Shows member's upcoming activities and deadlines
 *
 * Displays a prioritized list of what the member needs to do or attend.
 * Part of the "My SBNC" member home page utility column.
 *
 * Copyright (c) Santa Barbara Newcomers Club
 */

"use client";

import SectionCard from "@/components/layout/SectionCard";

interface NextThing {
  id: string;
  type: "event" | "renewal" | "action";
  title: string;
  date?: string;
  urgency: "normal" | "soon" | "urgent";
}

// Demo data - would come from API in production
const DEMO_NEXT_THINGS: NextThing[] = [
  {
    id: "1",
    type: "event",
    title: "Monthly Luncheon",
    date: "Jan 15, 2025",
    urgency: "soon",
  },
  {
    id: "2",
    type: "renewal",
    title: "Membership renewal due",
    date: "Feb 1, 2025",
    urgency: "normal",
  },
  {
    id: "3",
    type: "event",
    title: "Book Club Meeting",
    date: "Jan 22, 2025",
    urgency: "normal",
  },
];

const urgencyColors: Record<string, string> = {
  normal: "var(--token-color-text-muted)",
  soon: "var(--token-color-warning)",
  urgent: "var(--token-color-danger)",
};

const typeIcons: Record<string, string> = {
  event: "\u{1F4C5}", // calendar
  renewal: "\u{1F4B3}", // credit card
  action: "\u{2705}", // check mark
};

export default function MyNextThingsCard() {
  return (
    <SectionCard
      title="My Next Things"
      testId="my-next-things-card"
    >
      {DEMO_NEXT_THINGS.length === 0 ? (
        <p
          style={{
            color: "var(--token-color-text-muted)",
            fontStyle: "italic",
          }}
        >
          Nothing coming up - enjoy your free time!
        </p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {DEMO_NEXT_THINGS.map((item) => (
            <li
              key={item.id}
              data-test-id={`next-thing-${item.id}`}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "var(--token-space-sm)",
                padding: "var(--token-space-sm) 0",
                borderBottom: "1px solid var(--token-color-border)",
              }}
            >
              <span style={{ fontSize: "1.2em" }}>{typeIcons[item.type]}</span>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontWeight: 500,
                    color: "var(--token-color-text)",
                  }}
                >
                  {item.title}
                </div>
                {item.date && (
                  <div
                    style={{
                      fontSize: "var(--token-text-sm)",
                      color: urgencyColors[item.urgency],
                    }}
                  >
                    {item.date}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
