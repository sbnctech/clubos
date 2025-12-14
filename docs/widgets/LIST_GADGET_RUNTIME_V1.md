# List Gadget Runtime v1

Purpose
- Provide a safe, RBAC-scoped list-rendering runtime for homepage and admin dashboards.
- Browser provides template_id + template_params only. Server enforces RBAC and allowlists.

Non-goals
- No arbitrary filtering/sorting from the browser.
- No server-side mutations.

Request shape
- template_id: string
- params: object (template-specific allowlist)
- cursor: opaque string (optional)
- page_size: integer (server clamps)

Server responsibilities
- Validate template_id exists in registry
- Validate params against per-template allowlist schema
- Compute ViewerContext (member_id, roles, scopes)
- Execute query via allowlisted query template
- Apply RBAC (row-level + field-level redactions)
- Return results + next_cursor

Response shape
- items: array
- next_cursor: string | null
- meta: { template_id, page_size, total_known?: number }

Security gates
- RBAC enforced server-side only
- Deny unknown template_id
- Deny unknown params keys
- Clamp page_size
- Rate limit per viewer
- Audit log for admin templates (read events optional)

Next steps
- Implement API route: GET/POST /api/widgets/list (server-only)
- Implement runtime function: runListGadget(template_id, params, viewerCtx)
- Add unit tests for allowlist enforcement (deny unknown filters/sorts)
