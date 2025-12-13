# Chatbot Query Templates and RBAC

Worker 2 - Chatbot Query Templates and RBAC - Report

## Purpose
Define how query.run works safely:
- No freeform queries
- Only pre-approved query templates
- RBAC and row-level filtering enforced server-side

## Query Template Model
Each query template has:
- query_id (stable string)
- description
- allowed_roles (list)
- parameter_schema (JSON schema-like)
- default_limit
- max_limit
- output_schema (columns, types)
- privacy_notes
- deep_link_template (optional)

## RBAC Enforcement
- ViewerContext is mandatory
- Server checks role membership before executing template
- Templates must apply row-level filters using ViewerContext:
  - member_id scoping for self data
  - group_id scoping for committee views
  - finance role gating for any payment fields
- Any field containing PII must be explicitly listed as allowed

## Initial Query IDs (Proposed)
- membership.self_status
- events.upcoming_for_viewer
- events.waitlist_status_self
- photos.albums_visible
- photos.search_by_event
- admin.data_quality_summary (admin-only)

## Output Rules
- Truncate large outputs
- Prefer summary rows with deep links
- Never return secrets or internal tokens
- Avoid raw internal IDs unless required and safe

## Audit Rules
Log:
- actor_user_id
- query_id
- params_hash
- result_row_count
- duration_ms
- request_id

## Verdict
READY FOR REVIEW
