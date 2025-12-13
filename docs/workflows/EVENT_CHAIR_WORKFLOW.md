# Event Chair Workflow

This document defines the workflow responsibilities and decision gates for
Event Chairs (committee chairs who manage events).

---

## Role Definition

An Event Chair is a committee leader who:

- Creates and manages events for their committee
- Handles registrations and attendee communications
- Coordinates with Activities VP for event approval
- Manages cancellations and waitlist substitutions

**Access scope:** Events owned by their committee only.

---

## Event Creation Workflow

### Step 1: Submit Event Request

Event Chair submits event details via the event submission form:

- Event title, description, date/time
- Location
- Registration types and pricing
- Capacity limits
- Event image

**Gate:** Submission goes to Activities VP for review.

### Step 2: Activities VP Approval

Activities VP reviews for:

- Content quality and accuracy
- Calendar conflicts
- Pricing alignment with club policies
- Completeness of information

**Outcome:** Approve (event created) or Request Changes (back to chair).

### Step 3: Event Activation

After posting team creates the event:

- Activities VP performs final activation
- Event becomes visible to members
- Registration opens

---

## Registration Management

### View Registrations

Event Chair can view:

- List of registered attendees
- Waitlist members (if capacity reached)
- Guest registrations
- Payment status

### Add Manual Registration

Event Chair can add registrations for:

- Phone/email requests
- Walk-ins (day of event)
- Special accommodations

**Requirement:** Note the reason for manual entry.

### Cancel a Registration

When a member requests cancellation:

1. Event Chair locates the registration
2. Selects "Cancel registration"
3. System sends cancellation notification to member
4. If waitlist exists, earliest member is automatically promoted
5. Promoted member receives confirmation notification

**Important:** Cancellation is NOT a refund. See Finance Manager workflow.

---

## Waitlist Management

### Automatic Promotion

When a registered member cancels:

1. System identifies earliest waitlisted member (FIFO)
2. Automatically promotes them to registered status
3. Sends promotion notification

### Manual Promotion

Event Chair MAY manually promote a waitlisted member out of order:

**Allowed reasons:**

- Accessibility accommodation
- Previously cancelled and re-added
- Administrative error correction

**Requirement:** Document reason for out-of-order promotion.

---

## Attendee Communication

### Send Event Updates

Event Chair can email all registrants:

- Logistics updates (parking, location changes)
- Day-of reminders
- Post-event follow-ups

### Send to Waitlist

Event Chair can email waitlisted members separately:

- Status updates on likelihood of spots opening
- Alternative event suggestions

---

## Cancellation Workflow (Cancelling Registration)

### Member-Initiated Cancellation

1. Member requests cancellation (via system or direct contact)
2. Event Chair cancels registration
3. System:
   - Updates registration status to "Cancelled"
   - Sends confirmation to member
   - Promotes next waitlisted member (if any)
4. **If refund needed:** Event Chair initiates refund request

### Initiating a Refund Request

**Event Chair can request a refund but CANNOT execute it.**

1. Go to cancelled registration
2. Select "Request Refund"
3. Enter reason for refund
4. Submit to Finance Manager queue

**Gate:** Finance Manager must approve and execute refund.

See: docs/workflows/FINANCE_MANAGER_WORKFLOW.md

---

## Event Cancellation Workflow (Cancelling Entire Event)

When an event must be cancelled:

### Step 1: Mark Event as Cancelled

1. Edit event
2. Add "[CANCELLED]" to event title
3. Update description with cancellation notice
4. Disable registration

**Important:** Do NOT delete the event.

### Step 2: Notify Registrants

1. Go to registrations list
2. Select all registrants
3. Send cancellation notification with explanation

### Step 3: Handle Refunds (if applicable)

For each paid registration:

1. Event Chair submits refund request
2. Finance Manager reviews and approves
3. Finance Manager executes refund
4. Finance Manager confirms in QuickBooks

---

## Permissions Summary

| Action | Event Chair Can |
|--------|-----------------|
| View own events | Yes |
| Create event request | Yes |
| Edit own events | Yes |
| Cancel registrations | Yes |
| Promote from waitlist | Yes |
| Email registrants | Yes |
| Request refund | Yes |
| Execute refund | **No** - Finance Manager only |
| Activate event | **No** - Activities VP only |
| Delete event | **No** - Not recommended for anyone |

---

## Cross-References

- Finance Manager workflow: docs/workflows/FINANCE_MANAGER_WORKFLOW.md
- Finance roles: docs/rbac/FINANCE_ROLES.md
- Activities VP scope: docs/rbac/VP_ACTIVITIES_SCOPE.md
- RBAC overview: docs/RBAC_OVERVIEW.md
