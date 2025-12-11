Copyright (c) Santa Barbara Newcomers Club
All rights reserved.

SYSTEM SPECIFICATION
ClubOS Platform
ASCII Only
No external branding references

----------------------------------------------------------------------

1. System Overview

ClubOS is the membership, events, communication, and operations platform
for SBNC. It replaces legacy systems and provides a unified, modern,
API-first foundation. The system must support the following domains:

- Member directory and profile management
- Event creation, registration, attendance, and waitlist flows
- Communications (email, SMS, two-way texting)
- Roles and permissions for staff and volunteers
- Notifications framework
- Admin control panel
- Structured activity logs for all actions
- Integration surfaces for future modules

All files and documentation must use ASCII characters only.
All content must be suitable for rendering in MacDown.
All code, docs, and internal text blocks must be written as if they were
produced by a professional software team (no meta commentary).

----------------------------------------------------------------------

2. Architecture Summary

- Next.js application in TypeScript
- PostgreSQL primary datastore via Prisma ORM
- API routes in Next.js for all server functions
- Modular subsystem boundaries:
  - members
  - events
  - registrations
  - waitlist
  - sms
  - email
  - notifications
  - permissions
  - admin_ui
  - integrations

Testing:
- Playwright for end-to-end tests
- Test data must use deterministic fixtures
- UI must expose stable data-test-id attributes for selectors

----------------------------------------------------------------------

3. Member Subsystem

3.1 Data Model
Members have:
- id
- first_name
- last_name
- email
- phone
- membership_level
- status
- created_at
- updated_at

3.2 Core Requirements
- Searchable member directory
- Per-member communication preferences
- Opt-in state for SMS and email
- View and update profile (admin-managed)

----------------------------------------------------------------------

4. Events Subsystem

4.1 Data Model
Events include:
- id
- title
- category
- description
- start_time
- end_time
- location
- capacity
- created_by
- created_at
- updated_at

4.2 Registration Model
Registrations include:
- id
- event_id
- member_id
- status (registered, cancelled, waitlisted)
- created_at
- updated_at

4.3 Waitlist Rules
- When capacity is reached, new registrations join the waitlist.
- When a registered member cancels, the earliest waitlisted member is
  automatically promoted to registered.
- Promotion triggers a notification via email and (optionally) SMS.

----------------------------------------------------------------------

5. Communications Subsystem

5.1 Email
- Outbound email using a provider adapter pattern.
- Templates stored in the repository.
- Logging of:
  - who was emailed
  - which template was used
  - success/failure state

5.2 SMS (Outbound Baseline)
ClubOS must support outbound SMS broadcasts using a dedicated local
number. Requirements:

- 10 digit local number
- Send to filtered subsets of members or event registrants
- Log outbound sends and status
- Inbound handling:
  - STOP and similar keywords must be honored
  - Basic display of replies in a per-member thread view

Use cases:
- Last minute logistics
- Day of event reminders
- Simple one-way alerts

----------------------------------------------------------------------

6. Two Way Texting (Trellis or Equivalent)

6.1 Purpose
Enable full conversational SMS interaction between members and staff,
with structured automation logic. Must support use cases including RSVP,
waitlist actions, surveys, and member assistance.

6.2 Provider Requirements
- API for outbound messages
- Webhooks for inbound messages
- Support for US carriers
- Support for 10DLC compliance
- Exportable message history

6.3 Outbound Flow
- ClubOS triggers outbound SMS:
  - Event reminders
  - Registration status changes
  - Manual campaign sends
- Provider returns message IDs and delivery status for logging.

6.4 Inbound Flow
- Provider posts inbound SMS to a ClubOS webhook.
- ClubOS parses message and applies rules:
  - Y or YES: confirm attendance
  - N or NO: cancel and promote next from waitlist
  - Numeric ratings for surveys
  - Free text routed to admin inbox
- All inbound messages stored in message_log table.

6.5 Admin UI Requirements
- Per-member conversation thread
- Per-event SMS conversation log
- Filter for unresolved inbound messages needing attention

6.6 Automation
- Waitlist promotion triggered by N reply
- Confirmation triggered by Y reply
- Survey scores stored per event participation

----------------------------------------------------------------------

7. Permissions and Roles

7.1 Principles
- Least privilege
- Role-based access
- Separation between operational roles and developer roles

7.2 Roles
- System Admin
- Communications Admin
- Events Admin
- Category Chair
- Read Only Auditor

7.3 Capabilities Matrix
Each role grants explicit rights to:
- Create/read/update/delete events
- Send email
- Send SMS
- Manage members
- Access analytics
- Access system settings

----------------------------------------------------------------------

8. Notifications Framework

All subsystems use a unified notification bus.

Supported channels:
- Email
- SMS
- In-app notifications (later)

Notifications must be:
- Logged
- Deduplicated
- Idempotent (safe to retry)
- Delivered asynchronously

----------------------------------------------------------------------

9. Admin UI

9.1 Requirements
- Web-based console
- Stable data-test-id attributes
- iframe-safe rendering for testing
- Must expose:
  - event list
  - event details
  - registration list
  - member list
  - communications center (email + SMS)
  - inbox for inbound SMS from Trellis provider

9.2 Testing Hooks
- Root element: data-test-id="admin-root"
- Header: data-test-id="admin-header"
- Any interactive element must include a stable data-test-id

----------------------------------------------------------------------

10. Testing Requirements

10.1 Playwright Tests
- All admin pages must load inside iframe #admin-frame
- Tests must use waitForAdminFrame helper pattern:
  - Wait for iframe
  - Acquire frame via contentFrame()
  - Wait for load state
  - Wait for [data-test-id="admin-root"]
- Provide fixtures for:
  - Member creation
  - Event creation
  - Registrations and waitlist states

----------------------------------------------------------------------

11. Future Modules

Placeholder modules for future expansion:
- Payments
- Carpooling
- Photo and media management
- Volunteer management

----------------------------------------------------------------------

END OF SYSTEM SPEC

--------------------------------------------------
Requirements update 2025-12-10: Contacts and memberships
--------------------------------------------------

Data model

- The system MUST treat Contact as the canonical person record.
- Each Contact MAY have zero or more Membership records over time.
- The system MUST support at least the following membership statuses:
  - ACTIVE
  - LAPSED
  - ALUMNI
  - PROSPECT
- The system MUST support at least the following membership levels, which can be mapped to SBNC usage:
  - NEWBIE
  - NEWCOMER
  - EXTENDED
  - BOARD
  - ALUMNI_LEVEL
  - OTHER
- The Members view in the admin UI MUST be defined as:
  - Contacts with at least one Membership where status = ACTIVE.
- Event registrations MUST reference Contact and Event by id.
- SmsMessageLog entries MAY reference Contact and Event, but SMS behavior beyond basic logging is a later phase.

Email and SMS scope for early milestones

- The system MUST provide a mock email provider:
  - Writes outbound messages to a local log file.
  - Exposes a test endpoint for use in automated tests.
  - Supports an admin Email Activity panel to inspect recently logged messages.
- The system SHOULD be designed so that a real email provider (for example SES or Postmark) can be plugged in later without breaking the admin UI.
- The system MUST NOT depend on a real SMS provider for the initial milestones.
- Two way SMS is explicitly treated as a later phase and is out of scope for the first working demo.
## Domain model (authoritative v0.2)

This project treats Contact as the primary identity record. All other person- or event-related records hang off Contacts.

Entities:

- Contact
  - One row per real-world person (member, spouse, guest, admin, etc.).
  - Stores stable identifiers, names, primary email and phone, and basic profile fields.
  - Represents both current and former members, guests, and other contacts.

- Membership
  - Time-bounded snapshots representing the relationship between a Contact and the club.
  - Examples of states: Newbie, Newcomer, Extended Newcomer, Alumni, Lapsed, Admin.
  - Multiple rows per Contact over time, allowing a full membership history.
  - Encodes start and end timestamps plus membership level and any relevant flags.

- Event
  - A scheduled activity with title, description, category, start and end timestamps, and any access rules.
  - Used by both the public/member-facing calendar and internal admin tools.

- Registration
  - A link table between Contact and Event.
  - Represents a single contact's relationship to a specific event (Registered, Waitlisted, Cancelled, No-Show, etc.).
  - Designed to support full history of changes, not just the current status.

- SmsMessageLog
  - Tracks SMS messages related to Contacts and Events.
  - Stores direction (outbound, inbound), status (pending, sent, failed, delivered), body text, phone number, optional contactId and eventId, and an optional providerMessageId.
  - Intended for compliance, debugging, and operational visibility.

### Terminology and "members" as a derived concept

The database no longer has a top-level Member entity.

- "Member" in the UI is a derived concept:
  - A Contact with at least one active Membership row in a "member-like" state (for example: Newcomer, Extended Newcomer, or Alumni depending on business rules).
  - Different screens may filter by different membership states, but they all start from Contact plus Membership.

- This means:
  - All membership state logic lives in the Membership model and the queries that interpret it.
  - Admin tools should think in terms of Contacts and Memberships, even if the UI labels still say "Members" for now to keep things familiar.

### Persistence technology

- Database: PostgreSQL 16, running locally for development.
- Schema management: Prisma Migrate with a migration history checked into prisma/migrations.
- Application access: Prisma Client v7, generated from prisma/schema.prisma.

These choices are now considered part of the core system specification.

## Email subsystem specification (updated)

### 1. Test email endpoint

Current behavior:

- Route: POST /api/email/test
- Sends a mock email via mockEmailSend helper
- Returns:
  {
    ok: true,
    to,
    messageId
  }
- Used for system testing and as a placeholder until real provider integration.

Design constraints:

- Must behave consistently in all environments.
- Must not require a real provider for tests or local development.
- API contract is now considered stable.

Future expansion:

- Add provider adapter layer:
  - mock (default for test)
  - resend
  - ses
  - smtp
- Add retry and failure logging.

---

### 2. Email log endpoint

Current behavior (Phase 1):

- Route: POST /api/email/log
  - Generates an id, captures subject, body, timestamp.
  - Stores entry in in-memory array emailLog.
  - Responds with {
      ok: true,
      id,
      subject
    }

- Route: GET /api/email/log
  - Returns { emails: emailLog }

- Behavior is validated with Playwright tests.
- In-memory data resets when the dev server restarts.

Reasoning for current design:

- Locks down the API contract while deferring database wiring.
- Allows front-end and admin tooling to progress without waiting for persistence.
- Avoids blocking progress on Prisma (which is still being stabilized).

---

### 3. Planned final implementation (not yet completed)

Database-backed EmailMessageLog:

- Prisma model (to be added):
  - id (string)
  - memberId (nullable)
  - to (string)
  - subject (string)
  - body (text)
  - providerMessageId (string nullable)
  - status (enum: SENT, FAILED, PENDING)
  - createdAt (datetime)

- Repository interface:
  - createEmailLog(entry)
  - listRecent(limit)

- Route updates:
  - POST /api/email/test: persists log after sending
  - POST /api/email/log: writes to database
  - GET /api/email/log: queries last 20 items

Testing:

- Continue using Playwright for contract tests.
- Add Prisma integration tests only after model and migrations exist.

---

### 4. Architectural guarantees

- The API shape for test email and email log endpoints is now fixed.
- Persistence layer is intentionally deferred.
- Mock behavior must remain fully functional and testable until persistence is added.
- Code written by agents must not assume that Prisma persistence is already wired.


## Development Stages Checklist

This section tracks implementation stages for ClubOS at the system level.
It should stay consistent with PROJECT_PLAN.md.

Stage 0: Repo and tooling baseline
- Status: Done
- Next.js App Router project scaffolded.
- TypeScript, ESLint, and basic formatting in place.
- Playwright test runner configured and working against PW_BASE_URL.
- Prisma client generated and prisma.ts helper file created, but not yet used by production endpoints.

Stage 1: Minimal app shell
- Status: Partial
- Default layout and basic app chrome in place.
- Healthcheck style endpoints can be added without touching core domain logic.
- No persistent data model relied upon yet for production features.

Stage 2: Email primitives and dev/test endpoints
- Status: Done
- /api/email/test POST endpoint implemented.
  - Accepts JSON body with optional "to", "subject", and "body".
  - Uses server/mock-email.ts mockEmailSend helper to simulate sending and returns a messageId.
  - Has a Playwright test (tests/api/email-test.spec.ts) that asserts HTTP 200 and basic response shape.
- /api/email/log POST + GET implemented with in-memory storage only.
  - POST: accepts minimal subject/body, writes to an in-memory array, and returns a generated id.
  - GET: returns the current in-memory log array with id, subject, body, and createdAt ISO timestamp.
  - Covered by tests/api/email-log.spec.ts, which posts a log entry and then verifies it appears in the list.
- Prisma is not yet used by these endpoints.
  - Earlier attempts to wire Prisma into /api/email/log ran into PrismaClient initialization issues that need to be solved before production persistence is enabled.
  - The current behavior is explicitly dev-friendly and safe but not durable.

Stage 3: Email and notification subsystem v1 (persistent)
- Status: Not started
- Define Prisma model for EmailMessageLog (or equivalent) in prisma/schema.prisma.
- Resolve Prisma configuration so that new PrismaClient() can be constructed safely in server/prisma.ts using DATABASE_URL from the environment.
- Migrate the /api/email/log implementation from in-memory storage to Prisma-backed storage while keeping tests green.
- Ensure schema and endpoint can support future notification features:
  - Recipient address.
  - Subject.
  - Body or serialized payload.
  - Timestamps and basic status fields for sent messages.

Stage 4: Member and admin facing UX
- Status: Not started
- Build minimal authenticated admin view for recent email logs.
- Add simple filters (by recipient or time range) to verify that the log is usable for debugging.
- Wire this into the broader ClubOS admin shell as it comes online.

Notes
- The current implementation intentionally favors simplicity and green tests over early database complexity.
- When Prisma configuration is stable, we will update this checklist to mark Stage 3 as in progress and move the email log from memory to the database.
