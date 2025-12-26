# Calendar Time Model

Copyright (c) Santa Barbara Newcomers Club. All rights reserved.

This document describes the time model used by ClubOS for calendar integration,
focusing on the ICS generator implementation in `src/lib/calendar/`.

For broader calendar interoperability concepts, see [CALENDAR_INTEROP_GUIDE.md](./CALENDAR_INTEROP_GUIDE.md).

---

## Overview

ClubOS generates RFC 5545 compliant iCalendar (ICS) files for export to
Google Calendar, Apple Calendar, and Microsoft Outlook. The implementation
prioritizes:

1. **IANA timezone names** - Always use `America/Los_Angeles`, never offsets
2. **Correct DTSTART/DTEND semantics** - TZID for timed events, VALUE=DATE for all-day
3. **Exclusive end dates** - All-day DTEND is the day after the last event day
4. **UTC DTSTAMP** - Modification timestamps always in UTC

---

## Implementation: src/lib/calendar/ics.ts

### Core Functions

| Function | Purpose |
|----------|---------|
| `generateIcs(events, options)` | Generate complete VCALENDAR with multiple events |
| `generateSingleEventIcs(event, options)` | Convenience wrapper for single event |
| `generateVEvent(event, options)` | Generate VEVENT block |
| `generateVTimezone(timezone)` | Generate VTIMEZONE block with DST rules |

### Text Processing

| Function | Purpose |
|----------|---------|
| `escapeIcsText(text)` | Escape `\`, `;`, `,`, newlines per RFC 5545 §3.3.11 |
| `foldLine(line)` | Fold lines >75 chars per RFC 5545 §3.1 |

### Date Formatting

| Function | Output Format | Use Case |
|----------|---------------|----------|
| `formatDtstamp(date)` | `YYYYMMDDTHHMMSSZ` | DTSTAMP (always UTC) |
| `formatLocalDateTime(date, tz)` | `YYYYMMDDTHHMMSS` | DTSTART/DTEND with TZID |
| `formatDateOnly(date, tz)` | `YYYYMMDD` | VALUE=DATE for all-day events |

---

## Time Model Rules

### Rule 1: Timed Events Use TZID

Timed events must include the TZID parameter with an IANA timezone name:

```
DTSTART;TZID=America/Los_Angeles:20250615T110000
DTEND;TZID=America/Los_Angeles:20250615T130000
```

**Why?** TZID ensures correct DST handling. Using raw UTC offsets (like `-08:00`)
causes time shifts when clocks change.

### Rule 2: All-Day Events Use VALUE=DATE

All-day events use date-only format without timezone:

```
DTSTART;VALUE=DATE:20250615
DTEND;VALUE=DATE:20250616
```

**Why?** All-day events are date-anchored, not instant-anchored. A user in
Tokyo should see the same calendar date as a user in Los Angeles.

### Rule 3: All-Day End Dates Are Exclusive

Per RFC 5545, DTEND for VALUE=DATE events is exclusive. An event spanning
June 15-16 requires:

```
DTSTART;VALUE=DATE:20250615
DTEND;VALUE=DATE:20250617   ← Day AFTER last event day
```

The implementation handles this automatically:

```typescript
if (event.endTime) {
  const exclusiveEnd = new Date(event.endTime);
  exclusiveEnd.setDate(exclusiveEnd.getDate() + 1);
  lines.push(`DTEND;VALUE=DATE:${formatDateOnly(exclusiveEnd, timezone)}`);
}
```

### Rule 4: DTSTAMP Is Always UTC

The DTSTAMP property (when the event record was created/modified) must always
be in UTC with Z suffix:

```
DTSTAMP:20251226T080000Z
```

---

## Interface: IcsEventInput

The minimal event interface compatible with Prisma's Event model:

```typescript
interface IcsEventInput {
  id: string;           // Unique identifier (forms UID)
  title: string;        // Event title (SUMMARY)
  description?: string; // Event description (DESCRIPTION)
  location?: string;    // Event location (LOCATION)
  startTime: Date;      // Start time (DTSTART)
  endTime?: Date;       // End time (DTEND)
  isAllDay?: boolean;   // If true, use VALUE=DATE format
}
```

---

## Interface: IcsOptions

Generation options:

```typescript
interface IcsOptions {
  timezone?: string;   // IANA timezone (default: CLUB_TIMEZONE)
  prodId?: string;     // PRODID (default: -//ClubOS//Event Calendar//EN)
  baseUrl?: string;    // Domain for UID (default: clubos.app)
}
```

---

## VTIMEZONE Generation

The generator includes a minimal VTIMEZONE block for `America/Los_Angeles`:

```
BEGIN:VTIMEZONE
TZID:America/Los_Angeles
BEGIN:DAYLIGHT
TZOFFSETFROM:-0800
TZOFFSETTO:-0700
TZNAME:PDT
DTSTART:19700308T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
END:DAYLIGHT
BEGIN:STANDARD
TZOFFSETFROM:-0700
TZOFFSETTO:-0800
TZNAME:PST
DTSTART:19701101T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
END:STANDARD
END:VTIMEZONE
```

**Note**: Modern calendar clients resolve TZID from their own timezone database.
The embedded VTIMEZONE provides fallback rules for clients without full IANA
support.

---

## UID Format

Event UIDs follow the format: `{eventId}@{baseUrl}`

Example: `550e8400-e29b-41d4-a716-446655440000@clubos.app`

Stable UIDs allow calendar clients to:

- Update existing events instead of creating duplicates
- Track changes across sync cycles
- Handle event cancellations correctly

---

## Testing

Golden file tests are in `tests/unit/calendar/ics.spec.ts`. Key assertions:

1. **TZID uses IANA names** - Verify `America/Los_Angeles`, not offsets
2. **DTSTART/DTEND semantics** - Correct format for timed vs all-day
3. **Exclusive end dates** - All-day DTEND is day after
4. **Line folding** - Lines >75 chars properly folded
5. **Character escaping** - `;`, `,`, `\`, newlines escaped
6. **DTSTAMP in UTC** - Always ends with Z

---

## Usage Example

```typescript
import { generateSingleEventIcs } from "@/lib/calendar";

const event = {
  id: "evt-123",
  title: "Monthly Luncheon",
  description: "Join us for lunch!",
  location: "Garden Restaurant, Santa Barbara, CA",
  startTime: new Date("2025-06-15T18:30:00Z"),
  endTime: new Date("2025-06-15T21:00:00Z"),
};

const ics = generateSingleEventIcs(event, {
  timezone: "America/Los_Angeles",
  baseUrl: "sbnewcomers.org",
});

// Returns RFC 5545 compliant iCalendar string
```

---

## Related Documents

- [CALENDAR_INTEROP_GUIDE.md](./CALENDAR_INTEROP_GUIDE.md) - Client interoperability
- [../CI/TIME_AND_TIMEZONE_RULES.md](../CI/TIME_AND_TIMEZONE_RULES.md) - Time handling rules
- [../../src/lib/timezone.ts](../../src/lib/timezone.ts) - Core timezone utilities

---

## References

- RFC 5545: Internet Calendaring and Scheduling (iCalendar)
- IANA Time Zone Database: https://www.iana.org/time-zones
