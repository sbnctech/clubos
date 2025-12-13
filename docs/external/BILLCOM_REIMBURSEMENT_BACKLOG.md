# Bill.com Reimbursement Workflow - Backlog

**Status**: Backlog (not yet specified)
**Audience**: Tech Chair, Treasurer, Finance Committee
**Purpose**: Document known requirements and proposed workflow for reimbursement tracking

---

## Overview

SBNC uses Bill.com to process reimbursement requests from committee chairs and
members for approved club expenses. This document captures what is known and
proposes a target workflow for ClubOS integration.

**Important**: QuickBooks Online remains the accounting system of record. Bill.com
is the payment processor. ClubOS will provide workflow visibility, not replace
either system.

---

## What Is Known

### Current Process (Observed)

1. Member incurs expense on behalf of club (supplies, venue deposit, etc.)
2. Member submits reimbursement request via Bill.com
3. Request includes: receipt image, amount, expense category, description
4. Treasurer (or designated approver) reviews in Bill.com
5. Approved requests are paid via Bill.com (ACH or check)
6. Transaction syncs to QuickBooks for accounting record

### Current Participants

| Role | Bill.com Access | Responsibility |
|------|-----------------|----------------|
| Treasurer | Admin | Review, approve, configure |
| President | Approver | Backup approval |
| Finance Committee | Viewer | Audit and oversight |
| Committee Chairs | Submitter | Submit reimbursement requests |

### Known Pain Points

| Issue | Impact |
|-------|--------|
| No visibility in ClubOS | Finance Manager cannot see pending requests |
| Manual status tracking | Chair must log into Bill.com to check status |
| No event linkage | Reimbursements not connected to event records |
| Approval bottleneck | Single approver can delay payments |

---

## What Is Unknown (Requires Discovery)

- [ ] Exact Bill.com tier and API availability
- [ ] Current approval workflow configuration (single vs multi-level)
- [ ] Expense category taxonomy used
- [ ] Average volume of reimbursement requests per month
- [ ] Integration options supported by Bill.com (webhook, API, export)
- [ ] Sync frequency with QuickBooks

---

## Proposed Target Workflow

### Goal

Provide visibility into reimbursement status within ClubOS without replacing
Bill.com as the payment processor.

### Proposed Flow

```
Member incurs expense
        |
        v
  Member submits in Bill.com
  (or: Member initiates in ClubOS -> redirects to Bill.com)
        |
        v
  ClubOS receives notification (webhook or poll)
        |
        v
  Reimbursement record created in ClubOS
    - status: PENDING
    - linkedEventId (optional)
    - amount, category, description
        |
        v
  Finance Manager sees in ClubOS dashboard
        |
        v
  Approver approves in Bill.com
        |
        v
  Bill.com notifies ClubOS (webhook or poll)
        |
        v
  ClubOS updates status: APPROVED -> PAID
        |
        v
  QuickBooks sync (handled by Bill.com)
```

### Data Model (Proposed)

```
ReimbursementRequest
  - id (UUID)
  - externalId (string) - Bill.com request ID
  - source (enum: BILLCOM)
  - status (enum: PENDING, APPROVED, REJECTED, PAID, CANCELLED)
  - requestedBy (contactId FK)
  - amount (decimal)
  - category (string) - expense category
  - description (text)
  - eventId (eventId FK nullable) - linked event if applicable
  - receiptUrl (string nullable) - link to receipt in Bill.com
  - submittedAt (datetime)
  - approvedBy (contactId FK nullable)
  - approvedAt (datetime nullable)
  - paidAt (datetime nullable)
  - quickbooksRef (string nullable) - QB transaction reference
  - createdAt (datetime)
  - updatedAt (datetime)
```

### Visibility by Role

| Role | Can See | Can Do |
|------|---------|--------|
| Member | Own requests | View status |
| Event Chair | Committee requests | View status, link to event |
| Finance Manager | All requests | View, link to event, add notes |
| Treasurer | All requests | Full access (via Bill.com) |
| Admin | All requests | View all |

---

## Integration Options

### Option A: Webhook Integration (Preferred if Available)

- Bill.com sends webhook on status change
- ClubOS receives and updates local record
- Near real-time visibility
- Requires: Bill.com webhook support (verify availability)

### Option B: API Polling

- ClubOS polls Bill.com API on schedule (hourly or daily)
- Updates local records with any changes
- Slight delay in visibility
- Requires: Bill.com API access (verify tier requirements)

### Option C: Manual Export/Import

- Treasurer exports CSV from Bill.com periodically
- Upload to ClubOS for record keeping
- Most manual, least real-time
- Always available as fallback

### Recommendation

Investigate Option A (webhook) first. Fall back to Option B (API) if webhooks
not available. Option C as interim if no API access.

---

## Relationship to Finance Manager Role

The Finance Manager role (defined in docs/rbac/FINANCE_ROLES.md) has visibility
into reimbursement requests for:

- Dispute resolution (member claims reimbursement not received)
- Budget tracking (expenses by committee/event)
- Reconciliation support (verify ClubOS matches QuickBooks)

Finance Manager does NOT:

- Approve reimbursements (Treasurer role)
- Process payments (Bill.com handles)
- Modify accounting records (QuickBooks handles)

---

## Implementation Phases

### Phase 0: Discovery (Current)

- [ ] Document current Bill.com configuration
- [ ] Verify API/webhook availability
- [ ] Map expense categories to ClubOS taxonomy
- [ ] Estimate volume and priority

### Phase 1: Read-Only Visibility

- [ ] Implement data sync (webhook, API, or manual)
- [ ] Create ReimbursementRequest model
- [ ] Add Finance Manager dashboard view
- [ ] Add member "My Reimbursements" view

### Phase 2: Event Linkage

- [ ] Allow linking reimbursement to event record
- [ ] Show event expenses in event detail view
- [ ] Budget vs actual reporting (future)

### Phase 3: Request Initiation (Future)

- [ ] Allow starting reimbursement request from ClubOS
- [ ] Pre-fill event context
- [ ] Redirect to Bill.com for actual submission

---

## Open Questions

1. **API access**: What Bill.com tier does SBNC have? API included?
2. **Webhook support**: Does Bill.com support outbound webhooks?
3. **Expense categories**: What categories are configured? Map to ClubOS?
4. **Historical data**: Import past reimbursements or start fresh?
5. **Multi-approver**: Is multi-level approval needed? Currently configured?

---

## Dependencies

- Bill.com API documentation review
- Treasurer input on current workflow
- Finance Committee input on reporting needs
- QuickBooks sync verification

---

## Related Documents

- [External Systems and SSO Spec](./EXTERNAL_SYSTEMS_AND_SSO_SPEC.md)
- [Finance Manager Role](../rbac/FINANCE_ROLES.md)
- [QuickBooks Integration](../QUICKBOOKS_INTEGRATION.md) (if exists)

---

*Document maintained by ClubOS development team. Last updated: December 2024*
*Status: BACKLOG - Awaiting discovery phase completion*
