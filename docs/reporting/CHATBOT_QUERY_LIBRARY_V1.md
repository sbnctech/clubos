# Chatbot Query Library v1

**Version**: 1.0
**Questions**: 65
**Last Updated**: December 2024

---

## Format

Each question entry contains:

- **id**: Unique identifier (category-number)
- **title**: Short descriptive title
- **prompt**: Natural language question
- **required_roles**: Roles that can execute this query
- **scope**: global / committee / self
- **sensitivity**: low / medium / high
- **output_type**: count / list / table / summary
- **max_rows**: Maximum rows returned

---

## Category: Membership (MEM)

### MEM-001
- **title**: Total Active Members
- **prompt**: How many active members do we have?
- **required_roles**: Admin, President, VP Membership
- **scope**: global
- **sensitivity**: low
- **output_type**: count
- **max_rows**: 1

### MEM-002
- **title**: Members by Status
- **prompt**: Show me the count of members by status (active, lapsed, prospect)
- **required_roles**: Admin, President, VP Membership
- **scope**: global
- **sensitivity**: low
- **output_type**: table
- **max_rows**: 10

### MEM-003
- **title**: Members by Level
- **prompt**: How many members are at each membership level?
- **required_roles**: Admin, President, VP Membership
- **scope**: global
- **sensitivity**: low
- **output_type**: table
- **max_rows**: 10

### MEM-004
- **title**: New Members This Month
- **prompt**: How many new members joined this month?
- **required_roles**: Admin, President, VP Membership
- **scope**: global
- **sensitivity**: low
- **output_type**: count
- **max_rows**: 1

### MEM-005
- **title**: New Members This Year
- **prompt**: How many new members joined this year?
- **required_roles**: Admin, President, VP Membership
- **scope**: global
- **sensitivity**: low
- **output_type**: count
- **max_rows**: 1

### MEM-006
- **title**: Members Expiring Soon
- **prompt**: Which members have memberships expiring in the next 30 days?
- **required_roles**: Admin, VP Membership
- **scope**: global
- **sensitivity**: medium
- **output_type**: list
- **max_rows**: 100

### MEM-007
- **title**: Lapsed Members
- **prompt**: Show me members who lapsed in the last 90 days
- **required_roles**: Admin, VP Membership
- **scope**: global
- **sensitivity**: medium
- **output_type**: list
- **max_rows**: 100

### MEM-008
- **title**: Member Retention Rate
- **prompt**: What is our member retention rate for this year?
- **required_roles**: Admin, President, VP Membership
- **scope**: global
- **sensitivity**: low
- **output_type**: summary
- **max_rows**: 1

### MEM-009
- **title**: Membership Growth Trend
- **prompt**: Show membership count by month for the past 12 months
- **required_roles**: Admin, President, VP Membership
- **scope**: global
- **sensitivity**: low
- **output_type**: table
- **max_rows**: 12

### MEM-010
- **title**: Members Without Email
- **prompt**: How many members do not have an email address on file?
- **required_roles**: Admin, VP Membership
- **scope**: global
- **sensitivity**: medium
- **output_type**: count
- **max_rows**: 1

### MEM-011
- **title**: Member Directory Search
- **prompt**: Find members whose name contains [search term]
- **required_roles**: Admin, VP Membership, VP Activities
- **scope**: global
- **sensitivity**: medium
- **output_type**: list
- **max_rows**: 50

### MEM-012
- **title**: Members by Join Year
- **prompt**: How many members joined in each year?
- **required_roles**: Admin, President, VP Membership
- **scope**: global
- **sensitivity**: low
- **output_type**: table
- **max_rows**: 20

### MEM-013
- **title**: Alumni Count
- **prompt**: How many alumni members do we have?
- **required_roles**: Admin, President, VP Membership
- **scope**: global
- **sensitivity**: low
- **output_type**: count
- **max_rows**: 1

### MEM-014
- **title**: Prospect Conversion Rate
- **prompt**: What percentage of prospects became members this year?
- **required_roles**: Admin, President, VP Membership
- **scope**: global
- **sensitivity**: low
- **output_type**: summary
- **max_rows**: 1

### MEM-015
- **title**: My Membership Status
- **prompt**: What is my current membership status?
- **required_roles**: Member, Event Chair, VP, Admin
- **scope**: self
- **sensitivity**: low
- **output_type**: summary
- **max_rows**: 1

---

## Category: Events (EVT)

### EVT-001
- **title**: Total Events This Year
- **prompt**: How many events have we held this year?
- **required_roles**: Admin, President, VP Activities
- **scope**: global
- **sensitivity**: low
- **output_type**: count
- **max_rows**: 1

### EVT-002
- **title**: Events by Category
- **prompt**: Show me event counts by activity category
- **required_roles**: Admin, President, VP Activities
- **scope**: global
- **sensitivity**: low
- **output_type**: table
- **max_rows**: 20

### EVT-003
- **title**: Upcoming Events
- **prompt**: What events are scheduled for the next 30 days?
- **required_roles**: Member, Event Chair, VP, Admin
- **scope**: global
- **sensitivity**: low
- **output_type**: table
- **max_rows**: 50

### EVT-004
- **title**: Events by Chair
- **prompt**: How many events has each chair organized this year?
- **required_roles**: Admin, VP Activities
- **scope**: global
- **sensitivity**: low
- **output_type**: table
- **max_rows**: 50

### EVT-005
- **title**: Cancelled Events
- **prompt**: Which events were cancelled this year and why?
- **required_roles**: Admin, VP Activities
- **scope**: global
- **sensitivity**: medium
- **output_type**: table
- **max_rows**: 50

### EVT-006
- **title**: Events at Capacity
- **prompt**: Which upcoming events are at full capacity?
- **required_roles**: Admin, VP Activities, Event Chair
- **scope**: global
- **sensitivity**: low
- **output_type**: list
- **max_rows**: 20

### EVT-007
- **title**: Events with Waitlists
- **prompt**: Which events currently have waitlists?
- **required_roles**: Admin, VP Activities, Event Chair
- **scope**: global
- **sensitivity**: low
- **output_type**: table
- **max_rows**: 20

### EVT-008
- **title**: Low Attendance Events
- **prompt**: Which events had less than 50% capacity filled?
- **required_roles**: Admin, VP Activities
- **scope**: global
- **sensitivity**: medium
- **output_type**: table
- **max_rows**: 50

### EVT-009
- **title**: Average Event Attendance
- **prompt**: What is the average attendance per event by category?
- **required_roles**: Admin, President, VP Activities
- **scope**: global
- **sensitivity**: low
- **output_type**: table
- **max_rows**: 20

### EVT-010
- **title**: My Category Events
- **prompt**: Show events in my activity category
- **required_roles**: Event Chair, VP Activities, Admin
- **scope**: committee
- **sensitivity**: low
- **output_type**: table
- **max_rows**: 100

### EVT-011
- **title**: Events by Month
- **prompt**: How many events occurred each month this year?
- **required_roles**: Admin, President, VP Activities
- **scope**: global
- **sensitivity**: low
- **output_type**: table
- **max_rows**: 12

### EVT-012
- **title**: Most Popular Events
- **prompt**: What were the most attended events this year?
- **required_roles**: Admin, President, VP Activities
- **scope**: global
- **sensitivity**: low
- **output_type**: table
- **max_rows**: 20

### EVT-013
- **title**: Event Revenue Summary
- **prompt**: What is total revenue by event category?
- **required_roles**: Admin, President, Finance Manager
- **scope**: global
- **sensitivity**: high
- **output_type**: table
- **max_rows**: 20

### EVT-014
- **title**: Free vs Paid Events
- **prompt**: How many events were free vs paid this year?
- **required_roles**: Admin, VP Activities
- **scope**: global
- **sensitivity**: low
- **output_type**: table
- **max_rows**: 2

### EVT-015
- **title**: Events I Created
- **prompt**: Show events I have created or chaired
- **required_roles**: Event Chair, VP Activities, Admin
- **scope**: self
- **sensitivity**: low
- **output_type**: table
- **max_rows**: 100

---

## Category: Registrations (REG)

### REG-001
- **title**: Total Registrations This Year
- **prompt**: How many event registrations have we processed this year?
- **required_roles**: Admin, President, VP Activities
- **scope**: global
- **sensitivity**: low
- **output_type**: count
- **max_rows**: 1

### REG-002
- **title**: Registrations by Status
- **prompt**: Show registration counts by status (confirmed, cancelled, waitlisted)
- **required_roles**: Admin, VP Activities
- **scope**: global
- **sensitivity**: low
- **output_type**: table
- **max_rows**: 10

### REG-003
- **title**: Cancellation Rate
- **prompt**: What is our overall event cancellation rate?
- **required_roles**: Admin, VP Activities
- **scope**: global
- **sensitivity**: low
- **output_type**: summary
- **max_rows**: 1

### REG-004
- **title**: Frequent Cancellers
- **prompt**: Which members have cancelled more than 3 times this year?
- **required_roles**: Admin, VP Activities
- **scope**: global
- **sensitivity**: high
- **output_type**: list
- **max_rows**: 50

### REG-005
- **title**: Waitlist Conversion Rate
- **prompt**: What percentage of waitlisted members get promoted to registered?
- **required_roles**: Admin, VP Activities
- **scope**: global
- **sensitivity**: low
- **output_type**: summary
- **max_rows**: 1

### REG-006
- **title**: Registrations for Event
- **prompt**: Show all registrations for event [event name or ID]
- **required_roles**: Event Chair, VP Activities, Admin
- **scope**: committee
- **sensitivity**: medium
- **output_type**: table
- **max_rows**: 200

### REG-007
- **title**: My Registrations
- **prompt**: Show my upcoming event registrations
- **required_roles**: Member, Event Chair, VP, Admin
- **scope**: self
- **sensitivity**: low
- **output_type**: table
- **max_rows**: 50

### REG-008
- **title**: My Registration History
- **prompt**: Show all events I have attended
- **required_roles**: Member, Event Chair, VP, Admin
- **scope**: self
- **sensitivity**: low
- **output_type**: table
- **max_rows**: 100

### REG-009
- **title**: No-Show Rate
- **prompt**: What is our no-show rate for events?
- **required_roles**: Admin, VP Activities
- **scope**: global
- **sensitivity**: medium
- **output_type**: summary
- **max_rows**: 1

### REG-010
- **title**: Members Never Attended
- **prompt**: How many members have never attended an event?
- **required_roles**: Admin, VP Activities, VP Membership
- **scope**: global
- **sensitivity**: medium
- **output_type**: count
- **max_rows**: 1

---

## Category: Financial (FIN)

### FIN-001
- **title**: Total Revenue This Year
- **prompt**: What is our total event revenue this year?
- **required_roles**: Admin, President, Finance Manager
- **scope**: global
- **sensitivity**: high
- **output_type**: count
- **max_rows**: 1

### FIN-002
- **title**: Revenue by Month
- **prompt**: Show monthly event revenue for this year
- **required_roles**: Admin, President, Finance Manager
- **scope**: global
- **sensitivity**: high
- **output_type**: table
- **max_rows**: 12

### FIN-003
- **title**: Refunds Issued
- **prompt**: How many refunds have been issued this year?
- **required_roles**: Admin, Finance Manager
- **scope**: global
- **sensitivity**: high
- **output_type**: count
- **max_rows**: 1

### FIN-004
- **title**: Refund Total Amount
- **prompt**: What is the total dollar amount of refunds this year?
- **required_roles**: Admin, Finance Manager
- **scope**: global
- **sensitivity**: high
- **output_type**: count
- **max_rows**: 1

### FIN-005
- **title**: Pending Refunds
- **prompt**: Which refund requests are pending approval?
- **required_roles**: Admin, Finance Manager
- **scope**: global
- **sensitivity**: high
- **output_type**: table
- **max_rows**: 50

### FIN-006
- **title**: Revenue by Category
- **prompt**: Show revenue breakdown by activity category
- **required_roles**: Admin, President, Finance Manager
- **scope**: global
- **sensitivity**: high
- **output_type**: table
- **max_rows**: 20

### FIN-007
- **title**: Average Event Price
- **prompt**: What is the average ticket price by event category?
- **required_roles**: Admin, VP Activities, Finance Manager
- **scope**: global
- **sensitivity**: medium
- **output_type**: table
- **max_rows**: 20

### FIN-008
- **title**: Outstanding Balances
- **prompt**: Are there any outstanding member balances?
- **required_roles**: Admin, Finance Manager
- **scope**: global
- **sensitivity**: high
- **output_type**: table
- **max_rows**: 50

### FIN-009
- **title**: My Payment History
- **prompt**: Show my payment history
- **required_roles**: Member, Event Chair, VP, Admin
- **scope**: self
- **sensitivity**: medium
- **output_type**: table
- **max_rows**: 100

### FIN-010
- **title**: Cancellation Fees Collected
- **prompt**: How much have we collected in cancellation fees this year?
- **required_roles**: Admin, Finance Manager
- **scope**: global
- **sensitivity**: high
- **output_type**: count
- **max_rows**: 1

---

## Category: Engagement (ENG)

### ENG-001
- **title**: Most Active Members
- **prompt**: Which members have attended the most events this year?
- **required_roles**: Admin, President, VP Activities
- **scope**: global
- **sensitivity**: medium
- **output_type**: table
- **max_rows**: 50

### ENG-002
- **title**: Inactive Members
- **prompt**: Which members have not attended any events in 6 months?
- **required_roles**: Admin, VP Membership, VP Activities
- **scope**: global
- **sensitivity**: medium
- **output_type**: list
- **max_rows**: 100

### ENG-003
- **title**: Event Participation by Member Level
- **prompt**: What is average event participation by membership level?
- **required_roles**: Admin, President, VP Membership
- **scope**: global
- **sensitivity**: low
- **output_type**: table
- **max_rows**: 10

### ENG-004
- **title**: New Member Engagement
- **prompt**: How many events do new members attend in their first 90 days?
- **required_roles**: Admin, VP Membership
- **scope**: global
- **sensitivity**: low
- **output_type**: summary
- **max_rows**: 1

### ENG-005
- **title**: Category Participation
- **prompt**: Which activity categories have the most unique participants?
- **required_roles**: Admin, VP Activities
- **scope**: global
- **sensitivity**: low
- **output_type**: table
- **max_rows**: 20

### ENG-006
- **title**: Repeat Attendees
- **prompt**: How many members have attended more than 10 events this year?
- **required_roles**: Admin, VP Activities
- **scope**: global
- **sensitivity**: low
- **output_type**: count
- **max_rows**: 1

### ENG-007
- **title**: First-Time Attendees
- **prompt**: How many members attended their first event this month?
- **required_roles**: Admin, VP Membership, VP Activities
- **scope**: global
- **sensitivity**: low
- **output_type**: count
- **max_rows**: 1

### ENG-008
- **title**: Cross-Category Participation
- **prompt**: How many members participate in multiple activity categories?
- **required_roles**: Admin, VP Activities
- **scope**: global
- **sensitivity**: low
- **output_type**: count
- **max_rows**: 1

### ENG-009
- **title**: Volunteer Event Chairs
- **prompt**: How many unique event chairs do we have?
- **required_roles**: Admin, President, VP Activities
- **scope**: global
- **sensitivity**: low
- **output_type**: count
- **max_rows**: 1

### ENG-010
- **title**: My Participation Summary
- **prompt**: Summarize my event participation this year
- **required_roles**: Member, Event Chair, VP, Admin
- **scope**: self
- **sensitivity**: low
- **output_type**: summary
- **max_rows**: 1

---

## Category: Administrative (ADM)

### ADM-001
- **title**: System Users
- **prompt**: How many users have logged into the system?
- **required_roles**: Admin
- **scope**: global
- **sensitivity**: medium
- **output_type**: count
- **max_rows**: 1

### ADM-002
- **title**: Recent Query Activity
- **prompt**: Show recent chatbot queries (last 24 hours)
- **required_roles**: Admin
- **scope**: global
- **sensitivity**: high
- **output_type**: table
- **max_rows**: 100

### ADM-003
- **title**: Export Audit Log
- **prompt**: Show recent data exports
- **required_roles**: Admin
- **scope**: global
- **sensitivity**: high
- **output_type**: table
- **max_rows**: 50

### ADM-004
- **title**: Role Distribution
- **prompt**: How many users have each role?
- **required_roles**: Admin
- **scope**: global
- **sensitivity**: medium
- **output_type**: table
- **max_rows**: 10

### ADM-005
- **title**: Data Quality Issues
- **prompt**: Are there any data quality issues to address?
- **required_roles**: Admin
- **scope**: global
- **sensitivity**: medium
- **output_type**: table
- **max_rows**: 50

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | December 2024 | Initial 65 questions across 6 categories |

---

## Adding New Questions

To add a question to the library:

1. Create a PR with the new question in this document
2. Include test cases showing expected output
3. Document the security scope and sensitivity
4. Get approval from Tech Chair
5. Update version history

Questions should not be removed, only deprecated (marked with status: deprecated).

---

*Document maintained by ClubOS development team.*
