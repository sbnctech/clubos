# Membership Manager Workflow

## Purpose

Manage membership status changes, approvals, and member communications while maintaining audit trails for changes that affect billing or eligibility.

## Who uses this

- Membership Manager
- Membership Committee members
- Board-designated membership approvers

## Preconditions

- User has Membership Manager role or equivalent permissions
- Contact record exists for the member
- Membership change request has been received or identified

## Primary steps

1. Receive membership status change request (application, renewal, lapse, reinstatement)
2. Verify contact information and eligibility criteria
3. Review supporting documentation if required
4. Approve or deny the status change
5. Update membership record with new status and effective dates
6. Trigger appropriate member communications
7. If billing impact, ensure Finance Manager is notified
8. Record decision and rationale

## Inputs

- Membership application or change request
- Contact profile data
- Current membership status and history
- Eligibility criteria (membership type requirements)
- Supporting documentation (if applicable)

## Outputs

- Updated membership status (ACTIVE, LAPSED, ALUMNI, PROSPECT)
- Updated membership level (NEWBIE, NEWCOMER, EXTENDED, BOARD, ALUMNI_LEVEL, OTHER)
- Member notification sent (welcome, renewal confirmation, lapse notice)
- Finance notification (if billing affected)
- Audit record of change

## Audit trail

- Who requested the change (member or staff)
- Who approved the change (Membership Manager)
- Previous status and level
- New status and level
- Effective date of change
- Reason code (new application, renewal, voluntary lapse, administrative, etc.)
- Billing impact flag (yes/no)
- Supporting document references

## Failure modes and guardrails

- **Eligibility bypass**: Membership granted without meeting criteria. Prevention: system validates eligibility rules before approval.
- **Communication gap**: Member not notified of status change. Prevention: mandatory notification trigger on status transitions.
- **Billing disconnect**: Membership status changed without finance awareness. Prevention: automatic notification to Finance Manager when billing-affecting changes occur.
- **History loss**: Prior membership records overwritten. Prevention: append-only membership history (new rows, not updates).
- **Unauthorized change**: Status modified by non-approved user. Prevention: role-based access control with Membership Manager permission required.

## Open questions

- What is the grace period for lapsed members before losing member benefits?
- Should membership renewals be auto-approved or require manual review?
- How should household membership status changes propagate to associated contacts?
- What documentation is required for reinstatement after lapse?
