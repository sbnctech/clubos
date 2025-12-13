# Event Chair Workflow: Cancellations and Waitlist Substitution

**Audience**: Event Chairs, VPs of Activities
**Purpose**: Define the operational workflow for handling cancellations and waitlist substitutions

---

## Overview

This workflow describes how Event Chairs handle member cancellations and waitlist
substitutions. The goal is predictable, auditable operations with clear handoff
to Finance Manager when refunds are involved.

---

## Cancellation Flow

```
Member or partner requests cancellation
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
   | (handoff to FM)  |
   +------------------+
```

---

## Waitlist Substitution Rules

When a spot opens up, the waitlist is processed in this order:

1. Timestamp priority: Earliest waitlist entry first
2. Same registration type: Match original capacity slot type if applicable
3. Household rule: If event has per-household limits, check compliance

The system identifies the next eligible waitlist member. The Event Chair
confirms and triggers the promotion.

---

## Partnership Delegation Notes

Cancellations and registrations may be initiated by a partner under partnership
delegation. The following rules apply:

- A partner with delegation rights may cancel a registration on behalf of their
  partner. The system must verify the delegation is active before allowing the
  action.

- Waitlist substitution logic is independent of who initiated the cancellation.
  The next eligible member is promoted regardless of whether the cancellation
  was initiated by the registrant, their partner, or the Event Chair.

- The audit trail must show the acting partner vs the affected registrant. Every
  cancellation record must include:
  - actingMemberId: Who clicked cancel
  - affectedMemberId: Whose registration was cancelled
  - timestamp
  - eventId
  - registrationId

This distinction is critical for support requests and dispute resolution.

---

## Refund Handoff

When a cancellation may require a refund:

1. Event Chair (or member/partner) initiates the cancellation
2. System creates a Pending Refund Request if applicable
3. Finance Manager reviews eligibility and amount
4. Finance Manager approves/denies and executes refund

**Key rule**: Cancellation is not a refund. These are separate actions.

---

## Related Documents

- [FINANCE_MANAGER_WORKFLOW.md](./FINANCE_MANAGER_WORKFLOW.md)
- [AUTH_AND_RBAC.md](../rbac/AUTH_AND_RBAC.md) - Delegation Layer section
- SYSTEM_SPEC.md - Partnerships section

---

*Document maintained by ClubOS development team. Last updated: December 2024*
