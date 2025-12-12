# Day 3 Objective — API Integration & Contract Lock

## Goal
Complete the transition from mock data to Prisma-backed APIs, eliminate remaining stub endpoints, and lock a stable, documented API contract so frontend and integration work can proceed without ambiguity.

## Primary Outcomes
1. All admin and v1 API endpoints (members, events, registrations, health) return real database data via Prisma.
2. No remaining "not implemented" or mock-only endpoints in the active API surface.
3. Health endpoints standardized to a single canonical response shape.
4. ESLint warnings reduced below the repo threshold with no functional regressions.
5. Seed data expanded sufficiently to support filter, pagination, and export tests.
6. A canonical API contract document exists and reflects reality (params, shapes, pagination rules).

## Non-Goals (Out of Scope)
- Authentication and authorization hardening
- UI feature development
- Performance optimization
- Production deployment

## Definition of Done
- ./scripts/dev/preflight.sh passes on main
- Admin and v1 endpoints are Prisma-backed
- All API tests pass or are explicitly skipped with documented rationale
- API surface is documented and considered stable for frontend work

## Rationale
Day 3 closes the integration gap between schema, API, and tests. Once complete, ClubOS moves from scaffolding to a reliable application core that other contributors (frontend, automation, reporting) can safely build on.
