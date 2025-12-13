# QuickBooks Integration Boundary

**Audience**: Tech Chair, Treasurer, Board
**Purpose**: Define the integration boundary between ClubOS and QuickBooks

---

## Core Principle

**QuickBooks is the system of record for all financial data.**

ClubOS integrates with QuickBooks but does not replace it. ClubOS tracks workflow context, approvals, and operational data. QuickBooks tracks accounting truth, the general ledger, and financial reporting.

---

## What Each System Tracks

| Data Type | ClubOS Tracks | QuickBooks Tracks |
|-----------|---------------|-------------------|
| Member payments | Registration, event, member context | Revenue, payment method, deposit |
| Refunds | Request, approval, execution workflow | Expense/credit, GL impact |
| Cancellation fees | Policy applied, amount retained | Revenue adjustment |
| Event revenue | Registrations, capacity, attendance | Income by category |
| Member balances | Operational context only | Authoritative balance |

---

## Integration Principles

### 1. Sync Finalized Transactions

- Only sync transactions that have completed their ClubOS lifecycle
- Include: event ID, registration ID, member ID, amount, reason code
- Do not sync pending or draft transactions

### 2. Keep References Bidirectional

- ClubOS stores QuickBooks transaction reference after sync
- QuickBooks memo field includes ClubOS reference (event, registration)
- Either system can trace to the other

### 3. Reconcile Processor vs QuickBooks

- Payment processor (Stripe, Square, etc.) is the source of money movement
- ClubOS must reconcile processor activity against QuickBooks
- Discrepancies trigger Finance Manager review

### 4. Avoid Hidden Balances

- ClubOS must not maintain member credit balances that differ from QuickBooks
- Any credit or adjustment in ClubOS must sync to QuickBooks
- Ghost credits (internal credit with no QuickBooks entry) are a critical failure

---

## Sync Flow

```
ClubOS Transaction Lifecycle
            |
            v
   +---------------------+
   | Transaction reaches |
   | SYNCED state        |
   +---------------------+
            |
            v
   +---------------------+
   | Push to QuickBooks  |
   | with full context   |
   +---------------------+
            |
            v
   +---------------------+
   | Store QB reference  |
   | in ClubOS record    |
   +---------------------+
            |
            v
   +---------------------+
   | Daily reconciliation|
   | validates match     |
   +---------------------+
```

---

## What ClubOS Does NOT Do

- Does not replace QuickBooks for financial reporting
- Does not maintain authoritative member balances
- Does not generate financial statements
- Does not handle tax reporting or compliance
- Does not store sensitive payment card data (PCI scope belongs to processor)

---

## Error Handling

| Error | Action |
|-------|--------|
| QuickBooks sync fails | Retry with backoff; alert Finance Manager after 3 failures |
| Reconciliation mismatch | Block further syncs; require manual review |
| Duplicate transaction detected | Flag for review; do not auto-correct |

---

## Related Documents

- [Finance Manager Workflow](./workflows/FINANCE_MANAGER_WORKFLOW.md)
- [Finance Roles](./rbac/FINANCE_ROLES.md)

---

*Document maintained by ClubOS development team. Last updated: December 2024*
