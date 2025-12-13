# Finance Roles

This document defines the Finance Manager role and its separation from
Event Chair responsibilities.

---

## Finance Manager Role

### Definition

The Finance Manager is responsible for all money movement operations:

- Approving refund requests
- Executing refunds via payment processor
- Recording transactions in QuickBooks
- Reconciling ClubOS with QuickBooks
- Maintaining financial audit trail

### Why This Role Exists

**Problem observed in legacy systems:**

1. Event Chairs could process refunds directly
2. No approval gate for money leaving the organization
3. Refunds executed without corresponding QuickBooks entries ("ghost credits")
4. Books didn't balance; audit trail broken
5. Difficult to track who authorized what

**Solution:**

Separate the person who decides "this member shouldn't attend" (Event Chair)
from the person who decides "this member should get their money back"
(Finance Manager).

---

## Role Boundaries

### Event Chair Responsibilities

- Manage event content and logistics
- Handle registration operations
- Cancel registrations (operational decision)
- **REQUEST** refunds (initiate workflow)
- Communicate with attendees

### Finance Manager Responsibilities

- **APPROVE** refund requests (authorization gate)
- **EXECUTE** refunds (money movement)
- Record in QuickBooks (accounting system of record)
- Reconcile systems
- Handle financial exceptions

### What Event Chairs CANNOT Do

- Execute refunds
- Access QuickBooks
- Override Finance Manager decisions
- Process payments directly

### What Finance Manager CANNOT Do

- Cancel registrations
- Activate events
- Modify event content
- Email event attendees directly

---

## Permission Matrix

| Permission | Event Chair | Finance Manager | Treasurer |
|------------|-------------|-----------------|-----------|
| Cancel registration | Yes | No | No |
| Request refund | Yes | No | No |
| Approve refund | No | Yes | Yes |
| Execute refund | No | Yes | Yes |
| Access QuickBooks | No | Yes | Yes |
| View payment history | Limited | Full | Full |
| Run finance reports | No | Yes | Yes |
| View refund queue | No | Yes | Yes |

---

## Workflow Integration

### Standard Refund Flow

```
Event Chair                Finance Manager              QuickBooks
    |                            |                          |
    |-- Cancel Registration ---->|                          |
    |                            |                          |
    |-- Request Refund --------->|                          |
    |                            |                          |
    |                            |-- Review Request         |
    |                            |                          |
    |                            |-- Approve/Reject         |
    |                            |                          |
    |                            |-- Execute Refund ------->|
    |                            |                          |
    |                            |-- Record in QB --------->|
    |                            |                          |
    |<-- Notification -----------|                          |
    |                            |                          |
```

### Event Cancellation Flow

When an entire event is cancelled:

1. Event Chair marks event as cancelled
2. Event Chair notifies all registrants
3. For each paid registration:
   - Event Chair submits refund request
   - Finance Manager reviews batch
   - Finance Manager approves batch
   - Finance Manager executes refunds
   - Finance Manager records in QuickBooks

---

## Implementation Notes

### Database Model

```
RefundRequest {
  id
  registrationId
  requestedById (Event Chair)
  requestedAt
  amount
  reason
  status (PENDING, APPROVED, REJECTED, COMPLETED)
  approvedById (Finance Manager)
  approvedAt
  executedAt
  paymentProcessorRefundId
  quickbooksTransactionId
  notes
}
```

### API Endpoints

```
POST /api/refunds/request
  - Requires: Event Chair role
  - Creates pending refund request

GET /api/refunds/pending
  - Requires: Finance Manager role
  - Returns pending refund requests

POST /api/refunds/:id/approve
  - Requires: Finance Manager role
  - Approves a pending request

POST /api/refunds/:id/reject
  - Requires: Finance Manager role
  - Rejects a pending request with reason

POST /api/refunds/:id/execute
  - Requires: Finance Manager role
  - Records execution details and marks complete
```

### UI Requirements

**Event Chair View:**
- Button to request refund on cancelled registrations
- View status of submitted requests
- Notification when request approved/rejected/completed

**Finance Manager View:**
- Queue of pending refund requests
- Batch approval capability
- Execution form with confirmation fields
- Reconciliation dashboard

---

## Audit Trail

Every refund must record:

- Who requested (Event Chair)
- When requested
- Why requested (reason text)
- Who approved (Finance Manager)
- When approved
- Who executed
- When executed
- Payment processor confirmation
- QuickBooks transaction ID
- Any notes or exceptions

---

## Exception Handling

### Finance Manager Rejects Request

1. Finance Manager marks request as REJECTED
2. Enters reason for rejection
3. Event Chair receives notification
4. Event Chair can resubmit with additional information OR
5. Event Chair can escalate to Treasurer

### Escalation Path

Event Chair -> Finance Manager -> Treasurer -> Board

### Emergency Refunds

In urgent situations (e.g., Finance Manager unavailable):

- Treasurer can approve and execute refunds
- Must still follow same process (request, approve, execute, record)
- Must document why emergency process was used

---

## Cross-References

- Event Chair workflow: docs/workflows/EVENT_CHAIR_WORKFLOW.md
- Finance Manager workflow: docs/workflows/FINANCE_MANAGER_WORKFLOW.md
- RBAC overview: docs/RBAC_OVERVIEW.md
- AUTH_AND_RBAC: docs/rbac/AUTH_AND_RBAC.md
