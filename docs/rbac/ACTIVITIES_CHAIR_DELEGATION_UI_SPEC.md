# Activities -> Chair Delegation UI Spec (v1)

## Goal
Allow VP Activities to manage Event Chair assignments safely, with audit logging and strict scope rules.

## Roles
- VP_ACTIVITIES: can assign/remove Event Chair for events (scoped to Activities)
- EVENT_CHAIR: can manage their own events/registrants; cannot grant roles
- SYSTEM_ADMIN: break-glass, full visibility

## UI Surfaces
1) Chair Assignment Panel (Admin-only)
- Search events
- View current chair(s)
- Assign chair (by member_id)
- Remove chair
- Reason required for every change

2) Committee Roster Manager (optional v2)
- Maintain committee membership list used for suggestions (no implicit authority)

## Guardrails
- No grant outside Activities domain
- No cross-org delegation
- Time-bounded grants optional (v2)
- All changes append-only audited (actor, target, before/after, timestamp, reason)
- Deny-path behavior visible (clear errors)

## Success Criteria
- VP Activities can staff events without needing President for routine changes
- Chairs can do event operations without role-management capabilities
