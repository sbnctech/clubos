# Finance Manager Workflow: Refunds, Fees, and Reconciliation

**Audience**: Treasurer, Finance Manager, Tech Chair
**Purpose**: Define the financial workflow for refunds, cancellation fees, and reconciliation

---

## Overview

This workflow describes how the Finance Manager handles refunds, applies
cancellation fees, and ensures proper reconciliation. The goal is to maintain
accurate financial records and prevent inconsistencies between ClubOS and
external accounting systems.

---

## Refund Lifecycle

Every refund follows this lifecycle:

```
+------------+     +------------+     +------------+
| REQUESTED  | --> | APPROVED   | --> | EXECUTED   |
+------------+     +------------+     +------------+
                                            |
                                            v
                   +------------+     +------------+
                   |   SYNCED   | <-- | RECORDED   |
                   +------------+     +------------+
```

### State Definitions

| State | Description |
|-------|-------------|
| REQUESTED | Refund request created (by member, partner, or Event Chair) |
| APPROVED | Finance Manager reviewed and authorized |
| EXECUTED | Payment processor has processed the refund |
| RECORDED | ClubOS internal records updated |
| SYNCED | Transaction synced to external accounting system |

A refund is not complete until it reaches SYNCED state.

---

## Partnership Delegation Notes

Refund eligibility and approval is independent from who clicked cancel. The
Finance Manager must evaluate the refund based on policy, not on whether the
cancellation was initiated by the registrant or their partner.

### Required Visibility

When reviewing a refund request, the Finance Manager must see:

- Acting member: Who initiated the cancellation
- Payer identity: Who paid for the original registration (may be registrant
  or their partner)
- Registrant identity: Whose registration was cancelled
- Payment method used: Which card or payment method was charged

This three-way distinction (actor, payer, registrant) is critical when
partnerships are involved.

### Refund Destination Rules

1. Default: Refund returns to the original payment method used for the
   transaction, even if a partner paid on behalf of the registrant.

2. Exceptions: Refunding to a different payment method requires:
   - Finance Manager approval
   - Logged reason code
   - Documentation in the refund record

3. No ghost credits: The refund amount must be recorded consistently in
   ClubOS and synced to external accounting. Internal credits without
   corresponding accounting entries are prohibited.

### Reconciliation Requirements

Daily reconciliation must compare:

- Processor refund totals
- ClubOS refund records
- External accounting entries

Any discrepancy triggers Finance Manager review before additional refunds
can be processed.

---

## Cancellation Fee Policy

| Scenario | Policy Example |
|----------|----------------|
| Cancel > 7 days before | Full refund |
| Cancel 3-7 days before | 75% refund, 25% fee |
| Cancel < 3 days before | 50% refund, 50% fee |
| No-show | No refund |

Finance Manager may override policy in documented exceptional cases.

---

## Key Guardrails

1. Cancellation is not a refund. A cancelled registration may or may not
   result in a refund depending on policy and Finance Manager approval.

2. Separation of duties. Event Chairs and members can initiate cancellations,
   but only the Finance Manager can approve and execute refunds.

3. Audit everything. Every refund request, approval, and execution must be
   logged with timestamps, actor IDs, and reason codes.

---

## Related Documents

- [EVENT_CHAIR_WORKFLOW.md](./EVENT_CHAIR_WORKFLOW.md)
- [AUTH_AND_RBAC.md](../rbac/AUTH_AND_RBAC.md) - Delegation Layer section
- SYSTEM_SPEC.md - Partnerships section

---

*Document maintained by ClubOS development team. Last updated: December 2024*
