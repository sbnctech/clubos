# Personalized Homepage Assembly (RBAC-Driven)

## Question
Can we create an effectively personalized website per user based on RBAC?

## Answer
Yes. The homepage is assembled from "sections" that each contain:
- one or more widgets
- RBAC visibility rules
- safe defaults and fallbacks

## Model
- A user has roles and scopes (ViewerContext).
- The server returns an ordered set of homepage sections the user is allowed to see.
- Each widget renders only server-provided, role-filtered ViewModels.

## Section Definition (Concept)
- id
- title
- description (optional)
- widgets[]
- visibility:
  - allowed_roles[] (or rule)
  - scope requirements (committee/event)
- refresh policy (TTL, caching)
- failure behavior (empty state vs hide)

## Safe Defaults
- If a widget errors: show a friendly empty state, never partial sensitive data.
- If RBAC denies: section is omitted (not shown).

## Example Homepages
- Regular Member:
  - Upcoming Events, Renew Membership, Announcements, My Registrations
- Event Chair:
  - My Events, Registrant Snapshot, Waitlist, Check-in Links
- Finance Manager:
  - Finance Approval Queue, Missing Receipt Queue, Deny/Exception Log (read)
- President:
  - Executive Dashboard, Finance Escalations, Board Approval Queue

## Non-Goals (v1)
- No arbitrary user scripting.
- No user-defined queries beyond allowlisted templates.
- No client-side RBAC logic.
