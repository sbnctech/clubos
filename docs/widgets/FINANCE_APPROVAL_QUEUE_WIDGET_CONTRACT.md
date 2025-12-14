# Finance Approval Queue Widget Contract (Read-Only v1)

## Purpose
Provide a role-gated, read-only view of finance items requiring action (review/approve/clarify) with safe deep links to the correct admin pages.

## Widget Type
Untrusted UI renderer (no authorization, no mutation).

## Inputs (WidgetConfig)
- viewer_context: provided by platform (opaque)
- scope:
  - org_id
  - optional: committee_id (for committee-scoped finance)
- filters:
  - status: Draft|Submitted|NeedsClarification|Approved|Rejected|Paid (default: Submitted, NeedsClarification)
  - date_from/date_to (optional)
  - amount_min/amount_max (optional)
- sort:
  - created_at|submitted_at|amount (default: submitted_at desc)
- page_size: 10|25|50 (default: 25)

## Output (ViewModel)
- items[]:
  - id
  - type: Reimbursement|VendorPayment|Other
  - status
  - requester_display
  - amount_display
  - submitted_at
  - last_action_at
  - next_required_action: Review|Approve|Clarify|None
  - deep_link: internal URL (role-gated page)
  - warnings[] (optional): e.g., "Over threshold", "Missing receipt"
- paging:
  - cursor_next (optional)
  - total_estimate (optional)

## RBAC Rules (Server-Enforced)
- Finance Manager:
  - can view all Submitted/NeedsClarification items
- VP Finance:
  - can view items requiring VP approval by policy/threshold
- President:
  - can view all items requiring final approval
- Board:
  - can view only board-approval items when a board vote is required
- Others:
  - denied (403) except requester may view own submissions (optional; v1 can omit)

## Security Invariants
- Widget never decides eligibility.
- All data returned is pre-filtered on the server.
- No raw PII fields; requester identity is display-safe.
- Amounts are display-safe; no bank details ever.
- Deny-path tests required for every role boundary (401/403/404).

## Error Codes
- 401 unauthorized
- 403 forbidden
- 404 not found (scope not visible)
- 422 invalid request (bad filter/sort key)
- 429 rate limited

## Examples
- VP Finance sees: "Submitted reimbursements over VP threshold" sorted by submitted_at.
- Finance Manager sees: all Submitted + NeedsClarification, with warnings for missing receipt.

## Non-Goals (v1)
- No approvals, no clarifications, no mutation.
- No export, no ledger integration.
- No cross-org views.
