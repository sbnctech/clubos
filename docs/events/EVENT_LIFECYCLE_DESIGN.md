# Event Lifecycle & Ticket Tier Design

**Status:** Design Document
**Charter Compliance:** P3 (state machines over booleans), P7 (audit logging)

---

## Current State

The Event model currently uses:
- `isPublished: Boolean` - violates P3 (should be state machine)
- `capacity: Int?` - single capacity field

This design replaces the boolean with an explicit state machine and introduces ticket tiers for capacity management.

---

## Event Status Lifecycle

### States

```
enum EventStatus {
  DRAFT           // Initial creation, not visible to members
  PENDING_REVIEW  // Submitted for VP Activities approval
  APPROVED        // Approved but not yet visible (scheduling window)
  PUBLISHED       // Visible to members, registration open
  REGISTRATION_CLOSED // Past registration deadline, event not yet occurred
  COMPLETED       // Event occurred, pending chair wrap-up
  ARCHIVED        // Final state, read-only
  CANCELLED       // Cancelled before occurrence
}
```

### State Transitions

```
DRAFT → PENDING_REVIEW
  Trigger: Event chair submits for approval
  Required: Title, startTime, at least one ticket tier
  Audit: EVENT_SUBMITTED_FOR_REVIEW

PENDING_REVIEW → APPROVED
  Trigger: VP Activities approves
  Required: Approver has vp_activities or admin capability
  Audit: EVENT_APPROVED

PENDING_REVIEW → DRAFT
  Trigger: VP Activities requests changes
  Required: Reason provided
  Audit: EVENT_RETURNED_FOR_CHANGES

APPROVED → PUBLISHED
  Trigger: Automatic when publishAt date reached, or manual publish
  Audit: EVENT_PUBLISHED

PUBLISHED → REGISTRATION_CLOSED
  Trigger: Automatic when registrationDeadline reached
  Audit: EVENT_REGISTRATION_CLOSED

PUBLISHED → CANCELLED
  Trigger: Admin or VP Activities cancels
  Required: Reason, notification to registrants
  Audit: EVENT_CANCELLED

REGISTRATION_CLOSED → COMPLETED
  Trigger: Automatic when endTime passed
  Audit: EVENT_COMPLETED

COMPLETED → ARCHIVED
  Trigger: Chair submits wrap-up notes, or 30 days after completion
  Audit: EVENT_ARCHIVED

Any → CANCELLED (except ARCHIVED, COMPLETED)
  Trigger: Admin action with reason
  Audit: EVENT_CANCELLED
```

### Backward Compatibility

The `isPublished` field will be:
1. Kept as a derived/computed property (not stored)
2. True when status IN (PUBLISHED, REGISTRATION_CLOSED)
3. Existing queries continue to work during transition

---

## Ticket Tiers (Capacity per Tier)

### Rationale

Events often have multiple ticket types:
- Member rate vs Guest rate
- Early bird vs Regular
- Different meal options with different limits

Capacity is NOT a single number—it's the sum of available slots across tiers.

### Schema

```prisma
model TicketTier {
  id          String   @id @default(uuid()) @db.Uuid
  eventId     String   @db.Uuid
  name        String   // "Member", "Guest", "Early Bird"
  description String?
  priceCents  Int      @default(0) // 0 = free
  capacity    Int?     // null = unlimited
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  event         Event               @relation(fields: [eventId], references: [id], onDelete: Cascade)
  registrations EventRegistration[]

  @@index([eventId])
  @@index([eventId, isActive])
}
```

### Registration Changes

```prisma
model EventRegistration {
  // ... existing fields ...
  ticketTierId String? @db.Uuid  // NEW: Which tier they registered for

  ticketTier TicketTier? @relation(fields: [ticketTierId], references: [id])
}
```

### Capacity Calculation (Derived)

```typescript
function getEventCapacity(event: EventWithTiers): {
  total: number | null;      // null = unlimited
  registered: number;
  available: number | null;  // null = unlimited
  byTier: TierCapacity[];
} {
  const tiers = event.ticketTiers.filter(t => t.isActive);

  // If any tier is unlimited, total is unlimited
  const hasUnlimited = tiers.some(t => t.capacity === null);
  const total = hasUnlimited ? null : tiers.reduce((sum, t) => sum + (t.capacity ?? 0), 0);

  // Count registrations per tier
  const registered = event.registrations.filter(
    r => ['CONFIRMED', 'PENDING_PAYMENT', 'PENDING'].includes(r.status)
  ).length;

  return {
    total,
    registered,
    available: total === null ? null : Math.max(0, total - registered),
    byTier: tiers.map(t => ({
      tierId: t.id,
      tierName: t.name,
      capacity: t.capacity,
      registered: event.registrations.filter(r => r.ticketTierId === t.id).length,
      available: t.capacity === null ? null : Math.max(0, t.capacity - tierRegistered),
    })),
  };
}
```

### Migration Path

1. Events with existing `capacity` field get a default "General Admission" tier
2. `capacity` field on Event marked as deprecated
3. New events must use ticket tiers
4. Queries updated to use derived capacity

---

## Chair Notebook (Institutional Memory)

### Purpose

Event chairs need to record:
- Pre-event notes (venue contact, setup requirements)
- Post-event wrap-up (what worked, what didn't)
- Lessons for future chairs
- Handoff notes when cloning

### Schema

```prisma
model EventNote {
  id        String        @id @default(uuid()) @db.Uuid
  eventId   String        @db.Uuid
  authorId  String        @db.Uuid
  noteType  EventNoteType
  content   String        // Markdown supported
  isPrivate Boolean       @default(false) // Chair-only vs visible to admins
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  event  Event  @relation(fields: [eventId], references: [id], onDelete: Cascade)
  author Member @relation(fields: [authorId], references: [id])

  @@index([eventId])
  @@index([eventId, noteType])
}

enum EventNoteType {
  PLANNING      // Pre-event planning notes
  VENUE         // Venue-specific info (contact, access codes, etc.)
  WRAP_UP       // Post-event summary
  LESSON        // Lessons learned for future
  HANDOFF       // Notes for next chair when cloning
}
```

### Visibility Rules

- `isPrivate = true`: Only event chair and admins can see
- `isPrivate = false`: Visible to VP Activities and future event chairs
- Lessons and handoff notes are always copied when cloning an event

---

## Event Cloning

### What Gets Copied

| Field | Copied? | Notes |
|-------|---------|-------|
| title | Yes | With "(Copy)" suffix |
| description | Yes | |
| category | Yes | |
| location | Yes | |
| startTime | No | Must be set by user |
| endTime | No | Must be set by user |
| ticketTiers | Yes | All active tiers with same prices/capacities |
| eventChairId | No | Must be assigned |
| status | No | Always starts as DRAFT |
| notes (HANDOFF, LESSON) | Yes | Copied for reference |
| notes (PLANNING, VENUE, WRAP_UP) | No | Event-specific |
| registrations | No | Never copied |

### Safeguards

1. **Confirmation required**: "You are cloning [Event Name]. This creates a new draft event."
2. **No dates**: Clone has no dates—forces user to set them
3. **No chair**: Clone has no chair—forces assignment
4. **Audit logged**: EVENT_CLONED with source event ID
5. **Source link**: `clonedFromId` field tracks lineage

### Schema Addition

```prisma
model Event {
  // ... existing fields ...
  clonedFromId String? @db.Uuid
  clonedFrom   Event?  @relation("EventClones", fields: [clonedFromId], references: [id])
  clones       Event[] @relation("EventClones")
}
```

---

## Role Dashboard Requirements

### VP Activities Dashboard

Needs to see:
- Events pending review (PENDING_REVIEW status)
- Recently approved events (APPROVED status, last 7 days)
- Upcoming events missing chairs (no eventChairId, startTime in next 60 days)
- Events completed but not archived (COMPLETED status)

### Committee Chair Dashboard

Needs to see:
- My events (where eventChairId = me)
- Events I need to wrap up (COMPLETED, eventChairId = me)
- Upcoming events I'm chairing

### API Endpoints

```
GET /api/v1/officer/events/pending-review
GET /api/v1/officer/events/needing-chairs
GET /api/v1/officer/events/needing-wrapup
GET /api/v1/me/events/chairing
GET /api/v1/me/events/needing-wrapup
```

---

## Assumptions

1. **Refund policy is global**: Not modeled per-event. Handled at organization level.
2. **Single event chair**: One chair per event (not multiple co-chairs).
3. **Ticket tiers are additive**: Can add tiers to existing events, cannot remove tiers with registrations.
4. **Notes are append-only in spirit**: Can edit own notes, but deletions are audit-logged.
5. **Cloning is intentional**: Requires explicit user action, not automatic.

---

## Migration Strategy

### Phase 1: Schema Additions (Additive Only)
1. Add `EventStatus` enum
2. Add `status` field to Event (default: derives from isPublished)
3. Add `TicketTier` model
4. Add `EventNote` model
5. Add `clonedFromId` to Event

### Phase 2: Data Migration
1. Existing events: isPublished=true → status=PUBLISHED, else DRAFT
2. Existing events with capacity: Create default "General Admission" tier

### Phase 3: Code Updates
1. Update queries to use status instead of isPublished
2. Add ticket tier management UI
3. Add chair notebook UI
4. Add approval workflow

### Phase 4: Deprecation
1. Mark isPublished as deprecated (keep for backward compat)
2. Mark Event.capacity as deprecated
3. Remove in future major version

---

## Audit Actions to Add

```prisma
enum AuditAction {
  // ... existing ...
  EVENT_SUBMITTED_FOR_REVIEW
  EVENT_APPROVED
  EVENT_RETURNED_FOR_CHANGES
  EVENT_PUBLISHED
  EVENT_REGISTRATION_CLOSED
  EVENT_COMPLETED
  EVENT_ARCHIVED
  EVENT_CLONED
  EVENT_NOTE_ADDED
  EVENT_NOTE_UPDATED
  TICKET_TIER_ADDED
  TICKET_TIER_UPDATED
}
```

---

*Last updated: December 2025*
