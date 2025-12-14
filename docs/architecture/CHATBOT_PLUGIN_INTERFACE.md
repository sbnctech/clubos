# Chatbot Plugin Interface Contract

Worker 2 — Q-030 Chatbot Plugin Interface — Report

---

## Purpose

Define a strict, auditable interface between the chatbot UI and ClubOS backend services. The chatbot is treated as an **untrusted UI client**—it may request data and navigation assistance, but it cannot mutate state or bypass access controls.

This interface enables:

- Read-only data queries scoped to the viewer's role
- Guided navigation via deep links
- How-to support with contextual help
- Consistent error handling and refusal patterns

---

## Non-Goals

- No direct database access from chatbot
- No mutation operations (create, update, delete)
- No bypass of RBAC enforcement
- No caching of sensitive data client-side
- No execution of arbitrary queries
- No access to audit logs or system internals

---

## Plugin Interface Responsibilities

The chatbot plugin interface is responsible for:

| Responsibility | Owner |
|----------------|-------|
| Authenticate viewer identity | Platform (not chatbot) |
| Enforce role-based access | Platform (not chatbot) |
| Execute pre-approved query templates | Platform |
| Return filtered, safe responses | Platform |
| Log all queries for audit | Platform |
| Present results to user | Chatbot UI |
| Handle errors gracefully | Chatbot UI |

The chatbot UI is a presentation layer only. All access control, data filtering, and audit logging occur server-side.

---

## Allowed Operations (Explicit List)

The chatbot MAY request:

| Operation | Description | Example |
|-----------|-------------|---------|
| query.run | Execute a pre-approved query template | "What events am I registered for?" |
| help.lookup | Retrieve help content by topic or context | "How do I cancel a registration?" |
| navigate.suggest | Get deep link to relevant page | "Where do I update my profile?" |
| context.get | Get current viewer context (role, name, status) | Display personalized greeting |
| glossary.lookup | Define a club-specific term | "What does lapsed mean?" |
| escalate.request | Request handoff to human support | "I need to talk to someone" |

Each operation has defined input/output schema, role requirements, and audit logging.

---

## Forbidden Operations (Explicit List)

The chatbot MUST NOT:

| Forbidden Operation | Reason |
|---------------------|--------|
| Execute arbitrary SQL or queries | Security: injection risk |
| Create, update, or delete any record | Mutations require explicit UI action |
| Access other users' data | Privacy: only viewer's data or authorized aggregates |
| Retrieve raw audit logs | Security: audit logs are admin-only |
| Cache PII client-side | Privacy: sensitive data must not persist |
| Bypass query templates | Security: all queries must be pre-approved |
| Access payment tokens or card numbers | Security: never exposed |
| Impersonate another user | Security: viewer context is immutable |
| Disable or modify logging | Audit: all operations must be logged |

Attempts to perform forbidden operations return a structured refusal, not an error.

---

## Access Control Model

### Viewer Context

Every chatbot request includes a ViewerContext provided by the platform:

- user_id: string
- roles: Role[]
- committee_ids: string[]
- membership_status: active | lapsed | prospect
- session_id: string

The chatbot cannot modify ViewerContext. It is injected server-side.

### Query Scoping

| Scope | Meaning | Example |
|-------|---------|---------|
| self | Only viewer's own records | My registrations |
| committee | Records in viewer's committees | Events I chair |
| global | Aggregates visible to viewer's role | Total member count (admin only) |

Queries exceeding viewer's scope return empty results, not errors.

### Role Enforcement

If viewer lacks required role, query returns:

- status: denied
- reason: insufficient_role
- message: "This information requires [Role] access."

---

## Query Execution Rules

### Pre-Approved Templates Only

- All queries execute against pre-defined templates
- Templates are versioned and documented
- No dynamic query construction from user input
- Parameters validated against schema before execution

### Result Limits

| Constraint | Default | Max |
|------------|---------|-----|
| Row limit | 50 | 500 |
| Response size | 64KB | 256KB |
| Query timeout | 5s | 30s |

### No Side Effects

Query execution MUST NOT modify any record, send notifications, or trigger jobs.

---

## How-To Support vs Data Query Behavior

### How-To Support (help.lookup)

- Returns static help content (markdown)
- May include deep links to relevant pages
- Role-aware: shows content appropriate to viewer's role
- Does not access viewer's data

### Data Query (query.run)

- Executes query template against live data
- Returns viewer-scoped results
- Filtered by RBAC before return

---

## Error Handling and Refusal Patterns

### Response Structure

- status: success | denied | error | empty
- data: (optional) query results
- message: (optional) user-facing message
- reason: (optional) machine-readable reason
- deep_link: (optional) helpful navigation

### What Not to Reveal

Responses MUST NOT reveal:

- Whether denied data exists
- Internal table or column names
- Stack traces or error details
- Other users' existence or data

---

## Audit and Logging Expectations

### Every Request Logged

| Field | Description |
|-------|-------------|
| timestamp | Server time of request |
| session_id | Viewer's session |
| user_id | Viewer's identity |
| operation | query.run, help.lookup, etc. |
| query_id | Template ID (for queries) |
| params_hash | Hash of parameters |
| status | success, denied, error, empty |
| result_count | Number of rows returned |
| duration_ms | Execution time |

### Retention

- Chatbot audit logs retained 2 years minimum
- Logs are append-only
- No role can delete chatbot audit entries

---

## Verdict

READY FOR REVIEW
