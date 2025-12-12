# Admin Events Explorer

## Overview

The Admin Events Explorer provides an interface for club officers and administrators to browse events and view registration details. It displays event information, registration counts, and attendee lists in a structured format.

This feature is backed by the `/api/admin/events` and `/api/admin/events/[id]` endpoints. Currently, these endpoints return mock data for development and testing.

## Routes

### /admin/events

The events list page displays all events with summary metrics.

- Shows a table of events with key information
- Columns: Title, Category, Start time, Registrations, Waitlisted
- Event titles link to individual event detail pages
- Registration and waitlisted counts are derived from mock registrations

### /admin/events/[id]

The event detail page shows a single event and its registrations.

- Displays event information: Title, Category, Start time
- Shows a table of registrations for this event
- Registration table columns: Member, Status, Registered at
- Returns a 404 page for unknown event IDs

## Data Sources

### GET /api/admin/events

Returns a list of all events with aggregated registration metrics.

**Response fields:**

| Field              | Type   | Description                              |
|--------------------|--------|------------------------------------------|
| id                 | string | Unique event identifier                  |
| title              | string | Event title                              |
| category           | string | Event category (e.g., "Outdoors")        |
| startTime          | string | ISO 8601 timestamp of event start        |
| registrationCount  | number | Total registrations for event            |
| waitlistedCount    | number | Registrations with WAITLISTED status     |

Counts are derived from mock registrations until the database layer is wired up.

### GET /api/admin/events/[id]

Returns detailed information for a single event.

**Response structure:**

- **event** object:
  - id - Unique event identifier
  - title - Event title
  - category - Event category
  - startTime - ISO 8601 timestamp

- **registrations** array (each item):
  - id - Registration identifier
  - memberId - Reference to member
  - memberName - Human-readable member name
  - status - REGISTERED, WAITLISTED, or CANCELLED
  - registeredAt - ISO 8601 timestamp of registration

## Testing

The Admin Events Explorer is covered by the following test files:

**API tests:**

- tests/api/admin-events-list.spec.ts - Tests the /api/admin/events endpoint
- tests/api/admin-event-detail.spec.ts - Tests the /api/admin/events/[id] endpoint

**UI tests:**

- tests/admin/admin-events-explorer.spec.ts - Tests the events list page
- tests/admin/admin-event-detail-page.spec.ts - Tests the event detail page

Passing tests confirm the basic contract between UI and API is working correctly.

## Future Enhancements

Planned improvements for the Admin Events Explorer:

- Filter events by category or date range
- Add pagination for long event lists
- Sort by start time or registration counts
- Replace mock data with database-backed queries
- Add event edit and create functionality
- Export event registrations to CSV
