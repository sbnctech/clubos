# Trust Surface Review Checklist

A specialized checklist for reviewing PRs that touch trust-model documentation. These documents define what customers can rely on; changes require extra care.

---

## When This Checklist Applies

Use this checklist when a PR modifies any of:

- `docs/ARCH/*CONTRACT*.md` (any file with "contract" in the name)
- `docs/ARCH/*MANIFEST*.md` (intent manifest documentation)
- `docs/ARCH/PREVIEW_SURFACE_CONTRACT.md`
- `docs/ARCH/REVERSIBILITY_CONTRACT.md`
- `docs/ARCH/SUGGESTION_REVIEW_WORKFLOW.md`
- `docs/IMPORTING/MIGRATION_CUSTOMER_JOURNEY.md` (customer-facing guarantees)
- `docs/BIZ/ORGANIZATIONAL_PRESENTATION_PHILOSOPHY.md` (trust promises)

If the PR touches these files, complete all items below before approving.

---

## Review Items

### Guarantees and Promises

- [ ] **Existing guarantees preserved** — No guarantee has been weakened, removed, or made conditional without explicit justification and version bump
- [ ] **Non-guarantees still present** — The "What is NOT guaranteed" sections remain accurate; nothing has been silently promoted to a guarantee
- [ ] **Backward compatibility noted** — If behavior changes, a versioning note or migration path is documented

### Human Authority Model

- [ ] **Human authority explicit** — Every decision point names who decides (customer, operator, system)
- [ ] **No new implied automation** — The system does not gain new autonomous decision-making power without explicit documentation
- [ ] **Abort semantics unchanged** — Customer-initiated abort remains unconditional and side-effect-free

### Terminology Consistency

- [ ] **"Silent" used only literally** — The word "silent" appears only when describing actual absence of output, never to describe hidden behavior
- [ ] **Abort vs rollback vs recovery distinguished** — These terms are not used interchangeably; each has a specific meaning
- [ ] **"System proposes, human decides" preserved** — Language reinforces that customers control outcomes

### Contract Hygiene

- [ ] **Version updated if guarantees change** — Contract version number incremented when binding promises change
- [ ] **Related documents cross-referenced** — Links to dependent documents are present and accurate
- [ ] **Testable claims remain testable** — Any claim that can be verified still describes how to verify it

---

## Quick Reference: Key Terms

| Term | Meaning | Used For |
|------|---------|----------|
| **Abort** | Customer-initiated; discards pending work | Before commit |
| **Rollback** | Customer-initiated; reverses committed work | After commit |
| **Recovery** | System-initiated; handles technical failures | On error |
| **Preview** | System proposal shown for human approval | Before action |
| **Intent manifest** | Machine-readable record of planned actions | Audit trail |

---

## If Any Item Fails

1. **Do not approve** until the issue is resolved
2. Request changes with specific line references
3. For guarantee changes, require explicit sign-off from merge captain
4. For terminology drift, suggest specific corrections

---

## Related Documents

- [PR Review Checklist](./PR_REVIEW_CHECKLIST.md) — General PR review process
- [Architectural Charter](../ARCHITECTURAL_CHARTER.md) — P5: Reversibility principle
- [Preview Surface Contract](../ARCH/PREVIEW_SURFACE_CONTRACT.md) — What previews guarantee
- [Reversibility Contract](../ARCH/REVERSIBILITY_CONTRACT.md) — Migration safety guarantees
- [Suggestion Review Workflow](../ARCH/SUGGESTION_REVIEW_WORKFLOW.md) — Approval workflow semantics

---

*This checklist protects the promises we make to customers. When in doubt, do not weaken a guarantee.*
