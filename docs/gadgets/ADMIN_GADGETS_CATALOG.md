# Admin Gadgets Catalog (ClubOS)

Worker 3 — Admin Gadgets Catalog — Report

## Scope
Admin-facing gadgets needed for operations, with RBAC gates and delegated administration.
No implementation.

## Gadget Catalog (Initial)
| Gadget ID | Name | Primary Users | What it does | Inputs | Outputs | RBAC Gate | Notes |
|---|---|---|---|---|---|---|---|
| ADM-010 | Role Assignment | VP/President | Assign roles to people | personId, roleId | audit event | President OR delegated VP scope | |
| ADM-020 | Delegation Map | VP Activities | Manage chairs/committee admins | committeeId, chairId | audit event | VP Activities | |
| ADM-030 | Approval Queue | Finance VP/President | Review approvals | filters | list | role-based | |
| ADM-040 | Member Search | Admin | search members | query | list | admin | |
| ADM-050 | Event Admin Panel | Chairs | manage events in scope | eventId | status | chair scope | |
| ADM-060 | Data Quality Dashboard | Admin | detect data issues | none | metrics | admin | |
| ADM-070 | Audit Log Viewer | President/Admin | view audit logs | filters | rows | strict | |

## Extensibility Rules
- Gadget IDs are stable (do not reuse)
- Each gadget declares:
  - required permissions
  - query templates it uses
  - audit events it emits
- Gadgets must be composable onto role-specific homepages

## Delegated Admin Notes
- VP Activities can manage RBAC for chairs within Activities domain
- Chairs can manage committee/event scopes assigned to them
- President retains global override; default is deny

## Verdict
READY FOR REVIEW
