Copyright (c) Santa Barbara Newcomers Club
All rights reserved.

SYSTEM SPEC CHANGE HISTORY

Entry 0001
Date: Initial creation
Summary:
- Created SYSTEM_SPEC.md from scratch.
- Established architecture, member model, events model, registrations,
  waitlist flows, communications baseline, SMS baseline, permissions,
  notifications, admin UI, and testing model.

Entry 0002
Date: Addition of two way texting subsystem
Summary:
- Added full Trellis-style two way SMS integration section.
- Added inbound webhook model.
- Added admin SMS inbox requirements.
- Added RSVP automation rules (Y=confirm, N=cancel/promote).

--------------------------------------------------
2025-12-10: Data model pivot to contacts + memberships
--------------------------------------------------

- Introduced Contact as the primary person entity in the system.
- Defined Membership as the relationship between a Contact and the club over time.
- Members in the admin UI are now defined as Contacts who have at least one ACTIVE Membership.
- Event registrations now link to Contact and Event, not to a standalone Member record.
- SmsMessageLog is linked to Contact and Event where applicable, but deeper SMS behavior is deferred.
- Email delivery is implemented as a mock provider with file based logging to support early admin UI development.

## 2025-12-11 Prisma initialization issue and member API todos

Context
- While integrating Prisma into the API layer, a PrismaClientInitializationError was encountered:
  - "PrismaClient needs to be constructed with a non-empty, valid PrismaClientOptions"
- The current server/prisma.ts constructs `new PrismaClient()` with no options, which should normally be valid.
- This suggests an environment or configuration issue rather than just TypeScript code shape.

Open questions for Prisma setup
- Is DATABASE_URL set and valid in `.env` (and visible to the Next.js runtime)?
- Has `npx prisma generate` been run after the latest schema changes?
- Are there any project-specific workarounds we intend to standardize for Prisma with Next.js App Router?

Member API todos related to this work
- [x] Update `/api/members` route to use Prisma with ACTIVE membership filter when Prisma is healthy.
- [x] Update `admin-members.spec.ts` to be less specific about exact member names.
- [ ] Run member-related tests end-to-end (API and admin UI) and verify they pass under a stable Prisma configuration.

Notes
- For now, member-related logic can be exercised against mock data while Prisma configuration is being stabilized.
- Once Prisma is confirmed working (DATABASE_URL, migrations, client generation), we will:
  - Re-run member tests.
  - Promote Prisma-backed `/api/members` to the primary implementation.
  - Remove any temporary mock fallbacks that are no longer needed.

