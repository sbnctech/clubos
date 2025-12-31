# Murmurant System Guarantees

Status: Draft (Authoritative once approved)
Owner: Architecture / Product
Applies to: All Murmurant services, data stores, and operational workflows

---

## 1. Purpose

Murmurant is the system of record for a membership organization of approximately 700 members.
If Murmurant is unavailable or loses data, organizational operations are materially impaired.

This document defines **explicit system guarantees**:
- What Murmurant guarantees
- What Murmurant does NOT guarantee
- How failures are handled
- How recovery is expected to work

All infrastructure, application logic, and operational decisions MUST conform to these guarantees.

---

## 2. Guiding Principles

1. **Data integrity over availability**
   - The system must never knowingly corrupt or lose confirmed data.
   - Read-only degradation is preferable to unsafe writes.

2. **Fail closed, not open**
   - When uncertain, deny access or actions rather than risk leakage or corruption.

3. **Explicit over implicit behavior**
   - No hidden defaults, inferred state, or silent promotion of visibility.

4. **Recoverability is a first-class feature**
   - A system that cannot be restored is considered incomplete.

5. **Human-operable under stress**
   - Recovery must be executable by a trained volunteer, not only the original developers.

---

## 3. Availability Guarantees

### 3.1 Service Availability Target

- Target uptime: **99.9% monthly**
- Planned maintenance excluded, but must be announced and reversible.

### 3.2 Partial Availability

Murmurant guarantees:
- The system may enter **degraded mode** instead of total outage.
- Read-only access may be enforced during incidents.
- Administrative access may be restricted during instability.

Murmurant does NOT guarantee:
- Zero downtime deployments
- Continuous write availability during failures
- Real-time updates during degraded operation

---

## 4. Data Guarantees (Critical)

### 4.1 Data Durability

Murmurant guarantees:
- No acknowledged write is lost without a documented catastrophic failure.
- All primary data is backed up on a defined schedule.
- Backups are encrypted and retained for a defined period.

### 4.2 Data Integrity

Murmurant guarantees:
- No silent data mutation.
- No background jobs that alter historical records without audit logging.
- Schema migrations must be forward- and backward-compatible during rollout.

Murmurant does NOT guarantee:
- Recovery from manual database tampering
- Preservation of data explicitly deleted by authorized admins

---

## 5. Recovery Objectives

### 5.1 Recovery Time Objective (RTO)

- Target RTO: **< 4 hours** for full service restoration
- Target RTO: **< 1 hour** for read-only access

### 5.2 Recovery Point Objective (RPO)

- Target RPO: **< 15 minutes** for core membership and publishing data

---

## 6. Security Guarantees

Murmurant guarantees:
- No private or restricted content is exposed due to partial failure.
- Authentication failures default to denial.
- Authorization is enforced server-side at all times.

Murmurant does NOT guarantee:
- Protection against compromised admin credentials
- Defense against nation-state actors

---

## 7. Publishing & Visibility Guarantees

Murmurant guarantees:
- Draft content is never visible to unintended audiences.
- Preview does not imply publish.
- Visibility rules are evaluated server-side on every request.

Murmurant does NOT guarantee:
- Atomic multi-page publishes (unless explicitly implemented)
- Rollback of user-perceived publication once cached externally

---

## 8. Operational Guarantees

Murmurant guarantees:
- All critical operations have a written runbook.
- Failures produce observable signals (logs, alerts, admin UI warnings).
- Administrative actions are auditable.

Murmurant does NOT guarantee:
- Automatic recovery from all failures
- Absence of human intervention during incidents

---

## 9. API Stability Guarantees (Append-Only Contract)

### 9.1 Stable API Fields

Murmurant guarantees:
- Response fields listed in `tests/contracts/api-schema.contract.spec.ts` cannot be removed.
- New fields may be added to any response (append-only).
- Field types cannot change once stable (e.g., string cannot become number).
- Pagination envelope structure is stable: `{ items, page, pageSize, totalItems, totalPages }`.
- Error responses always include `{ error: string }`.

### 9.2 Breaking Change Policy

A breaking change is defined as:
- Removing a field from an API response
- Changing the type of a field
- Renaming a field
- Changing the structure of a response envelope
- Removing an endpoint

Breaking changes require:
1. **Major version bump** (e.g., v1 → v2)
2. **6-month deprecation period** with `Deprecation` header
3. **Merge captain approval**
4. **Contract test update** with documented justification

### 9.3 Versioning Strategy

- All APIs are versioned under `/api/v1/`
- Old versions remain available for minimum 12 months after successor release
- Sunset dates are communicated via `Sunset` HTTP header

### 9.4 Contract Test Enforcement

The following contract tests run in CI to prevent regressions:
- `tests/contracts/api-schema.contract.spec.ts` - Response field stability
- `tests/contracts/rbac.contract.spec.ts` - Authorization invariants
- `tests/contracts/lifecycle.contract.spec.ts` - State machine invariants

Murmurant does NOT guarantee:
- Response field ordering (JSON objects are unordered)
- Exact error message wording (only structure)
- Performance characteristics

---

## 10. Explicit Non-Goals

The following are intentionally NOT guaranteed:

- Five-nines (99.999%) availability
- Instant global consistency
- Zero data loss under all circumstances
- Self-healing without human oversight
- Complex distributed transactions

---

## 10. Enforcement

- Any feature or change that violates these guarantees MUST NOT be merged.
- Ambiguities are resolved in favor of safety and reversibility.
- This document supersedes informal assumptions.

---

## 11. Change Control

- Changes to this document require:
  - Explicit review
  - Changelog entry
  - Rationale explaining tradeoffs

This document is the foundation for all reliability, resiliency, and operational work in Murmurant.

