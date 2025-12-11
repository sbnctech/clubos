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
