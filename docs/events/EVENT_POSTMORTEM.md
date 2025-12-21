# Event Postmortem System

**Status:** Implemented
**Charter Compliance:** P3 (explicit derived state), P7 (audit trail)

---

## Overview

The Event Postmortem system enables event chairs to capture institutional knowledge after events conclude. This document defines the completion criteria and explains how postmortem status is derived.

---

## Postmortem Completion Status

Each event's postmortem has a **derived completion status**. This status is computed server-side from the postmortem record fields, not stored separately.

### Status Values

| Status | Description | UI Badge | CTA Text |
|--------|-------------|----------|----------|
| `NOT_STARTED` | No postmortem record exists | Not started | Start post-mortem |
| `IN_PROGRESS` | Record exists but required fields missing | In progress | Complete post-mortem |
| `COMPLETE` | All required fields present | Complete | View post-mortem |

---

## Completion Criteria

A postmortem is considered **COMPLETE** when it has both:

1. **At least one retrospective note** (qualitative feedback for future chairs)
2. **At least one rating** (quantitative assessment for trend analysis)

### Required Fields (Conservative Minimal Set)

#### Retrospective Notes (at least one required)
- `whatWorked` — Things that went well
- `whatDidNot` — Things that didn't work
- `whatToChangeNextTime` — Recommendations for future chairs

**Note:** Empty strings and whitespace-only strings do not count as filled.

#### Ratings (at least one required)
- `attendanceRating` — How well attended? (1-5 scale)
- `logisticsRating` — How smooth was logistics? (1-5 scale)
- `satisfactionRating` — Perceived member satisfaction (1-5 scale)

**Note:** A rating is considered present if it is not `null`. The value `0` would technically count as present, but UI validation should enforce 1-5 range.

### Rationale

This minimal set ensures we capture:

1. **Qualitative feedback** — At least one lesson learned that future chairs can use
2. **Quantitative assessment** — At least one data point for trend analysis

We intentionally do not require all fields because:

- Some events may not have obvious failures to report
- Chairs should not be blocked by incomplete data
- Any feedback is better than no feedback

---

## Database Schema

```prisma
model EventPostmortem {
  id        String   @id @default(uuid()) @db.Uuid
  eventId   String   @unique @db.Uuid
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Preparation notes (optional, not part of completion criteria)
  setupNotes    String?
  contactsUsed  String?
  timelineNotes String?

  // Success ratings (1-5 scale, null = not rated)
  attendanceRating   Int?
  logisticsRating    Int?
  satisfactionRating Int?

  // Retrospective notes
  whatWorked           String?
  whatDidNot           String?
  whatToChangeNextTime String?

  // Access control
  internalOnly Boolean @default(true)

  // Workflow status (separate from completion)
  status     PostmortemStatus @default(DRAFT)
  approvedAt DateTime?
  approvedBy String?          @db.Uuid
  createdById String?         @db.Uuid

  // Relations
  event    Event   @relation(...)
  approver Member? @relation(...)
  createdBy Member? @relation(...)
}

enum PostmortemStatus {
  DRAFT      // Being edited by chair
  SUBMITTED  // Ready for VP review
  APPROVED   // Locked, VP approved
  UNLOCKED   // VP unlocked for further edits
}
```

---

## API Response

The Committee Chair Dashboard API (`GET /api/v1/officer/events/my-events`) returns events with derived postmortem fields:

```typescript
interface ChairEventSummary {
  // ... other event fields ...

  // Postmortem tracking (server-derived)
  postmortemCompletionStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE";
  postmortemStatusLabel: string;    // Human-readable: "Not started" | "In progress" | "Complete"
  postmortemCTAText: string;        // CTA text: "Start post-mortem" | "Complete post-mortem" | "View post-mortem"
  postmortemDbStatus: PostmortemStatus | null;  // Workflow status from DB
}
```

### Response Stats

The dashboard includes a summary stat for postmortems needing attention:

```typescript
stats: {
  totalChairingUpcoming: number;
  pendingApproval: number;
  postmortemsNeedingAttention: number;  // Past events where completion != COMPLETE
}
```

---

## Filtering

The API supports filtering to show only events with incomplete postmortems:

```
GET /api/v1/officer/events/my-events?filter=incomplete_postmortem
```

This returns only past events where `postmortemCompletionStatus !== "COMPLETE"`.

---

## Access Control

| Role | Can View Postmortem | Can Edit Postmortem |
|------|--------------------|--------------------|
| Event Chair (assigned) | Yes | Yes (own events) |
| VP Activities | Yes (all events) | Yes (all events) |
| President | Yes (all events) | No |
| Admin | Yes (all events) | Yes (all events) |
| Regular Member | No | No |

**Security Notes:**

- Postmortem content fields (`whatWorked`, `whatDidNot`, etc.) are NOT exposed in the dashboard API response
- Only the derived `postmortemCompletionStatus` is visible in listings
- Full postmortem content requires accessing the postmortem detail endpoint with proper authorization

---

## Implementation

### Utility Functions

Location: `src/lib/events/postmortem.ts`

```typescript
// Derive postmortem completion status
derivePostmortemStatus(postmortem): PostmortemCompletionStatus

// Check completion criteria breakdown
checkPostmortemCompletion(postmortem): PostmortemCompletionCriteria

// Get human-readable labels
getPostmortemStatusLabel(status): string
getPostmortemCTAText(status): string
```

### Tests

- **Unit tests:** `tests/unit/events/postmortem.spec.ts`
- **API tests:** `tests/api/v1/officer/my-events.spec.ts`

---

## Future Considerations

1. **Stricter completion criteria** — Could require specific fields (e.g., must have `whatToChangeNextTime`)
2. **Partial completion scoring** — Show 3/6 fields filled instead of binary status
3. **Reminder notifications** — Auto-email chairs when postmortem is overdue
4. **VP review workflow** — Require VP approval before postmortem is finalized

---

*Last updated: December 2025*
