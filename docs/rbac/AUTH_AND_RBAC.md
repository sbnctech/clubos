# Authentication and Role-Based Access Control (RBAC)

**Audience**: SBNC Tech Chair and club administrators
**Purpose**: Explain how ClubOS controls who can access what

---

## Plain-English Summary

ClubOS uses two layers of security to protect club data:

1. **Authentication** - Proves who you are (like showing your ID at the door)
2. **Authorization** - Decides what you can do (like checking if your badge opens certain rooms)

Think of it like entering a secure building:

```
You arrive at ClubOS
        |
        v
   +----------+
   |  LOGIN   |  <-- Authentication: "Who are you?"
   +----------+
        |
        v
   Are you a valid member?
        |
   NO   |   YES
   |    |    |
   v    |    v
 401    | +----------+
Denied  | | ROLE     |  <-- Authorization: "What can you do?"
        | | CHECK    |
        | +----------+
        |      |
        | +---------+---------+
        | |         |         |
        | v         v         v
        | ADMIN   VP/CHAIR  MEMBER
        | (full)  (limited) (basic)
```

---

## The Two Layers Explained

### Layer 1: Authentication (Who Are You?)

Before you can do anything in ClubOS, you must prove your identity.

**How it works today (development mode)**:
- You send a special token in your request header
- ClubOS checks if this token belongs to a real user
- If valid, you're "logged in"

**What happens if authentication fails**:
- You see a **401 Unauthorized** error
- Message: "Missing or invalid authorization header"
- Solution: Log in again or check your credentials

### Layer 2: Authorization (What Can You Do?)

Once ClubOS knows who you are, it checks what you're allowed to do.

**Two types of authorization**:

1. **Global Role** - Your overall permission level (Admin vs Member)
2. **Committee Role** - Your specific job in a committee (VP, Event Chair)

---

## Understanding Roles

### The Four Global Roles

ClubOS currently uses four global roles (defined in `src/lib/auth.ts`):

| Role | Slug | What It Means | Example People |
|------|------|---------------|----------------|
| **Admin** | `admin` | Full access to everything | Tech Chair, Board Members |
| **VP of Activities** | `vp-activities` | Can view/edit/publish all events | Sarah Martinez, John Kim |
| **Event Chair** | `event-chair` | Manages events (scoping planned) | Alice (Hiking), Bob (Social) |
| **Member** | `member` | Basic access, published events only | Regular club members |

> **Note**: Committee-based scoping (where VPs only see their supervised groups) is planned but not yet implemented. Currently, VPs can see and edit ALL events.

---

## What Each Role Can Do

### Quick Reference Card (Current Implementation)

```
+------------------+------------------------------------------+
|      ADMIN       |                                          |
|                  |  - See ALL events (including drafts)     |
|                  |  - Edit ALL events                       |
|                  |  - DELETE events (only role that can)    |
|                  |  - Publish events                        |
|                  |  - Export all data                       |
+------------------+------------------------------------------+

+------------------+------------------------------------------+
| VP OF ACTIVITIES |                                          |
|                  |  - See ALL events (including drafts)     |
|                  |  - Edit ALL events                       |
|                  |  - PUBLISH events                        |
|                  |  - CANNOT delete events                  |
|                  |  (Scoped access is planned for future)   |
+------------------+------------------------------------------+

+------------------+------------------------------------------+
|   EVENT CHAIR    |                                          |
|                  |  - (Scoped access planned for future)    |
|                  |  - Currently same as Member              |
|                  |  - Cannot publish events                 |
|                  |  - Cannot delete events                  |
+------------------+------------------------------------------+

+------------------+------------------------------------------+
|     MEMBER       |                                          |
|                  |  - See published events only             |
|                  |  - See own profile and registrations     |
|                  |  - Register for events                   |
|                  |  - Cannot see draft events               |
+------------------+------------------------------------------+
```

### Permission Matrix (from code)

| Permission | Admin | VP | Chair | Member |
|------------|:-----:|:--:|:-----:|:------:|
| View all events (incl. drafts) | Yes | Yes | No | No |
| Edit any event | Yes | Yes | No | No |
| Publish events | Yes | Yes | No | No |
| Delete events | **Yes** | No | No | No |

---

## How RBAC Differs from Data Ownership

This is an important distinction:

### RBAC (Role-Based Access Control)

- Controls **what features** you can use
- Based on your **role** (Admin, VP, Chair, Member)
- Example: "Can this person access the admin dashboard?"

### Data Ownership

- Controls **which records** you can see within a feature
- Based on **who owns** the data
- Example: "Which events can this VP see?" (only supervised ones)

### Diagram: RBAC + Data Ownership Together

```
User Request: "Show me the events"
                    |
                    v
         +-------------------+
         |   RBAC Check      |
         |   Can user access |
         |   event features? |
         +-------------------+
                    |
        +-----------+-----------+
        |                       |
        v                       v
    NO (403)                YES
    Forbidden          +-------------------+
                       |  Ownership Check  |
                       |  Which events     |
                       |  belong to user?  |
                       +-------------------+
                                |
                    +-----------+-----------+
                    |           |           |
                    v           v           v
                 Admin       VP/Chair    Member
                 (all)      (scoped)    (published)
```

---

## Error Messages You Might See

### 401 Unauthorized

**What it means**: You're not logged in, or your session expired.

```json
{
  "error": "Unauthorized",
  "message": "Missing or invalid authorization header"
}
```

**What to do**: Log in again.

### 403 Forbidden

**What it means**: You're logged in, but don't have permission.

```json
{
  "error": "Forbidden",
  "message": "Admin access required"
}
```

**What to do**: Contact an Admin if you need access.

---

## Common Questions

### Q: I'm a member. Why can't I see all events?

A: Members only see **published** events. Draft events are only visible to Event Chairs, VPs, and Admins.

### Q: I'm an Event Chair. Why can't I publish my event?

A: Publishing is a VP privilege. This creates a review workflow where VPs approve events before they go public. Ask your VP to publish when ready.

### Q: I'm a VP. Can I see all events?

A: **Yes, currently.** In the current implementation, VPs can see and edit ALL events. Committee-based scoping (where VPs only see their supervised groups) is planned for a future release.

### Q: Can someone have multiple roles?

A: Yes. A person could be an Event Chair for Hiking AND have a VP role. The system uses your "highest" privilege for each action.

### Q: How do I become an Admin?

A: An existing Admin must update your account. This is typically reserved for the Tech Chair and key board members.

---

## Partnership Delegation Layer

Partnerships enable one member to act on behalf of another for specific actions.
Delegation is evaluated AFTER role/scope checks but BEFORE hard gates.

### Evaluation Order

```
Auth -> Roles -> Scope -> Delegation -> Hard Gates
```

### Delegation Modes

Partnerships support these delegation modes:
- **NONE**: No delegation. Each partner acts only for themselves.
- **MUTUAL**: Either partner can act for either partner.
- **PRIMARY_A**: Partner A can act for both; Partner B can only act for self.
- **PRIMARY_B**: Partner B can act for both; Partner A can only act for self.
- **INDEPENDENT**: Linked for household tracking but no delegation rights.

### Scope of Delegation

When delegation is granted, the delegating partner grants rights for:
- Register for events (on behalf of partner)
- Cancel event registrations (on behalf of partner)
- Use partner's payment method on file

### Bilateral Consent Requirement

Both parties must sign a Partnership Delegation Agreement:
- Partner A cannot act for Partner B unless B has signed
- Partner B cannot act for Partner A unless A has signed
- For MUTUAL mode, both must sign granting rights to each other
- Agreement must be signed BEFORE delegation rights are effective

### Revocation

- Either partner can revoke delegation at any time
- Revocation is effective IMMEDIATELY
- No grace period
- In-progress actions may complete; new actions are blocked
- System logs revocation with timestamp and who revoked

### Delegation Cannot Bypass Hard Gates

Even with full delegation rights:
- Partner A CANNOT sign agreements on behalf of Partner B
- Partner A CANNOT register Partner B if B's required agreements are unsigned
- Each member must satisfy their own agreement hard gates
- Delegation expands WHO can act, not WHAT gates can be bypassed

### Audit Trail

Every delegated action must record:
- acting_member_id: Who performed the action
- affected_member_id: Whose record was changed
- delegation_id: Which delegation relationship authorized this
- timestamp
- action_type

---

## Hard Gates (Agreement Enforcement)

Hard gates are evaluated LAST in the authorization chain. A user may pass all role
and delegation checks but still be blocked by an unmet hard gate.

### Gate Types

1. **Membership Agreement Gate**
   - Blocks: Event registration
   - Unmet message: "Please sign your Membership Agreement to continue"

2. **Media Rights Agreement Gate**
   - Blocks: Event registration
   - Unmet message: "Please sign your Media Rights Agreement to continue"

3. **Partnership Delegation Gate**
   - Blocks: Acting on behalf of partner
   - Unmet message: "Partner has not granted delegation rights"

4. **Guest Release Gate**
   - Blocks: Guest participation at check-in
   - Unmet message: "Guest must sign release before participating"
   - NON-DELEGABLE: Member cannot sign for their guest

### Gate Evaluation Flow

```
User action requested
        |
        v
   Auth check (401 if fail)
        |
        v
   Role check (403 if fail)
        |
        v
   Scope check (403 if fail)
        |
        v
   Delegation check (403 if fail and acting for another)
        |
        v
   Hard Gate check (blocked with specific message if fail)
        |
        v
   Action proceeds
```

### Key Rules

- Gates block the action; they do not warn
- Clear message identifies which gate is unmet
- Admin override available (logged with reason)
- Gates do not grant permissions; they only gate actions

See docs/agreements/AGREEMENTS_SYSTEM_SPEC.md for full specification.

---

## For Developers

See these technical documents:
- [VP Activities Scope](./VP_ACTIVITIES_SCOPE.md) - Data model and query patterns
- [VP Activities Access Matrix](./VP_ACTIVITIES_ACCESS_MATRIX.md) - Detailed permission tables
- [RBAC Overview](../RBAC_OVERVIEW.md) - High-level authorization flow

### Key Implementation Files

- `src/lib/auth.ts` - Authentication and authorization helpers

### Test Tokens (Development Only)

Use these tokens in the `Authorization: Bearer <token>` header:

| Role | Token Format | Example |
|------|--------------|---------|
| Admin | `test-admin-{id}` | `test-admin-123` |
| VP | `test-vp-{id}` | `test-vp-456` |
| Chair | `test-chair-{id}` | `test-chair-789` |
| Member | `test-member-{id}` | `test-member-abc` |

Legacy tokens also work: `admin-token`, `vp-token`, `chair-token`, `member-token`

### Key Auth Functions

```typescript
// From src/lib/auth.ts
requireAuth(req)        // Returns 401 if not authenticated
requireAdmin(req)       // Returns 403 if not admin
requireRole(req, roles) // Returns 403 if role not in list

canViewAllEvents(role)  // admin, vp-activities can
canEditAnyEvent(role)   // admin, vp-activities can
canPublishEvents(role)  // admin, vp-activities can
canDeleteEvents(role)   // admin only
```

---

## Summary

```
                    ClubOS Security Model
                    =====================

     AUTHENTICATION              AUTHORIZATION
     ==============              =============

     "Who are you?"              "What can you do?"
           |                            |
           v                            v
      +----------+               +-------------+
      |  Token   |               | Global Role |
      |  Check   |               | (Admin/Mem) |
      +----------+               +-------------+
           |                            |
      Valid? --> Yes             +------+------+
           |                     |             |
           v                     v             v
      Get User              Committee     Data Filter
      Identity              Roles         (Ownership)
                            (VP/Chair)
```

The system is designed to be:
- **Simple** - Two global roles cover most cases
- **Flexible** - Committee roles add granular control
- **Safe** - Destructive actions require Admin
- **Auditable** - All actions can be logged

---

*Document maintained by ClubOS development team. Last updated: December 2024*
