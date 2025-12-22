Copyright (c) Santa Barbara Newcomers Club. All rights reserved.

# Second Approver Escalation Policy (v1)

This policy governs the escalation path for requests that require a second-person review
(e.g., access to financial data, private member information, or changes to the rules that
control access).

## Escalation rule
- If a required second approver has not acted within 7 days, escalate to the President.
- Notify the originator when escalation happens.
- Record the escalation in the audit log with correlationId.

## Decision notification
- When the President (or delegated approver) approves or denies the request, notify the originator of the decision.
- Record the decision notification in the audit log (approved/denied + correlationId).

## VP Technology notification for access-right changes
- If the request involves access-right changes (role reassignment, delegation changes, or changes to rules/policies that affect access),
  notify the VP Technology when escalation occurs.
- If the President (or delegated approver) approves or denies the request, also notify the VP Technology of the final decision.
- Record both notifications in the audit log with correlationId.
