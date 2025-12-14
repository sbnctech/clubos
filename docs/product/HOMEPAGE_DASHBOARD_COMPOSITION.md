# Homepage Dashboard Composition Rules

Worker 4 — Homepage Dashboard Composition — Report

## Dashboard Model

### Structure

A homepage dashboard consists of:

```
Dashboard
  Section[]
    Gadget[]
```

### Section

A named region of the dashboard with a title and placement order.

```
Section {
  id: string
  title: string
  order: number
  visible_to: Role[]
}
```

### Gadget Placement

A gadget instance placed within a section.

```
GadgetPlacement {
  section_id: string
  gadget_id: string
  order: number
  config: object
}
```

---

## Gadget Registry

All gadgets must be registered before use.

```
GadgetRegistryEntry {
  id: string
  version: string
  title: string
  description: string
  roles: Role[]
  refresh_cadence: "realtime" | "minute" | "hourly" | "daily"
  data_scope: "self" | "committee" | "org"
  cacheable: boolean
  failure_mode: "hide" | "placeholder" | "error"
}
```

### Required Fields

| Field | Purpose |
|-------|---------|
| id | Stable identifier |
| version | Breaking change tracking |
| roles | Who can see this gadget |
| data_scope | What data it accesses |
| failure_mode | Behavior when data unavailable |

### Registry Rules

- No gadget renders without registry entry
- Version bump required for data scope changes
- Role changes require review

---

## Safe Defaults

### Limit Counts

| Gadget Type | Default Limit | Max Limit |
|-------------|---------------|-----------|
| List gadget | 5 items | 25 items |
| Table gadget | 10 rows | 50 rows |
| Chart gadget | 30 data points | 100 points |

### Pagination

- Lists over limit show "View all" link
- Link goes to full page, not inline expansion
- No infinite scroll on homepage

### Caching

| Refresh Cadence | Cache TTL |
|-----------------|-----------|
| realtime | 0 (no cache) |
| minute | 60 seconds |
| hourly | 3600 seconds |
| daily | 86400 seconds |

### Failure Isolation

- Gadget failure does not break dashboard
- Failed gadget shows failure_mode behavior
- Failures logged server-side
- No retry storms (max 1 retry per minute)

---

## No Surprises Rules

### Rule 1: No Hidden Data

A gadget only displays data the viewer is authorized to see.
No "teaser" content for unauthorized data.

### Rule 2: No Cross-Role Leakage

A gadget scoped to Role A never appears for Role B,
even if both roles share the same user.

### Rule 3: No Implicit Aggregation

Aggregates (counts, sums) only include records the viewer can access.
No "You have 5 of 12 events" where 12 is org-wide.

### Rule 4: No Stale Misleading Data

If cache is stale beyond 2x TTL, show placeholder instead of old data.

### Rule 5: No Silent Failures

If a gadget cannot load, it shows a visible indicator.
Never show empty where data should exist.

---

## Homepage Layouts by Role

### Regular Member

| Section | Gadgets |
|---------|---------|
| My Upcoming | my_registrations (limit 5) |
| Explore | upcoming_events (limit 5), new_activities |
| Account | membership_status, profile_completeness |

Data scope: self only.

### Event Chair

| Section | Gadgets |
|---------|---------|
| My Events | my_committee_events (limit 5), pending_approvals |
| Registrations | recent_registrations (limit 10), waitlist_summary |
| Quick Actions | create_event_link, export_registrations_link |

Data scope: self + committee.

### Finance Manager

| Section | Gadgets |
|---------|---------|
| Pending | pending_refunds (limit 10), unreconciled_payments |
| Recent | recent_transactions (limit 10) |
| Reports | monthly_summary_link, export_link |

Data scope: org (financial only).

### Tech Chair

| Section | Gadgets |
|---------|---------|
| System Health | health_status, recent_errors (limit 5) |
| Activity | recent_logins (limit 10), api_usage |
| Quick Actions | audit_log_link, user_management_link |

Data scope: org (technical only).

---

## Adding New Gadgets

### Review Checklist

Before a gadget is approved:

- [ ] Registry entry complete with all required fields
- [ ] Roles explicitly defined (no wildcard)
- [ ] Data scope documented and minimal
- [ ] Failure mode specified
- [ ] Refresh cadence justified
- [ ] Default limit set and reasonable
- [ ] No cross-role data leakage possible
- [ ] Caching strategy defined
- [ ] Error states designed

### Required Documentation

| Document | Contents |
|----------|----------|
| Gadget spec | Purpose, inputs, outputs, data sources |
| RBAC mapping | Which roles see which data |
| Test cases | Happy path + failure modes |

### Approval Process

1. Developer creates registry entry + spec
2. Security review for data scope
3. Product review for UX fit
4. Add to staging dashboard
5. Validate with test users
6. Promote to production

---

## Constraints

### What This Does Not Cover

- Gadget implementation details
- UI component library
- CSS/styling rules
- Mobile layout variants

### What This Enforces

- Registry-first development
- Explicit role scoping
- Failure isolation
- Cache hygiene
- Data minimization

---

## Verdict

READY FOR REVIEW
