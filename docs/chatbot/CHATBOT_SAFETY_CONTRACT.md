# Chatbot Safety Contract

## Allowed
- Read-only queries
- Template-backed queries
- Deep links to UI

## Forbidden
- Mutations
- Role changes
- Approvals
- Workflow initiation
- Parameter inference

## Enforcement
- Server-side RBAC
- Template registry
- Deny-first routing
