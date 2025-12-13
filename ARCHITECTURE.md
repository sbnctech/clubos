## Persistence layer v0.1

The persistence layer uses PostgreSQL 16 and Prisma to model the core club data.

### Core tables

- Contact
  - Fields: id, createdAt, updatedAt, firstName, lastName, email, phone, and other profile fields.
  - Notes: primary anchor for any person; other tables refer to Contact via foreign keys.

- Membership
  - Fields: id, createdAt, updatedAt, contactId, level, status, startAt, endAt (nullable for open-ended).
  - Relationship: many Membership rows per Contact over time.
  - Purpose: represents membership history and allows the system to compute the current membership state at any time.

- Event
  - Fields: id, createdAt, updatedAt, title, description, category, startAt, endAt, and any additional scheduling and configuration fields.
  - Purpose: defines scheduled activities that can be listed on calendars and used for registrations and communications.

- Registration
  - Fields: id, createdAt, updatedAt, eventId, contactId, status.
  - Relationship:
    - Many registrations per Event.
    - Many registrations per Contact.
  - Purpose: represents the relationship between a Contact and an Event, including statuses like REGISTERED and WAITLISTED.

- SmsMessageLog
  - Fields: id, createdAt, contactId (optional), eventId (optional), phone, direction, status, body, providerMessageId (optional).
  - Purpose: central log for outbound and inbound SMS around Contacts and Events.

### Concept of "member" in the architecture

There is no Member table.

- "Member" is a view:
  - Derived from Contact + Membership where Membership is in an active state.
  - Different screens may use slightly different definitions of "active" (for example: includes Extended Newcomer or Alumni), but the underlying data remains the same.

- Query examples:
  - "Current members" page:
    - Select Contacts that have at least one Membership row whose state is in an allowed set and whose time bounds include "now".
  - "Lapsed members" view:
    - Select Contacts whose most recent Membership row ended before "now" and is in a lapsed state.

### Development environment

- PostgreSQL 16 runs locally via Homebrew:
  - Data directory: /opt/homebrew/var/postgresql@16
- Prisma is configured with a single datasource "db" pointing at:
  - postgresql://clubos:clubos@localhost:5432/clubos
- Migration:
  - Managed via "prisma migrate dev".
  - Migration history is stored in the _prisma_migrations table and in prisma/migrations on disk.
- Application code:
  - Uses the generated Prisma Client to read and write Contact, Membership, Event, Registration, and SmsMessageLog.

### Transitional API approach

For now:

- The admin dashboard endpoints are still mostly mocked:
  - /api/members, /api/events, /api/registrations.
- The architecture assumes these will be replaced by Prisma-backed implementations that:
  - Use Contact as the root for any person lists.
  - Use Membership to derive member status.
  - Use Registration for event attendance.
  - Use SmsMessageLog for SMS-related monitoring and audit.

This section is the authoritative reference for how the persistence layer is expected to behave in the current phase.

## Server Components: Do Not Fetch /api/admin/*

**Problem:** Next.js Server Components cannot propagate authentication headers or
cookies to internal API routes. A `fetch("/api/admin/...")` from a Server Component
arrives at the API handler without session context, resulting in "Unauthorized".

**Solution:** Server Components must query the database directly via Prisma or call
shared server modules. Do not use `fetch()` to hit `/api/admin/*` endpoints.

**Pattern:**
```typescript
// BAD - fails with Unauthorized in Server Components
const res = await fetch("/api/admin/events/123");

// GOOD - use server module
import { getAdminEventById } from "@/server/admin/events";
const event = await getAdminEventById("123");
```

**Reference implementation:** `src/server/admin/events.ts`

**ESLint guardrail:** The rule `no-restricted-syntax` blocks this pattern in
`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and `not-found.tsx` files.

## Copyright

Copyright (c) 2025 Santa Barbara Newcomers Club. All rights reserved.
