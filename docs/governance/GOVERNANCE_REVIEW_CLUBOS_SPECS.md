# Governance Review: ClubOS Specs

**Reviewer**: Governance and Board Readiness Review
**Date**: December 2024
**Scope**: SYSTEM_SPEC.md (Observed Failures), QUICKBOOKS_INTEGRATION.md, FINANCE_MANAGER_WORKFLOW.md, FINANCE_ROLES.md

---

## Board-Safe Strengths

The current specifications include several governance-appropriate controls:

1. **Explicit separation of duties**: The system enforces a clear boundary between operational actions (Event Chair) and financial actions (Finance Manager). The phrase "cancellation is not a refund" is explicit, intentional, and auditable.

2. **QuickBooks protected as system of record**: The specs explicitly state that QuickBooks is authoritative for all financial data. ClubOS does not maintain member balances that could diverge from the accounting system.

3. **Ghost credits defined as critical failure**: The specifications call out the specific failure mode of internal credits without QuickBooks entries. This shows awareness of a real reconciliation risk.

4. **Audit trail requirements are documented**: Every refund requires recording who requested, who approved, who executed, original amount, final amount, fee retained, timestamps, reason codes, and processor/QuickBooks references.

5. **Observed failures from legacy system documented**: SYSTEM_SPEC.md includes a section on specific failures from prior systems. This demonstrates that the design is informed by real operational problems, not theoretical concerns.

6. **Override authority exists but requires documentation**: Finance Manager can override replacement-required policy "with documented justification." This balances operational flexibility with accountability.

---

## Governance Risks (Requiring Clarification)

The following items may raise questions from board members or auditors:

### Risk 1: Escalation Path for Emergencies

**Issue**: The specs do not document what happens when the Finance Manager is unavailable (vacation, illness, resignation). Who can authorize refunds in an emergency?

**Board concern**: "What if the Treasurer is on vacation and a member needs an urgent refund?"

**Auditor concern**: "Who has backup authority, and is that authority logged the same way?"

### Risk 2: No Dollar Threshold for Dual Control

**Issue**: Large refunds (e.g., group cancellation for a travel event) are approved and executed by a single Finance Manager. Standard nonprofit practice often requires dual approval above a threshold.

**Board concern**: "Can one person refund $5,000 without a second set of eyes?"

**Auditor concern**: "Is there a materiality threshold where additional approval is required?"

### Risk 3: Time Limits on Approved-but-Unexecuted Refunds

**Issue**: The refund lifecycle shows APPROVED -> EXECUTED, but no time limit. A refund could sit in approved state indefinitely, creating a hidden liability.

**Board concern**: "How do we know approved refunds are actually being executed?"

**Auditor concern**: "Is there an aging report? What is the policy on stale approvals?"

### Risk 4: Board Visibility into Financial Activity

**Issue**: The specs describe Finance Manager reconciliation but do not mention board-level reporting or oversight dashboards.

**Board concern**: "How does the board know refunds are being handled properly without asking for a special report?"

### Risk 5: Implicit Admin Override Power

**Issue**: The permission matrix shows Admin can approve refunds, execute refunds, and cancel registrations. This bypasses the separation of duties.

**Board concern**: "Does the Tech Chair have unchecked financial power?"

---

## Suggested Clarifications

The following wording changes address the risks above without introducing new features or changing the authority model.

### Clarification 1: Add Escalation Path to FINANCE_MANAGER_WORKFLOW.md

Add after "Audit Requirements" section:

```
## Emergency Escalation

When the Finance Manager is unavailable:

1. President or Treasurer may act as backup Finance Manager
2. Backup authorization must be logged with reason "FM unavailable"
3. Primary Finance Manager reviews backup actions upon return
4. System does not distinguish between primary and backup FM in audit log

This policy ensures operational continuity while preserving accountability.
```

### Clarification 2: Add Dollar Threshold Note to FINANCE_ROLES.md

Add to "Separation of Duties" section:

```
### Large Transaction Review

For refunds exceeding $500:
- Requires secondary review by Treasurer or President before execution
- Secondary reviewer is recorded in audit trail
- Finance Manager may not execute without secondary approval

This threshold aligns with standard nonprofit internal controls.
```

### Clarification 3: Add Aging Policy to FINANCE_MANAGER_WORKFLOW.md

Add to "Refund Lifecycle" section:

```
### Approval Expiration

Approved refunds must be executed within 14 days. After 14 days:
- Approval expires automatically
- Refund request returns to REQUESTED state
- Finance Manager must re-approve if still valid

This prevents stale approved refunds from creating hidden liabilities.
```

### Clarification 4: Add Board Reporting Note to QUICKBOOKS_INTEGRATION.md

Add after "Reconciliation" section:

```
## Board Reporting

Monthly financial reports to the board include:
- Total refunds processed (count and amount)
- Outstanding refund requests pending approval
- Reconciliation status (all clear or discrepancies flagged)
- Any override actions with justification

Finance Manager provides this report to the Treasurer for board packet.
```

### Clarification 5: Add Admin Scope Note to FINANCE_ROLES.md

Add to "Permission Matrix" section:

```
### Admin Role in Financial Actions

The Admin role has financial permissions for system maintenance only:
- Used for correcting data errors or system recovery
- Not used for routine refund approval or execution
- Admin financial actions require documented justification
- Treasurer reviews Admin financial actions in monthly audit

System Admin should not routinely approve or execute refunds.
```

---

## Why This Design Is Safer Than Wild Apricot

The ClubOS design is safer than Wild Apricot because it explicitly separates the act of cancellation from the act of refund, requires human approval before any money leaves the organization, names QuickBooks as the single source of financial truth, and documents the specific failure modes the system is designed to prevent. Wild Apricot allowed automatic refunds on cancellation, which created credits that never reached the accounting system and left no audit trail of who authorized money movement. ClubOS eliminates this failure by design: no refund can occur without a Finance Manager explicitly approving it, and every refund must sync to QuickBooks before it is considered complete.

---

*This review is advisory. Final governance decisions rest with the Board and Treasurer.*
