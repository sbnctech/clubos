
## 2025-12-13 - Stabilizing docs workflow; agreements, partnerships, reporting chatbot

- Restored stashed reporting/governance/persona docs and opened PR #14.
- Cleaned chair-guide source import into an allowlisted, minimal reference-only set under docs/source/chair-guides/.
- Clarified RBAC evaluation order as: Auth -> Roles -> Scope -> Delegation -> Hard Gates.
- Added/confirmed hard gates:
  - Membership Agreement required for members before event registration.
  - Media Rights Agreement required for members before event registration.
  - Event-specific Guest Release required for guests at designated events; guest must sign directly (non-delegable).
- Added partnerships requirement:
  - Bilateral consent required via agreement by both partners.
  - Either partner may register/cancel for either/both only if rights granted.
  - Delegation revocable and cannot bypass hard gates.
- Confirmed need for secure reporting/chatbot in ClubOS:
  - Library of pretested sidebar questions plus limited ad hoc queries.
  - Requires strict RBAC, row-level security, column redaction, and audit logging.
- External systems risk highlighted:
  - JotForm currently used for event submission; integrate now but replace later with native workflow.
  - Bill.com used for reimbursements; workflow details TBD and tracked as backlog.
