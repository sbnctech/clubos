# Admin Dashboard Overview

The admin dashboard (`/admin`) is the main entry point for club officers and administrators. It provides an at-a-glance view of club activity, quick search, and navigation to detailed explorer pages.

## Summary Tiles

The top of the dashboard displays four summary tiles showing key metrics:

| Tile | Description | Data Source |
|------|-------------|-------------|
| Active Members | Count of members with ACTIVE status | `/api/admin/summary` |
| Total Events | Number of events in the system | `/api/admin/summary` |
| Registrations | Total number of event registrations | `/api/admin/summary` |
| Waitlisted | Registrations with WAITLISTED status | `/api/admin/summary` |

Each tile shows a numeric value and a label. The tiles refresh when the dashboard loads but do not auto-update.

## Admin Search

The search panel allows administrators to find members, events, and registrations from a single input field.

**How it works:**

- Enter a search term and press Enter or click Search
- Results are grouped by type: Members, Events, Registrations
- Search is case-insensitive and matches partial strings
- Members match against name or email
- Events match against title
- Registrations match against member name or event title

**Data source:** `/api/admin/search?q=<query>`

For implementation details, see the search endpoint in [API Surface](API_SURFACE.md).

## Activity Feed

The "Recent activity" panel shows the 10 most recent registration events across all members and events. This gives administrators a quick view of what is happening in the club.

**Columns displayed:**

- Member - Full name of the registrant
- Event - Title of the event
- Status - REGISTERED or WAITLISTED
- When - Registration timestamp

**Empty state:** When no activity exists, displays "No recent activity."

**Data source:** `/api/admin/activity`

For full documentation, see [Admin Activity Feed](ADMIN_ACTIVITY_UI.md).

## Navigating to Explorer Pages

The dashboard provides navigation to three detailed explorer pages:

| Explorer | Route | Purpose |
|----------|-------|---------|
| Members | `/admin/members` | Browse and search all members |
| Events | `/admin/events` | Browse all events with registration counts |
| Registrations | `/admin/registrations` | Browse all registrations across events |

Each explorer follows the same pattern:

- List page showing all items with summary metrics
- Detail page (`/admin/<type>/[id]`) showing full information
- Tables with sortable columns and links to related entities

See individual explorer docs for details:

- [Admin Members UI](ADMIN_MEMBERS_UI.md)
- [Admin Events UI](ADMIN_EVENTS_UI.md)
- [Admin Registrations UI](ADMIN_REGISTRATIONS_UI.md)

## Data Sources

The admin dashboard uses the following API endpoints:

| Endpoint | Purpose |
|----------|---------|
| `/api/admin/summary` | Dashboard summary tiles |
| `/api/admin/search` | Cross-entity search panel |
| `/api/admin/activity` | Recent activity feed |
| `/api/admin/activity/search` | Filter activity by member or event |

All endpoints are documented in [API Surface](API_SURFACE.md).

**Note on server-side rendering:**

The admin dashboard uses Next.js App Router with server components. The summary tiles and activity feed are fetched server-side during page render, not via client-side JavaScript. This means:

- Data is fresh on each page load
- No loading spinners for initial data
- Search uses client-side fetching for interactive updates

## Testing

The admin dashboard is covered by these test files:

**API tests (in `tests/api/`):**

- `admin-summary.spec.ts` - Summary endpoint response shape
- `admin-search.spec.ts` - Search endpoint across entity types
- `admin-activity.spec.ts` - Activity feed endpoint and sorting

**UI tests (in `tests/admin/`):**

- `admin-dashboard.spec.ts` - Dashboard renders with tiles and panels
- `admin-search-ui.spec.ts` - Search input and results display
- `admin-activity-ui.spec.ts` - Activity panel rendering and empty state

Run dashboard tests with:

```bash
make test-admin    # All admin UI tests
make test-api      # All API tests
```

## Future Enhancements

Planned improvements for the admin dashboard:

- Auto-refresh for summary tiles and activity feed
- Customizable dashboard layout
- Additional summary metrics (new members this week, upcoming events)
- Quick actions (send announcement, create event)
- Dashboard-level filtering by date range
- Export dashboard data to PDF or CSV
