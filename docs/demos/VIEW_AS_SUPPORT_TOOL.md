# View as Member - Admin Support Tool

## Overview

The "View as Member" feature allows tech leads and webmasters to view the application as a specific member for troubleshooting and support purposes. This is distinct from role simulation (viewing as "a member" generically) - this feature lets you view as "John Smith" specifically.

## 60-Second Demo

1. Navigate to **`/admin/demo`**
2. Find the **"Support Tools"** section
3. Type a member's name or email in the search box
4. Click **"View As"** next to their name
5. Notice the **dark banner** appears at the top with role badges and member info
6. Navigate around - you see exactly what they see
7. Press **Escape** or click **"Exit"** to return to your admin view

**That's it.** The entire session is audit-logged, and no changes can be made.

## Tech Lead Summary

**Impersonation is read-only and safe by design.** When viewing as another member:

- A prominent dark banner displays at the top with **READ-ONLY** badge, lock icon, and member info
- Role badges show the member's type: **Member**, **Event Chair**, or **Officer**
- Status badge shows membership status (Active, Pending, Expired, etc.)
- **"What's blocked?"** panel explains each disabled action and why
- **Quick Switch** button links to demo personas for rapid testing
- **Keyboard shortcut (Esc)** exits instantly
- **Elapsed time** shows how long the session has been active
- Dangerous capabilities (financial transactions, email sending, role changes, event deletions) are blocked at the server level via `requireCapabilitySafe()`, not just hidden in the UI
- All impersonation sessions are audit-logged with start/end timestamps

Zero risk of accidental data modification.

## Trust Signal for Board Members

This feature was designed with conservative stakeholders in mind:

- **No hidden functionality**: Everything is visible and documented
- **Server-side enforcement**: Security cannot be bypassed by the UI
- **Complete audit trail**: Every session is logged with who, what, when, and how long
- **Instant exit**: No commitment required - exit at any time
- **Official product feature**: Not a hack or workaround

## What Changed

### Database

- Added `impersonatingMemberId` and `impersonatedAt` fields to Session model
- Added `IMPERSONATION_START` and `IMPERSONATION_END` audit actions

### Auth System

- Added `getEffectiveMember()` helper to resolve impersonated vs real user
- Added `BLOCKED_WHILE_IMPERSONATING` list of blocked capabilities
- Added session functions: `startImpersonation()`, `endImpersonation()`, `getImpersonationData()`
- Enhanced `ImpersonationData` to include: memberStatus, memberStatusLabel, roleAssignments, isEventChair, isOfficer

### API Endpoints

- `POST /api/admin/impersonate/start` - Start impersonating (requires admin:full)
- `POST /api/admin/impersonate/end` - End impersonation
- `GET /api/admin/impersonate/status` - Check current impersonation state (includes role info)

### UI Components

- `ImpersonationBanner` - Dark sticky banner with:
  - READ-ONLY lock badge (red background)
  - Member name and email
  - Role badge (Member/Event Chair/Officer)
  - Status badge (Active/Pending/Expired)
  - Elapsed time indicator
  - "What's blocked?" expandable panel with detailed reasons
  - Quick Switch panel for demo personas
  - Exit button + keyboard hint (Esc)
- `MemberSearch` - Search input to find members by name/email
- `ViewAsMemberSection` - Integration component for demo dashboard

## How to Demo

### Starting Impersonation

1. Navigate to `/admin/demo`
2. Find the "View as Member (Support Tool)" section
3. Search for a member by name or email
4. Click "View As" next to a member

### During Impersonation

The dark banner appears at the top showing:

```
🔒 READ-ONLY | Viewing as: Jane Smith [Event Chair] [Active] | jane@example.com • Started 5m ago | [What's blocked?] [Switch] [Exit]
```

- **Navigate freely**: All pages work normally from the member's perspective
- **Click "What's blocked?"**: See the list of disabled actions with explanations
- **Click "Switch"**: Quick links to demo personas
- **Press Escape**: Exit impersonation instantly

### Exiting Impersonation

- Click the amber "Exit" button in the banner
- Or press the **Escape** key from any page
- Page reloads to your admin view

## Support Workflow Examples

### Scenario: Member Reports They Can't See an Event

1. Go to `/admin/demo`
2. Search for the member by email
3. Click "View As" to impersonate them
4. Navigate to `/events` - see exactly what they see
5. Check if the event is published, if they meet eligibility requirements
6. Note the member's status (Active/Pending) and roles in the banner
7. Press Escape to exit and investigate further with admin tools

### Scenario: Testing Event Chair Permissions

1. Go to `/admin/demo`
2. Search for a known Event Chair member
3. Click "View As" - note the **Event Chair** badge in the banner
4. Navigate to `/events` and verify they see their committee's events
5. Try to edit an event - should work for their committee
6. Press Escape to return to admin view

### Scenario: Debugging Officer Dashboard

1. Go to `/admin/demo`
2. Search for a board member (President, VP, Secretary, etc.)
3. Click "View As" - note the **Officer** badge in the banner
4. Navigate to `/officer` to see their dashboard
5. Verify they see appropriate governance items
6. Press Escape to return to admin view

## Safety Guardrails

### Visual Safety Indicators

The impersonation banner provides clear visual feedback:

| Element | Purpose |
|---------|---------|
| Dark slate banner | Unmistakably different from normal UI |
| 🔒 READ-ONLY badge | Red background, immediately visible |
| Amber accent line | Warning color, draws attention |
| Role badges | Shows member type (Member/Event Chair/Officer) |
| Status badge | Shows membership status (Active/Pending/Expired) |
| Elapsed time | Shows session duration |
| Keyboard hint | Fixed at bottom-right: "Press Esc to exit" |

### Blocked Capabilities During Impersonation

These capabilities are **server-side blocked** while impersonating (via `requireCapabilitySafe`):

| Capability | Reason | User-Friendly Message |
|------------|--------|----------------------|
| `finance:manage` | No money movement while impersonating | Cannot move money while viewing as another member |
| `comms:send` | No email sending while impersonating | Cannot send on behalf of impersonated member |
| `users:manage` | No role changes while impersonating | Cannot modify member permissions |
| `events:delete` | No destructive actions | Destructive actions require your own account |
| `admin:full` | Downgraded to read-only | Admin capabilities suspended during impersonation |

**Important**: API endpoints using `requireCapabilitySafe()` will return HTTP 403 with a clear message:

```json
{
  "error": "Action blocked during impersonation",
  "message": "The capability \"finance:manage\" is disabled while viewing as another member. Exit impersonation to perform this action.",
  "blockedCapability": "finance:manage",
  "impersonating": true
}
```

### Security Requirements

1. **Admin-only**: Requires `admin:full` capability to start impersonation
2. **Session-scoped**: Impersonation is tied to the admin's session
3. **Explicit opt-in**: Must explicitly select a member to impersonate
4. **Easy exit**: One-click exit button + Escape key always available
5. **Audit trail**: Start/end events logged with member details
6. **Server-side enforcement**: Blocked capabilities are enforced at the API layer, not just UI

## Audit Trail

All impersonation events are recorded in the audit log:

- **IMPERSONATION_START**: Records who started impersonating whom
- **IMPERSONATION_END**: Records end of impersonation with duration

Audit entries include:

- Admin's member ID (actor)
- Impersonated member's ID, name, email
- Timestamp
- Duration (on end)

### Viewing Audit Logs

Audit logs are stored in the `AuditLog` table and can be queried via:

```sql
-- View recent impersonation sessions
SELECT
  al.action,
  al.timestamp,
  actor.firstName || ' ' || actor.lastName as actor_name,
  al.metadata->>'impersonatedMemberName' as viewed_member,
  al.metadata->>'durationSeconds' as duration
FROM "AuditLog" al
JOIN "Member" actor ON al."actorId" = actor.id
WHERE al.action IN ('IMPERSONATION_START', 'IMPERSONATION_END')
ORDER BY al.timestamp DESC
LIMIT 20;
```

Future enhancement: Admin UI panel to view impersonation audit logs.

## API Reference

### Start Impersonation

```
POST /api/admin/impersonate/start
Content-Type: application/json

{
  "memberId": "uuid-of-member-to-impersonate"
}

Response (200):
{
  "success": true,
  "impersonating": {
    "id": "uuid",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "startedAt": "2024-12-19T...",
    "status": "active",
    "statusLabel": "Active",
    "roleAssignments": ["Chair - Book Club"],
    "isEventChair": true,
    "isOfficer": false
  }
}
```

### End Impersonation

```
POST /api/admin/impersonate/end

Response (200):
{
  "success": true,
  "message": "Impersonation ended"
}
```

### Check Status

```
GET /api/admin/impersonate/status

Response (200):
{
  "isImpersonating": true,
  "impersonating": {
    "id": "uuid",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "startedAt": "2024-12-19T...",
    "status": "active",
    "statusLabel": "Active",
    "roleAssignments": ["Chair - Book Club"],
    "isEventChair": true,
    "isOfficer": false
  }
}
```

## Rollback

To remove this feature:

1. Remove Session model fields: `impersonatingMemberId`, `impersonatedAt`
2. Remove AuditAction enum values: `IMPERSONATION_START`, `IMPERSONATION_END`
3. Delete API routes: `/api/admin/impersonate/*`
4. Delete components: `ImpersonationBanner`, `MemberSearch`, `ViewAsMemberSection`
5. Remove imports from `ViewAsWrapper.tsx`

## Related Files

- `prisma/schema.prisma` - Session model, AuditAction enum
- `src/lib/auth.ts` - Impersonation helpers, blocked capabilities
- `src/lib/auth/session.ts` - Impersonation session functions, ImpersonationData interface
- `src/app/api/admin/impersonate/` - API endpoints
- `src/components/view-as/` - UI components
- `src/app/admin/demo/ViewAsMemberSection.tsx` - Demo integration

---

*Last updated: December 2024*
