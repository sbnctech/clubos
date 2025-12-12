# RBAC Test Coverage Matrix

## Roles Tested

| Role | Token Pattern | Description |
|------|---------------|-------------|
| **MEMBER** | `Bearer test-member-{id}` | Regular club member |
| **EVENT_CHAIR** | `Bearer test-member-{chairMemberId}` | Member who chairs specific events |
| **VP_ACTIVITIES** | `Bearer test-vp-activities` | VP with all-events access |
| **ADMIN** | `Bearer test-admin-token` | Full system access |

---

## Test Matrix: Events

### View Operations

| Route | Method | MEMBER | EVENT_CHAIR | VP_ACTIVITIES | ADMIN | Coverage |
|-------|--------|--------|-------------|---------------|-------|----------|
| `/api/v1/events` | GET | 200 | 200 | 200 | 200 | **Covered** |
| `/api/v1/events/[id]` | GET | 200 | 200 | 200 | 200 | **Covered** |
| `/api/admin/events` | GET | 403 | 403 | 200 | 200 | **Covered** |
| `/api/admin/events/[id]` | GET | 403 | 200* | 200 | 200 | **Covered** |
| `/api/v1/admin/events` | GET | — | — | — | — | Missing |
| `/api/v1/admin/events/[id]` | GET | — | — | — | — | Missing |

### Edit Operations

| Route | Method | MEMBER | EVENT_CHAIR | VP_ACTIVITIES | ADMIN | Coverage |
|-------|--------|--------|-------------|---------------|-------|----------|
| `/api/admin/events/[id]` | PATCH | 403 | 200* | 200 | 200 | **Covered** |
| `/api/admin/events/[id]/cancel` | PATCH | — | — | — | — | Missing |
| `/api/v1/admin/events/[id]` | PATCH | — | — | — | — | Missing |

### Delete Operations

| Route | Method | MEMBER | EVENT_CHAIR | VP_ACTIVITIES | ADMIN | Coverage |
|-------|--------|--------|-------------|---------------|-------|----------|
| `/api/admin/events/[id]` | DELETE | 403 | 403 | 403 | 200 | **Covered** |
| `/api/v1/admin/events/[id]` | DELETE | — | — | — | — | Missing |

> `*` EVENT_CHAIR: Only events they chair (200), other events (403)

---

## Test Matrix: Registrations

### View Operations

| Route | Method | MEMBER | EVENT_CHAIR | VP_ACTIVITIES | ADMIN | Coverage |
|-------|--------|--------|-------------|---------------|-------|----------|
| `/api/admin/registrations` | GET | — | — | — | 200 | Partial |
| `/api/admin/registrations/[id]` | GET | — | — | — | — | Missing |
| `/api/admin/registrations/search` | POST | — | — | — | — | Missing |
| `/api/v1/admin/registrations` | GET | — | — | — | — | Missing |
| `/api/v1/admin/registrations/[id]` | GET | — | — | — | — | Missing |
| `/api/v1/admin/registrations/pending` | GET | — | — | — | — | Missing |

### Edit Operations

| Route | Method | MEMBER | EVENT_CHAIR | VP_ACTIVITIES | ADMIN | Coverage |
|-------|--------|--------|-------------|---------------|-------|----------|
| `/api/v1/events/[id]/register` | POST | — | — | — | — | Missing |
| `/api/v1/events/[id]/register` | DELETE | — | — | — | — | Missing |
| `/api/v1/admin/registrations/[id]/promote` | POST | — | — | — | — | Missing |

### Delete Operations

| Route | Method | MEMBER | EVENT_CHAIR | VP_ACTIVITIES | ADMIN | Coverage |
|-------|--------|--------|-------------|---------------|-------|----------|
| `/api/v1/admin/registrations/[id]` | DELETE | — | — | — | — | Missing |

---

## Coverage Summary

| Resource | Action | Covered | Missing | Total | % |
|----------|--------|---------|---------|-------|---|
| Events | View | 4 | 2 | 6 | 67% |
| Events | Edit | 1 | 2 | 3 | 33% |
| Events | Delete | 1 | 1 | 2 | 50% |
| Registrations | View | 1 | 5 | 6 | 17% |
| Registrations | Edit | 0 | 3 | 3 | 0% |
| Registrations | Delete | 0 | 1 | 1 | 0% |
| **TOTAL** | | **7** | **14** | **21** | **33%** |

---

## Existing Test Files (Auth Coverage)

| File | Tests | Focus |
|------|-------|-------|
| `vp-activities-auth.spec.ts` | 15 | VP can view/edit all events, cannot delete |
| `event-chair-access.spec.ts` | 11 | Chair owns their events, blocked from others |
| `admin-event-detail.spec.ts` | 5 | 401 for unauthenticated |
| `v1/members-list.spec.ts` | 2 (skipped) | 401/403 patterns |
| `v1/registration-promote.spec.ts` | 2 (skipped) | 401/403 patterns |

### Covered Scenarios

- VP_ACTIVITIES: view all events, edit all events, cannot delete
- EVENT_CHAIR: view/edit own events, blocked from others' events, cannot delete
- MEMBER: blocked from admin events list
- Unauthenticated: 401 on admin routes

### Gaps Identified

1. **Registrations completely uncovered** for role-based access
2. **V1 admin routes** have no auth tests (and no auth implementation)
3. **MEMBER self-service** (own registrations) not tested
4. **EVENT_CHAIR registration access** for their events not tested

---

## Redundancy Analysis

| Test Pattern | Files | Status |
|--------------|-------|--------|
| VP can view events | `vp-activities-auth.spec.ts` | OK (2 tests) |
| VP can edit events | `vp-activities-auth.spec.ts` | OK (3 tests) |
| VP cannot delete | `vp-activities-auth.spec.ts` | OK (2 tests) |
| Chair owns events | `event-chair-access.spec.ts` | OK |
| 401 unauthenticated | Multiple files | **Redundant** |

### Redundant Tests

1. **Unauthenticated 401** tested in:
   - `admin-event-detail.spec.ts`
   - `vp-activities-auth.spec.ts`
   - `event-chair-access.spec.ts`

   **Recommendation**: Consolidate into single auth suite or accept redundancy for isolation.

---

## Recommendations

### P0 — Immediate (Day 4)

| Gap | Recommendation |
|-----|----------------|
| V1 admin routes have no auth | Add `requireAdmin()` to all `/api/v1/admin/*` routes |
| No V1 auth tests | Create `tests/api/v1/admin-auth.spec.ts` |
| Registrations auth missing | Add auth tests for `/api/admin/registrations/*` |

### P1 — Should Have (Day 4-5)

| Gap | Recommendation |
|-----|----------------|
| EVENT_CHAIR registration scope | Test chair can view registrations for their events only |
| MEMBER self-service | Test member can register/cancel own registrations |
| VP registration access | Test VP can view all registrations |

### P2 — Nice to Have

| Gap | Recommendation |
|-----|----------------|
| Consolidate 401 tests | Consider single auth middleware test file |
| Export endpoints auth | Add auth tests for `/api/admin/export/*` |

### Tests to Add (Proposed Structure)

```
tests/api/
├── rbac/
│   ├── events-rbac.spec.ts       # Consolidate VP + Chair + Member event tests
│   ├── registrations-rbac.spec.ts # New: all roles × registration actions
│   └── v1-admin-auth.spec.ts     # New: V1 admin endpoints auth
```

### Proposed New Tests

**`registrations-rbac.spec.ts`** (14 tests needed):

| Test | Roles |
|------|-------|
| Admin can list all registrations | ADMIN=200 |
| VP can list all registrations | VP_ACTIVITIES=200 |
| Chair can list registrations for own events | EVENT_CHAIR=200* |
| Chair cannot list registrations for others' events | EVENT_CHAIR=403 |
| Member cannot list admin registrations | MEMBER=403 |
| Unauthenticated returns 401 | NONE=401 |
| Member can register for event | MEMBER=201 |
| Member can cancel own registration | MEMBER=204 |
| Member cannot cancel others' registration | MEMBER=403 |
| Admin can promote waitlisted | ADMIN=200 |
| VP can promote waitlisted | VP_ACTIVITIES=200 |
| Chair can promote for own events | EVENT_CHAIR=200* |
| Member cannot promote | MEMBER=403 |
| Unauthenticated cannot register | NONE=401 |

---

## Quick Reference: Test Tokens

```typescript
const TOKENS = {
  ADMIN: { Authorization: "Bearer test-admin-token" },
  VP_ACTIVITIES: { Authorization: "Bearer test-vp-activities" },
  EVENT_CHAIR: (memberId: string) => ({ Authorization: `Bearer test-member-${memberId}` }),
  MEMBER: (memberId: string) => ({ Authorization: `Bearer test-member-${memberId}` }),
  NONE: {},
};
```

---

## Implementation Status

| Route Group | Auth Implemented | Tests Exist |
|-------------|------------------|-------------|
| `/api/admin/*` | Yes (most routes) | Yes (events) |
| `/api/v1/admin/*` | **NO** | No |
| `/api/v1/events/*` | No (public) | N/A |
| `/api/v1/members/*` | **NO** | Skipped |

---

*Generated: Day 4 RBAC Sprint — Worker 5*
