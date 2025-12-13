# Finance Manager Workflow

## Purpose

Process refund requests through a controlled lifecycle, apply cancellation fee policies, and ensure all financial transactions are reconciled with QuickBooks as the system of record.

## Who uses this

- Finance Manager
- Treasurer
- Authorized financial approvers

## Preconditions

- User has Finance Manager role
- Refund request exists (created by Event Chair or system)
- Payment processor credentials are configured
- QuickBooks integration is active

## Primary steps

1. Review incoming refund request (member, event, amount, reason)
2. Check policy compliance (timing, replacement status, prior history)
3. Approve or deny request with documented reason
4. If approved, calculate final refund amount (apply cancellation fee if required)
5. Execute refund through payment processor
6. Wait for processor confirmation
7. Record execution result in ClubOS
8. Sync transaction to QuickBooks
9. Verify reconciliation (processor, ClubOS, QuickBooks alignment)

## Inputs

- Refund request record (from Event Chair)
- Member payment history
- Event cancellation policy
- Replacement status (from Event Chair workflow)

## Outputs

- Approved or denied refund decision
- Executed refund transaction
- Updated ClubOS financial record
- QuickBooks journal entry
- Reconciliation confirmation

## Audit trail

- Who requested (member or Event Chair)
- Who approved (Finance Manager)
- Who executed (Finance Manager or automated system)
- Original amount requested
- Final amount refunded
- Fee amount retained
- Timestamp for each state transition (Requested, Approved, Executed, Recorded, Synced)
- Reason code
- Processor transaction ID
- QuickBooks reference ID

## Failure modes and guardrails

- **Ghost credits**: Refund recorded in ClubOS but not executed in processor or not synced to QuickBooks. Prevention: atomic transactions and daily reconciliation.
- **Unauthorized refund**: Refund executed without Finance Manager approval. Prevention: role-based access control blocks Event Chair from direct execution.
- **Fee policy bypass**: Cancellation fee not applied when required. Prevention: system enforces policy rules before approval can proceed.
- **Reconciliation drift**: Processor and QuickBooks totals diverge. Prevention: daily automated comparison with alerts on discrepancy.
- **Duplicate refund**: Same refund executed twice. Prevention: idempotency keys and state machine enforcement.

QuickBooks is the system of record for all financial data. ClubOS tracks workflow context and approvals but does not replace QuickBooks as the accounting authority.

## Open questions

- What is the escalation path when reconciliation fails?
- Should there be a refund amount threshold requiring additional approval?
- How should credit card disputes interact with this workflow?
