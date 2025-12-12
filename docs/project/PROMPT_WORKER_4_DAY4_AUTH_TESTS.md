You are implementing Day 4 tests for auth + RBAC in ClubOS.

Your task:
1) Add/extend Playwright API tests to validate:
   - /api/admin/dashboard returns 401 if Authorization header missing
   - /api/admin/dashboard returns 403 for a MEMBER token
   - /api/admin/dashboard returns 200 for an ADMIN token
2) Apply the same pattern to ONE more admin route (pick /api/admin/members or /api/admin/events).
3) Ensure tests are stable and do not depend on random data.
4) Tokens:
   - Read from env vars if provided (preferred):
     - CLUBOS_ADMIN_TOKEN
     - CLUBOS_MEMBER_TOKEN
   - If not set, tests should SKIP with explicit message (do not fail).
5) Keep existing tests green.

Do NOT:
- Change API response shapes for successful responses
- Add UI tests
- Assume Docker

Acceptance criteria:
- Tests pass locally when tokens are present.
- Tests skip cleanly when tokens are absent.
