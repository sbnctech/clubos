# Agreements System Specification

**Purpose**: Define agreement types, versioning, storage, and enforcement in ClubOS
**Audience**: Tech Chair, Development Team, Board
**Status**: Specification (docs-only)

---

## Overview

ClubOS enforces certain agreements as hard gates. Users cannot proceed with specific
actions until the required agreements are satisfied. This document specifies the
agreement types, their requirements, and how they integrate with the authorization
evaluation order.

### Evaluation Order

Agreements are evaluated as part of the ClubOS authorization chain:

```
Auth -> Roles -> Scope -> Delegation -> Hard Gates (Agreements)
```

Agreements are checked LAST, after all other authorization checks pass. A user may
have the correct role and delegation rights, but still be blocked if an agreement
hard gate is not satisfied.

---

## Agreement Types

### 1. Membership Agreement

**Purpose**: Establishes the member's relationship with the club
**Required for**: All active members
**Scope**: Club-wide

Enforcement:
- New members cannot register for any event until signed
- Existing members whose agreement expires must re-sign before registering
- Admin can override in exceptional cases (logged)

Content includes:
- Code of conduct
- Liability acknowledgment
- Communication consent
- Dues and fee policies

### 2. Media Rights Agreement

**Purpose**: Grants permission for the club to use member photos/media
**Required for**: All active members
**Scope**: Club-wide

Enforcement:
- New members cannot register for any event until signed
- Members may opt out (decline media rights) but must explicitly do so
- Opt-out does not block registration; it sets a flag for event photographers

Content includes:
- Photo/video permission grant
- Social media usage consent
- Opt-out option with acknowledgment

### 3. Partnership Delegation Agreement

**Purpose**: Establishes delegation rights between partners
**Required for**: Partnership delegation functionality
**Scope**: Bilateral (between two specific contacts)

Enforcement:
- Partner A cannot act on behalf of Partner B unless B has signed
- Partner B cannot act on behalf of Partner A unless A has signed
- Both parties must sign for MUTUAL delegation mode
- Revocation is effective immediately

Content includes:
- Grant of registration rights (register for partner)
- Grant of cancellation rights (cancel partner's registration)
- Grant of payment method usage (use partner's card on file)
- Revocation clause
- Bilateral consent acknowledgment

### 4. Guest Release Agreement

**Purpose**: Liability release for non-member guests at specific events
**Required for**: Guests attending events that require releases
**Scope**: Event-specific

Enforcement:
- Guest cannot participate in event without signing
- Check-in system blocks participation if release not signed
- CANNOT be delegated (guest must sign directly)
- Member bringing guest cannot sign on guest's behalf

Content includes:
- Liability waiver
- Emergency contact information
- Acknowledgment of event-specific risks (e.g., hiking, boating)

---

## Versioning Model

### Version Identification

Each agreement has:
- `agreement_type`: enum (MEMBERSHIP, MEDIA_RIGHTS, PARTNERSHIP_DELEGATION, GUEST_RELEASE)
- `version_id`: unique identifier (UUID or incremental)
- `content_hash`: SHA-256 hash of agreement content
- `effective_date`: when this version became active
- `supersedes_version_id`: previous version (nullable for first version)

### Version Tracking Requirements

1. When agreement content changes, a new version must be created
2. The system must track which version each user signed
3. If a new version is published:
   - Existing signatures remain valid unless explicitly invalidated
   - Admin can mark a version as "re-signature required"
   - Users with re-signature required are blocked until they sign the new version

### Content Hash

The content_hash serves as a tamper-evident seal:
- Hash is computed from the exact agreement text
- If hash does not match stored content, signature is invalid
- Enables audit verification that signed content was not altered

---

## Storage Requirements

### Signature Record

Each signed agreement must store:

```
agreement_signature:
  id: UUID
  contact_id: who signed
  agreement_type: MEMBERSHIP | MEDIA_RIGHTS | PARTNERSHIP_DELEGATION | GUEST_RELEASE
  version_id: which version was signed
  signed_at: timestamp (UTC)
  actor_id: who performed the action (may differ from contact_id for admin overrides)
  method: WEB_UI | ADMIN_OVERRIDE | API | PAPER_UPLOAD
  ip_address: (optional) for web signatures
  event_id: (nullable) for event-scoped agreements like guest releases
  partner_contact_id: (nullable) for partnership delegation (the other party)
  revoked_at: (nullable) timestamp if revoked
  revoked_by: (nullable) who revoked
```

### Retrieval Requirements

The system must support:
- Show exact version signed by a specific user
- Show full audit trail of signatures and revocations
- Show all users who have NOT signed a required agreement
- Show all users whose signatures are for an outdated version (if re-sign required)
- Export agreement signature history for compliance/legal review

---

## Enforcement Points

### Hard Gate: Event Registration

```
User attempts to register for event
        |
        v
   Auth -> Roles -> Scope -> Delegation checks pass?
        |
        NO --> 401/403 error
        |
       YES
        |
        v
   Is user a member?
        |
       YES --> Check: Membership Agreement signed?
        |              |
        |         NO --> BLOCKED: "Please sign Membership Agreement"
        |              |
        |         YES --> Check: Media Rights Agreement signed?
        |                      |
        |                 NO --> BLOCKED: "Please sign Media Rights Agreement"
        |                      |
        |                 YES --> Proceed to registration
        |
       NO (guest) --> Different flow (guest release at check-in)
```

### Hard Gate: Partnership Delegation

```
Partner A attempts to register Partner B for event
        |
        v
   Auth -> Roles -> Scope checks pass?
        |
       YES
        |
        v
   Does Partner B have active Partnership Delegation Agreement
   granting rights to Partner A?
        |
       NO --> BLOCKED: "Partner has not granted delegation rights"
        |
       YES
        |
        v
   Has Partner B signed Membership Agreement?
        |
       NO --> BLOCKED: "Partner must sign Membership Agreement"
        |
       YES
        |
        v
   Has Partner B signed Media Rights Agreement?
        |
       NO --> BLOCKED: "Partner must sign Media Rights Agreement"
        |
       YES
        |
        v
   Proceed with registration for Partner B
```

### Hard Gate: Guest Participation

```
Guest arrives at event check-in
        |
        v
   Does event require Guest Release?
        |
       NO --> Check in guest normally
        |
       YES
        |
        v
   Has this specific guest signed Guest Release for this event?
        |
       NO --> BLOCKED: "Guest must sign release before participating"
        |              (Provide signing mechanism at check-in)
        |
       YES --> Check in guest
```

---

## Admin Views Required

### Missing Agreements Dashboard

Admins must be able to view:
- List of members missing Membership Agreement
- List of members missing Media Rights Agreement
- List of members with outdated agreement versions (if re-sign required)
- List of guests registered for events requiring releases who have not yet signed

### Partnership Status View

Admins must be able to view:
- All active partnerships
- Delegation status (who has granted rights to whom)
- Revocation history

### Agreement Audit View

Admins must be able to view:
- Full signature history for any contact
- Exact agreement version text that was signed
- Who signed, when, and by what method
- Export capability for compliance

---

## Key Rules

### Delegation Cannot Override Hard Gates

Even if Partner A has been granted full delegation rights by Partner B:
- Partner A cannot register Partner B if Partner B has not signed required agreements
- Partner A cannot sign agreements on behalf of Partner B
- Each member must sign their own Membership and Media Rights agreements

### Guest Release is Non-Delegable

- The member who brings a guest CANNOT sign the guest release on their behalf
- The guest must sign directly (at check-in if not done in advance)
- System must track which guest signed, not which member brought them

### Revocation is Immediate

- When Partner B revokes delegation rights from Partner A:
  - Revocation takes effect immediately
  - Partner A's in-progress actions may complete
  - Partner A cannot initiate new actions on behalf of Partner B
  - No grace period; no notification requirement before revocation

### Agreement Gates Do Not Grant Permissions

- Signing an agreement only satisfies a gate; it does not grant role permissions
- A member who signs all agreements still cannot access admin features unless they have an admin role
- Agreements and RBAC are separate concerns evaluated in sequence

---

## Related Documents

- docs/rbac/AUTH_AND_RBAC.md - Delegation layer and role-based access
- SYSTEM_SPEC.md - Agreements and Releases section
- docs/project/AGREEMENTS_AND_PARTNERSHIP_ACCEPTANCE_CRITERIA.md - Build-ready acceptance criteria

---

*Document maintained by ClubOS development team. Last updated: December 2024*
