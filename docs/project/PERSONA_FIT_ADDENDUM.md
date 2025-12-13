# Persona Fit Addendum: Event Chair and Membership Manager Focus

**Document Type**: Specification Gap Analysis
**Date**: December 2024
**Parent Document**: `PERSONA_FIT_ASSESSMENT.md`

---

## Part 1: Event Chair — Detailed Analysis

### Representative Persona

**Bob Stewart** (64, retired operations engineer) — Comfortable with logistics and planning. Frustrated by unclear permissions and unpredictable system behavior. Often takes on event chair roles because he likes seeing events run smoothly.

**Secondary**: Jack Reynolds (62, hospitality) — Focused on event-day execution: check-in, name tags, and on-the-ground member communication.

### Top 5 Needs

| # | Need | Why It Matters |
|---|------|----------------|
| 1 | Cancel registrations and manage waitlist substitutions | Core operational task; members expect quick resolution |
| 2 | View attendee lists with easy export for name tags | Event-day prep; manual workarounds cause errors |
| 3 | Predictable workflows with clear confirmation messages | Bob hates surprises; needs to trust the system |
| 4 | Initiate refund requests (but not execute them) | Member service requires responsiveness |
| 5 | Edit own committee events without VP for minor fixes | Typo corrections shouldn't require escalation |

### Where Current Specs Meet These Needs

**Need 1 (Cancel/waitlist)**: `docs/workflows/EVENT_CHAIR_WORKFLOW.md` provides a detailed, diagram-backed workflow. Steps are explicit: confirm request → cancel registration → check waitlist → promote if available → notify members → hand off to Finance Manager if refund needed. This is well-specified.

**Need 3 (Predictable workflows)**: The workflow documentation uses ASCII diagrams and explicit state transitions. The separation between "cancellation" (operational) and "refund" (financial) is clear. Bob would understand this.

**Need 4 (Initiate refunds)**: `docs/rbac/FINANCE_ROLES.md` explicitly states: "Event Chair initiates refund request; Finance Manager approves and executes." The permission matrix confirms Chair can initiate but not approve/execute. This is correct.

### Where Current Specs Fall Short

**Need 2 (Attendee export/name tags)**: `SYSTEM_SPEC.md` section 9.1 mentions "event list" and "registration list" in Admin UI requirements but does not specify:

- Export formats (CSV, PDF, label-ready)
- What fields are included in an attendee export
- Name tag layout or Avery label compatibility
- Whether export is available to Event Chair role or Admin-only

This is a **missing spec**, not a UI gap. Bob cannot plan event logistics without knowing what data he can extract.

**Need 5 (Edit own events)**: `AUTH_AND_RBAC.md` states: "Event Chair role — Scoped access planned for future. Currently same as Member." The permission matrix shows Chair cannot view drafts, edit events, or publish. The spec acknowledges the gap but defers it.

This is a **critical missing spec**. Without committee-scoped edit rights, Event Chair is a title without system authority. Bob must escalate every typo fix to a VP or Admin.

### Proposed Spec Improvement: Event Chair

**Requirement to add to `AUTH_AND_RBAC.md` or `SYSTEM_SPEC.md`:**

> **Event Chair Scoped Permissions**
>
> An Event Chair MUST be able to perform the following actions on events belonging to their assigned committee:
>
> - View event details (including drafts)
> - Edit event metadata (title, description, location, capacity)
> - View registration list for the event
> - Export registration list in CSV format with at minimum: member name, email, registration status, registration timestamp
> - Cancel a registration and trigger waitlist promotion per `EVENT_CHAIR_WORKFLOW.md`
> - Initiate a refund request per `FINANCE_ROLES.md`
>
> An Event Chair MUST NOT be able to:
>
> - Publish or unpublish events (VP or Admin only)
> - Delete events (Admin only)
> - Edit events outside their assigned committee
> - Approve or execute refunds (Finance Manager only)
>
> Committee assignment is managed by Admin. An Event Chair may be assigned to one or more committees.

---

## Part 2: Membership Manager — Detailed Analysis

### Representative Persona

**Ellen Brooks** (58, former HR manager) — Enjoys helping people feel welcome. Cares about fair, clear processes. Works on the membership team reviewing applications and tracking member status.

### Top 5 Needs

| # | Need | Why It Matters |
|---|------|----------------|
| 1 | Membership pipeline for tracking applicants through stages | Prospects get lost without visibility |
| 2 | Application review workflow with clear status visibility | Fair process requires consistent steps |
| 3 | Renewal tracking and automatic reminders | Manual tracking leads to missed renewals and awkward conversations |
| 4 | Communication templates for welcome, renewal, lapse notices | Consistent messaging; reduces Ellen's workload |
| 5 | Bulk operations for membership status changes | Year-end renewals affect hundreds of members |

### Where Current Specs Meet These Needs

**Data model foundation**: The Membership model in `SYSTEM_SPEC.md` correctly supports Ellen's needs:

- Membership statuses include PROSPECT, ACTIVE, LAPSED, ALUMNI
- Membership is time-bounded (start/end timestamps)
- Contact + Membership separation allows tracking history over time

**Notification framework**: `SYSTEM_SPEC.md` section 8 defines a unified notification bus with email/SMS channels, logging, deduplication, and idempotent delivery. The infrastructure exists.

**MailTemplate entity**: `SYSTEM_SPEC.md` section on Public Site defines MailTemplate with name, slug, type (transactional/campaign), subject, and blocks. The entity exists.

### Where Current Specs Fall Short

**Need 1 (Membership pipeline)**: No workflow document exists for membership application processing. The PROSPECT status exists in the data model, but there is no specification for:

- What triggers a Contact to become PROSPECT
- What steps move PROSPECT → ACTIVE
- Who can approve applications
- What notifications are sent at each stage

This is a **missing spec**. The data model is ready; the workflow is not documented.

**Need 2 (Application review)**: No mention of application review in any workflow document. `AUTH_AND_RBAC.md` does not define a "Membership Manager" role or its permissions. Ellen has no specified authority.

This is a **missing spec**. There is no Membership Manager in the RBAC model.

**Need 3 (Renewal reminders)**: `SYSTEM_SPEC.md` section 8 lists notification requirements (logged, deduplicated, async) but does not specify membership-related triggers:

- No "renewal due in 30 days" notification trigger
- No "membership lapsed" notification trigger
- No specification for how lapse is detected (cron job? on-access check?)

This is a **missing spec**. The notification framework exists but has no membership triggers.

**Need 5 (Bulk operations)**: No specification for bulk status changes. Admin Members UI (`ADMIN_MEMBERS_UI.md`) is read-oriented. No mention of multi-select or batch actions.

This is a **missing spec**. Year-end renewal processing would require manual one-by-one updates.

### Proposed Spec Improvement: Membership Manager

**Requirement to add as new workflow document `docs/workflows/MEMBERSHIP_LIFECYCLE_WORKFLOW.md`:**

> **Membership Lifecycle Workflow**
>
> This workflow defines the stages a Contact moves through from prospect to active member, and the transitions that occur during renewal and lapse.
>
> **States**
>
> | State | Description |
> |-------|-------------|
> | PROSPECT | Contact has applied or expressed interest; not yet approved |
> | ACTIVE | Contact is a current, dues-paying member |
> | LAPSED | Membership term expired without renewal |
> | ALUMNI | Former member in good standing (voluntary departure or term limit) |
>
> **Transitions**
>
> | From | To | Trigger | Who Can Trigger |
> |------|----|---------|-----------------|
> | (none) | PROSPECT | Application submitted | Self-service or Admin |
> | PROSPECT | ACTIVE | Application approved + payment confirmed | Membership Manager or Admin |
> | PROSPECT | (deleted) | Application denied | Membership Manager or Admin |
> | ACTIVE | LAPSED | Membership end date passed without renewal | System (automated) |
> | ACTIVE | ALUMNI | Member requests transition or term limit reached | Admin |
> | LAPSED | ACTIVE | Renewal payment confirmed | System or Admin |
>
> **Notification Triggers**
>
> | Event | Notification | Channel |
> |-------|--------------|---------|
> | PROSPECT created | "Application received" confirmation | Email |
> | PROSPECT → ACTIVE | "Welcome to the club" | Email |
> | 30 days before membership end | "Renewal reminder" | Email |
> | 7 days before membership end | "Renewal reminder (urgent)" | Email + SMS |
> | ACTIVE → LAPSED | "Membership lapsed" notice | Email |
>
> **Membership Manager Role**
>
> The system MUST define a Membership Manager role with the following permissions:
>
> - View all Contacts with PROSPECT status
> - Approve or deny membership applications
> - View membership history for any Contact
> - Trigger renewal reminders manually
> - Export member list with status and renewal dates

---

## Part 3: Remaining Personas — Gap Classification

### Finance Manager

| Gap | Classification | Pain if Unaddressed |
|-----|----------------|---------------------|
| Payment processor adapter not specified | **Intentional deferral** | Low — workflow can be tested with mocks; processor is implementation detail |
| Finance dashboard (refund queue, reconciliation status) | **Missing UI spec** | **Medium** — FM can work from raw data but efficiency suffers |
| Batch refund processing | **Missing spec** | Low — rare scenario; can process individually |

**Verdict**: Finance Manager specs are solid. The gaps are UI conveniences, not workflow holes. No urgent pain.

### Treasurer

| Gap | Classification | Pain if Unaddressed |
|-----|----------------|---------------------|
| No Treasurer-specific dashboard | **Missing UI spec** | **Medium** — Treasurer must use QuickBooks for summaries; ClubOS has context but doesn't surface it |
| No finance export spec | **Missing spec** | Medium — reconciliation requires manual data extraction |
| Term handoff process | **Missing spec** | Low — infrequent; can be handled manually |

**Verdict**: Treasurer is underserved by current specs but QuickBooks is the safety net. The gaps cause inefficiency, not failure. Medium-term priority.

### President

| Gap | Classification | Pain if Unaddressed |
|-----|----------------|---------------------|
| No trend data on dashboard | **Intentional deferral** | Low — counts are sufficient for initial launch |
| No president-specific role | **Intentional deferral** | Low — Admin role covers president needs |
| No announcement templates | **Missing spec** | Low — president can compose manually |
| No quick actions on dashboard | **Intentional deferral** (listed as "future enhancement") | Low — navigation works |

**Verdict**: President needs are largely met. Gaps are polish, not pain. Low priority.

### VP of Technology

| Gap | Classification | Pain if Unaddressed |
|-----|----------------|---------------------|
| No log viewer in admin UI | **Missing UI spec** | Low — logs exist; viewer is convenience |
| No role management UI | **Missing UI spec** | **High** — every role change requires developer; blocks self-service |
| No import tool | **Missing spec** | Medium — initial data load is painful; ongoing use is fine |
| No API rate limiting spec | **Missing spec** | Low — internal system; abuse unlikely |

**Verdict**: Role management UI is a real pain point. VP of Technology cannot delegate admin tasks or onboard new officers without developer involvement. This should be addressed.

---

## Summary: Gaps That Cause Real Pain

| Persona | Gap | Pain Level | Why |
|---------|-----|------------|-----|
| Event Chair | Committee-scoped permissions | **High** | Chair is a title without authority; every action requires escalation |
| Membership Manager | Membership lifecycle workflow | **High** | Ellen cannot do her job; no documented process, no role, no triggers |
| VP of Technology | Role management UI | **High** | Every officer change requires developer; blocks operational independence |
| Treasurer | Finance dashboard | Medium | Inefficient but QuickBooks is fallback |
| Finance Manager | Refund queue UI | Medium | Workflow exists; UI would improve efficiency |

---

## Recommended Next Steps (Spec Work Only)

1. **Add Event Chair scoped permissions** to `AUTH_AND_RBAC.md` (proposed text above)
2. **Create `MEMBERSHIP_LIFECYCLE_WORKFLOW.md`** (proposed outline above)
3. **Add Membership Manager role** to `AUTH_AND_RBAC.md` permission matrix
4. **Specify role management requirements** in `SYSTEM_SPEC.md` Admin UI section

These four spec additions would move Event Chair and Membership Manager from "Partial" to "Good" fit, and unblock VP of Technology's operational independence.

---

*Addendum to PERSONA_FIT_ASSESSMENT.md. December 2024.*
