# CC Project: Board KPI Widget (Organizational Health Dashboard)
Date: 2025-12-14
Status: Scaffolding + requirements capture
Owner: Ed (dispatch); implementation via CC workers

## Goal
Create a flexible, extensible "Board KPI Dashboard" widget system that can:
- Add new criteria (KPIs) without rewriting the widget
- Compute results from pluggable evaluators
- Display results consistently (tiles/trends/threshold status)
- Support role-based views and configurable thresholds
- Stay "quiet unless red" by default

## Non-goals (for this project wave)
- No survey tooling
- No predictive modeling
- No public views
- No write actions (read-only dashboard)

## Architectural direction (must-have)
We will implement a small "KPI Engine" and a UI widget that consumes it.

### Data flow
UI (Board Dashboard) ->
API (read-only) ->
KPI Engine (evaluators + config) ->
Data access layer (queries) ->
DB

### Extensibility requirements
1) KPIs defined as "definitions" with:
   - id, title, description
   - category
   - required inputs (time window, cohort, committee scope)
   - thresholds (configurable)
   - evaluator hook (code)
   - output schema (standard)
2) Adding a KPI should be:
   - add one evaluator + one definition entry
   - optionally add config defaults
   - no UI changes required unless new visualization type is introduced

### Standard KPI result schema (v1)
- id
- title
- category
- status: GREEN | YELLOW | RED | UNKNOWN
- value: number|string
- unit?: string
- target?: number|string
- comparison?: { mode: "YOY"|"ROLLING"|"ABS"; delta?: number|string; direction?: "UP"|"DOWN"|"FLAT" }
- reasonCodes?: string[]
- detail?: { lines: string[] }   (brief explanation)
- updatedAt: ISO

### Visualization types (v1)
- Tile (default)
- Sparkline trend (optional later)
Keep v1 simple: tiles + small delta indicator.

## Config model (must be externalized)
- Config stored in DB (preferred) or JSON file (interim)
- Per KPI:
  - enabled
  - thresholds (green/yellow/red)
  - time window
  - comparison mode (YOY default)
  - role visibility (board roles)

## RBAC
- Endpoint only accessible to board/admin roles
- Role determines which KPI sets appear (President, VP Membership, VP Activities, Treasurer, Technology)

## Work breakdown (CC workers)
### Worker 1 (Core engine)
- Create KPI engine scaffolding:
  - types/interfaces for definitions/results
  - registry mechanism
  - evaluator interface
  - config loader abstraction
- Add 2 placeholder evaluators:
  - website uptime (stub)
  - email bounce rate (stub)
Goal: prove extensibility + end-to-end wiring

### Worker 2 (API)
- Add read-only API endpoint(s):
  - GET /api/v1/admin/kpis?view=president|vp_membership|...
  - returns list of KPIResult
- Add contract tests (no admin UI)
- No writes

### Worker 3 (UI widget)
- Add Board KPI panel widget:
  - tiles grouped by category
  - role segmented view (dropdown or auto based on role)
  - quiet-unless-red behavior (default collapse green)
- Mount location: Admin Event Detail is NOT the target.
  - Target: Board dashboard / admin home (new panel section)

### Worker 4 (Data queries stub + wiring)
- Define data access layer functions that evaluators call:
  - getMemberCohortStats(...)
  - getCommitteeCadenceStats(...)
  - getFinancialCoverageStats(...)
  - getOpsHealthStats(...)
- Implement as stubs returning placeholder values if DB not ready
- Keep interfaces stable so real queries can replace later

### Worker 5 (Configuration + defaults)
- Add default KPI config file:
  - thresholds, targets, time windows
- Add validation (schema) for config
- Add TODO hooks for moving config to DB later

## Merge rules
- Each worker has separate branch + PR
- No PR mixes schema migrations with KPI engine work
- Use small commits; keep types strict; no eslint disables without justification

## Reference
Primary requirements doc:
- docs/widgets/organizational-health-dashboard.md
