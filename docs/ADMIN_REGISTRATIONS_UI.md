# Admin Registrations Explorer

## Overview

The Admin Registrations Explorer provides an interface for club officers and administrators to browse all event registrations across the system. It displays registration records with enriched member and event information, allowing administrators to see the full picture of who is signed up for which events.

This feature is backed by the `/api/admin/registrations` and `/api/admin/registrations/[id]` endpoints. Currently, these endpoints return mock data for development and testing.

## Routes

### /admin/registrations

The registrations list page displays all registrations with enriched context.

- Shows a table of all registrations across all events
- Columns: Member, Event, Status, Registered at
- Member names and event titles are resolved from their IDs
- Registration rows link to individual registration detail pages
- Supports filtering by status (REGISTERED, WAITLISTED, CANCELLED)

### /admin/registrations/[id]

The registration detail page shows a single registration record.

- Displays the registration status and timestamp
- Shows the associated member information (name, email)
- Shows the associated event information (title, category, start time)
- Provides links to the related member and event detail pages
- Returns a 404 page for unknown registration IDs

## Data Sources

### GET /api/admin/registrations

Returns a list of all registrations with enriched member and event data.

**Response fields:**

| Field        | Type   | Description                              |
|--------------|--------|------------------------------------------|
| id           | string | Unique registration identifier           |
| memberId     | string | Reference to the member                  |
| memberName   | string | Full name of the member                  |
| eventId      | string | Reference to the event                   |
| eventTitle   | string | Title of the event                       |
| status       | string | REGISTERED, WAITLISTED, or CANCELLED     |
| registeredAt | string | ISO 8601 timestamp of registration       |

The memberName and eventTitle fields are derived by joining against mock members and events data.

### GET /api/admin/registrations/[id]

Returns detailed information for a single registration.

**Response structure:**

- **registration** object:
  - id - Unique registration identifier
  - status - REGISTERED, WAITLISTED, or CANCELLED
  - registeredAt - ISO 8601 timestamp

- **member** object:
  - id - Member identifier
  - name - Full name
  - email - Email address

- **event** object:
  - id - Event identifier
  - title - Event title
  - category - Event category
  - startTime - ISO 8601 timestamp

Returns 404 if the registration ID is not found.

## Testing

The Admin Registrations Explorer is covered by the following test files:

**API tests:**

- tests/api/admin-registrations-list.spec.ts - Tests the /api/admin/registrations endpoint
- tests/api/admin-registration-detail.spec.ts - Tests the /api/admin/registrations/[id] endpoint

**UI tests:**

- tests/admin/admin-registrations-explorer.spec.ts - Tests the registrations list page
- tests/admin/admin-registration-detail-page.spec.ts - Tests the registration detail page

Passing tests confirm the basic contract between UI and API is working correctly.

## Future Enhancements

Planned improvements for the Admin Registrations Explorer:

- Filter registrations by status, member, or event
- Add date range filtering (registrations created between dates)
- Add pagination for long registration lists
- Sort by registration date, member name, or event title
- Replace mock data with database-backed queries
- Bulk status updates (e.g., move waitlisted to registered)
- Export registrations to CSV
