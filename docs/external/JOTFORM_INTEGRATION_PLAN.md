# JotForm Integration Plan

**Audience**: Tech Chair, VP Activities, Committee Chairs
**Purpose**: Document JotForm integration phases and native replacement roadmap

---

## Overview

JotForm is currently used by committee chairs to submit event requests. This
document defines:

- Phase 1: Integrate JotForm with ClubOS (capture submissions)
- Phase 2: Replace JotForm with native ClubOS event submission workflow
- Failure modes and resilience improvements

---

## Current State

### How JotForm Is Used Today

1. Committee chair fills out JotForm event request form
2. JotForm sends email notification to VP Activities
3. VP Activities manually reviews submission
4. VP Activities manually creates event in calendar/system
5. Chair is notified (manually) of approval/rejection

### Current Form Fields (Observed)

Based on existing JotForm configuration:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Event Title | Text | Yes | |
| Event Date | Date | Yes | |
| Event Time | Time | Yes | Start time |
| End Time | Time | No | Defaults to +2 hours |
| Location | Text | Yes | Venue name and address |
| Location Type | Select | Yes | Private Home, Public Venue, Outdoor, Virtual |
| Description | Textarea | Yes | Public-facing event description |
| Category/Committee | Select | Yes | Which activity group |
| Expected Attendance | Number | Yes | For capacity planning |
| Registration Required | Yes/No | Yes | |
| Registration Limit | Number | Conditional | If registration required |
| Member Fee | Currency | No | 0 = free |
| Guest Fee | Currency | No | |
| Guests Allowed | Yes/No | Yes | |
| Host Name | Text | No | Event host if applicable |
| Host Email | Email | No | |
| Special Requirements | Textarea | No | Equipment, setup, etc. |
| Chair Name | Text | Yes | Submitting chair |
| Chair Email | Email | Yes | For notifications |
| Chair Phone | Phone | No | |

### Known Issues with Current State

| Issue | Impact | Severity |
|-------|--------|----------|
| Manual data entry | Errors, delays, duplicate work | High |
| No audit trail | Cannot trace who approved what | High |
| Email-based workflow | Easy to miss, no tracking | Medium |
| No status visibility | Chair cannot check submission status | Medium |
| Single point of failure | VP unavailable = events stall | Medium |
| No integration with calendar | Manual calendar entry required | Medium |

---

## Phase 1: Integrate JotForm with ClubOS

### Goal

Capture JotForm submissions in ClubOS database to enable:

- Audit trail of submissions
- Dashboard visibility for VPs
- Foundation for approval workflow

### Implementation Approach

#### Option A: Webhook Integration (Recommended)

```
JotForm Form Submission
        |
        v
  JotForm Webhook
        |
        v
  POST /api/webhooks/jotform
        |
        v
  ClubOS stores EventSubmission record
        |
        v
  ClubOS sends confirmation to chair
```

**Webhook endpoint requirements**:

- Route: POST /api/webhooks/jotform
- Authentication: Shared secret in header (stored in environment)
- Payload: JotForm submission JSON
- Response: 200 OK with submission ID

**Data model addition**:

```
EventSubmission
  - id (UUID)
  - externalId (string) - JotForm submission ID
  - source (enum: JOTFORM, NATIVE)
  - status (enum: PENDING, APPROVED, REJECTED, CANCELLED)
  - formData (JSON) - raw submission data
  - submittedBy (contactId FK)
  - submittedAt (datetime)
  - reviewedBy (contactId FK nullable)
  - reviewedAt (datetime nullable)
  - reviewNotes (text nullable)
  - eventId (eventId FK nullable) - linked after approval
  - createdAt (datetime)
  - updatedAt (datetime)
```

#### Option B: Email Parsing (Fallback)

If webhook integration is not feasible:

- Forward JotForm notification emails to a ClubOS inbox
- Parse email content to extract submission data
- Higher maintenance, less reliable

**Recommendation**: Implement Option A (webhook)

### Phase 1 Deliverables

- [ ] Webhook endpoint implemented
- [ ] EventSubmission model added to Prisma schema
- [ ] Admin UI shows pending submissions
- [ ] Email notification to VP on new submission
- [ ] Email confirmation to chair on submission receipt

### Phase 1 Success Criteria

- All JotForm submissions captured in ClubOS database
- VP can view submissions in ClubOS admin
- Audit trail established for all submissions

---

## Phase 2: Replace JotForm with Native ClubOS Workflow

### Goal

Eliminate JotForm dependency by providing native event submission within ClubOS.

### Native Event Submission Workflow

```
Chair logs into ClubOS
        |
        v
  Chair clicks "Submit Event Request"
        |
        v
  Chair fills out event submission form
        |
        v
  ClubOS validates and stores EventSubmission
        |
        v
  VP Activities receives notification
        |
        v
  VP reviews in ClubOS admin
        |
        |----> Approve: Event created, Chair notified
        |
        |----> Request Changes: Chair notified with feedback
        |
        +----> Reject: Chair notified with reason
```

### Form Fields (Native)

Preserve durable fields from JotForm, with improvements:

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| title | Text | Yes | 5-100 chars | |
| eventDate | Date | Yes | Future date | |
| startTime | Time | Yes | | |
| endTime | Time | Yes | After start | |
| location | Text | Yes | | |
| locationType | Enum | Yes | | PRIVATE_HOME, PUBLIC_VENUE, OUTDOOR, VIRTUAL |
| description | Textarea | Yes | 20-2000 chars | Markdown supported |
| committeeId | Select | Yes | From committee list | |
| expectedAttendance | Number | Yes | 1-500 | |
| registrationRequired | Boolean | Yes | | |
| capacity | Number | Conditional | If registration required | |
| memberFee | Decimal | No | >= 0 | |
| guestFee | Decimal | No | >= memberFee | |
| guestsAllowed | Boolean | Yes | | |
| hostContactId | Select | No | From contact list | |
| specialRequirements | Textarea | No | | |

### Approval Routing

```
EventSubmission created (status: PENDING)
        |
        v
  System determines approver(s):
    - VP Activities for the committee
    - Posting Coordinator (for calendar)
        |
        v
  Notification sent to approver(s)
        |
        v
  Approver reviews:
    |
    +---> APPROVE
    |       |
    |       v
    |     Event record created
    |     Event status: DRAFT
    |       |
    |       v
    |     Posting Coordinator notified
    |       |
    |       v
    |     Posting Coordinator publishes
    |     Event status: PUBLISHED
    |
    +---> REQUEST_CHANGES
    |       |
    |       v
    |     Chair notified with feedback
    |     Chair can edit and resubmit
    |
    +---> REJECT
            |
            v
          Chair notified with reason
          Submission archived
```

### Audit Trail

Every action on an EventSubmission is logged:

| Action | Who | What Is Recorded |
|--------|-----|------------------|
| Submit | Chair | contactId, timestamp, form snapshot |
| View | VP/Admin | contactId, timestamp |
| Approve | VP | contactId, timestamp, notes |
| Request Changes | VP | contactId, timestamp, feedback |
| Reject | VP | contactId, timestamp, reason |
| Edit | Chair | contactId, timestamp, diff |
| Publish | Posting | contactId, timestamp |

### Role Permissions

| Action | Member | Chair | VP Activities | Admin |
|--------|--------|-------|---------------|-------|
| Submit event request | No | Yes (own committee) | Yes | Yes |
| View own submissions | - | Yes | - | - |
| View committee submissions | No | No | Yes (supervised) | Yes |
| Approve/Reject | No | No | Yes (supervised) | Yes |
| Publish event | No | No | Yes | Yes |

### Phase 2 Deliverables

- [ ] Native event submission form in ClubOS
- [ ] Approval workflow with status tracking
- [ ] Email notifications at each status change
- [ ] Audit log for all submission actions
- [ ] Chair dashboard showing submission status
- [ ] VP dashboard showing pending approvals
- [ ] JotForm retired (form disabled, redirect to ClubOS)

### Phase 2 Success Criteria

- Chairs can submit events entirely within ClubOS
- VPs can approve/reject without leaving ClubOS
- Full audit trail for compliance
- JotForm no longer used for event submissions

---

## Failure Modes and Resilience

### Current Failures (JotForm-Based)

| Failure Mode | Current Impact | Frequency |
|--------------|----------------|-----------|
| JotForm email goes to spam | Submission lost until noticed | Occasional |
| VP unavailable | Events not processed | Rare |
| Manual entry error | Wrong date/time/venue published | Occasional |
| No submission tracking | Chair unsure if received | Common |
| Password lost | Cannot access JotForm admin | Rare |

### Resilience Improvements (ClubOS Native)

| Failure Mode | ClubOS Mitigation |
|--------------|-------------------|
| Email goes to spam | In-app notification + dashboard visibility |
| VP unavailable | Backup approver routing; escalation rules |
| Manual entry error | Direct data flow; no re-keying |
| No submission tracking | Real-time status in chair dashboard |
| Password lost | SSO via Google; password manager backup |
| System outage | Database backups; standard availability SLA |

### Monitoring and Alerts

When native workflow is implemented:

- Alert if submission pending > 48 hours without action
- Alert if approval queue > 10 items
- Weekly digest to Tech Chair of submission metrics

---

## Migration Plan

### Timeline

| Phase | Duration | Key Milestones |
|-------|----------|----------------|
| Phase 1 | 2-4 weeks | Webhook live, submissions captured |
| Parallel Run | 4-8 weeks | Both systems active, data verified |
| Phase 2 | 4-6 weeks | Native form launched, training complete |
| Cutover | 1 week | JotForm disabled, redirect active |
| Decommission | 2 weeks | JotForm admin access removed |

### Training Requirements

| Audience | Training Needed |
|----------|-----------------|
| Committee Chairs | New submission form walkthrough |
| VP Activities | Approval workflow, dashboard |
| Posting Coordinator | Publication workflow |
| Tech Chair | Admin functions, monitoring |

### Rollback Plan

If native workflow has critical issues after cutover:

1. Re-enable JotForm form
2. Update redirect to point back to JotForm
3. Continue capturing via webhook while issues resolved
4. Communicate to chairs via email

---

## Open Questions (TBD)

1. **Webhook secret management**: How to rotate JotForm webhook secret?
2. **Historical data**: Import past JotForm submissions or start fresh?
3. **Form versioning**: How to handle form field changes over time?
4. **Offline submissions**: Support for chairs with limited connectivity?

---

## Related Documents

- [External Systems and SSO Spec](./EXTERNAL_SYSTEMS_AND_SSO_SPEC.md)
- [RBAC Overview](../rbac/AUTH_AND_RBAC.md)
- [Event Policy Gates](../../SYSTEM_SPEC.md) (Event Policy Gates section)

---

*Document maintained by ClubOS development team. Last updated: December 2024*
