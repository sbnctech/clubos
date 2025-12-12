# Day 4 Plan - Auth + RBAC (Integration Cycle)

Goal: Safe-by-default API access control.

## Outcomes
1. Auth is enforced on protected routes (at minimum /api/admin/*).
2. RBAC role checks return correct status codes:
   - 401 Unauthorized (missing/invalid token)
   - 403 Forbidden (token ok, role insufficient)
3. Seed data includes at least:
   - 1 ADMIN user (token available for tests)
   - 1 MEMBER user (token available for tests)
4. Tests cover:
   - unauth -> 401
   - wrong role -> 403
   - correct role -> 200
5. Docs updated to reflect reality.

## Scope (minimal and safe)
- Protect /api/admin/* now.
- Leave /api/v1/* as-is unless it is already intended to be protected.
- No UI login flows.
- No OAuth.

## Notes on Activities hierarchy
Two VPs of Activities + Event Chairs reporting model is a row-level concept.
RBAC provides the role labels; row-level rules come later once relationships exist in Prisma.
