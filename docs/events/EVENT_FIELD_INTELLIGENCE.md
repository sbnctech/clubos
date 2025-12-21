# Event Field Intelligence: Human vs Derived

This document clarifies which event fields require human input vs. which are automatically derived.

## Human-Entered Fields (Stored in Database)

These fields must be provided when creating/editing an event:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | String | Yes | Event name |
| `description` | String | No | Full event description |
| `category` | String | No | Activity type (e.g., "Luncheon", "Book Club") |
| `location` | String | No | Venue name/address |
| `startTime` | DateTime | Yes | When the event begins |
| `endTime` | DateTime | No | When the event ends (defaults to startTime + 2 hours) |
| `capacity` | Int | No | Max attendees (null = unlimited) |
| `isPublished` | Boolean | No | Whether visible to members (default: false) |
| `eventChairId` | UUID | No | Member responsible for the event |

## Auto-Generated Fields (System-Managed)

These fields are automatically set by the system:

| Field | Trigger | Value |
|-------|---------|-------|
| `id` | On create | New UUID |
| `createdAt` | On create | Current timestamp |
| `updatedAt` | On update | Current timestamp |

## Derived Fields (Computed at Query Time)

These values are calculated when events are fetched, **not stored**:

| Field | Derivation |
|-------|------------|
| `registeredCount` | Count of registrations with status CONFIRMED, PENDING, or PENDING_PAYMENT |
| `waitlistedCount` | Count of registrations with status WAITLISTED |
| `spotsRemaining` | `capacity - registeredCount` (null if no capacity limit) |
| `isWaitlistOpen` | `registeredCount >= capacity` (always false if no capacity) |
| `isFull` | `spotsRemaining === 0` |
| `isPast` | `startTime < now` |

## Smart Defaults

To reduce admin burden, these defaults are applied:

| Field | Default | Rationale |
|-------|---------|-----------|
| `isPublished` | `false` | Events start as drafts; explicit publish required |
| `endTime` | `startTime + 2 hours` | Most club events run ~2 hours |
| `capacity` | `null` (unlimited) | Not all events have limits |

## Validation Rules

- `startTime` must be provided
- `endTime` must be >= `startTime` if provided
- `capacity` must be >= 0 if provided
- `title` must be non-empty

## Event Lifecycle States

Events don't have an explicit `status` field. Instead, state is derived:

```
Draft     = !isPublished
Upcoming  = isPublished && startTime > now
Ongoing   = isPublished && startTime <= now && endTime > now
Past      = startTime < now (regardless of published state)
```

## Design Decisions

1. **No explicit status field**: Avoids state sync issues between stored and computed values
2. **Derived availability**: `spotsRemaining` and `isWaitlistOpen` are always current
3. **No event deletion for published events with registrations**: Protects member data (soft-delete via unpublish instead)

---

Copyright (c) Santa Barbara Newcomers Club
