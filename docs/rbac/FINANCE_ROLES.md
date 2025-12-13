# Finance Manager Role

**Audience**: Treasurer, Finance Committee, Tech Chair
**Purpose**: Define the Finance Manager role and its separation of duties from Event Chair

---

## Role Definition

**Role name**: Finance Manager
**Slug**: `finance-manager`

**Who has this role**: Treasurer or designated finance volunteer responsible for money movement

---

## Responsibilities

The Finance Manager is responsible for:

- Approve or deny refund requests
- Apply cancellation fee policy consistently
- Execute refunds through payment processor
- Resolve credits and adjustments
- Ensure audit trail integrity for all financial transactions
- Reconcile processor activity against QuickBooks

---

## Separation of Duties

The Finance Manager role enforces clear boundaries between operational and financial actions:

| Action | Event Chair | Finance Manager |
|--------|:-----------:|:---------------:|
| Cancel registration | Yes | No |
| Initiate refund request | Yes | No |
| Approve refund | No | Yes |
| Execute refund | No | Yes |
| Apply cancellation fee | No | Yes |
| Move waitlist member | Yes | No |

**Key rule**: Cancellation is not a refund.

- Event Chair cancels the registration (operational action)
- Finance Manager approves and executes the refund (financial action)
- These are separate, intentional steps with distinct authorization

---

## Why This Separation Matters

Without clear separation:

- Automatic refunds can occur without financial oversight
- Credits may be issued without being recorded in QuickBooks
- Inconsistent fee application across similar situations
- No audit trail linking operational decisions to financial outcomes

With Finance Manager role:

- Every refund has explicit authorization
- Financial transactions are recorded consistently
- Cancellation fees follow policy
- Clear accountability for money movement

---

## Permission Matrix

| Permission | Admin | Finance Manager | VP | Event Chair | Member |
|------------|:-----:|:---------------:|:--:|:-----------:|:------:|
| View refund requests | Yes | Yes | No | No | No |
| Approve refunds | Yes | Yes | No | No | No |
| Execute refunds | Yes | Yes | No | No | No |
| Apply cancellation fees | Yes | Yes | No | No | No |
| View financial audit log | Yes | Yes | No | No | No |
| Cancel registrations | Yes | No | Yes | Yes | No |
| Initiate refund request | Yes | No | Yes | Yes | No |

---

## Workflow Handoff Points

See [EVENT_CHAIR_WORKFLOW.md](../workflows/EVENT_CHAIR_WORKFLOW.md) for the Event Chair perspective.

See [FINANCE_MANAGER_WORKFLOW.md](../workflows/FINANCE_MANAGER_WORKFLOW.md) for the Finance Manager workflow.

---

*Document maintained by ClubOS development team. Last updated: December 2024*
