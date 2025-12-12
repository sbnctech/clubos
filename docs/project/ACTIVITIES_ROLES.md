# Activities Roles (Planned)

## Real-world structure (SBNC)
- Two VPs of Activities
- Each Event Chair reports to exactly one VP of Activities
- Each Event is owned by one Event Chair

## Intent
This structure supports:
- Clear accountability
- Delegated event management
- Scalable permissions without over-complication

## Roles
Current (implemented today):
- ADMIN

Planned (next iteration):
- VP_ACTIVITIES
- EVENT_CHAIR
- MEMBER

## RBAC vs row-level permissions
RBAC determines "who you are" and which endpoints you may call.

Row-level permissions determine which records you may access.
They are enforced using data relationships.

## Row-level rules (planned)
- EVENT_CHAIR can manage events where event.ownerId == currentUser.id
- VP_ACTIVITIES can manage events owned by chairs who report to that VP
- ADMIN can manage all events

## Notes
RBAC does not implement row-level rules by itself.
Those rules must be implemented in Prisma queries and API handlers.
