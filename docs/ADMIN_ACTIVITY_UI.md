# Admin Activity Feed

## Overview

The Admin Activity Feed provides a real-time view of recent member registrations across all events. It is designed for club officers and administrators who want to quickly see what is happening in the club without navigating to individual member or event pages.

This feature is backed by the `/api/admin/activity` endpoint. Currently, the endpoint returns mock data for development and testing.

## Routes

### /admin (Recent activity section)

The "Recent activity" panel appears near the bottom of the main admin dashboard page (`/admin`). It is a read-only display showing the 10 most recent registration events.

- Located below the summary tiles and other dashboard panels
- Displays registration activity in reverse chronological order
- Automatically populated when the admin dashboard loads

## Data Sources

### GET /api/admin/activity

Returns recent registration activity for the admin dashboard.

**Query parameters:**

| Parameter | Required | Description                                      |
|-----------|----------|--------------------------------------------------|
| `limit`   | No       | Maximum number of items to return (test use only)|

**Response structure:**

```json
{
  "activity": [
    {
      "id": "r1",
      "type": "REGISTRATION",
      "memberId": "m1",
      "memberName": "Alice Johnson",
      "eventId": "e1",
      "eventTitle": "Welcome Hike",
      "status": "REGISTERED",
      "registeredAt": "2025-06-01T14:30:00Z"
    }
  ]
}
```

**Activity entry fields:**

| Field        | Type   | Description                              |
|--------------|--------|------------------------------------------|
| id           | string | Registration identifier                  |
| type         | string | Activity type (currently "REGISTRATION") |
| memberId     | string | Reference to the member                  |
| memberName   | string | Full name of the member                  |
| eventId      | string | Reference to the event                   |
| eventTitle   | string | Title of the event                       |
| status       | string | REGISTERED or WAITLISTED                 |
| registeredAt | string | ISO 8601 timestamp of registration       |

**Sorting:**

Results are sorted by `registeredAt` in descending order (most recent first) on the backend.

**Limit:**

The UI currently displays the 10 most recent items. The `limit` parameter is available for testing purposes but defaults to returning all activity if not specified or invalid.

## UI Behavior

The Recent activity panel displays a table with the following columns:

| Column | Description                                |
|--------|--------------------------------------------|
| Member | Full name of the member who registered     |
| Event  | Title of the event they registered for     |
| Status | REGISTERED or WAITLISTED                   |
| When   | Registration timestamp                     |

**Status values:**

- **REGISTERED** - Member has a confirmed spot in the event
- **WAITLISTED** - Member is on the waitlist for the event

**Empty state:**

When there is no recent activity, the panel displays: "No recent activity."

**Access:**

This is an admin-only feature. It is only visible within the admin dashboard and requires appropriate access permissions.

## Testing

The Admin Activity Feed is covered by the following test files:

**API tests:**

- tests/api/admin-activity.spec.ts
  - Verifies the endpoint returns the expected response shape
  - Tests sorting order (most recent first)
  - Tests the optional limit parameter

**UI tests:**

- tests/admin/admin-activity-ui.spec.ts
  - Verifies the activity panel renders on the admin dashboard
  - Tests that activity entries display correct member/event information
  - Tests empty state behavior when no activity exists

## Future Enhancements

Planned improvements for the Admin Activity Feed:

- Filter by specific event or member
- Show activity types beyond registrations (cancellations, waitlist promotions)
- Add relative time display (e.g., "5 minutes ago" instead of timestamp)
- Real-time updates via polling or WebSocket
- Pagination for viewing older activity
- Click-through links to member and event detail pages
