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
