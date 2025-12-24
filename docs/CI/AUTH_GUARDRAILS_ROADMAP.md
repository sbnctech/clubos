# Auth Guardrails Remediation Roadmap

This document tracks the remediation of known gaps in auth guardrails, prioritized by risk and complexity.

---

## Principles

1. **No new gaps**: CI blocks any new `requireCapability()` usage for dangerous capabilities
2. **Incremental fixes**: Each PR addresses one route or one logical group
3. **Test-first**: Each fix includes verification that `requireCapabilitySafe()` is enforced
4. **Backward compatible**: Fixes must not change API behavior for non-impersonating users

---

## Gap Classification

### Severity Levels

| Level | Definition | SLA |
|-------|------------|-----|
| **P0** | Privilege escalation possible during impersonation | Fix immediately |
| **P1** | High-privilege operation (`users:manage`) exposed | Fix in next sprint |
| **P2** | Read-only or diagnostic operation exposed | Fix when convenient |

### Risk Categories

| Category | Description |
|----------|-------------|
| `priv-esc` | Could allow privilege escalation during impersonation |
| `data-mod` | Could allow data modification during impersonation |
| `read-only` | Exposes read-only data (lower risk) |
| `dev-only` | Demo/test endpoints (lowest risk in prod) |

---

## Current Gaps (28 total)

### P1: users:manage Endpoints (13 gaps)

These routes allow user/role management while impersonating. **Highest priority**.

| ID | File | Line | Operation | Fix Type |
|----|------|------|-----------|----------|
| GAP-001 | `v1/admin/users/[id]/passkeys/route.ts` | 48 | DELETE passkey | `requireCapabilitySafe` |
| GAP-002 | `v1/admin/users/[id]/passkeys/route.ts` | 98 | POST passkey | `requireCapabilitySafe` |
| GAP-003 | `v1/admin/service-history/route.ts` | 86 | POST service record | `requireCapabilitySafe` |
| GAP-004 | `v1/admin/service-history/[id]/close/route.ts` | 21 | POST close record | `requireCapabilitySafe` |
| GAP-005 | `v1/admin/transitions/route.ts` | 72 | POST transition | `requireCapabilitySafe` |
| GAP-006 | `v1/admin/transitions/[id]/detect-outgoing/route.ts` | 21 | POST detect | `requireCapabilitySafe` |
| GAP-007 | `v1/admin/transitions/[id]/cancel/route.ts` | 21 | POST cancel | `requireCapabilitySafe` |
| GAP-008 | `v1/admin/transitions/[id]/apply/route.ts` | 24 | POST apply | `requireCapabilitySafe` |
| GAP-009 | `v1/admin/transitions/[id]/assignments/[aid]/route.ts` | 18 | DELETE assignment | `requireCapabilitySafe` |
| GAP-010 | `v1/admin/transitions/[id]/assignments/route.ts` | 32 | POST assignment | `requireCapabilitySafe` |
| GAP-011 | `v1/admin/transitions/[id]/submit/route.ts` | 21 | POST submit | `requireCapabilitySafe` |
| GAP-012 | `v1/admin/transitions/[id]/route.ts` | 55 | PUT transition | `requireCapabilitySafe` |
| GAP-013 | `v1/admin/transitions/[id]/route.ts` | 105 | DELETE transition | `requireCapabilitySafe` |

**Proposed PR sequence:**

1. `fix/guardrails-passkeys` (GAP-001, GAP-002) - 2 fixes
2. `fix/guardrails-service-history` (GAP-003, GAP-004) - 2 fixes
3. `fix/guardrails-transitions` (GAP-005 through GAP-013) - 9 fixes

### P2: admin:full Endpoints (9 gaps)

These routes use `admin:full` for mostly read-only operations. Lower risk but still worth fixing.

| ID | File | Line | Operation | Fix Type |
|----|------|------|-----------|----------|
| GAP-014 | `v1/admin/import/status/route.ts` | 37 | GET import status | `requireCapabilitySafe` |
| GAP-015 | `v1/support/cases/route.ts` | 44 | GET cases list | `requireCapabilitySafe` |
| GAP-016 | `v1/support/cases/route.ts` | 104 | POST case | `requireCapabilitySafe` |
| GAP-017 | `v1/support/cases/[id]/notes/route.ts` | 42 | POST note | `requireCapabilitySafe` |
| GAP-018 | `v1/support/cases/[id]/route.ts` | 53 | GET case | `requireCapabilitySafe` |
| GAP-019 | `v1/support/cases/[id]/route.ts` | 160 | PUT case | `requireCapabilitySafe` |
| GAP-020 | `v1/support/dashboard/route.ts` | 49 | GET dashboard | `requireCapabilitySafe` |
| GAP-021 | `v1/officer/governance/minutes/[id]/route.ts` | 256 | PUT minutes | `requireCapabilitySafe` |
| GAP-022 | `v1/officer/governance/meetings/[id]/route.ts` | 99 | PUT meeting | `requireCapabilitySafe` |

**Proposed PR sequence:**

4. `fix/guardrails-support-cases` (GAP-015 through GAP-020) - 6 fixes
5. `fix/guardrails-governance` (GAP-021, GAP-022) - 2 fixes
6. `fix/guardrails-import-status` (GAP-014) - 1 fix

### P2: Demo/Dev Endpoints (6 gaps)

These are demo or development-only endpoints. Lowest priority since they're not used in production.

| ID | File | Line | Operation | Fix Type |
|----|------|------|-----------|----------|
| GAP-023 | `admin/demo/lifecycle-members/route.ts` | 81 | Demo endpoint | `requireCapabilitySafe` |
| GAP-024 | `admin/demo/member-list/route.ts` | 98 | Demo endpoint | `requireCapabilitySafe` |
| GAP-025 | `admin/demo/status/route.ts` | 21 | Demo endpoint | `requireCapabilitySafe` |
| GAP-026 | `admin/demo/work-queue/route.ts` | 21 | Demo endpoint | `requireCapabilitySafe` |
| GAP-027 | `admin/demo/scenarios/route.ts` | 596 | Demo endpoint | `requireCapabilitySafe` |
| GAP-028 | `openapi/route.ts` | 57 | OpenAPI spec | `requireCapabilitySafe` |

**Proposed PR sequence:**

7. `fix/guardrails-demo-endpoints` (GAP-023 through GAP-027) - 5 fixes
8. `fix/guardrails-openapi` (GAP-028) - 1 fix

---

## Next 3 PRs (Recommended)

These are the highest-priority, smallest-scope PRs to tackle first:

| PR | Issue | Gaps | Est. Size |
|----|-------|------|-----------|
| `fix/guardrails-passkeys` | #223 | GAP-001, GAP-002 | ~10 lines |
| `fix/guardrails-service-history` | #224 | GAP-003, GAP-004 | ~10 lines |
| `fix/guardrails-transitions` | #225 | GAP-005 through GAP-013 | ~50 lines |

### PR 1: `fix/guardrails-passkeys` (#223)

**Scope:** GAP-001, GAP-002

**Files:**
- `src/app/api/v1/admin/users/[id]/passkeys/route.ts`

**Changes:**
- Line 48: `requireCapability` → `requireCapabilitySafe`
- Line 98: `requireCapability` → `requireCapabilitySafe`

**Risk:** Low (passkey management is sensitive, but fix is mechanical)

**Estimated size:** ~10 lines changed

---

### PR 2: `fix/guardrails-service-history` (#224)

**Scope:** GAP-003, GAP-004

**Files:**
- `src/app/api/v1/admin/service-history/route.ts`
- `src/app/api/v1/admin/service-history/[id]/close/route.ts`

**Changes:**
- Line 86: `requireCapability` → `requireCapabilitySafe`
- Line 21: `requireCapability` → `requireCapabilitySafe`

**Risk:** Low (service history is important but fix is mechanical)

**Estimated size:** ~10 lines changed

---

### PR 3: `fix/guardrails-transitions` (#225)

**Scope:** GAP-005 through GAP-013

**Files:**
- `src/app/api/v1/admin/transitions/route.ts`
- `src/app/api/v1/admin/transitions/[id]/route.ts`
- `src/app/api/v1/admin/transitions/[id]/detect-outgoing/route.ts`
- `src/app/api/v1/admin/transitions/[id]/cancel/route.ts`
- `src/app/api/v1/admin/transitions/[id]/apply/route.ts`
- `src/app/api/v1/admin/transitions/[id]/submit/route.ts`
- `src/app/api/v1/admin/transitions/[id]/assignments/route.ts`
- `src/app/api/v1/admin/transitions/[id]/assignments/[aid]/route.ts`

**Changes:** 9 instances of `requireCapability` → `requireCapabilitySafe`

**Risk:** Medium (transitions are critical workflow, but fix is mechanical)

**Estimated size:** ~50 lines changed (across multiple files)

---

## Definition of Done

A gap is considered **closed** when:

1. The route uses `requireCapabilitySafe()` instead of `requireCapability()`
2. The gap is removed from `KNOWN_GAPS` in `check-auth-guardrails.ts`
3. `npm run test:guardrails` passes
4. The PR is merged to main

---

## No New Gaps Rule

**CI enforces this automatically.** If you add a new route that uses `requireCapability()` with a dangerous capability, CI will fail with:

```
✗ Found 1 NEW unsafe auth helper usage(s)
```

To fix: use `requireCapabilitySafe()` instead.

---

## Tracking

| Metric | Current | Target |
|--------|---------|--------|
| Total gaps | 28 | 0 |
| P1 gaps | 13 | 0 |
| P2 gaps | 15 | 0 |

Last updated: 2024-12-23

---

## GitHub Issues

For each gap group, create an issue using the template below.

### Issue Template

```markdown
**Title:** [guardrails] Fix GAP-XXX through GAP-YYY: [description]

**Labels:** security, auth, guardrails, tech-debt

**Body:**

## Summary
Migrate [N] endpoints from `requireCapability()` to `requireCapabilitySafe()`.

## Gaps Addressed
- [ ] GAP-XXX: `path/to/route.ts:LINE`
- [ ] GAP-YYY: `path/to/route.ts:LINE`

## Files to Modify
- `src/app/api/v1/admin/...`

## Acceptance Criteria
- [ ] All listed gaps use `requireCapabilitySafe()`
- [ ] Gaps removed from `KNOWN_GAPS` in `check-auth-guardrails.ts`
- [ ] `npm run test:guardrails` passes
- [ ] No new gaps introduced

## Risk Assessment
- **Severity:** P1/P2
- **Category:** priv-esc / data-mod / read-only
- **Blast radius:** [description of affected functionality]

## Testing
- [ ] Manual test: verify endpoint still works for non-impersonating admin
- [ ] Manual test: verify endpoint is blocked for impersonating admin
```

---

## Related Documentation

- [INVARIANTS.md](./INVARIANTS.md) - Security invariants overview
- [SAFETY_NET.md](./SAFETY_NET.md) - How safety layers work together
- [PR_REVIEW_CHECKLIST.md](./PR_REVIEW_CHECKLIST.md) - Review process for auth changes
