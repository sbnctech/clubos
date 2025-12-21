# Work Queue: Feature Specs and TODO Items

This directory contains specification documents for planned features and widgets.
Each document describes intent, scope, and acceptance criteria for future work.

---

## Widget Specifications

### Membership Application Widget

- **File**: [MEMBERSHIP_APPLICATION_WIDGET.md](./MEMBERSHIP_APPLICATION_WIDGET.md)
- **Intent**: Special, polished UI and workflow for new member applications.
- **Summary**:
  - Public-facing multi-step application form (mobile-first, accessible)
  - Admin queue for review, approval, and onboarding
  - Premium "moment of delight" experience for prospective members
  - Integration with governance/audit for decision tracking

### Gift Membership Widget

- **File**: [GIFT_MEMBERSHIP_WIDGET.md](./GIFT_MEMBERSHIP_WIDGET.md)
- **Intent**: Enable non-members (e.g., realtors) to purchase gift memberships.
- **Summary**:
  - Non-member purchaser buys gift membership for a recipient
  - Recipient receives link to redeem via pre-paid application
  - Purchaser receives notification when recipient completes application
  - Printable gift certificate (PDF) for in-person delivery

---

## Lifecycle and Workflow Documents

### Membership Lifecycle

- **File**: [MEMBERSHIP_LIFECYCLE.md](./MEMBERSHIP_LIFECYCLE.md)
- **Intent**: Notes on membership lifecycle workflow and transitions.

---

## Related Documentation

- [Membership Model Truth Table](../MEMBERSHIP/MEMBERSHIP_MODEL_TRUTH_TABLE.md)
- [Membership Lifecycle State Machine](../MEMBERSHIP/MEMBERSHIP_LIFECYCLE_STATE_MACHINE.md)

---

## Adding New Work Items

When adding a new feature spec to this queue:

1. Create a new markdown file with a descriptive name (e.g., `FEATURE_NAME_WIDGET.md`).
2. Include sections: Goal, Scope, Data Model (draft), Open Questions, Acceptance Criteria.
3. Update this README to list the new item with a short summary.
4. Keep specs implementation-friendly but avoid premature detail.
