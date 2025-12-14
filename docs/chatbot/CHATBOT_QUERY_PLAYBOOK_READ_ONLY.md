# Chatbot Query Playbook (Read-Only, Role-Aware)

Worker 3 - Chatbot Query Playbook - Report

## Purpose

Specify how the chatbot executes read-only queries via the plugin interface, using the same filter catalog and RBAC rules as list gadgets.

---

## 1. Chatbot as Router

The chatbot does not generate queries. It routes user intent to predefined query templates.

```
User Question
     |
     v
Intent Classification
     |
     v
Template Selection (from QUERY_FILTER_CATALOG)
     |
     v
RBAC Check (ViewerContext)
     |
     v
Query Execution (read-only)
     |
     v
Response Formatting
     |
     v
Answer + Deep Link + Next Action
```

**Key principle**: The chatbot interprets, selects, executes, and explains. It never constructs ad-hoc queries.

---

## 2. Required Inputs

Every chatbot query requires:

| Input | Source | Purpose |
|-------|--------|---------|
| ViewerContext | Session/Auth | Identifies who is asking |
| role | ViewerContext | Determines allowed templates |
| scope | ViewerContext + Intent | Filters data (e.g., "my events" vs "all events") |
| intent | User message | Classified question type |
| parameters | Extracted from message | Date ranges, names, categories |

### ViewerContext Structure

```
{
  "memberId": "string",
  "roles": ["member", "event_chair", ...],
  "committees": ["hiking", "wine", ...],
  "isAuthenticated": boolean
}
```

---

## 3. Allowed and Forbidden Operations

### Allowed (Read-Only)

| Operation | Description |
|-----------|-------------|
| search | Find records matching criteria |
| list | Return filtered, paginated results |
| count | Return aggregate counts |
| summarize | Provide high-level statistics |
| lookup | Retrieve single record by ID |
| explain | Describe what a field or status means |

### Forbidden (Mutations)

| Operation | Why Forbidden |
|-----------|---------------|
| create | Chatbot cannot add records |
| update | Chatbot cannot modify records |
| delete | Chatbot cannot remove records |
| register | Must go through authenticated UI flow |
| cancel | Must go through authenticated UI flow |
| approve | Must go through authenticated UI flow |
| send_email | Chatbot cannot trigger communications |

---

## 4. Response Style

Every chatbot response has three components:

### (a) Answer
Concise, direct response to the question. Use plain language.

> "There are 3 events with openings next week: Hiking at Inspiration Point (Tuesday), Wine Tasting (Thursday), and Book Club (Saturday)."

### (b) Deep Link
Direct link to the relevant page or section in ClubOS.

> "View all upcoming events: [Events Calendar](/events?filter=upcoming)"

### (c) Next Action
Suggest what the user might want to do next (non-destructive only).

> "Would you like to see details for any of these events?"

---

## 5. Audit Logging

All chatbot queries are logged for accountability and debugging.

### Required Log Fields

| Field | Description |
|-------|-------------|
| timestamp | When query was executed |
| actor_id | ViewerContext.memberId |
| actor_roles | ViewerContext.roles |
| intent | Classified intent |
| template_id | Which query template was used |
| parameters | Sanitized query parameters |
| result_count | Number of records returned |
| response_type | answer/error/access_denied |

### Access Denied Logging

When a user asks for data they cannot access:

```
{
  "timestamp": "...",
  "actor_id": "member-123",
  "intent": "list_all_members",
  "template_id": "members.list",
  "response_type": "access_denied",
  "reason": "role 'member' cannot list all members"
}
```

---

## 6. Connection to QUERY_FILTER_CATALOG

The chatbot uses **only** templates defined in `QUERY_FILTER_CATALOG.md`.

**Rules**:
- No ad-hoc query construction
- Template parameters are validated against catalog schema
- RBAC rules in catalog are authoritative
- Chatbot cannot bypass catalog restrictions

**If a user asks for something not in the catalog**:
- Respond with "I cannot answer that question directly."
- Suggest the appropriate page or contact.
- Do not attempt to construct a workaround.

---

## 7. Example User Questions (12 Templates)

### Members Domain

**Q1**: "How many active members do we have?"
- Intent: `members.count`
- Template: `members.count(status=active)`
- RBAC: Admin, Board
- Response: "There are 487 active members as of today."
- Link: [Membership Dashboard](/admin/members)

**Q2**: "Who joined this month?"
- Intent: `members.list`
- Template: `members.list(joined_after=month_start, limit=20)`
- RBAC: Admin, Board, Membership Chair
- Response: "12 members joined this month. [List follows]"
- Link: [New Members Report](/admin/members?filter=new)

**Q3**: "What is my membership status?"
- Intent: `members.lookup_self`
- Template: `members.get(id=viewer.memberId)`
- RBAC: Any authenticated member
- Response: "Your membership is Active, renews on March 15, 2026."
- Link: [My Profile](/profile)

### Events Domain

**Q4**: "What events are happening next week?"
- Intent: `events.list`
- Template: `events.list(start_after=today, start_before=week_end)`
- RBAC: Any authenticated member
- Response: "There are 8 events next week. [List follows]"
- Link: [Events Calendar](/events?view=week)

**Q5**: "Which events have openings?"
- Intent: `events.list`
- Template: `events.list(has_openings=true, start_after=today)`
- RBAC: Any authenticated member
- Response: "5 upcoming events have openings. [List follows]"
- Link: [Events with Openings](/events?filter=openings)

**Q6**: "What events is the Hiking committee running?"
- Intent: `events.list`
- Template: `events.list(committee=hiking, start_after=today)`
- RBAC: Any authenticated member
- Response: "The Hiking committee has 3 upcoming events. [List follows]"
- Link: [Hiking Events](/events?committee=hiking)

### Registrations Domain

**Q7**: "What events am I registered for?"
- Intent: `registrations.list_self`
- Template: `registrations.list(member_id=viewer.memberId, status=active)`
- RBAC: Any authenticated member
- Response: "You are registered for 2 upcoming events. [List follows]"
- Link: [My Registrations](/profile/registrations)

**Q8**: "Who is registered for the Wine Tasting event?"
- Intent: `registrations.list_by_event`
- Template: `registrations.list(event_id=X)`
- RBAC: Event Chair (own events), Admin
- Response: "14 members are registered. [List follows]"
- Link: [Event Registrations](/admin/events/X/registrations)

**Q9**: "How many people are on the waitlist for Book Club?"
- Intent: `registrations.count`
- Template: `registrations.count(event_id=X, status=waitlist)`
- RBAC: Event Chair (own events), Admin
- Response: "There are 3 people on the waitlist."
- Link: [Event Waitlist](/admin/events/X/waitlist)

### Payments Domain

**Q10**: "What payments have I made this year?"
- Intent: `payments.list_self`
- Template: `payments.list(member_id=viewer.memberId, date_after=year_start)`
- RBAC: Any authenticated member
- Response: "You have 4 payments totaling $180 this year. [List follows]"
- Link: [My Payment History](/profile/payments)

**Q11**: "Are there any pending refunds?"
- Intent: `refunds.list`
- Template: `refunds.list(status=pending)`
- RBAC: Finance Manager, Admin
- Response: "There are 2 pending refund requests. [List follows]"
- Link: [Pending Refunds](/admin/finance/refunds?status=pending)

**Q12**: "What is the total revenue from events this month?"
- Intent: `payments.summarize`
- Template: `payments.sum(type=event, date_after=month_start)`
- RBAC: Finance Manager, Treasurer, Admin
- Response: "Event revenue this month is $4,230."
- Link: [Financial Summary](/admin/finance/summary)

---

## 8. Error Responses

### Access Denied
> "I cannot show you that information. Members with [required role] can access this data. Contact the Tech Chair if you believe you should have access."

### Template Not Found
> "I do not have a way to answer that question directly. You might find what you need on the [suggested page]."

### No Results
> "No records match your query. Try broadening your search or check [suggested page]."

### System Error
> "I encountered an error processing your request. Please try again or contact support if the problem persists."

---

## Verdict

READY FOR REVIEW
