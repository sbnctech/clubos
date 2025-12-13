# Implementation Readiness Notes

**Purpose**: Translate workflow and RBAC specs into buildable acceptance criteria
**Audience**: Engineering team, Tech Chair
**Status**: Pre-implementation analysis

---

## Event Chair Workflow Acceptance Criteria

### State Transitions

Registration states: REGISTERED, WAITLISTED, CANCELLED, NO_SHOW
Refund request states: (created by Event Chair, handed off to Finance Manager)

### Cancellation Flow

**AC-EC-001**: Given an Event Chair role, when viewing an event's registrations, then the Chair must see a "Cancel Registration" action for each REGISTERED or WAITLISTED member.

**AC-EC-002**: Given an Event Chair role, when cancelling a registration, then the system must change the registration status from REGISTERED to CANCELLED.

**AC-EC-003**: Given a cancelled registration, when a waitlist exists for the event, then the system must automatically identify the next eligible waitlist member (by timestamp priority).

**AC-EC-004**: Given a waitlist member identified for promotion, when the Event Chair confirms the promotion, then the system must change that member's status from WAITLISTED to REGISTERED.

**AC-EC-005**: Given a cancelled registration, when no waitlist exists, then the system must skip the promotion step and proceed to the refund decision.

### Waitlist Priority Rules

**AC-EC-006**: Given multiple members on a waitlist, when selecting the next member for promotion, then the system must select the member with the earliest waitlist timestamp.

**AC-EC-007**: Given an event with per-household limits, when promoting a waitlist member, then the system must verify the promotion does not violate household limits before allowing it.

**AC-EC-008**: Given a waitlist promotion that would violate household limits, when the Event Chair attempts promotion, then the system must block the promotion and identify the next eligible member.

### Notifications

**AC-EC-009**: Given a successful cancellation, when the status changes to CANCELLED, then the system must send a notification to the cancelled member.

**AC-EC-010**: Given a successful waitlist promotion, when the status changes to REGISTERED, then the system must send a notification to the promoted member.

### Refund Handoff

**AC-EC-011**: Given a cancelled registration with payment, when the Event Chair determines a refund is needed, then the Chair must be able to initiate a refund request.

**AC-EC-012**: Given an Event Chair role, when initiating a refund request, then the system must create a record with: member ID, event ID, amount, reason, replacement status.

**AC-EC-013**: Given a refund request created, when the request is submitted, then the Finance Manager must receive a notification.

**AC-EC-014**: Given an Event Chair role, when attempting to execute a refund directly, then the system must block the action with a 403 Forbidden error.

### Replacement-Required Policy

**AC-EC-015**: Given an event with replacement-required-before-refund policy enabled, when the Event Chair initiates a refund request without a replacement, then the system must block the request until a waitlist promotion occurs.

**AC-EC-016**: Given the replacement-required policy, when no waitlist exists, then the system must allow the refund request to proceed (policy cannot be satisfied).

### Partnership Delegation (Cancellation)

**AC-EC-017**: Given a member with an active partnership (Mutual mode), when the partner initiates a cancellation for the member's registration, then the system must allow the action after verifying the delegation is active.

**AC-EC-018**: Given a member with partnership in PRIMARY_A mode where they are partner B, when partner B attempts to cancel partner A's registration, then the system must block the action (only primary can act for both).

**AC-EC-019**: Given a member with partnership in NONE or INDEPENDENT mode, when attempting to cancel their partner's registration, then the system must block the action with a clear error message.

**AC-EC-020**: Given a cancellation initiated by a partner, when the cancellation is recorded, then the audit trail must distinguish:
- actingMemberId: Who clicked cancel (the partner)
- affectedMemberId: Whose registration was cancelled (the registrant)
- registrationId, eventId, timestamp

**AC-EC-021**: Given a cancellation initiated by a partner, when the waitlist substitution runs, then the promotion must follow standard priority rules regardless of who initiated the cancellation.

### Audit Events (Event Chair)

The following audit events must be recorded:

- `CANCELLATION_REQUESTED` - actingMemberId, affectedMemberId, event, timestamp, reason
- `CANCELLATION_EXECUTED` - actingMemberId, affectedMemberId, event, timestamp, executed_by (Chair or self-service)
- `WAITLIST_PROMOTION` - promoted_member, event, timestamp, promoted_by (Chair or system)
- `REFUND_REQUEST_INITIATED` - actingMemberId, affectedMemberId, event, amount, reason, initiated_by

Note: actingMemberId and affectedMemberId may be the same (self-cancellation) or different (partner delegation).

---

## Finance Manager Workflow Acceptance Criteria

### State Transitions

Refund lifecycle: REQUESTED -> APPROVED -> EXECUTED -> RECORDED -> SYNCED

Additional states (implied but not explicit in spec):
- DENIED (when Finance Manager rejects request)
- FAILED (when processor execution fails)

### Refund Approval

**AC-FM-001**: Given a Finance Manager role, when viewing the refund queue, then the Manager must see all refunds in REQUESTED state.

**AC-FM-002**: Given a refund in REQUESTED state, when the Finance Manager reviews it, then the system must display:
- Acting member: Who initiated the cancellation
- Payer identity: Who paid for the original registration (may differ from registrant)
- Registrant identity: Whose registration was cancelled
- Event, requested amount, reason, replacement status
- Payment method used for original transaction

**AC-FM-003**: Given a refund in REQUESTED state, when the Finance Manager approves it, then the status must change to APPROVED.

**AC-FM-004**: Given a refund in REQUESTED state, when the Finance Manager denies it, then the status must change to DENIED with a required reason.

**AC-FM-005**: Given a Finance Manager role, when approving a refund, then the Manager must be able to set a final refund amount different from the requested amount.

### Cancellation Fee Application

**AC-FM-006**: Given an approved refund, when cancellation timing is >7 days before event, then no fee should be applied (full refund).

**AC-FM-007**: Given an approved refund, when cancellation timing is 3-7 days before event, then a 25% fee should be applied (75% refund).

**AC-FM-008**: Given an approved refund, when cancellation timing is <3 days before event, then a 50% fee should be applied (50% refund).

**AC-FM-009**: Given a no-show situation, when a refund is requested, then the system should recommend denial (no refund policy).

**AC-FM-010**: Given any fee policy scenario, when the Finance Manager disagrees with policy, then the Manager must be able to override with documented justification.

### Refund Execution

**AC-FM-011**: Given a refund in APPROVED state, when the Finance Manager triggers execution, then the system must attempt to process the refund through the payment processor.

**AC-FM-012**: Given a successful processor response, when the refund executes, then the status must change to EXECUTED.

**AC-FM-013**: Given a failed processor response, when the refund execution fails, then the status must remain APPROVED (or change to a FAILED state) with the error recorded.

**AC-FM-014**: Given a refund in EXECUTED state, when the internal record is updated, then the status must change to RECORDED.

**AC-FM-015**: Given a refund in RECORDED state, when synced to QuickBooks, then the status must change to SYNCED.

**AC-FM-016**: Given a refund not in SYNCED state, when viewed in reports, then it must be flagged as incomplete.

### Ghost Credit Prevention

**AC-FM-017**: Given a refund execution, when the processor succeeds, then the internal record update must occur atomically (both succeed or both fail).

**AC-FM-018**: Given any state where ClubOS shows a credit but QuickBooks does not, when reconciliation runs, then the system must flag this as a GHOST_CREDIT discrepancy.

### Reconciliation

**AC-FM-019**: Given the daily reconciliation job, when it runs, then it must compare: processor transactions, ClubOS refund records, QuickBooks entries.

**AC-FM-020**: Given a discrepancy between any two systems, when detected, then the system must alert the Finance Manager for review.

**AC-FM-021**: Given a discrepancy alert, when the Finance Manager views it, then the system must display: expected values, actual values, source systems, suggested resolution.

### Partial Refunds

**AC-FM-022**: Given a registration with multiple payment components (event fee, add-ons), when a refund is processed, then the Finance Manager must be able to refund individual components.

**AC-FM-023**: Given multiple partial refunds for the same registration, when viewing refund history, then each partial refund must appear as a separate record with its own lifecycle state.

### Replacement-Required Override

**AC-FM-024**: Given a refund blocked by replacement-required policy, when the Finance Manager determines an override is needed, then the Manager must be able to override with documented justification.

### Partnership Payment Refund Rules

**AC-FM-025**: Given a registration where partner A paid on behalf of partner B, when a refund is approved, then the refund must default to the original payment method (partner A's card).

**AC-FM-026**: Given a refund where Finance Manager needs to refund to a different payment method than the original, when approving, then the Manager must:
- Provide a documented reason code
- Have the exception logged in the refund record

**AC-FM-027**: Given a refund review, when the payer and registrant are different contacts, then the system must clearly indicate this three-way relationship (actor, payer, registrant).

**AC-FM-028**: Given a refund eligibility check, when evaluating policy, then the decision must be based on policy rules only, not on whether the cancellation was initiated by the registrant or their partner.

### Audit Events (Finance Manager)

The following audit events must be recorded:

- `REFUND_APPROVED` - refund_id, approved_by, final_amount, fee_applied
- `REFUND_DENIED` - refund_id, denied_by, reason
- `REFUND_EXECUTED` - refund_id, processor_txn_id, amount, timestamp
- `REFUND_RECORDED` - refund_id, internal_record_id
- `REFUND_SYNCED` - refund_id, quickbooks_ref
- `POLICY_OVERRIDE` - action, overridden_by, justification
- `RECONCILIATION_DISCREPANCY` - type, expected, actual, systems_involved

---

## RBAC Enforcement Checks

### Authentication Layer

**AC-RBAC-001**: Given an unauthenticated request, when accessing any protected endpoint, then the system must return 401 Unauthorized.

**AC-RBAC-002**: Given an invalid token, when accessing any protected endpoint, then the system must return 401 Unauthorized with message "Missing or invalid authorization header".

### Role-Based Restrictions

**AC-RBAC-003**: Given a Member role, when attempting to view draft events, then the system must return 403 Forbidden.

**AC-RBAC-004**: Given a Member role, when attempting to cancel another member's registration, then the system must return 403 Forbidden.

**AC-RBAC-005**: Given an Event Chair role, when attempting to publish an event, then the system must return 403 Forbidden (VP or Admin required).

**AC-RBAC-006**: Given an Event Chair role, when attempting to delete an event, then the system must return 403 Forbidden (Admin only).

**AC-RBAC-007**: Given a VP of Activities role, when attempting to delete an event, then the system must return 403 Forbidden (Admin only).

**AC-RBAC-008**: Given a Finance Manager role, when attempting to cancel a registration, then the system must return 403 Forbidden (Event Chair or above required).

**AC-RBAC-009**: Given an Event Chair role, when attempting to approve a refund, then the system must return 403 Forbidden (Finance Manager or Admin required).

**AC-RBAC-010**: Given an Event Chair role, when attempting to execute a refund, then the system must return 403 Forbidden (Finance Manager or Admin required).

### Finance Manager Specific

**AC-RBAC-011**: Given a Finance Manager role, when viewing refund requests, then access must be granted.

**AC-RBAC-012**: Given a Finance Manager role, when approving refunds, then access must be granted.

**AC-RBAC-013**: Given a Finance Manager role, when executing refunds, then access must be granted.

**AC-RBAC-014**: Given a Finance Manager role, when viewing financial audit logs, then access must be granted.

### Admin Privileges

**AC-RBAC-015**: Given an Admin role, when performing any action in the system, then access must be granted.

**AC-RBAC-016**: Given an Admin role, when deleting an event, then the action must succeed (only Admin can delete).

### Multi-Role Handling

**AC-RBAC-017**: Given a user with multiple roles (e.g., Event Chair AND VP), when accessing a feature, then the system must use the highest privilege level.

### Delegation Layer (Partnerships)

**AC-RBAC-018**: Given a member with no partnership, when attempting to register another member for an event, then the system must return 403 Forbidden.

**AC-RBAC-019**: Given a member with an active partnership (Mutual mode), when attempting to register their partner for an event, then the system must allow the action.

**AC-RBAC-020**: Given a member with an active partnership, when attempting to cancel their partner's registration, then the system must verify the delegation mode allows this action before proceeding.

**AC-RBAC-021**: Given a member with an active partnership, when attempting to use their partner's payment method, then the system must verify the delegation mode allows payment method sharing.

**AC-RBAC-022**: Given a partnership delegation, when the action succeeds, then the system must NOT grant any global role privileges to the acting member (delegation is object-level only).

**AC-RBAC-023**: Given a partnership in NONE or INDEPENDENT mode, when a member attempts any action on behalf of their partner, then the system must block the action.

**AC-RBAC-024**: Given a delegation action, when recorded, then the audit log must include both actingMemberId and affectedMemberId to distinguish actor from affected party.

### Capability Hooks (Suggested)

The following capability checks should be implemented for delegation:

- `events.registration.create_on_behalf` - Can register another member
- `events.registration.cancel_on_behalf` - Can cancel another member's registration
- `finance.payment.use_partner_method` - Can use partner's payment method

These capabilities are granted by active Partnership or Delegation records, not by global roles.

---

## Open Questions for Later Phases

### Event Chair Workflow Gaps

1. **Missing DENIED state for refund requests**: The spec shows refund lifecycle but does not explicitly define what happens when Finance Manager denies. Should there be a DENIED state, and should the Event Chair be notified?

2. **Batch cancellation**: Can Event Chairs batch-cancel multiple registrations? The spec implies single-member flow only.

3. **Cancellation deadline**: Is there a cutoff after which Event Chairs cannot cancel without VP approval? Not defined.

4. **Guest handling**: How are non-member (guest) registrations handled differently? Not addressed.

5. **Event Chair permissions gap**: The RBAC doc says Event Chair "currently same as Member" but the workflow requires Chair to cancel registrations and initiate refunds. This is a contradiction that blocks implementation.

### Finance Manager Workflow Gaps

6. **FAILED state missing**: What happens when processor execution fails? The spec does not define a FAILED state or retry mechanism.

7. **Reconciliation failure escalation**: What is the escalation path when reconciliation discrepancies cannot be resolved? Not defined.

8. **Timeout handling**: How long can a refund stay in REQUESTED or APPROVED state before escalation? Not defined.

9. **Processor unavailability**: What happens if the payment processor is unavailable during execution? No fallback defined.

10. **QuickBooks sync retry**: What happens if QuickBooks sync fails? No retry mechanism or manual sync option defined.

11. **Refund request origin**: Is the refund request created automatically when a registration is cancelled, or does the Event Chair explicitly create it? The spec implies explicit creation but this should be confirmed.

### RBAC Gaps

12. **Event Chair scope not implemented**: The spec notes "scoped access planned for future" but Event Chair workflow requires Chair to act on events. What events can a Chair act on today?

13. **VP scope not implemented**: VPs currently see ALL events. When scoping is implemented, how will cross-committee cancellations/refunds work?

14. **Finance Manager event visibility**: Can Finance Manager see event details when reviewing refund requests? Not addressed in RBAC matrix.

15. **Audit log access**: Who can view audit logs beyond Finance Manager? Not defined for other roles.

### Cross-Workflow Gaps

16. **Notification delivery failures**: What happens if cancellation or promotion notifications fail to deliver? No retry or alerting mechanism defined.

17. **Concurrent modification**: What happens if two Chairs try to cancel the same registration simultaneously? No locking/conflict resolution defined.

18. **Refund amount validation**: Can Finance Manager approve a refund amount greater than the original payment? No upper bound defined.

### Partnership and Delegation Gaps

19. **Partnership creation flow**: Who can create a partnership? Can members self-service, or does an admin need to approve? Not defined.

20. **Partnership termination**: What happens to in-flight registrations when a partnership is terminated? Can a partner cancel registrations made by the other partner after termination?

21. **Delegation mode changes**: If delegation mode changes from MUTUAL to NONE, what happens to existing capabilities? Are they revoked immediately?

22. **Payment method visibility**: When paying on behalf of a partner, can the acting member see the partner's full card details, or only last-4 digits? Security implications not addressed.

23. **Split tender**: The spec mentions split tender is a "future enhancement." Should the system block attempts to use two payment methods, or silently use the first one selected?

24. **Partnership vs. Delegation table usage**: The spec shows both Partnership (for couples) and Delegation (for general use). Are both needed, or does Partnership cover all current use cases?

25. **Household tracking vs. delegation**: Partnership with INDEPENDENT mode links contacts for "household tracking" but disables delegation. What does household tracking mean operationally?

26. **Three-way audit distinction**: The spec requires distinguishing actor, payer, and registrant. If all three are different people, is this a valid scenario? (e.g., Admin acting, Partner A paying, Partner B registering)

### Assumptions to Make Explicit

- **Assumption**: All monetary values are in USD and stored as cents (integer) to avoid floating point issues.
- **Assumption**: Timestamps are stored in UTC and displayed in the user's local timezone.
- **Assumption**: "Replacement" means a waitlist promotion occurred for the same event, not a different event.
- **Assumption**: QuickBooks sync is one-way (ClubOS -> QuickBooks), not bidirectional.
- **Assumption**: Event Chair can only act on events they are assigned to chair (once scoping is implemented).
- **Assumption**: Partnership delegation is bidirectional when in MUTUAL mode; both partners have equal capabilities.
- **Assumption**: Partnership status is checked at action time, not cached; if partnership is terminated, subsequent actions are blocked immediately.
- **Assumption**: A contact can have at most one active Partnership at a time.
- **Assumption**: When a partner pays on behalf of registrant, the payer's payment method is stored on the registration for refund purposes.

---

*Document created for implementation readiness review. Not a design or schema document.*
