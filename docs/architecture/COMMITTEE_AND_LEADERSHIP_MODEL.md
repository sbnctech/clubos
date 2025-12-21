Copyright (c) Santa Barbara Newcomers Club. All rights reserved.

# Committee and Leadership Model

Status: Architecture Specification
Audience: Engineering, Operations, Solutions
Last updated: 2025-12-21

---

## Executive Summary

ClubOS treats committees, roles, chairs, and terms as **first-class entities**
in the data model. This enables safe leadership transitions, permission
inheritance, and historical continuity - solving major limitations of
platforms like Wild Apricot where organizational structure is an afterthought.

---

## 1. Problem Statement: Why WA Forces Contortions

### The Wild Apricot Reality

Wild Apricot has no concept of:

- **Committees** as entities (only loose contact groupings)
- **Roles** with defined permissions (only coarse admin levels)
- **Terms** with start/end dates (permissions are permanent until removed)
- **Transition workflows** (handoff is manual and error-prone)

This forces organizations to:

| WA Limitation | Typical Workaround | Result |
|---------------|-------------------|--------|
| No committee entity | Create contact groups manually | Groups get stale, no permission link |
| No role concept | Give everyone "Limited Admin" | Overprivileged volunteers |
| No term tracking | Remember to revoke access annually | Former chairs retain access for months |
| No transition workflow | Email instructions, hope for compliance | Knowledge loss, permission gaps |

### Real Incidents from SBNC

1. **Former chair retained admin access 18 months after term ended**
   - No mechanism to track term expiration
   - Manual revocation was forgotten

2. **Incoming chair had no access for first 3 weeks of term**
   - Outgoing chair forgot to request access grant
   - No overlap period, no handoff

3. **Committee lost all historical context when chair left**
   - WA has no concept of "who held this role before"
   - Audit trail not linked to role, only to individual

### The Core Problem

WA treats permissions as **person-to-action bindings**:

```
PERSON --> [can do] --> ACTION
```

ClubOS treats permissions as **role-to-capability bindings with terms**:

```
PERSON --> [holds] --> ROLE --> [during] --> TERM --> [grants] --> CAPABILITY
```

This seemingly small difference enables everything that follows.

---

## 2. First-Class Entities

### 2.1 Committee

A committee is an organizational unit with defined scope and membership.

```
Committee {
  id: UUID
  name: string                    // "Activities", "Membership", "Finance"
  slug: string                    // "activities", "membership", "finance"
  description: string
  parentCommitteeId: UUID | null  // Enables hierarchy (subcommittees)
  status: "active" | "inactive" | "dissolved"
  createdAt: datetime
  dissolvedAt: datetime | null
}
```

**Key Properties:**

- Committees persist across leadership changes
- Committees can have subcommittees (e.g., Activities -> Hiking, Social)
- Committees can be dissolved but never deleted (historical continuity)
- All committee changes are audited

### 2.2 Role

A role is a named position within a committee with defined capabilities.

```
Role {
  id: UUID
  committeeId: UUID
  name: string                    // "Chair", "Vice Chair", "Secretary"
  slug: string                    // "chair", "vice-chair", "secretary"
  capabilities: Capability[]      // What this role can do
  maxHolders: int                 // How many can hold simultaneously (default: 1)
  requiresSuccessor: boolean      // Must have transition plan before vacating
  status: "active" | "inactive"
  createdAt: datetime
}
```

**Key Properties:**

- Roles belong to committees
- Roles define capabilities, not individuals
- Roles can require succession planning
- Roles can be shared (e.g., co-chairs)

### 2.3 Chair (Role Assignment)

A chair assignment connects a person to a role for a specific term.

```
RoleAssignment {
  id: UUID
  roleId: UUID
  memberId: UUID
  termId: UUID
  status: "pending" | "active" | "completed" | "resigned" | "removed"
  assignedBy: UUID                // Who made the assignment
  assignedAt: datetime
  acceptedAt: datetime | null     // When holder accepted
  effectiveAt: datetime           // When permissions activate
  endsAt: datetime | null         // Scheduled end (null = indefinite)
  actualEndAt: datetime | null    // When actually ended
  endReason: string | null        // "term_completed", "resigned", "removed"
}
```

**Key Properties:**

- Assignments are always linked to a term
- Assignments have explicit acceptance (no silent grants)
- Assignments track both scheduled and actual end dates
- Assignments record why they ended

### 2.4 Term

A term is a bounded period during which role assignments are valid.

```
Term {
  id: UUID
  committeeId: UUID | null        // Null = org-wide term (e.g., fiscal year)
  name: string                    // "2025-2026 Term", "Q1 2025"
  startDate: date
  endDate: date
  transitionStartDate: date       // When incoming can start overlap
  status: "upcoming" | "active" | "transitioning" | "completed"
  createdAt: datetime
}
```

**Key Properties:**

- Terms have explicit boundaries
- Terms have a transition window built in
- Terms can be committee-specific or organization-wide
- Multiple terms can overlap (incoming/outgoing)

---

## 3. Permission Inheritance Model

### Capability Flow

Permissions flow through a defined hierarchy:

```
Organization
     |
     | defines
     v
Committee Scope
     |
     | contains
     v
Role
     |
     | grants (during term)
     v
Capabilities
     |
     | applied to
     v
Member (while holding role)
```

### Inheritance Rules

1. **Role capabilities are additive**
   - Holding multiple roles grants union of capabilities
   - No role can revoke capabilities granted by another

2. **Committee scope limits visibility**
   - A role in Committee A cannot access Committee B resources
   - Cross-committee access requires explicit grant

3. **Term boundaries are enforced**
   - Capabilities are only active during the assignment's effective period
   - Before effectiveAt: no access
   - After actualEndAt: no access

4. **Parent committee grants visibility, not modification**
   - VP of Activities can view all activity committees
   - VP cannot directly edit subcommittee resources unless explicitly granted

### Example: Activities Chair Permissions

```
Committee: Activities
Role: Chair
Term: 2025-2026

Capabilities Granted:
  - events:create (scope: activities)
  - events:edit (scope: activities)
  - events:publish (scope: activities)
  - members:view (scope: activities committee members)
  - reports:view (scope: activities)

Capabilities NOT Granted:
  - events:delete (admin only)
  - events:* (scope: other committees)
  - members:edit (membership committee only)
  - finance:* (finance committee only)
```

### Explicit Denials

Some capabilities are never inherited:

| Capability | Reason |
|------------|--------|
| admin:delete:* | Destructive actions require explicit admin grant |
| roles:assign | Cannot delegate role assignment |
| audit:modify | Audit log is append-only |
| backups:restore | Requires human verification |

See: [Safe Delegation Model](#safe-delegation-cross-reference)

---

## 4. Leadership Transition Workflow

### The Problem with Ad-Hoc Transitions

Without a structured workflow:

- Incoming chair may have no access during first weeks
- Outgoing chair may retain access indefinitely
- No knowledge transfer mechanism
- No verification that transition completed

### ClubOS Transition States

```
Term Status: UPCOMING
     |
     | transitionStartDate reached
     v
Term Status: TRANSITIONING
     |
     | Incoming chair:
     |   - Can be assigned to role
     |   - Permissions activated (read-only initially)
     |   - Receives knowledge transfer
     |
     | Outgoing chair:
     |   - Still has full permissions
     |   - Expected to mentor/transfer
     |   - Can initiate handoff checklist
     |
     | startDate reached
     v
Term Status: ACTIVE
     |
     | Incoming chair:
     |   - Full permissions activated
     |   - Primary responsibility
     |
     | Outgoing chair:
     |   - Permissions downgraded to read-only
     |   - 30-day support window
     |   - Cannot publish or modify
     |
     | outgoing.actualEndAt reached
     v
Outgoing chair:
     - All permissions revoked
     - Remains visible in history
```

### Transition Timeline (Recommended)

```
-30 days     Term transition starts
             Incoming chair gains read access
             Handoff checklist initiated

-14 days     Incoming chair gains full access (shadow)
             Both chairs can make changes
             Outgoing mentors incoming

Day 0        Term officially starts
             Incoming is primary
             Outgoing becomes read-only

+30 days     Outgoing access revoked
             Transition marked complete
```

### Handoff Checklist (System-Generated)

When transition begins, system generates:

```
[ ] Incoming chair accepted role assignment
[ ] Incoming chair completed orientation materials
[ ] Outgoing chair scheduled knowledge transfer meeting
[ ] Critical passwords/credentials transferred (if applicable)
[ ] Pending items list reviewed
[ ] Contact lists verified
[ ] Upcoming commitments reviewed
[ ] Transition meeting completed
[ ] Incoming chair confirmed ready
[ ] Outgoing chair confirmed handoff complete
```

**Checklist Properties:**

- Checklist items are audited
- Incomplete checklist triggers reminder notifications
- Checklist state visible to admin/board
- Transition can proceed even if incomplete (with warning)

### Handling Resignations and Removals

| Scenario | System Behavior |
|----------|-----------------|
| Resignation with notice | Standard transition, abbreviated timeline |
| Resignation immediate | Access revoked immediately, no overlap |
| Removal by board | Access revoked immediately, documented |
| No successor identified | Role vacant, admin notified, visibility preserved |

---

## 5. Audit and Historical Continuity

### What Is Audited

Every leadership-related action creates an audit entry:

| Action | Audit Entry Includes |
|--------|---------------------|
| Role created | Role details, creator, committee |
| Role assigned | Assignee, assigner, term, effective date |
| Role accepted | Acceptor, acceptance date |
| Role permissions changed | Before/after capabilities |
| Role ended | Reason, actual end date, successor (if any) |
| Committee created/modified | All field changes |
| Term created/modified | All field changes |
| Transition checklist item completed | Item, completer, timestamp |

### Historical Queries

The data model enables queries that WA cannot answer:

| Query | ClubOS | Wild Apricot |
|-------|--------|--------------|
| "Who was Activities Chair in 2023?" | Direct query on RoleAssignment | Manual memory/notes |
| "What roles has Sarah held?" | Query by memberId | Not possible |
| "When did permission X get granted?" | Audit log query | Limited/incomplete |
| "Who approved this role change?" | assignedBy field | Not tracked |
| "How long was the role vacant?" | Date math on assignments | Not possible |

### Continuity Guarantees

1. **Role history is never deleted**
   - Past assignments are always queryable
   - Even dissolved committees retain history

2. **Audit entries are immutable**
   - Cannot modify past records
   - Corrections create new entries with reference

3. **Member identity persists across roles**
   - Same memberId across all role assignments
   - Role changes don't fragment history

---

## 6. Guarantees ClubOS Makes During Transitions

### Access Guarantees

| Guarantee | Mechanism |
|-----------|-----------|
| Incoming chair has access before term starts | transitionStartDate + read-only assignment |
| Outgoing chair does not retain access indefinitely | Scheduled end + automatic revocation |
| No gap in committee leadership visibility | Overlap period is mandatory |
| Emergency access is always available | Admin can override any transition |

### Data Guarantees

| Guarantee | Mechanism |
|-----------|-----------|
| No data is lost during transition | Soft delete only, recovery window |
| Audit trail continues across transitions | Actor attribution includes role context |
| Pending items are not orphaned | Handoff checklist requires review |
| Historical context is preserved | All past assignments queryable |

### Notification Guarantees

| Event | Who Is Notified |
|-------|-----------------|
| Role assignment created | Incoming chair, outgoing chair, admin |
| Transition period begins | Both chairs, committee members |
| Handoff checklist item overdue | Both chairs, admin |
| Access about to expire | Outgoing chair (7 days, 1 day) |
| Access revoked | Outgoing chair, admin |
| Transition complete | Both chairs, admin, board |

### Failure Mode Handling

| Failure | System Response |
|---------|-----------------|
| Incoming chair does not accept | Admin notified after 7 days |
| Handoff not completed by term start | Warning logged, transition proceeds |
| Outgoing chair unresponsive | Admin can force-complete transition |
| No successor identified by term end | Role marked vacant, admin alerted |
| Both chairs unavailable | Admin assumes temporary custody |

See: [Failure Modes Registry](#failure-modes-cross-reference)

---

## 7. Non-Goals (What We Do Not Automate or Govern)

ClubOS provides structure, not governance. The following are explicitly
out of scope:

### We Do NOT:

| Non-Goal | Rationale |
|----------|-----------|
| Enforce term limits | Policy decision for bylaws, not software |
| Require specific qualifications | Organization decides who is eligible |
| Auto-approve role assignments | Human judgment required |
| Dictate committee structure | Organizations vary widely |
| Resolve disputes between chairs | Governance matter, not technical |
| Force completion of handoff checklist | Checklist is advisory, not blocking |
| Prevent vacancies | Some roles may be temporarily unfilled |
| Auto-select successors | Succession is a human decision |

### We DO Provide:

| Capability | Purpose |
|------------|---------|
| Visibility into role status | Know who holds what, when |
| Alerts when action needed | Prevent surprises |
| Historical record | Accountability and continuity |
| Transition scaffolding | Make handoffs easier |
| Permission automation | Reduce manual grant/revoke |
| Audit trail | Know what happened and when |

### Governance vs. System

```
+---------------------------------------------------------------+
|                      GOVERNANCE (Bylaws)                       |
|  - Who can hold roles                                          |
|  - Term lengths                                                |
|  - Succession rules                                            |
|  - Dispute resolution                                          |
|  - Eligibility requirements                                    |
+---------------------------------------------------------------+
                              |
                    (Organization configures)
                              |
                              v
+---------------------------------------------------------------+
|                      SYSTEM (ClubOS)                           |
|  - Enforces configured term dates                              |
|  - Applies permission inheritance                              |
|  - Generates transition checklists                             |
|  - Maintains audit trail                                       |
|  - Sends notifications                                         |
+---------------------------------------------------------------+
```

---

## 8. Addressing Volunteer Churn

### The Volunteer Reality

Membership organizations face unique challenges:

- Volunteers serve limited terms (often 1-2 years)
- Knowledge transfer is inconsistent
- Institutional memory lives in people, not systems
- Gaps between leadership are common

### How ClubOS Mitigates Churn Impact

| Churn Problem | ClubOS Mitigation |
|---------------|-------------------|
| "I don't know what the last chair did" | Role assignment history, audit trail |
| "I can't find the files" | Committee-scoped document storage |
| "I don't have access yet" | Automatic transition window |
| "The last chair still has access" | Automatic access revocation |
| "Nobody told me what to do" | System-generated handoff checklist |
| "I don't know who to ask" | Historical role holders are queryable |
| "Things were promised but not documented" | Pending items list in handoff |

### Preserving Institutional Memory

```
Knowledge Layer:
  +-- Committee Wiki (persistent, editable by chairs)
  +-- Decision Log (append-only, linked to meetings)
  +-- Handoff Notes (per-transition, archived)
  +-- Contact Lists (maintained by role, not person)

Visibility Layer:
  +-- Past Chairs List (with contact info if permitted)
  +-- Past Decisions (with context and rationale)
  +-- Recurring Task Calendar (survives chair changes)
  +-- Vendor/Partner Contacts (role-linked, not person-linked)
```

---

## Cross-References

### Safe Delegation Model {#safe-delegation-cross-reference}

The delegation rules are defined in:
- [RBAC Delegation Matrix](../rbac/RBAC_DELEGATION_MATRIX.md)
- [Activities Delegated Admin Model](../rbac/ACTIVITIES_DELEGATED_ADMIN_MODEL.md)

Key constraints:
- Chairs cannot assign roles
- No cross-domain delegation
- Delegation is always time-bounded

### Failure Modes Registry {#failure-modes-cross-reference}

Leadership transition failures are tracked in:
- [Degraded Mode Matrix](../reliability/DEGRADED_MODE_MATRIX.md)

Specific failure scenarios:
- FAIL-ROLE-001: Role assignment not accepted
- FAIL-ROLE-002: Transition handoff incomplete
- FAIL-ROLE-003: Both incoming and outgoing unavailable
- FAIL-ROLE-004: Successor not identified before term end

---

## See Also

- [Activities Roles](../rbac/ACTIVITIES_ROLES.md) - SBNC-specific role definitions
- [Auth and RBAC](../rbac/AUTH_AND_RBAC.md) - Authentication and authorization system
- [Architectural Charter](../ARCHITECTURAL_CHARTER.md) - Core principles
- [Audit Notes](../AUDIT_NOTES.md) - Audit system design

---

*This document is normative for the committee and leadership model.
Changes require architectural review.*
