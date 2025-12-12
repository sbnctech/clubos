You are implementing Day 4: auth + RBAC in ClubOS.

Repo facts:
- Next.js app router API routes live under src/app/api/**/route.ts
- Prisma is in use for admin endpoints; seed exists.
- Preflight script: ./scripts/dev/preflight.sh must pass.

Your task (implement, commit, push to day4-rbac-auth):
1) Implement auth token parsing:
   - Read Authorization: Bearer <token>
   - If missing/invalid -> 401 JSON response
2) Implement RBAC:
   - Protect /api/admin/* routes:
     - Require authenticated user
     - Require role ADMIN
     - If token ok but role not ADMIN -> 403 JSON response
3) Minimal data model and seed:
   - Ensure there is a User table or equivalent with role info, OR implement a temporary token-to-user mapping that is explicitly labeled as TEMP and used only for local/dev/tests.
   - Provide two tokens for tests:
     - ADMIN token
     - MEMBER token
   - Document where tokens come from (.env, seed output, etc.)
4) Ensure handlers return consistent JSON on auth failures:
   - { "error": { "code": "UNAUTHORIZED", "message": "..." } }
   - { "error": { "code": "FORBIDDEN", "message": "..." } }
5) Update docs:
   - docs/project/AUTH_AND_RBAC.md must match actual behavior.
6) Add a tiny helper in src/lib/auth.ts or src/lib/authz.ts:
   - getRequestUser(request) -> { id, role } or throws a typed error
7) Run:
   - ./scripts/dev/preflight.sh
   - npx playwright test tests/api/admin-*.spec.ts
8) Commit(s) with clear messages and push.

Do NOT:
- Build UI
- Add OAuth
- Add complex permission matrices
- Change existing response shapes for successful endpoints

Acceptance criteria:
- Unauthenticated request to any /api/admin/* -> 401
- Authenticated MEMBER to /api/admin/* -> 403
- Authenticated ADMIN to /api/admin/* -> 200 and existing tests still pass
