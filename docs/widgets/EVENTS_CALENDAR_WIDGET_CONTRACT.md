# Events Calendar Widget Contract

Worker 3 — Events Calendar Widget Contract — Report

## Purpose
Defines the formal contract between ClubOS and the Events/Calendar widget.

## Scope
This contract governs rendering, data access, and action dispatch
for the Events/Calendar widget.

## Viewer Context
- viewer_id
- membership_status
- roles
- effective_permissions
- request_origin

## Allowed Widget Actions
- event:view
- event:navigate
- event:register (intent dispatch only)
- event:download_ics
- event:open_details

## Explicit Non-Responsibilities
- Authentication
- Authorization
- Eligibility decisions
- Privacy enforcement
- Registration validation

## Security Invariants
- Widget is untrusted
- Widget makes read-only data requests
- All authorization enforced by ClubOS
- Widget never stores secrets
- Widget never infers identity

## Verdict
READY FOR REVIEW
