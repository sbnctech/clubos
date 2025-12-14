# Query Templates Registry (v1)

## Purpose
Define allowlisted, named query templates used by list widgets, dashboards, and the read-only chatbot. Templates are the ONLY way UI and chatbot request filtered/sorted lists.

## Key Rule
No arbitrary filters/sorts from UI/chatbot. Only templates + small safe parameters (cursor, page_size, optional date window).

## Template Shape (Concept)
- template_id (stable string)
- entity (members|events|registrations|payments)
- visibility (role/scopes required)
- allowlisted_filters (fixed)
- allowlisted_sorts (fixed)
- default_page_size
- response_projection (safe fields only)

## v1 Templates (initial)

### Events
- EVT_UPCOMING_PUBLIC
- EVT_UPCOMING_MEMBER
- EVT_MY_EVENTS_CHAIR
- EVT_WAITLISTED (chair)

### Registrations
- REG_MY_UPCOMING
- REG_EVENT_ROSTER_CHAIR

### Members
- MEM_DIRECTORY_PUBLIC (very limited, optional)
- MEM_DIRECTORY_MEMBER (role-gated, limited fields)
- MEM_NEW_MEMBERS_30D (admin)

### Payments (deferred)
- PAY_APPROVAL_QUEUE_FINANCE (contract only; no runtime yet)

## Notes
- Templates are referenced by widgets via template_id.
- Server resolves template_id + ViewerContext -> executes safely.
