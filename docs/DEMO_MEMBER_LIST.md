# Demo Member List

A read-only admin view that displays member information with status, tier, and lifecycle hints - designed for live demos.

## Access

**URL:** http://localhost:3000/admin/demo/members

**Quick Access:** From the Demo Dashboard (`/admin/demo`), click "Member List with Lifecycle Hints" in the Quick Links section.

## What It Shows

| Column | Description |
|--------|-------------|
| Name | Member's full name (links to member detail page) |
| Email | Contact email address |
| Status | Membership status badge (Active, Lapsed, Pending, etc.) |
| Tier | Membership tier badge (Newbie, Member, Extended, Admin) |
| Joined | Date the member joined the club |
| Lifecycle | Derived hint based on tier and join date |

## Lifecycle Hints

The lifecycle column shows contextual information based on membership tier:

| Tier | Lifecycle Hint Example |
|------|------------------------|
| Newbie Member | "Newbie expires in 23 days" (green/orange/red based on urgency) |
| Member | "Member for 2 years" |
| Extended Member | "Extended (Third Year)" |
| Admin | "Administrator" |
| Unknown/null | "Status pending" |

### Color Coding

- **Green** - More than 30 days remaining
- **Orange** - 8-30 days remaining
- **Red** - 7 days or less remaining / action needed
- **Purple** - Special status (Extended, Admin)

## Filters

Use the dropdowns at the top to filter by:

- **Status** - Filter by membership status (Active, Lapsed, etc.)
- **Tier** - Filter by membership tier (Newbie, Member, Extended)

Filters reset to page 1 when changed.

## Demo Script

### 1. Show the Member List

Navigate to `/admin/demo/members` and point out:

- The table shows all key membership information at a glance
- Status badges make it easy to see member states
- Tier badges distinguish between membership levels

### 2. Demonstrate Lifecycle Hints

- Filter by "Newbie Member" tier to show new members
- Point out the lifecycle column showing when newbie status expires
- Note the color coding: green (plenty of time), orange (attention needed), red (urgent)

### 3. Show Filtering

- Use the Status dropdown to filter to "Active" members only
- Use the Tier dropdown to show only "Extended Member" tier
- Clear filters to show all members

### 4. Pagination

- Use Previous/Next buttons to navigate through pages
- Note the page count and total member count

## API Endpoint

**GET** `/api/admin/demo/member-list`

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| pageSize | number | 25 | Items per page (max 100) |
| status | string | - | Filter by status code |
| tier | string | - | Filter by tier code |

### Response

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "status": "active",
      "statusLabel": "Active",
      "tier": "newbie_member",
      "tierName": "Newbie Member",
      "joinedAt": "2024-10-15T00:00:00.000Z",
      "lifecycleHint": "Newbie expires in 23 days"
    }
  ],
  "page": 1,
  "pageSize": 25,
  "totalItems": 150,
  "totalPages": 6,
  "filters": {
    "statusOptions": [
      { "code": "active", "label": "Active" }
    ],
    "tierOptions": [
      { "code": "newbie_member", "name": "Newbie Member" }
    ]
  }
}
```

## Requirements

- Database must be seeded with member data
- Requires `admin:full` capability
- Read-only - no modifications possible
