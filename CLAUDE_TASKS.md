# TASK: Mentorship match email trigger + mentoring dashboard cards (ClubOS)

## Locked UI decision (do not revisit)
- Implement Mentorship as a CARD on the existing VP Membership dashboard (not a new page/tab).
- Also make the same card optionally visible on the President dashboard via a simple config flag:
  - default: OFF for President
  - ON for VP Membership always

## Context and intent
Mentorship is a live program owned by VP Membership. Matching must be immediate and easy.
A "mentor completion" is defined as: the mentor agrees to be a mentor and receives an assignment.
No other criteria.

We need to implement:
1) Email trigger when a mentor match is made (notify both parties).
2) A mentoring program dashboard card that supports fast matching and review.
3) Member-facing mentorship section (lightweight) so participants can see their match.

This work must align to the SBNC flywheel grounding and be consistent with the Mentor role definition and Leadership Action Log semantics.

## A. Data model (minimal, stable)
If a MentorshipAssignment (or similar) model already exists, use it.
If not, create it with Prisma:

- MentorshipAssignment
  - id
  - createdAt
  - createdByMemberId (VP Membership actor, if available)
  - newbieMemberId
  - mentorMemberId
  - status: ACTIVE | ENDED
  - endedAt (nullable)
  - notes (nullable, short, non-sensitive)

Prevent duplicate ACTIVE assignment for the same newbie:
- enforce in code (transaction) and/or unique constraint strategy as appropriate for Prisma/DB.

Mentor eligibility tracking:
- If there is already a mentor opt-in flag, use it.
- If not, add Member.agreedToMentor boolean default false.

Capacity:
- Add setting key "MENTOR_MAX_ACTIVE_ASSIGNMENTS" default "1" if no settings mechanism exists.
- Enforce: current active assignments for mentor < limit.

## B. Match action API (VP Membership)
Endpoint:
- POST /api/v1/admin/mentorship/match
Payload:
- newbieMemberId
- mentorMemberId
- optional notes

Authz:
- Require VP Membership capability/role (not broad admin).
- Follow existing RBAC patterns.

Behavior:
- Validate newbie unmatched (no ACTIVE assignment). If matched, return 409.
- Validate mentor eligible (agreedToMentor=true; under cap). If not eligible, 422.
- Create ACTIVE MentorshipAssignment.
- Write Leadership Action Log entry:
  - action: mentor.assigned
  - include mentor + newbie names in summary
  - objectType/objectId should reference assignment id; objectLabel includes both names

## C. Email trigger on match
When match is created:
- Notify newbie and mentor.

Implementation:
- Prefer existing email utility if present.
- If outbound transport is not configured, implement an EmailOutbox table and enqueue 2 emails.
- In dev, attempt synchronous send if feasible; otherwise keep outbox status=PENDING.

Email content:
- simple, warm, non-technical
- include names, suggested next step, and a portal link if routing exists
- no sensitive info

## D. Dashboard card (VP Membership) - MUST BE EXCELLENT
Implement a Mentorship Card on the existing VP Membership dashboard:

1) Unmatched Newbies list:
- name
- join date
- days since join
- has registered for any event (Y/N)
- last activity timestamp if available
- default sort: longest waiting first

2) Available Mentors list:
- name
- agreedToMentor
- active assignment count
- last assignment date

3) Match flow:
- choose newbie
- choose mentor
- side-by-side details panel for both (within the card)
  - enough info to make a good match without leaving the page
- confirm match -> calls API -> shows success -> removes from lists

4) President visibility toggle:
- Add a setting "MENTORSHIP_CARD_VISIBLE_TO_PRESIDENT" default "false"
- If true, show a READ-ONLY view of the card on the President dashboard:
  - lists visible
  - ability to view details
  - NO ability to create matches (VP Membership only)

## E. Member-facing mentorship sections (lightweight)
Add a Mentorship section to:
- Newbie member profile: show assigned mentor (if any) + "What happens next"
- Mentor member profile: show assigned newbie + quick action to email

Also add action log hooks:
- mentor_newbie.registered_same_event (when both register for same event)
- mentor_newbie.attended_same_event (when attendance is confirmed)
These entries must be non-judgmental and used for third-year decisions visibility.

## F. Tests
Add tests for:
- RBAC: only VP Membership can create match
- duplicate prevention (409)
- email outbox entries created (2) on match
- action log entry created on match
- President card is read-only even when enabled

## G. Docs
Update/create docs (ASCII-only):
- docs/roles/MENTOR_ROLE.md (reference canonical grounding doc)
- docs/governance/LEADERSHIP_ACTION_LOG.md (document mentorship actions)
- docs/onboarding/OFFICER_ONBOARDING.md (VP Membership workflow)
Ensure the canonical grounding doc is referenced explicitly from the above.

## H. Exit criteria
- npm run green passes on sandbox
- VP Membership dashboard card works end-to-end (match -> logs -> email/outbox)
- President read-only card works when enabled
- Basic docs updated and linked
