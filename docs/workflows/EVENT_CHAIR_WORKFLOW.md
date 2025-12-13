# Event Chair Workflow: Cancellations and Waitlist Substitution

**Audience**: Event Chairs, VPs of Activities
**Purpose**: Define the operational workflow for handling cancellations and waitlist substitutions

---

## Overview

This workflow describes how Event Chairs handle member cancellations and waitlist substitutions. The goal is predictable, auditable operations with clear handoff to Finance Manager when refunds are involved.

---

## Cancellation and Substitution Steps

```
Member requests cancellation
            |
            v
   +------------------+
   | Event Chair      |
   | confirms request |
   +------------------+
            |
            v
   +------------------+
   | Cancel the       |
   | registration     |
   | (status change)  |
   +------------------+
            |
            v
   +------------------+
   | Waitlist check:  |
   | Is there a       |
   | replacement?     |
   +------------------+
            |
       +----+----+
       |         |
       v         v
     YES        NO
       |         |
       v         |
   +------------+|
   | Promote    ||
   | next from  ||
   | waitlist   ||
   +------------+|
       |         |
       v         v
   +------------------+
   | Notify affected  |
   | members          |
   +------------------+
            |
            v
   +------------------+
   | Refund needed?   |
   +------------------+
            |
       +----+----+
       |         |
       v         v
     YES        NO
       |         |
       v         v
   +------------+ +--------+
   | Initiate   | | Done   |
   | refund     | +--------+
   | request    |
   | (handoff   |
   |  to FM)    |
   +------------+
```

---

## Replacement Ordering and Priority

When a spot opens up, the waitlist is processed in this order:

1. **Timestamp priority**: Earliest waitlist entry first
2. **Same registration type**: Match original capacity slot type if applicable
3. **Household rule**: If event has per-household limits, check compliance before promotion

The system automatically identifies the next eligible waitlist member. The Event Chair confirms and triggers the promotion.

---

## Chair Responsibilities

| Step | Chair Action | System Action |
|------|--------------|---------------|
| 1 | Receive cancellation request | Log request timestamp |
| 2 | Confirm member identity | Validate registration exists |
| 3 | Execute cancellation | Update status to CANCELLED |
| 4 | Review waitlist | Show next eligible member |
| 5 | Confirm promotion | Update waitlist member to REGISTERED |
| 6 | (If refund) Initiate request | Create refund request record |

---

## Audit Trail Requirements

Every cancellation and substitution must record:

- Who requested the cancellation (member)
- Who executed the cancellation (Event Chair)
- Timestamp of cancellation
- Replacement member (if any)
- Timestamp of promotion
- Reason code (voluntary, emergency, no-show, etc.)

---

## Handoff to Finance Manager

When a refund is involved:

1. Event Chair initiates refund request in system
2. Request includes: member, amount, event, reason, replacement status
3. Finance Manager receives notification
4. Finance Manager approves/denies and executes
5. Event Chair receives confirmation when complete

**Important**: Event Chair does not execute refunds directly. The system enforces separation of duties.

---

## Policy Hook: Replacement Required Before Refund

Some events may require a replacement before a refund can be processed:

- Policy is set at event or category level
- If enabled, refund request cannot proceed until waitlist promotion occurs
- Finance Manager can override in exceptional cases

This policy protects the club from revenue loss on high-demand events.

---

## Related Documents

- [Finance Manager Workflow](./FINANCE_MANAGER_WORKFLOW.md)
- [Finance Roles](../rbac/FINANCE_ROLES.md)

---

*Document maintained by ClubOS development team. Last updated: December 2024*
