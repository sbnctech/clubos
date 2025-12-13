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

## Evaluation Order

When processing any request, ClubOS evaluates access in this order:

```
1. Authenticate user -----> 401 if failed
        |
        v
2. Resolve roles and capabilities
        |
        v
3. Apply scope rules (committee assignment)
        |
        v
4. Apply delegation layer (if acting on behalf)
        |
        v
5. Apply hard gates (agreements and releases)
        |
        v
   ALLOW or DENY
```

Hard gates (step 5) are checked LAST and override all previous checks. A user may
pass authentication, role, scope, and delegation checks but still be blocked by a
missing or outdated agreement.

---

## Hard Gates: Agreements and Releases

Certain actions require signed agreements regardless of role, scope, or delegation
status. These are non-negotiable gates that cannot be bypassed by any role,
including Admin.

| Gate | Requirement | Applies To |
|------|-------------|------------|
| Membership Agreement | Current version required | Any event registration |
| Media Rights Agreement | Current version required | Media-covered events only |
| Guest Release | Guest-signed (non-delegable) | Events requiring guest release |
| Partnership Consent | Both partners signed | Delegation/on-behalf actions |

### Key Rules

1. **Membership Agreement**: No event registration (self, partner, or admin-assisted)
   without the current version of the Membership Agreement on file.

2. **Media Rights Agreement**: No registration for events flagged as media-covered
   without the current version of the Media Rights Agreement on file.

3. **Guest Release**: For events requiring guest releases, the guest must sign
   directly. A member cannot accept a guest release on behalf of a guest.
   This is non-delegable.

4. **Partnership Delegation Consent**: Partnership delegation is inactive until
   BOTH partners have signed the partnership consent agreement. Either partner
   may revoke at any time, immediately deactivating delegation.

### Admin Does Not Bypass

Admin role does not exempt a registrant from agreement requirements. When an Admin
registers a member for an event, the system still checks that the member has the
required agreements on file. Admin can record an admin-assisted acceptance but
cannot skip the requirement.

### Canonical Reference

For agreement type definitions, versioning rules, acceptance tracking, and the
data model, see the canonical document:

- [Agreements and Consent Model](../agreements/AGREEMENTS_AND_CONSENT_MODEL.md)

For gate enforcement rules in the context of event registration, see:

- SYSTEM_SPEC.md - Agreement-Based Eligibility Gates section

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
