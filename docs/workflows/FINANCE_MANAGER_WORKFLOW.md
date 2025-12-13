# Finance Manager Workflow: Refunds, Fees, and Reconciliation

**Audience**: Treasurer, Finance Manager, Tech Chair
**Purpose**: Define the financial workflow for refunds, cancellation fees, and reconciliation

---

## Overview

This workflow describes how the Finance Manager handles refunds, applies cancellation fees, and ensures reconciliation with QuickBooks. The goal is to prevent ghost credits and maintain a single source of financial truth.

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
| REQUESTED | Event Chair or member initiated refund request |
| APPROVED | Finance Manager reviewed and authorized |
| EXECUTED | Payment processor has processed the refund |
| RECORDED | ClubOS internal records updated |
| SYNCED | Transaction synced to QuickBooks |

A refund is not complete until it reaches SYNCED state.

---

## Finance Manager Actions

### Approving Refunds

1. Review refund request (member, event, amount, reason)
2. Check policy compliance:
   - Cancellation timing (days before event)
   - Replacement status (if policy requires replacement first)
   - Prior refund history for member
3. Approve or deny with reason
4. If approved, set refund amount (may differ from request)
5. Apply cancellation fee if policy requires

### Executing Refunds

1. Select approved refund(s) for execution
2. Confirm processor connection is active
3. Execute through payment processor
4. Wait for processor confirmation
5. Record execution result (success/failure)

### Applying Cancellation Fees

| Scenario | Policy Example |
|----------|----------------|
| Cancel > 7 days before | Full refund |
| Cancel 3-7 days before | 75% refund, 25% fee |
| Cancel < 3 days before | 50% refund, 50% fee |
| No-show | No refund |

Finance Manager may override policy in documented exceptional cases.

---

## Preventing Ghost Credits

**Problem observed**: Processor refund executes but internal credit record remains, creating a "ghost credit" that does not exist in reality.

**Prevention requirements**:

1. **Atomic recording**: Refund execution and internal record update must be a single transaction
2. **Reconciliation check**: Daily reconciliation compares:
   - Processor refund totals
   - ClubOS refund records
   - QuickBooks entries
3. **Discrepancy alerts**: Any mismatch triggers Finance Manager review
4. **Single source of truth**: QuickBooks is authoritative; ClubOS must match

---

## Reconciliation Workflow

```
Daily automated job runs
            |
            v
   +---------------------+
   | Fetch processor     |
   | transactions        |
   +---------------------+
            |
            v
   +---------------------+
   | Compare to ClubOS   |
   | refund records      |
   +---------------------+
            |
            v
   +---------------------+
   | Compare to          |
   | QuickBooks entries  |
   +---------------------+
            |
            v
   +---------------------+
   | Any discrepancies?  |
   +---------------------+
            |
       +----+----+
       |         |
       v         v
     YES        NO
       |         |
       v         v
   +-----------+ +--------+
   | Alert FM  | | Done   |
   | for       | +--------+
   | review    |
   +-----------+
```

---

## Partial Refunds

The system must support:

- Refund less than original payment
- Split refunds (event fee vs. optional add-ons)
- Cancellation fee deduction before refund
- Multiple partial refunds for the same registration (rare)

Each partial refund is a separate record with its own lifecycle.

---

## No Refund Unless Replacement Policy

When enabled for an event:

1. Refund request cannot proceed to APPROVED until replacement confirmed
2. Event Chair must complete waitlist substitution first
3. System blocks Finance Manager approval if no replacement
4. Finance Manager can override with documented justification

---

## Audit Requirements

Every financial transaction must record:

- Who requested (member or Event Chair)
- Who approved (Finance Manager)
- Who executed (Finance Manager or system)
- Original amount requested
- Final amount refunded
- Fee amount retained
- Timestamp for each state transition
- Reason code
- Processor transaction ID
- QuickBooks reference (after sync)

---

## Related Documents

- [Event Chair Workflow](./EVENT_CHAIR_WORKFLOW.md)
- [Finance Roles](../rbac/FINANCE_ROLES.md)
- [QuickBooks Integration](../QUICKBOOKS_INTEGRATION.md)

---

*Document maintained by ClubOS development team. Last updated: December 2024*
