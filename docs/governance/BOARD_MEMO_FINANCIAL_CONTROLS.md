# Why ClubOS Financial Controls Are Safer Than Legacy Systems

**To**: SBNC Board of Directors
**From**: Tech Committee
**Date**: December 2024
**Subject**: Financial Control Design in ClubOS

---

## Executive Summary

ClubOS has been designed with financial controls that address specific problems experienced with our prior event management system. This memo explains, in plain English, how ClubOS protects the club's money and ensures clear accountability for every financial transaction.

The key principle is simple: **no money leaves the organization without explicit human approval, and every transaction is recorded in QuickBooks.**

---

## How ClubOS Protects Club Finances

### 1. Refunds

**The Problem We Solved**

In the past, when a member cancelled an event registration, the system sometimes issued a refund automatically. This created several problems:

- Refunds happened without anyone reviewing whether they were appropriate
- Some refunds were recorded internally but never made it to QuickBooks
- The Treasurer discovered discrepancies only during manual reconciliation
- There was no record of who authorized the refund or why

**How ClubOS Works**

In ClubOS, a cancellation and a refund are two separate actions performed by two different people:

1. **Event Chair cancels the registration** - This is an operational decision (the member is no longer attending)
2. **Finance Manager approves and executes the refund** - This is a financial decision (money should be returned)

No refund can occur without the Finance Manager explicitly approving it. The system enforces this rule; it cannot be bypassed.

Every refund records:
- Who requested it
- Who approved it
- The original amount and final amount
- Any cancellation fee applied
- The reason for the refund
- The QuickBooks reference number

**Reference**: `docs/workflows/FINANCE_MANAGER_WORKFLOW.md`, `docs/rbac/FINANCE_ROLES.md`

---

### 2. Cancellations

**The Problem We Solved**

Event Chairs sometimes could not process cancellations through the system. They resorted to email and manual workarounds. This meant:

- No consistent record of who cancelled and when
- Members received inconsistent communication
- Waitlist members were not notified promptly
- No audit trail of who replaced whom

**How ClubOS Works**

Event Chairs have clear authority to:
- Cancel a member's registration
- Promote the next person from the waitlist
- Notify affected members

What Event Chairs cannot do:
- Issue refunds (that requires Finance Manager)
- Delete financial records
- Bypass the waitlist order

The system records every cancellation with:
- Who requested it (the member)
- Who executed it (the Event Chair)
- The timestamp
- The replacement member (if any)
- The reason code

**Reference**: `docs/workflows/EVENT_CHAIR_WORKFLOW.md`

---

### 3. Delegated Authority (Partners)

**The Problem We Solved**

Couples often want one partner to handle event registrations for both. Without a formal system, this happened informally, creating confusion about:

- Who actually registered
- Whose card was charged
- Who should receive the refund if cancelled

**How ClubOS Works**

ClubOS supports formal "partnerships" where two members can act on each other's behalf. This is not account sharing; each person keeps their own identity and membership.

**Important**: Partnership delegation requires explicit consent from BOTH partners before it becomes active. One partner cannot unilaterally grant themselves authority over another. Either partner may revoke consent at any time.

Partnership delegation can be configured as:
- **Mutual**: Either partner can register, cancel, or pay for both
- **One-way**: One designated partner handles both; the other acts only for themselves
- **Independent**: Partners are linked for household tracking but cannot act for each other

Key protections:
- Bilateral consent required before any delegation is active
- Every action records both the acting member and the affected member
- Refunds go back to the original payment method, even if a partner paid
- Cancellation by a partner follows the same rules as self-cancellation

**Reference**: `SYSTEM_SPEC.md` (Partnerships section)

---

### 4. Accounting Reconciliation

**The Problem We Solved**

The most serious financial risk was "ghost credits" - situations where the system showed a member had a credit balance, but no corresponding entry existed in QuickBooks. This happened because:

- The internal system and accounting system were not synchronized
- Refunds were processed without being recorded in both places
- Discrepancies were discovered only during manual audits

**How ClubOS Works**

ClubOS treats QuickBooks as the "single source of truth" for all financial data. ClubOS tracks the workflow (who requested what, who approved it), but QuickBooks tracks the actual money.

The integration works like this:

1. A refund is not considered complete until it reaches QuickBooks
2. Every transaction includes references that link ClubOS and QuickBooks records
3. Daily reconciliation compares the payment processor, ClubOS records, and QuickBooks
4. Any discrepancy blocks further processing until the Finance Manager reviews it

Ghost credits are defined as a **critical failure** in our specifications. The system is designed to make them impossible.

**Reference**: `docs/QUICKBOOKS_INTEGRATION.md`

---

## Summary of Controls

| Risk | Control | Who Is Responsible |
|------|---------|-------------------|
| Unauthorized refunds | Refunds require Finance Manager approval | Finance Manager |
| Missing audit trail | Every action logged with actor, timestamp, reason | System (automatic) |
| Inconsistent fees | Cancellation fee policy applied by Finance Manager | Finance Manager |
| Partner confusion | Formal partnership model with explicit delegation | Members (setup), System (enforcement) |
| Accounting mismatch | QuickBooks is authoritative; daily reconciliation | Finance Manager, System |

---

## What This Means for the Board

1. **Clear accountability**: For any financial question, we can identify who approved what and when.

2. **Separation of duties**: The person who cancels a registration is not the same person who issues the refund.

3. **Auditable records**: Every transaction has a complete history suitable for audit review.

4. **Protected accounting**: QuickBooks remains the authoritative record. ClubOS cannot create balances that do not exist in QuickBooks.

5. **Documented design**: These controls are not informal practices. They are encoded in the system specifications and enforced by the software.

---

## Questions?

The Tech Committee is available to walk through any of these controls in more detail. The full specifications are available in the ClubOS repository for review.

---

*This memo summarizes financial controls documented in SYSTEM_SPEC.md, docs/QUICKBOOKS_INTEGRATION.md, docs/workflows/FINANCE_MANAGER_WORKFLOW.md, docs/workflows/EVENT_CHAIR_WORKFLOW.md, and docs/rbac/FINANCE_ROLES.md.*
