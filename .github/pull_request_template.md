<!--
WHY GREEN IS SUFFICIENT TO MERGE

When CI passes ("green"), six independent safety layers have verified this change:
contract tests prove security invariants hold, CI guardrails scan for unsafe patterns,
TypeScript catches capability typos, the PR template forces safety analysis, E2E tests
verify runtime authorization, and the review checklist provides mechanical verification.
For a bad auth change to ship, ALL of these would have to fail simultaneously—a compound
probability well under one in a million. Reviewers can therefore focus on business logic
and design decisions rather than hunting for bugs the tests should have caught.

See: docs/CI/SAFETY_NET.md § "What Would Have to Go Wrong"
-->

## Release classification (required)

Select exactly one:

- [ ] experimental
- [ ] candidate
- [ ] stable

## Size (required)

Select exactly one:

- [ ] S (1-5 files, 1-100 lines)
- [ ] M (6-15 files, 101-300 lines)
- [ ] L (16+ files, 301+ lines) - requires split plan below

## Hotspots touched (required)

Check all that apply:

- [ ] prisma/schema.prisma or migrations
- [ ] package.json or package-lock.json
- [ ] .github/workflows/**
- [ ] src/app/admin/**/layout, nav, or search
- [ ] src/components/editor/** or publishing surfaces
- [ ] src/lib/auth*, rbac*, or permissions*
- [ ] None of the above

If ANY hotspot is checked, you MUST complete the Hotspot Plan section below.

## Summary

What changed and why.

## Hotspot Plan

<!-- Required if any hotspot is checked above. Delete if not applicable. -->

**Files affected:**

- file1.ts
- file2.ts

**Why these changes are safe:**

<!-- Explain conflict risk and mitigation -->

**Rollback plan:**

<!-- How to undo if something goes wrong -->

## Split Plan (if size L)

<!-- Required if size is L. Delete if not applicable. -->

**Micro-PRs:**

1. PR: [title] - [files: X, lines: Y]
2. PR: [title] - [files: X, lines: Y]

## Why This Change Is Safe

<!-- Required for any PR touching auth, RBAC, impersonation, or lifecycle logic. -->
<!-- Delete this section ONLY if the PR is purely cosmetic (typos, comments, etc.) -->

**Invariants touched:**

- [ ] RBAC (capability checks, role mappings)
- [ ] Impersonation (blocked capabilities, impersonation context)
- [ ] Lifecycle (state transitions, status changes)
- [ ] None of the above

**How invariants are enforced:**

- Tests: <!-- e.g., "rbac.contract.spec.ts" -->
- Guardrails: <!-- e.g., "security-guardrails.yml" -->
- Runtime checks: <!-- e.g., "requireCapabilitySafe()" -->

**Worst-case failure mode if this breaks:**

<!-- One sentence. e.g., "Member could view another member's PII" -->

**How this would be detected:**

<!-- e.g., "Contract tests fail", "Audit log shows unauthorized action" -->

## Checks

- [ ] Local preflight passed: `npm run -s typecheck`
- [ ] Size declaration matches actual changes
- [ ] Hotspot declaration is accurate
- [ ] Why This Change Is Safe section completed (if applicable)
