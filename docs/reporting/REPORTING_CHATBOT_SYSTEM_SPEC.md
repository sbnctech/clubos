# Reporting and Chatbot System Specification

**Audience**: Tech Chair, Board, System Administrators
**Purpose**: Define secure reporting interface with query library and ad hoc capabilities
**Status**: Specification (not yet implemented)

---

## Overview

ClubOS provides a reporting and chatbot interface that allows authorized users to
query club data using natural language or structured queries. This system replaces
the legacy WA -> SQLite -> Chatbot workflow with a secure, auditable, role-aware
solution.

The system has two modes:

1. **Sidebar Query Library**: Pretested, versioned questions scoped to roles
2. **Ad Hoc Query Mode**: Free-form queries for authorized roles with guardrails

---

## Use Cases by Role

### President

- View membership trends and retention statistics
- See event participation summaries across all categories
- Access board-level financial summaries
- Review volunteer engagement metrics
- Export annual report data (with audit logging)

### VP of Activities

- Query event attendance by category, chair, or date range
- View waitlist patterns and capacity utilization
- Identify frequently cancelled events or members
- See event revenue summaries
- Access committee-scoped member lists for event planning

### VP of Membership

- View membership status distribution (active, lapsed, prospect)
- Query new member onboarding progress
- Identify members approaching renewal dates
- See membership level transitions over time
- Export member directories (role-gated, audited)

### Tech Chair / Admin

- Access full reporting capabilities
- Run ad hoc queries with full schema visibility
- Monitor query audit logs
- Manage query library versions
- Configure rate limits and access rules

### Finance Manager

- Query payment and refund summaries
- View revenue by event category
- Identify outstanding balances
- Access reconciliation-relevant data
- Export financial reports (audited)

### Event Chair

- View registrations for their events only
- See waitlist status for their events
- Query attendance history for their category
- Cannot access other chairs' event data

### Member

- View own registration history
- See own payment history
- Query events they attended
- Cannot access other members' data

---

## Query Library Concept

### Sidebar Questions

The query library contains pretested, versioned questions that appear in the
chatbot sidebar. Each question:

- Has a unique identifier
- Is scoped to specific roles
- Returns predictable, tested output
- Has defined row limits and output format
- Is audited when executed

### Library Management

- Questions are added via documentation PRs (not runtime config)
- Each question has acceptance criteria and expected output
- Deprecated questions are marked but retained for audit trail
- Version history tracks when questions were added/modified

### Why Sidebar Over Free-Form

| Aspect | Sidebar Questions | Ad Hoc Queries |
|--------|-------------------|----------------|
| Security risk | Low (pretested) | Higher (unpredictable) |
| Audit clarity | Clear intent | Intent must be inferred |
| Performance | Optimized | May be expensive |
| Access | All authorized roles | Restricted roles only |

---

## Ad Hoc Query Mode

### When Allowed

Ad hoc queries are permitted only for:

- Admin role
- Tech Chair
- Explicitly granted ReportingAdmin role

### Guardrails

1. **Query validation**: Reject queries that attempt:
   - Schema modification (DDL)
   - Data modification (INSERT, UPDATE, DELETE)
   - Access to system tables
   - Queries without WHERE clauses on large tables

2. **Result limits**: Hard cap on returned rows (default 1000)

3. **Timeout**: Query timeout (default 30 seconds)

4. **Rate limiting**: Max queries per hour per user

5. **Audit**: Every ad hoc query is logged with full query text

### Denied Operations

Ad hoc mode explicitly prohibits:

- Bulk export without role permission
- Access to audit tables
- Cross-member queries without appropriate role
- Payment token or full card number access
- Direct access to notes/comments containing PII

---

## Security Model

### RBAC Gate (First Layer)

Before any query executes, the system validates:

1. User is authenticated
2. User has a role that permits the query type
3. For sidebar questions: user's role is in the question's required_roles list
4. For ad hoc: user has ReportingAdmin or Admin role

```
Query Request
     |
     v
+------------------+
| RBAC Gate        |
| Is user allowed  |
| this query type? |
+------------------+
     |
     +--- NO --> 403 Forbidden
     |
     v YES
+------------------+
| Row-Level        |
| Security Filter  |
+------------------+
```

### Row-Level Security (Second Layer)

Even after passing RBAC, queries are filtered by row-level rules:

| Scope | Who Can Access | Filter Applied |
|-------|----------------|----------------|
| Self | Any member | WHERE contact_id = current_user |
| Committee | Event Chairs, VPs | WHERE category IN (user's categories) |
| Finance | Finance Manager | WHERE type IN (financial record types) |
| Global | Admin, President | No additional filter |

### Column-Level Redaction (Third Layer)

Sensitive columns are redacted or omitted based on role:

| Column Type | Admin | Finance | VP | Chair | Member |
|-------------|:-----:|:-------:|:--:|:-----:|:------:|
| Email | Full | Full | Full | Event only | Own |
| Phone | Full | Full | Redacted | Event only | Own |
| Payment token | Never | Last 4 | Never | Never | Never |
| Full card number | Never | Never | Never | Never | Never |
| Notes/comments | Full | Financial | Redacted | Own events | Own |
| Home address | Full | Full | Redacted | Never | Own |

**Never means never**: Payment tokens and full card numbers are never exposed
through the reporting interface, regardless of role.

### Audit Logging (Fourth Layer)

Every query execution logs:

| Field | Description |
|-------|-------------|
| timestamp | When the query was executed |
| user_id | Who executed the query |
| user_role | Role at time of execution |
| query_type | sidebar or ad_hoc |
| query_id | For sidebar: question ID. For ad hoc: hash of query |
| query_text | Full query text (ad hoc only) |
| result_count | Number of rows returned |
| was_truncated | Whether results hit row limit |
| export_requested | Whether user requested export |
| export_approved | Whether export was permitted |
| execution_time_ms | Query duration |
| ip_address | Requestor IP |

Audit logs are:

- Immutable (append-only)
- Retained for minimum 2 years
- Accessible only to Admin and designated auditors
- Not queryable through the chatbot interface

---

## Data Access Architecture

### Preferred: Direct Read Model

```
Chatbot Interface
       |
       v
+------------------+
| Query Executor   |
| (Read-Only Role) |
+------------------+
       |
       v
+------------------+
| Production DB    |
| (PostgreSQL)     |
+------------------+
```

The query executor connects with a read-only database role that:

- Cannot execute DDL or DML
- Has SELECT permission only on approved tables/views
- Uses connection pooling with limits
- Has statement timeout enforced at DB level

### Optional: Replica or Warehouse

For high-volume reporting or complex analytics:

```
Production DB  -->  Replication  -->  Read Replica
                                           |
                                           v
                                    Chatbot Interface
```

Benefits:
- No impact on production performance
- Can have relaxed timeouts
- Supports longer-running analytical queries

Trade-offs:
- Replication lag (data freshness)
- Additional infrastructure cost
- More complex architecture

Decision: Start with direct read model. Migrate to replica if performance
requires it.

### Rate Limiting

| Role | Queries/hour | Max concurrent |
|------|--------------|----------------|
| Member | 20 | 1 |
| Event Chair | 50 | 2 |
| VP | 100 | 3 |
| Admin | 500 | 5 |
| ReportingAdmin | 500 | 5 |

Rate limits are per-user, not per-role. Exceeding limits returns 429 Too Many
Requests with retry-after header.

### Pagination

All list/table queries must support pagination:

- Default page size: 50 rows
- Maximum page size: 500 rows
- Cursor-based pagination preferred over offset
- Total count provided when feasible (may be estimate for large tables)

---

## Output Controls

### Export Restrictions

| Role | Can Export | Max Rows | Audit Level |
|------|------------|----------|-------------|
| Member | Own data only | 100 | Logged |
| Event Chair | Own events | 500 | Logged |
| VP | Committee scope | 1000 | Logged + alert |
| Finance | Financial data | 1000 | Logged + alert |
| Admin | Any | 10000 | Logged + alert |

Export triggers additional audit entry with:
- Export format (CSV, JSON)
- Column set exported
- Row count
- File hash (for large exports)

### Result Caps by Role

Even without export, result sets are capped:

| Role | Max Rows Displayed |
|------|--------------------|
| Member | 100 |
| Event Chair | 500 |
| VP | 1000 |
| Finance | 1000 |
| Admin | 5000 |

Results exceeding the cap show: "Showing first N of M results. Refine your
query or request export approval."

### Access Denied Messaging

When a query is denied, the system explains why:

- "This question requires VP of Activities or higher role"
- "You can only view your own registration history"
- "Export of this data type requires Admin approval"
- "This query exceeds your hourly rate limit. Try again in N minutes"

Messages do not reveal:
- Existence of data the user cannot access
- Specific column names they cannot see
- Other users' queries or results

---

## Threat Model Summary

### Threats and Mitigations

| Threat | Likelihood | Impact | Mitigation |
|--------|------------|--------|------------|
| Unauthorized data access | Medium | High | RBAC + row-level security |
| Bulk data exfiltration | Medium | High | Export limits + audit alerts |
| Query injection | Low | Critical | Parameterized queries only |
| Denial of service via expensive queries | Medium | Medium | Timeouts + rate limits |
| Privilege escalation | Low | Critical | Role validation at query time |
| Audit log tampering | Low | High | Append-only logs, separate storage |
| PII exposure via aggregation | Medium | Medium | Minimum result thresholds |

### Minimum Result Thresholds

To prevent identification of individuals through aggregation:

- Count queries return "< 5" instead of exact count when result is 1-4
- This applies to: membership counts by narrow criteria, event attendance
  by specific filters, financial queries by individual

---

## Implementation Requirements

### Must Have (P0)

- [ ] Sidebar query library with 65+ questions
- [ ] RBAC gate on all queries
- [ ] Row-level security filtering
- [ ] Audit logging for all queries
- [ ] Rate limiting
- [ ] Result pagination
- [ ] Export restrictions

### Should Have (P1)

- [ ] Column-level redaction
- [ ] Minimum result thresholds
- [ ] Query timeout enforcement
- [ ] Access denied explanations

### Nice to Have (P2)

- [ ] Ad hoc query mode for admins
- [ ] Read replica support
- [ ] Query performance analytics
- [ ] Scheduled report generation

---

## Related Documents

- docs/reporting/CHATBOT_QUERY_LIBRARY_V1.md - The 65 sidebar questions
- docs/rbac/AUTH_AND_RBAC.md - Role definitions
- SYSTEM_SPEC.md - System overview and cross-references

---

*Document maintained by ClubOS development team. Last updated: December 2024*
