# Event Status Lifecycle

Implements the event approval workflow state machine per Charter P3 (explicit state machine) and P5 (approval chain enforced).

## Overview

Events follow a formal approval workflow before becoming visible to members. This ensures proper oversight by the VP of Activities while enabling Event Chairs to manage their own events.

## Status Diagram

```
                                ┌─────────────────────────┐
                                │                         │
                                ▼                         │
    ┌───────┐    ┌──────────────────────┐    ┌──────────────────────┐
    │ DRAFT │───▶│   PENDING_APPROVAL   │───▶│  CHANGES_REQUESTED   │
    └───────┘    └──────────────────────┘    └──────────────────────┘
                            │                         │
                            │                         │
                            ▼                         │
                    ┌──────────────┐                  │
                    │   APPROVED   │◀─────────────────┘
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │  PUBLISHED   │────────▶ [COMPLETED] (derived)
                    └──────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   CANCELED   │
                    └──────────────┘
```

## Status Definitions

| Status | Description |
|--------|-------------|
| DRAFT | Event chair is editing; not visible to members |
| PENDING_APPROVAL | Submitted for VP Activities review |
| CHANGES_REQUESTED | VP returned event for revisions |
| APPROVED | VP approved; ready to publish |
| PUBLISHED | Visible to members; registrations open |
| CANCELED | Event cancelled (soft delete) |
| COMPLETED | Derived: PUBLISHED event whose endTime has passed |

## Role-Based Transitions

### Event Chair

| From | To | Action |
|------|-----|--------|
| DRAFT | PENDING_APPROVAL | Submit for review |
| CHANGES_REQUESTED | PENDING_APPROVAL | Resubmit after revisions |

### VP of Activities (and Admin)

| From | To | Action |
|------|-----|--------|
| PENDING_APPROVAL | APPROVED | Approve event |
| PENDING_APPROVAL | CHANGES_REQUESTED | Request revisions (requires note) |
| APPROVED | PUBLISHED | Publish to members |
| Any (except COMPLETED) | CANCELED | Cancel event |

## Edit Restrictions

Event content can only be modified in these states:

- **DRAFT**: Full editing allowed by Event Chair
- **CHANGES_REQUESTED**: Chair can make revisions

Once an event reaches PENDING_APPROVAL or later states, only status transitions are allowed - content is locked.

## Metadata Fields

Each transition records tracking metadata:

| Field | Populated When |
|-------|----------------|
| submittedAt, submittedById | DRAFT → PENDING_APPROVAL |
| approvedAt, approvedById, approvalNotes | PENDING_APPROVAL → APPROVED |
| publishedAt, publishedById | APPROVED → PUBLISHED |
| changesRequestedAt, changesRequestedById, rejectionNotes | PENDING_APPROVAL → CHANGES_REQUESTED |
| canceledAt, canceledById, canceledReason | Any → CANCELED |

## Derived COMPLETED Status

COMPLETED is not stored in the database. It is derived at query time:

```typescript
function getEffectiveStatus(event) {
  if (event.status !== "PUBLISHED") {
    return event.status;
  }

  const endTime = event.endTime || (event.startTime + 2 hours);
  if (now > endTime) {
    return "COMPLETED";
  }

  return "PUBLISHED";
}
```

## API Usage

### Transition Functions

```typescript
import {
  submitForApproval,
  approveEvent,
  requestChanges,
  publishEvent,
  cancelEvent,
} from "@/lib/events/status";

// Chair submits event for review
const result = await submitForApproval({
  eventId: "evt_123",
  actor: authContext,
  req: request, // for audit logging
});

// VP approves with optional note
const result = await approveEvent({
  eventId: "evt_123",
  actor: authContext,
  note: "Looks good!",
});

// VP requests changes (note required)
const result = await requestChanges({
  eventId: "evt_123",
  actor: authContext,
  note: "Please add more details about parking",
});
```

### Check Valid Transitions

```typescript
import { getValidNextStates } from "@/lib/events/status";

// Get what states this user can transition to
const validStates = await getValidNextStates(eventId, authContext);
// Returns: ["APPROVED", "CHANGES_REQUESTED", "CANCELED"] for VP on PENDING_APPROVAL
```

### Check Edit Permission

```typescript
import { canEditEventContent } from "@/lib/events/status";

const { allowed, reason } = await canEditEventContent(eventId, authContext);
if (!allowed) {
  return { error: reason };
}
```

## Audit Logging

Every status transition creates an audit log entry (Charter P7):

```json
{
  "action": "UPDATE",
  "resourceType": "Event",
  "resourceId": "evt_123",
  "metadata": {
    "transition": "EVENT_APPROVED",
    "fromStatus": "PENDING_APPROVAL",
    "toStatus": "APPROVED",
    "note": "Looks good!",
    "actorRole": "vp-activities"
  }
}
```

Transition audit actions:

- `EVENT_SUBMITTED`
- `EVENT_APPROVED`
- `EVENT_CHANGES_REQUESTED`
- `PUBLISH`
- `EVENT_CANCELED`

## Charter Compliance

| Principle | Implementation |
|-----------|----------------|
| P1: Provable identity | Actor from AuthContext |
| P3: Explicit state machine | EventStatus enum, no boolean flags |
| P5: Approval chain | VP must approve before publishing |
| P7: Audit logging | All transitions logged |
| N2: Capability-based auth | Uses hasCapability("events:edit") |
| N4: Soft deletes | CANCELED instead of delete |

## Testing

Run the unit tests:

```bash
npm run test:unit -- tests/unit/events/status.spec.ts
```

## Related Files

- `prisma/schema.prisma` - EventStatus enum and Event model
- `src/lib/events/status.ts` - Transition logic implementation
- `src/lib/auth.ts` - Role capabilities
- `tests/unit/events/status.spec.ts` - Unit tests
