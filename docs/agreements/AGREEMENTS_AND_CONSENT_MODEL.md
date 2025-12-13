# Agreements and Consent Model

**Audience**: Tech Chair, Board, Administrators
**Purpose**: Define how ClubOS tracks member and guest agreements, consents, and releases

---

## Overview

ClubOS requires certain agreements and releases before members or guests can take specific actions. This document is the canonical reference for agreement types, versioning, acceptance tracking, revocation rules, and audit requirements.

Other documents (SYSTEM_SPEC.md, AUTH_AND_RBAC.md, workflow docs) reference this document rather than duplicating these definitions.

---

## Agreement Types

ClubOS tracks the following agreement types:

| Type | Slug | Who Signs | Purpose |
|------|------|-----------|---------|
| Membership Agreement | `membership_agreement` | Member | Required for any event registration |
| Media Rights Agreement | `media_rights` | Member | Required for events with photography or video |
| Partnership Delegation Consent | `partnership_consent` | Both partners | Enables one partner to act on behalf of another |
| Guest Release | `guest_release` | Guest (non-delegable) | Required for events that allow guests |

### Membership Agreement

The Membership Agreement captures the member's acceptance of club rules, liability waivers, and code of conduct. Every active member must have accepted the current version.

- **Gate**: No event registration (self, partner, or admin-assisted) without current version accepted
- **Triggered by**: Initial membership signup, annual renewal, or version change
- **Version tracking**: Required

### Media Rights Agreement

The Media Rights Agreement authorizes the club to use photos and videos that include the member.

- **Gate**: No registration for events flagged as media-covered without current version accepted
- **Triggered by**: First media-covered event registration, or version change
- **Version tracking**: Required
- **Note**: Members may opt out of media rights; opting out blocks registration for media-covered events

### Partnership Delegation Consent

Partnership delegation allows one member to register or cancel on behalf of another (typically a spouse or partner). Both parties must explicitly consent.

- **Gate**: Delegation is inactive until both partners have signed
- **Triggered by**: Either partner initiating a partnership request
- **Revocation**: Either partner may revoke at any time; effective immediately
- **Bilateral**: Both grantorContactId and delegateContactId must have signed

### Guest Release

For events that allow guests, the guest must sign a release accepting liability and club rules.

- **Gate**: No guest registration without guest-signed release
- **Non-delegable**: A member cannot accept this on behalf of a guest
- **Scope**: Per-event or per-event-type depending on policy
- **Version tracking**: Required

---

## Versioning Requirements

All agreement types MUST be versioned to support:

- Tracking which version a member accepted
- Requiring re-acceptance when agreement text changes
- Audit trail showing what the member agreed to

### Version Record Fields

Each agreement version includes:

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier for this version |
| agreementType | enum | One of: membership_agreement, media_rights, partnership_consent, guest_release |
| versionId | string | Human-readable version (e.g., "2024-01", "v2.1") |
| contentHash | string | SHA-256 hash of agreement text for tamper detection |
| effectiveDate | datetime | When this version becomes active |
| deprecatedDate | datetime (nullable) | When this version was replaced (null if current) |
| createdAt | datetime | Record creation timestamp |

### Current Version Rule

For gating purposes, "current version" means:

- The version where effectiveDate <= now AND deprecatedDate IS NULL
- If no current version exists, the gate cannot be passed (system configuration error)

---

## Acceptance Record Fields

When a member or guest accepts an agreement, the system records:

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique identifier for this acceptance |
| agreementVersionId | UUID | Foreign key to the agreement version |
| contactId | UUID | The Contact who accepted (member or guest) |
| acceptedAt | datetime | Timestamp of acceptance |
| acceptanceMethod | enum | How accepted: web_form, in_person, admin_assisted |
| ipAddress | string (nullable) | IP address at time of acceptance (optional) |
| userAgent | string (nullable) | Browser user-agent (optional) |
| revokedAt | datetime (nullable) | If revoked, when (null if still active) |
| revokedReason | string (nullable) | Reason for revocation if applicable |

### Acceptance Method Values

| Value | Description |
|-------|-------------|
| web_form | Member accepted via web interface |
| in_person | Member accepted in person (e.g., at event check-in) |
| admin_assisted | Admin recorded acceptance on member's behalf (with member present) |

---

## Revocation Rules

Different agreement types have different revocation rules:

| Agreement Type | Revocable | Effect of Revocation |
|----------------|-----------|----------------------|
| Membership Agreement | No (except by lapsing membership) | N/A |
| Media Rights Agreement | Yes | Member blocked from future media-covered events |
| Partnership Consent | Yes (either partner) | Delegation immediately inactive |
| Guest Release | No (per-event, not ongoing) | N/A |

### Revocation Process

For revocable agreements:

1. Member requests revocation via web interface or admin assistance
2. System sets revokedAt timestamp on acceptance record
3. Gates immediately treat this agreement as not accepted
4. No retroactive effect (past registrations remain valid)

### Partnership Consent Revocation

When either partner revokes partnership consent:

- Delegation is immediately inactive for both directions
- The other partner is notified
- No pending delegated actions are affected (only future actions blocked)
- Partnership can be re-established if both partners consent again

---

## Audit Requirements

The system MUST maintain a complete audit trail for agreements:

### What Must Be Logged

| Event | Required Fields |
|-------|-----------------|
| Agreement version created | agreementType, versionId, effectiveDate, createdBy |
| Agreement accepted | contactId, agreementVersionId, acceptanceMethod, acceptedAt |
| Agreement revoked | contactId, agreementVersionId, revokedAt, revokedReason, revokedBy |
| Gate check failed | contactId, agreementType, reason, attemptedAction |

### Retention

- Acceptance records: Retained for the lifetime of the Contact record plus 7 years
- Agreement versions: Retained indefinitely (never deleted, only deprecated)
- Audit logs: Retained for 7 years minimum

---

## Visibility by Role

Different roles have different visibility into agreement data:

| Role | Can View | Can Modify |
|------|----------|------------|
| Member | Own acceptance history | Accept agreements, revoke permitted consents |
| Event Chair | Registrant agreement status for own events | None |
| Finance Manager | Agreement status for dispute resolution | None |
| VP of Activities | Registrant agreement status for supervised events | None |
| Admin | All agreement data | Create versions, record admin-assisted acceptances |

### Member Self-Service

Members can view:

- Which agreements they have accepted
- Which version of each agreement they accepted
- When they accepted each agreement
- Current status (active, revoked, outdated)

Members cannot view:

- Other members' agreement status
- Agreement acceptance audit logs

---

## Integration with Eligibility Gates

This document defines the agreement types and tracking model. The eligibility gates that enforce these agreements are specified in:

- **SYSTEM_SPEC.md**: Section "Agreement-Based Eligibility Gates" defines which gates apply to which actions
- **AUTH_AND_RBAC.md**: Section "Hard Gates: Agreements and Releases" defines evaluation order

The gate logic follows this pattern:

```
1. Identify required agreements for the action
2. For each required agreement:
   a. Find current version (effectiveDate <= now AND deprecatedDate IS NULL)
   b. Check if Contact has acceptance for that version
   c. Check if acceptance is not revoked
3. If any required agreement is missing, outdated, or revoked: BLOCK
4. Otherwise: ALLOW
```

---

## Data Model Summary

```
AgreementVersion
  - id (UUID)
  - agreementType (enum)
  - versionId (string)
  - contentHash (string)
  - effectiveDate (datetime)
  - deprecatedDate (datetime nullable)
  - createdAt (datetime)

AgreementAcceptance
  - id (UUID)
  - agreementVersionId (UUID FK)
  - contactId (UUID FK)
  - acceptedAt (datetime)
  - acceptanceMethod (enum)
  - ipAddress (string nullable)
  - userAgent (string nullable)
  - revokedAt (datetime nullable)
  - revokedReason (string nullable)
```

---

## Related Documents

- [SYSTEM_SPEC.md](../../SYSTEM_SPEC.md) - Agreement-Based Eligibility Gates
- [AUTH_AND_RBAC.md](../rbac/AUTH_AND_RBAC.md) - Hard Gates evaluation order
- [FINANCE_ROLES.md](../rbac/FINANCE_ROLES.md) - Finance Manager visibility into agreements

---

*Document maintained by ClubOS development team. Last updated: December 2024*
