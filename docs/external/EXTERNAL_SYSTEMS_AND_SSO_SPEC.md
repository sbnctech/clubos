# External Systems and SSO Specification

**Audience**: Tech Chair, Board, Administrators
**Purpose**: Document external system integrations, ownership model, and SSO roadmap

---

## Overview

ClubOS integrates with several external systems to support club operations. This
document defines:

- Inventory of external systems
- Ownership and access model for each system
- SSO target state and interim controls
- Term transition requirements
- The "no single human dependency" rule

All credentials referenced in this document are stored in the club password manager
and are never embedded in documentation or code.

---

## External Systems Inventory

| System | Purpose | Current Status | Owner Role |
|--------|---------|----------------|------------|
| JotForm | Event submission forms | Active (transitional) | Tech Chair |
| Bill.com | Reimbursement processing | Active | Treasurer |
| QuickBooks Online | Accounting system of record | Active | Treasurer |
| Google Workspace | Email, calendar, drive | Active | Tech Chair |
| Wild Apricot | Legacy membership (read-only) | Sunset planned | Tech Chair |
| Mailchimp | Email campaigns (legacy) | Sunset planned | Communications Chair |

### System Details

#### JotForm

- **Purpose**: Committee chairs submit event requests via structured forms
- **Data flow**: Form submissions -> email notification -> manual entry into calendar
- **Integration plan**: See JOTFORM_INTEGRATION_PLAN.md
- **Target state**: Replace with native ClubOS event submission workflow

#### Bill.com

- **Purpose**: Process reimbursement requests from committee chairs and members
- **Data flow**: Request -> approval -> payment -> QuickBooks sync
- **Integration plan**: See BILLCOM_REIMBURSEMENT_BACKLOG.md
- **Target state**: Workflow visibility in ClubOS; Bill.com remains payment processor

#### QuickBooks Online

- **Purpose**: Accounting system of record for all financial transactions
- **Role**: Authoritative source for revenue, expenses, and reconciliation
- **Integration**: ClubOS does NOT replace QuickBooks; ClubOS provides workflow context
- **Target state**: Read-only sync for reconciliation dashboards (future)

#### Google Workspace

- **Purpose**: Club email accounts, shared calendars, document storage
- **Admin access**: Tech Chair + backup
- **2FA mailbox**: Configured for recovery; access documented in password manager
- **Target state**: SSO provider for ClubOS authentication

#### Wild Apricot (Legacy)

- **Purpose**: Previous membership management system
- **Current role**: Historical data reference only
- **Target state**: Data migration complete; decommission after verification

#### Mailchimp (Legacy)

- **Purpose**: Email campaign management
- **Current role**: Transitional; being replaced by ClubOS communications
- **Target state**: Decommission after ClubOS email subsystem is stable

---

## Ownership Model

### Principles

1. **Role-based ownership**: Systems are owned by roles, not individuals
2. **Backup owner required**: Every system must have a documented backup owner
3. **No personal accounts**: Admin access uses role-based accounts where possible
4. **Credential rotation**: Passwords rotated at every term transition

### Ownership Matrix

| System | Primary Owner | Backup Owner | Access Level |
|--------|---------------|--------------|--------------|
| JotForm | Tech Chair | VP Activities | Admin |
| Bill.com | Treasurer | President | Approver |
| QuickBooks | Treasurer | Finance Committee | Full |
| Google Workspace | Tech Chair | President | Super Admin |
| Wild Apricot | Tech Chair | (none - sunset) | Admin |
| Mailchimp | Communications Chair | Tech Chair | Admin |

### External Responsibility Roles

Some ClubOS roles exist primarily to track external system responsibilities:

| ClubOS Role | External System | Responsibility |
|-------------|-----------------|----------------|
| JotForm Admin | JotForm | Manage forms, webhooks, notifications |
| Bill.com Approver | Bill.com | Approve reimbursement requests |
| QuickBooks Admin | QuickBooks | Maintain chart of accounts, run reports |

These roles do not grant ClubOS in-app permissions but ensure:

- External access is documented and auditable
- Term transitions include explicit handoff
- No system becomes orphaned when volunteers leave

---

## Access Model

### Current State (Interim)

External systems currently use separate authentication:

```
User -> JotForm (separate login)
User -> Bill.com (separate login)
User -> QuickBooks (separate login)
User -> ClubOS (ClubOS auth)
```

**Risks of current state**:

- Multiple credentials to manage
- Inconsistent access revocation at term end
- No centralized audit trail
- Password sharing for shared admin accounts

**Interim controls**:

- All credentials stored in club password manager
- Access list maintained in this document
- Quarterly access review by Tech Chair
- Immediate revocation checklist at term transition

### Target State (SSO)

ClubOS will serve as the identity provider or delegate to Google Workspace:

```
User -> ClubOS (primary auth)
  |
  +-> JotForm (via webhook/API, no user login needed)
  +-> Bill.com (SSO or service account)
  +-> Google Workspace (OAuth federation)
```

**SSO implementation phases**:

1. **Phase 1**: ClubOS authenticates via Google OAuth (users sign in with club email)
2. **Phase 2**: External systems receive ClubOS identity via webhooks/APIs
3. **Phase 3**: Where supported, configure SAML/OIDC SSO from ClubOS

**Systems unlikely to support SSO**:

- JotForm: Will be replaced by native ClubOS forms
- Bill.com: Limited SSO support; may require service account approach

---

## Term Transition Requirements

### Pre-Transition Checklist (Outgoing)

For each external system:

- [ ] Document current configuration state
- [ ] Export any system-specific data needed for continuity
- [ ] Prepare credential transfer via password manager
- [ ] Schedule handoff meeting with incoming owner
- [ ] Do NOT change passwords until handoff is confirmed

### Transition Checklist (Day Of)

- [ ] Transfer password manager access to new owner
- [ ] Walk through admin console for each system
- [ ] Verify new owner can log in to all systems
- [ ] Update backup owner access if changed
- [ ] Document any pending issues or maintenance items

### Post-Transition Checklist (Incoming)

- [ ] Change all shared passwords within 48 hours
- [ ] Verify 2FA is configured on all admin accounts
- [ ] Update recovery email/phone to new owner
- [ ] Review and acknowledge this document
- [ ] Confirm access to password manager entries

### Transition Timeline

| Day | Action |
|-----|--------|
| T-14 | Schedule handoff meeting |
| T-7 | Export configurations and document state |
| T-0 | Conduct handoff, verify access |
| T+2 | Rotate all credentials |
| T+7 | Remove outgoing owner access |

---

## No Single Human Dependency Rule

### Definition

No external system shall depend on a single individual for:

- Admin access
- Knowledge of configuration
- Ability to perform critical operations

### Implementation

1. **Backup owner**: Every system has a documented backup owner
2. **Documentation**: Configuration documented in this spec or linked docs
3. **Cross-training**: Annual walkthrough with backup owner
4. **Break-glass**: Emergency access procedure documented

### Break-Glass Procedure

If the primary owner is unavailable and backup owner cannot access:

1. Contact Tech Chair (or President if Tech Chair is unavailable)
2. Retrieve credentials from password manager (requires board member access)
3. Log the emergency access with date, reason, and actions taken
4. Rotate credentials within 24 hours of resolution
5. File incident report with board

---

## Integration Patterns

### Preferred Patterns

| Pattern | When to Use | Example |
|---------|-------------|---------|
| **Webhook** | External system pushes data to ClubOS | JotForm submission -> ClubOS API |
| **OAuth/OIDC** | User authentication federation | Google OAuth for ClubOS login |
| **API Polling** | ClubOS pulls data on schedule | QuickBooks sync (future) |
| **Manual Export** | Low-frequency, high-value data | Annual financial report |

### Anti-Patterns to Avoid

| Anti-Pattern | Problem | Alternative |
|--------------|---------|-------------|
| Screen scraping | Fragile, breaks on UI changes | Use official API |
| Shared user account | No audit trail | Create role-based accounts |
| Personal email for 2FA | Access lost when person leaves | Use role-based email |
| Credentials in code | Security risk | Use environment variables |

---

## Audit and Compliance

### Access Reviews

- **Quarterly**: Tech Chair reviews external system access list
- **Annually**: Board reviews ownership matrix
- **At term transition**: Full access audit and rotation

### Audit Trail Requirements

For each external system, maintain records of:

- Who has access (current and historical)
- When access was granted/revoked
- What actions were performed (where system provides logs)
- Any security incidents or concerns

### Compliance Considerations

- **PCI**: No payment card data stored in ClubOS or external systems we control
- **Privacy**: Member data handling per club privacy policy
- **Data retention**: Follow club data retention policy (typically 7 years for financial)

---

## Related Documents

- [JotForm Integration Plan](./JOTFORM_INTEGRATION_PLAN.md)
- [Bill.com Reimbursement Backlog](./BILLCOM_REIMBURSEMENT_BACKLOG.md)
- [RBAC Overview](../rbac/AUTH_AND_RBAC.md)
- [SYSTEM_SPEC.md](../../SYSTEM_SPEC.md)

---

*Document maintained by ClubOS development team. Last updated: December 2024*
