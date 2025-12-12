# Day 5 Objective — Hardening & Polish

## Primary Goals
1. Centralize RBAC enforcement helpers (no copy/paste guards)
2. Ensure all protected routes return consistent 401 / 403 errors
3. Confirm Activities governance rules are enforced at API layer
4. Improve test clarity around authorization boundaries
5. Align documentation with actual behavior

## Explicit Non-Goals
- No UI work
- No schema changes
- No permission expansion
- No performance tuning

## Definition of Done
- All admin routes protected via shared helpers
- Event Chair / VP Activities behavior enforced consistently
- Error responses are predictable and documented
- Tests describe intent, not implementation
- Docs match code

## Risk Posture
Low-risk, high-confidence changes only.

