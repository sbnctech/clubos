# RBAC vs Data-Level Authorization

## What RBAC is
RBAC = Role-Based Access Control.

RBAC answers: "Who is allowed to call this endpoint at all?"
Examples:
- Only ADMIN can call /api/admin/*
- A signed-in MEMBER can call /api/v1/* (member-facing APIs)
- Unauthenticated users can call public endpoints (if any)

RBAC is coarse-grained:
- Endpoint-level / feature-level permissions
- "You may enter this room"

## What RBAC is NOT
RBAC by itself does NOT decide which specific database rows a user can access.
RBAC does NOT automatically implement:
- Row-level permissions (which events you can edit)
- Column-level permissions (which fields you can see)
- Ownership rules (your events vs someone else's events)

Those are data-level rules enforced separately.

## Data-level authorization (row-level)
Data-level authorization answers: "Which records can you see or modify?"
Examples:
- An Event Chair can edit only events they own
- A VP of Activities can edit events owned by their reporting Event Chairs
- ADMIN can edit all events

This is enforced in the API layer by:
1. Identifying the user (auth)
2. Determining their role (RBAC)
3. Applying relationship rules in database queries (row-level)

## Practical mental model
RBAC = "Which doors can you open?"
Row-level rules = "Which files can you read once inside the room?"

## Planned ClubOS pattern
- Step 1: RBAC middleware for /api/admin/* and member APIs
- Step 2: Add row-level checks for event ownership and reporting chains
- Step 3: Add field-level filtering only if needed (later)
