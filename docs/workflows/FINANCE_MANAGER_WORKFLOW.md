# Finance Manager Workflow

This document defines the workflow responsibilities and decision gates for
the Finance Manager role.

---

## Role Definition

The Finance Manager:

- Approves and executes all refunds
- Ensures QuickBooks reconciliation
- Maintains financial audit trail
- Prevents "ghost credits" (refunds without accounting entries)

**Key principle:** Cancellation is NOT a refund. These are separate actions
with different authorization levels.

---

## Separation of Duties

| Action | Who Can Initiate | Who Can Execute |
|--------|------------------|-----------------|
| Cancel registration | Event Chair | Event Chair |
| Request refund | Event Chair | Event Chair |
| Approve refund | Finance Manager | Finance Manager |
| Execute refund | Finance Manager | Finance Manager |
| Record in QuickBooks | Finance Manager | Finance Manager |

**Why this separation exists:**

- Event Chairs handle operational decisions (who attends)
- Finance Manager handles money movement (who gets paid back)
- Prevents unauthorized refunds
- Creates clear audit trail
- Ensures QuickBooks stays in sync

---

## Refund Request Queue

### Viewing Pending Requests

Finance Manager dashboard shows:

- All pending refund requests
- Requester (Event Chair)
- Event name and date
- Member name
- Original payment amount
- Reason for refund request
- Request timestamp

### Reviewing a Request

For each request, Finance Manager verifies:

1. Registration was actually cancelled
2. Payment was actually received
3. Refund amount is correct
4. Reason is valid per club policy

---

## Refund Execution Workflow

### Step 1: Approve the Request

1. Review request details
2. Verify against original payment
3. Click "Approve"
4. System records approval timestamp and approver

### Step 2: Execute the Refund

**Option A: Payment processor refund**

1. Navigate to payment processor (Stripe, PayPal, etc.)
2. Locate original transaction
3. Issue refund for approved amount
4. Record confirmation number in ClubOS

**Option B: Manual refund (check)**

1. Issue check for approved amount
2. Record check number in ClubOS
3. Mail or deliver check

### Step 3: Record in QuickBooks

**This step is REQUIRED for every refund.**

1. Open QuickBooks
2. Create refund entry linked to original payment
3. Verify account balances
4. Record QB transaction ID in ClubOS

### Step 4: Mark Complete

1. Enter confirmation/reference numbers
2. Mark refund as "Completed"
3. System notifies member of completed refund

---

## Observed Failures This Process Prevents

### Ghost Credits

**Problem:** Member receives refund in ClubOS but no QuickBooks entry.

- Books don't balance
- Audit trail broken
- Money "disappears" from accounting perspective

**Prevention:** Finance Manager must record QB entry before marking complete.

### Unauthorized Refunds

**Problem:** Event Chair refunds a member without proper approval.

- No oversight on money movement
- Potential for fraud or errors
- Missing documentation

**Prevention:** Event Chairs can only REQUEST refunds, not execute them.

### Duplicate Refunds

**Problem:** Same refund processed multiple times.

- Member receives multiple payments
- Difficult to recover funds

**Prevention:** System tracks refund status and prevents duplicate execution.

### Refund Without Cancellation

**Problem:** Member gets refund but remains registered.

- Takes spot from waitlisted members
- Confuses attendance tracking

**Prevention:** Refund requests require cancelled registration status.

---

## Reconciliation Process

### Daily Reconciliation

Finance Manager should daily:

1. Review completed refunds
2. Verify QuickBooks entries match ClubOS records
3. Investigate any discrepancies

### Monthly Reconciliation

Finance Manager should monthly:

1. Run refund report for the month
2. Compare to QuickBooks refund totals
3. Compare to payment processor refund totals
4. Document any discrepancies and resolutions

---

## Refund Policies

### Standard Refund Policy

- Full refund: Cancelled 7+ days before event
- Partial refund (50%): Cancelled 3-7 days before event
- No refund: Cancelled less than 3 days before event
- Exception: Medical emergency with documentation

### Policy Exceptions

Finance Manager MAY approve exceptions for:

- Medical emergencies
- Family emergencies
- Event cancellation by club
- Club error (double-charged, wrong amount, etc.)

**Requirement:** Document reason for exception.

---

## Permissions Summary

| Action | Finance Manager Can |
|--------|---------------------|
| View all refund requests | Yes |
| Approve refund requests | Yes |
| Reject refund requests | Yes |
| Execute approved refunds | Yes |
| Access QuickBooks | Yes |
| View payment history | Yes |
| Cancel registrations | **No** - Event Chair role |
| Activate events | **No** - Activities VP role |

---

## Reporting

Finance Manager has access to:

- Refund request report (pending, approved, completed, rejected)
- Refund summary by event
- Refund summary by time period
- Reconciliation status report
- Exception report (policy overrides)

---

## QuickBooks Integration

ClubOS is the workflow and approval layer.
QuickBooks is the system of record for accounting.

### Data Flow

1. Payment received in ClubOS
2. ClubOS records payment details
3. Finance Manager (or automated sync) creates QB invoice/receipt
4. When refund executed:
   - ClubOS records refund approval and execution
   - Finance Manager creates QB refund entry
   - Both systems reference each other's IDs

### What ClubOS Tracks

- Who requested the refund
- Who approved it
- When it was approved
- When it was executed
- Payment processor confirmation
- QuickBooks transaction ID

### What QuickBooks Tracks

- Actual money movement
- Account balances
- Tax implications
- Full accounting history

---

## Cross-References

- Event Chair workflow: docs/workflows/EVENT_CHAIR_WORKFLOW.md
- Finance roles: docs/rbac/FINANCE_ROLES.md
- QuickBooks integration: docs/QUICKBOOKS_INTEGRATION.md (future)
- RBAC overview: docs/RBAC_OVERVIEW.md
