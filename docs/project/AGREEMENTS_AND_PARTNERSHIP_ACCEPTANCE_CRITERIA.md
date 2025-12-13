# Agreements and Partnership Acceptance Criteria

**Purpose**: Build-ready acceptance criteria for agreements and partnership delegation
**Audience**: Engineering team, QA
**Status**: Specification (docs-only, no implementation)

---

## Agreement Hard Gates

### Membership Agreement

**AC-AG-001**: Given a new member who has NOT signed the Membership Agreement, when
they attempt to register for any event, then the system must block registration with
message "Please sign your Membership Agreement to continue."

**AC-AG-002**: Given a member whose Membership Agreement has expired (if version
requires re-signing), when they attempt to register for any event, then the system
must block registration until they sign the current version.

**AC-AG-003**: Given a member who HAS signed the Membership Agreement, when they
attempt to register for an event, then this gate passes (other gates may still apply).

### Media Rights Agreement

**AC-AG-004**: Given a new member who has NOT signed the Media Rights Agreement, when
they attempt to register for any event, then the system must block registration with
message "Please sign your Media Rights Agreement to continue."

**AC-AG-005**: Given a member who has signed the Media Rights Agreement with OPT-OUT,
when they attempt to register for an event, then registration is allowed (opt-out is
recorded as a flag, not a blocker).

**AC-AG-006**: Given a member who has signed both Membership and Media Rights
agreements, when they attempt to register for an event, then agreement gates pass.

### Agreement Versioning

**AC-AG-007**: Given an agreement with a new version published AND marked as
re-signature required, when a member who signed the old version attempts to register,
then the system must block registration until they sign the new version.

**AC-AG-008**: Given an agreement signature record, when an admin requests audit
details, then the system must display the exact version text that was signed, the
timestamp, and the signing method.

---

## Partnership Delegation

### Bilateral Consent

**AC-PA-001**: Given Partner A and Partner B with NO partnership delegation agreement
signed by B, when Partner A attempts to register Partner B for an event, then the
system must block the action with message "Partner has not granted delegation rights."

**AC-PA-002**: Given Partner B has signed a Partnership Delegation Agreement granting
rights to Partner A, when Partner A attempts to register Partner B for an event, then
the delegation gate passes (other gates may still apply).

**AC-PA-003**: Given Partnership in MUTUAL mode where only Partner A has signed
(Partner B has not), when Partner B attempts to register Partner A for an event, then
the system must block the action (B has not been granted rights by A).

### Delegation Modes

**AC-PA-004**: Given Partnership in PRIMARY_A mode, when Partner A attempts to
register Partner B, then the action is allowed (A can act for both).

**AC-PA-005**: Given Partnership in PRIMARY_A mode, when Partner B attempts to
register Partner A, then the system must block the action (B can only act for self).

**AC-PA-006**: Given Partnership in NONE or INDEPENDENT mode, when either partner
attempts to act for the other, then the system must block the action.

### Revocation

**AC-PA-007**: Given Partner B has granted delegation rights to Partner A, when
Partner B revokes those rights, then the revocation takes effect immediately.

**AC-PA-008**: Given Partner A is in the middle of browsing events for Partner B when
Partner B revokes, when Partner A attempts to complete a registration, then the
system must block the action (revocation already effective).

**AC-PA-009**: Given a revocation event, when the system logs it, then the log must
include: who revoked, when, and the partnership affected.

### Delegation Cannot Override Hard Gates

**AC-PA-010**: Given Partner A has delegation rights from Partner B, but Partner B has
NOT signed the Membership Agreement, when Partner A attempts to register Partner B,
then the system must block with message about Partner B's missing agreement.

**AC-PA-011**: Given Partner A has delegation rights from Partner B, when Partner A
attempts to sign the Membership Agreement on behalf of Partner B, then the system
must block the action (agreements are non-delegable).

**AC-PA-012**: Given any delegation scenario, when the action would bypass a hard
gate, then the system must block the action. Delegation cannot override gates.

### Payment Method Delegation

**AC-PA-013**: Given Partner A has delegation rights including payment method usage,
when Partner A registers for an event, then Partner A may select Partner B's payment
method on file.

**AC-PA-014**: Given Partner A does NOT have payment method delegation from Partner B,
when Partner A attempts to use Partner B's card, then the system must block the
selection.

---

## Guest Release

### Non-Delegable Signing

**AC-GR-001**: Given an event that requires a Guest Release, when a member attempts
to sign the release on behalf of their guest, then the system must block the action
with message "Guest must sign release directly."

**AC-GR-002**: Given a guest who has NOT signed the Guest Release for an event, when
check-in staff attempts to check in the guest, then the system must block check-in
with message "Guest must sign release before participating."

**AC-GR-003**: Given a guest who HAS signed the Guest Release for the specific event,
when check-in staff attempts to check in the guest, then check-in is allowed.

### Event-Scoped

**AC-GR-004**: Given a guest who signed a Guest Release for Event A, when the same
guest attends Event B (which also requires a release), then the guest must sign a
new release for Event B.

**AC-GR-005**: Given an event that does NOT require a Guest Release, when a guest
arrives at check-in, then no release check is performed.

### Check-In View

**AC-GR-006**: Given check-in staff viewing the attendance list for an event
requiring guest releases, when viewing a guest entry, then the system must display
release status (signed/not signed) prominently.

**AC-GR-007**: Given check-in staff viewing the attendance list, when the release
status is "not signed," then the system must provide a way for the guest to sign
on-site (e.g., tablet signing flow).

---

## Admin Functions

### Missing Agreements Dashboard

**AC-AD-001**: Given an admin viewing the missing agreements dashboard, when the page
loads, then the system must display a list of all members missing the Membership
Agreement.

**AC-AD-002**: Given an admin viewing the missing agreements dashboard, when the page
loads, then the system must display a list of all members missing the Media Rights
Agreement.

**AC-AD-003**: Given events requiring guest releases, when an admin views the
dashboard, then the system must display a list of registered guests who have not yet
signed their release.

### Admin Override

**AC-AD-004**: Given a member blocked by an agreement hard gate, when an admin
performs an override, then the override must be logged with: admin ID, member ID,
which gate was overridden, reason provided, timestamp.

**AC-AD-005**: Given an admin override was performed, when viewing the member's
registration, then the system must indicate the registration was allowed via
override.

### Partnership Management

**AC-AD-006**: Given an admin viewing partnerships, when viewing a specific
partnership, then the system must display: both partners, delegation mode, which
agreements are signed, revocation history.

---

## Audit and Retrieval

**AC-AU-001**: Given a signed agreement, when an admin requests retrieval, then the
system must display: exact agreement text signed, version ID, content hash, signed_at
timestamp, method (web/admin/paper).

**AC-AU-002**: Given a member's agreement history, when an admin requests export,
then the system must produce a downloadable record suitable for compliance review.

**AC-AU-003**: Given any delegated action, when logged, then the log must include:
acting_member_id, affected_member_id, action_type, delegation_id, timestamp.

---

## Summary of Hard Gates

| Gate | Blocks | Can Delegate? | Override? |
|------|--------|---------------|-----------|
| Membership Agreement | Event registration | NO | Admin only (logged) |
| Media Rights Agreement | Event registration | NO | Admin only (logged) |
| Partnership Delegation | Acting for partner | N/A (bilateral consent) | N/A |
| Guest Release | Guest participation | NO | Admin only (logged) |

**Key Rule**: Delegation CANNOT override hard gates.

---

## Related Documents

- docs/agreements/AGREEMENTS_SYSTEM_SPEC.md - Full specification
- docs/rbac/AUTH_AND_RBAC.md - Delegation layer and gate evaluation
- SYSTEM_SPEC.md - Agreements and Releases section

---

*Document maintained by ClubOS development team. Last updated: December 2024*
