# Leadership Action Log

Reference: [SBNC Business Model](../ORG/SBNC_BUSINESS_MODEL.md)

## Purpose

The Leadership Action Log records significant governance events for:

- Third-year membership decisions
- Flywheel health monitoring
- Officer transition documentation
- Audit trail

## Design Principles

1. **Evidence, not judgment** - Log what happened, not whether it was good
2. **Milestones, not metrics** - Track events, not scores
3. **Non-punitive** - Data informs decisions but does not dictate them

## Mentorship Actions

| Action | Description | Data Captured |
|--------|-------------|---------------|
| `MENTOR_ASSIGNED` | Mentor matched with newbie | mentor name, newbie name, assigned by |
| `MENTOR_ENDED` | Mentorship concluded | mentor name, newbie name, duration |
| `MENTOR_NEWBIE_SHARED_REGISTRATION` | Both registered for same event | event name, date |
| `MENTOR_NEWBIE_SHARED_ATTENDANCE` | Both attended same event | event name, date |

## Transition Actions

| Action | Description | Data Captured |
|--------|-------------|---------------|
| `TRANSITION_CREATED` | Transition plan initiated | outgoing officer, incoming officer |
| `TRANSITION_APPROVED` | President approved plan | approver name, plan summary |
| `TRANSITION_APPLIED` | Roles transferred | old role, new role, effective date |

## Audit Actions

| Action | Description | Data Captured |
|--------|-------------|---------------|
| `CREATE` | Resource created | resource type, resource ID |
| `UPDATE` | Resource modified | before state, after state |
| `DELETE` | Resource removed | resource type, resource ID |
| `PUBLISH` | Content published | page/campaign ID |
| `UNPUBLISH` | Content unpublished | page/campaign ID |
| `SEND` | Campaign sent | recipient count, campaign ID |

## Access Control

- **Admin**: Full access to all logs
- **President**: View all logs
- **VP Activities**: View event-related logs
- **VP Membership**: View member and mentorship logs
- **Past President**: View transition logs

## Querying Logs

Logs are stored in the `AuditLog` table with:

- `action` - The action type (enum)
- `resourceType` - Type of resource affected
- `resourceId` - ID of resource affected
- `memberId` - Actor who performed action
- `before` - State before action (JSON)
- `after` - State after action (JSON)
- `metadata` - Additional context (JSON)

## Retention

Logs are retained indefinitely. They support:

- Third-year membership review (requires 3+ years of history)
- Officer transition audits
- Compliance documentation

## Related Documentation

- [Mentor Role](../roles/MENTOR_ROLE.md)
- [Transition Plan Process](./TRANSITION_PLANS.md)
