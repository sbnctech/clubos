# Event Chair Workflow

**Audience**: Event Chairs, VPs of Activities
**Purpose**: Define operational workflows for Event Chairs

---

## Overview

This document describes the key workflows Event Chairs follow when creating,
managing, and closing events in ClubOS.

---

## Event Creation Workflow

1. Create event draft with required fields
2. Configure registration settings (capacity, fees, deadlines)
3. Review and confirm policy gates (see checklist below)
4. Request publication from VP of Activities
5. VP reviews and publishes (or requests changes)

---

## Policy Gates to Confirm Before Posting

Before requesting event publication, verify each gate:

### Venue Gate
- [ ] Venue type selected: PRIVATE_HOME, PUBLIC_VENUE, or BOATING
- [ ] If PRIVATE_HOME: House Registrar approval attached
- [ ] If BOATING: VP Activities approval attached and insurance documented

### Non-Member Gate
- [ ] Non-member policy configured correctly for venue type
- [ ] If PRIVATE_HOME: Confirm no non-members can register
- [ ] If PUBLIC_VENUE with non-members: Member priority window set
- [ ] Non-member fee >= member fee (if applicable)

### Registration Gate
- [ ] Registration required setting matches event intent
- [ ] Capacity set appropriately for venue

### Host Gate
- [ ] Host(s) designated if applicable
- [ ] Host guest limits configured (remember: no guests at private homes)

### Alcohol Gate
- [ ] If serving alcohol: responsible party assigned
- [ ] Alcohol policy acknowledgment enabled for registrants

For detailed gate definitions and examples, see:
[EVENT_POLICY_GATES.md](../policies/EVENT_POLICY_GATES.md)

---

## Cancellation and Substitution Workflow

When handling cancellations:

1. Receive cancellation request from member (or partner acting on their behalf)
2. Confirm request and execute cancellation in system
3. Check waitlist for eligible replacement
4. If replacement found: promote and notify
5. If refund needed: initiate refund request (handoff to Finance Manager)

Key rules:
- Cancellation is not a refund (separate actions)
- Waitlist priority: earliest timestamp first
- Audit trail must record who acted and who was affected

---

## Refund Handoff

When a cancellation requires a refund:

1. Event Chair initiates refund request in system
2. System creates Pending Refund Request
3. Finance Manager reviews eligibility and policy
4. Finance Manager approves/denies and executes

Event Chair does NOT execute refunds directly.

---

## Related Documents

- [EVENT_POLICY_GATES.md](../policies/EVENT_POLICY_GATES.md) - Detailed policy gate definitions
- [AUTH_AND_RBAC.md](../rbac/AUTH_AND_RBAC.md) - Role permissions

---

*Document maintained by ClubOS development team. Last updated: December 2024*
