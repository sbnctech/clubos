# Persona Widget Matrix

Worker 2 — Q-026 Persona-to-Widget Mapping — Report

---

## Homepage Philosophy

Widgets are optional, role-aware, and should never surprise users. The homepage serves as a personalized dashboard where each persona sees information relevant to their role and current tasks. Widgets display data the user is authorized to see—nothing more. Default layouts are sensible for each role, but users may hide widgets they find unhelpful. No widget should require explanation to understand; if a user must ask "what does this mean?", the widget has failed. Empty states are handled gracefully with helpful next steps, not error messages or blank spaces.

---

## Persona Widget Matrix

| Persona | Homepage Widgets (Top 5) | Why These | What to Avoid | Training Nudges |
|---------|-------------------------|-----------|---------------|-----------------|
| **Regular Member** | My Upcoming Events, Upcoming Events Calendar, My Waitlist Positions, Renewal Reminder, Announcements Feed | Core member journey: see what I signed up for, find new events, know if I got off waitlist, stay current on club news | Admin metrics, financial data, committee-level views, anything requiring explanation | "Click event name to see details and who else is going" |
| **New Member** | Featured Event Spotlight, Upcoming Events Calendar, My Membership Status, Quick Actions Panel, Announcements Feed | Discovery-focused: highlight newcomer-friendly events, confirm membership is active, easy access to common tasks | Waitlist (confusing early), advanced filters, committee views | "Events marked 'Newcomer Friendly' are great starting points" |
| **Event Chair** | Event Chair Dashboard, My Upcoming Events, Upcoming Events Calendar, Announcements Feed, Quick Actions Panel | Task-focused: see their events' registration status, manage their own participation, stay informed | Admin metrics they cannot act on, finance data, other committees' details | "Your dashboard shows events you manage. Click to see registrations." |
| **Committee Leader** | Event Chair Dashboard (committee scope), Upcoming Events Calendar, Membership Metrics (if VP), Announcements Feed, Pending Approvals | Oversight-focused: see all committee events, spot issues early, track what needs attention | Individual member data, finance details (unless Finance role), system health | "Dashboard shows all events in your committee. Yellow = needs attention." |
| **Board Member** | Membership Metrics, Event Metrics, Announcements Feed, Pending Approvals, Board Meeting Summary | Governance-focused: health of club, what needs decisions, key communications | Operational details, individual registrations, debugging info | "Metrics show trends. Click numbers to see supporting detail." |
| **Finance Manager** | Pending Approvals (refunds), Financial Metrics, Event Metrics (revenue view), Announcements Feed, Quick Actions Panel | Finance-focused: what needs action, reconciliation status, revenue tracking | Non-financial operational data, member PII beyond what refunds require | "Pending refunds require your approval before processing." |
| **Admin Staff** | Quick Actions Panel, Contact Directory Quick Search, Announcements Feed, My Upcoming Events, Pending Approvals | Task-focused: answer questions fast, look up members, handle requests | Deep analytics, system configuration, anything they cannot act on | "Use search to find member info. Common tasks are in Quick Actions." |
| **Tech Chair A (Operator)** | System Health, Announcements Feed, Quick Actions Panel, Data Quality Alerts, My Upcoming Events | Monitoring-focused: is everything working? any alerts? plus personal participation | Code-level details, raw logs, anything requiring technical interpretation | "Green = OK. Yellow = check it. Red = escalate to support." |
| **Tech Chair B (Steward)** | System Health, Data Quality Alerts, Membership Metrics, Event Metrics, Pending Approvals | Stewardship-focused: system health, data integrity, organizational health | Marketing fluff, redundant summaries, anything without drill-down capability | "Data Quality shows issues to investigate. Click for details." |

---

## RBAC and Privacy Rules Applied to Widgets

- Widgets only display data the viewer is authorized to see; authorization is enforced server-side before data reaches the widget
- Member-scoped widgets (My Upcoming Events, My Waitlist) query only the logged-in user's records
- Committee-scoped widgets filter by the viewer's committee membership; a Chair sees only their committee's events
- Admin-scoped widgets (Membership Metrics, System Health) are hidden entirely for non-admin roles, not shown as locked or greyed out
- Financial data widgets require explicit Finance Manager or Admin role; VP roles do not see payment details
- Member PII (email, phone, address) is redacted or omitted in widgets unless the viewer has explicit permission
- Widget data is never cached client-side; every render fetches fresh, permission-filtered data
- Audit logs record widget data access for admin-level widgets (Data Quality, System Health, Metrics)

---

## New Member vs Lapsed Member Behavior

**New Members:**

- See Featured Event Spotlight prominently to encourage early engagement
- Membership Status widget shows "Welcome!" messaging with days since joining
- Events Calendar highlights "Newcomer Friendly" events with visual indicator
- Quick Actions includes "Find Newcomer Events" as a prominent option
- Training nudges are more frequent and explanatory during first 90 days
- Waitlist widget is hidden until they have registered for at least one event

**Lapsed Members:**

- Homepage shows Renewal Reminder widget in prominent position with clear CTA
- My Upcoming Events shows only historical data with "Renew to register" messaging
- Event registration is blocked; clicking events shows renewal prompt, not registration form
- Membership Status widget shows expiration date and days lapsed with renewal link
- Non-member-only widgets (Admin, Finance, Committee) are hidden entirely
- Announcements Feed remains visible to encourage re-engagement
- Privacy preferences from active membership period remain frozen (cannot modify until renewed)
- Historical participation data (past events attended) remains visible to the lapsed member

---

## Verdict

READY FOR REVIEW
