# Murmurant Specs Backlog

This file tracks spec work that is approved as backlog but not yet implemented.

Format:
- ID
- Title
- Status
- Notes
- Links


## SPEC-BACKLOG: IDLE_SESSION_TIMEOUT

- Status: Backlog (requirement identified)
- Added: 2026-01-02
- Title: Configurable Idle Session Timeout (Security)
- Priority: High (Security)
- Charter: P1 (audit), P2 (least privilege), P9 (fail closed)
- Notes: |
    Wild Apricot does NOT provide configurable idle session timeout - it's a known gap.
    This is a significant security vulnerability, especially for admin sessions on shared/public computers.

    Requirements:
    - Configurable idle timeout (default 15-30 min for admin, longer for members)
    - Absolute session timeout (e.g., 8 hours max regardless of activity)
    - Admin-configurable settings per role/permission level
    - Audit log entry when session expires due to idle timeout
    - Grace period warning before logout (e.g., "Session expiring in 2 minutes")
    - "Remember this device" option with longer timeout for trusted devices

    Implementation considerations:
    - Server-side session validation (not just client-side timer)
    - Heartbeat mechanism to track actual activity
    - Handle multiple tabs gracefully
    - Secure session token rotation on activity

    Reference: WA forum wishlist item requesting this feature:
    https://forums.wildapricot.com/forums/308932-wishlist/suggestions/8827096-inactivity-auto-logout
- Links: (none yet)

---

## SPEC-BACKLOG: PAGE_AUDIENCE_ROLLOUT
- Status: Backlog (spec complete)
- Added: 2025-12-20
- Title: Page Audience Rollout (Pilot / Subset Testing)
- Notes: Enable staff-only and pilot-group testing for pages and optionally blocks; enforce server-side; prefer 404 for public leakage control.
- Links:
  - docs/specs/PAGE_AUDIENCE_ROLLOUT.md
