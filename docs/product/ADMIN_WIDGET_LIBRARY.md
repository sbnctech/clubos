# Admin Widget Library

Purpose
- Define the first-class widget library for administrators (RBAC, events ops, membership ops, data quality).
- Keep widgets as untrusted UI: they render data provided by ClubOS and request actions; ClubOS decides.

Core rule
- Widgets MUST NOT decide eligibility, authorization, or privacy filtering.
- ClubOS enforces RBAC server-side for every read and write.

Widget categories (admin)
1. RBAC and Identity
- Role Assignment Panel
- Group Membership Manager
- Permission Preview (View As) - read only
- Access Change Audit Viewer - read only
- Role Definition Browser - read only

2. Admin Operations
- Membership Admin Dashboard (approvals, renewals, lapses, data flags)
- Events Admin Dashboard (capacity, waitlists, cancellations)
- Finance Admin Dashboard (stubbed if payments are deferred)

3. Data Quality and Governance
- Data Completeness Report
- Duplicate Detector (read only)
- Policy/Configuration Lint (dangerous grants, misconfigs) - read only warnings

Common widget contract expectations
- Inputs: ViewerContext, query/filter keys, pagination, sorting, section placement hints
- Outputs: data payload plus ViewerContext-safe affordances (links, next actions as suggestions)
- Error handling: 401/403/404/409/422/429/5xx, with stable error codes
- Logging: audit for admin writes; query logging for sensitive admin reads (configurable)

RBAC sensitivity tiers (guideline)
- Low: announcements, public events, generic stats
- Medium: member roster (redacted), registrations (limited), committee rosters
- High: full member PII, payments/finance, role assignments, audit logs

Non-goals (v1)
- No client-side filtering of raw data
- No direct embedding of arbitrary admin widgets on public pages
