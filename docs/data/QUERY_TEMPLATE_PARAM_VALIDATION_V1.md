# Query Template Param Validation v1

Purpose
- Enforce that browser-supplied params cannot invent filters/sorts/fields.
- Provide a single validation layer used by widgets and chatbot query execution.

Rules
- Each template declares:
  - allowedParams: list of keys
  - per-key type constraints (string/number/enum/date)
  - allowedSortKeys (optional)
  - maxPageSize
- Validation denies:
  - unknown keys
  - wrong types
  - invalid enum values
  - disallowed sort keys
- Server clamps:
  - page_size <= maxPageSize

Deny tests (mandatory)
- Unknown key -> 400
- Sort key not allowlisted -> 400
- Page size > max -> clamped
