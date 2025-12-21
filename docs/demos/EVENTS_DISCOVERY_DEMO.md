# Events Discovery Demo Guide

This guide walks through a 3-5 minute demonstration of the public events pages.

## What Changed

### New Files Created

**API Endpoints:**
- `src/app/api/v1/events/route.ts` - Enhanced public events list endpoint
- `src/app/api/v1/events/[id]/route.ts` - Public event detail endpoint

**Pages:**
- `src/app/events/page.tsx` - Events discovery page (server component)
- `src/app/events/EventsDiscovery.tsx` - Interactive events browser (client component)
- `src/app/events/[id]/page.tsx` - Event detail page (server component)
- `src/app/events/[id]/EventDetailClient.tsx` - Event detail display (client component)

**Tests:**
- `tests/public/events-api.spec.ts` - API endpoint tests
- `tests/public/events-pages.spec.ts` - Playwright page tests

### Key Features

1. **Public Access**: No login required to browse events
2. **Search & Filter**: Search by title/description, filter by category, toggle upcoming/past
3. **View Modes**: List view and grid view toggle
4. **ICS Download**: Add any event to your calendar with one click
5. **Registration Stub**: "Register" button shows "Coming Soon" modal

---

## Prerequisites

```bash
# Start development server
npm run dev

# Ensure events are seeded (if not already)
npx prisma db seed
```

---

## Demo Walkthrough (3-5 minutes)

### 1. Events Discovery Page (2 minutes)

Navigate to: http://localhost:3000/events

**Show the hero section:**
- "Club Events" headline with description
- Professional, modern design vs. WA calendar widget

**Demonstrate filtering:**
1. Type "hike" in the search box - events filter in real-time
2. Clear search, select a category from the dropdown
3. Click "Past" toggle to show past events
4. Click "Upcoming" to return to default view

**Demonstrate view modes:**
1. Click grid icon - cards display in a grid
2. Click list icon - cards display in a list

**Show event cards:**
- Status badges (Open, Waitlist, Past, Spots left)
- Category labels
- Date/time formatting
- Location display
- Truncated descriptions

**Pagination (if many events):**
- Show "Page X of Y" and Previous/Next buttons

### 2. Event Detail Page (2 minutes)

Click any event card to open the detail page.

**Show the layout:**
- Breadcrumb navigation (Events / Event Name)
- Large event title
- Status badge (Registration Open, Waitlist, Past Event)

**Show event info card:**
- Date and time with calendar icon
- Location with map pin icon
- Capacity (X / Y registered, Z spots remaining)

**Show description:**
- Full event description displayed

**Show event chair:**
- If assigned, shows the event chair name

**Demonstrate actions:**
1. Click "Add to Calendar" - downloads ICS file
2. Open the downloaded .ics file to show it works
3. Click "Register" - shows "Coming Soon" modal
4. Click "Got it" or outside modal to close

### 3. Closing Points (30 seconds)

**Key differentiators from Wild Apricot:**
- Modern, responsive design that works on all devices
- Real-time search and filtering without page reload
- One-click calendar integration
- Clear capacity and waitlist status
- Fast page loads with server-side rendering

**What's NOT implemented:**
- Actual registration (stub only)
- Payment processing
- Member-specific personalization
- Waitlist management

---

## How to Rollback

If needed to revert these changes:

```bash
# Remove the new files
rm -rf src/app/events
rm -rf src/app/api/v1/events
rm -rf tests/public

# The original /api/v1/events routes were stubs - recreate if needed
```

---

## Test Commands

```bash
# Run typecheck
npm run typecheck

# Run just the new API tests
npx playwright test tests/public/events-api.spec.ts

# Run just the new page tests
npx playwright test tests/public/events-pages.spec.ts

# Run all public tests
npx playwright test tests/public/
```

---

## API Reference

### GET /api/v1/events

List published events (public, no auth required).

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 20, max: 100) - Items per page
- `category` - Filter by category
- `from` - Filter events starting on/after this ISO date
- `to` - Filter events starting on/before this ISO date
- `search` - Search in title and description
- `past` - If "true", show past events; otherwise upcoming only

**Response:**
```json
{
  "events": [
    {
      "id": "uuid",
      "title": "Welcome Coffee",
      "description": "Join us for coffee...",
      "category": "Social",
      "location": "Starbucks Downtown",
      "startTime": "2025-01-15T10:00:00.000Z",
      "endTime": "2025-01-15T12:00:00.000Z",
      "capacity": 20,
      "registeredCount": 12,
      "spotsRemaining": 8,
      "isWaitlistOpen": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 15,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "categories": ["Social", "Outdoors", "Cultural"]
}
```

### GET /api/v1/events/:id

Get event details (public, no auth required).

**Response:**
```json
{
  "event": {
    "id": "uuid",
    "title": "Welcome Coffee",
    "description": "Full description...",
    "category": "Social",
    "location": "Starbucks Downtown",
    "startTime": "2025-01-15T10:00:00.000Z",
    "endTime": "2025-01-15T12:00:00.000Z",
    "capacity": 20,
    "isPublished": true,
    "registeredCount": 12,
    "spotsRemaining": 8,
    "isWaitlistOpen": false,
    "eventChair": {
      "id": "uuid",
      "name": "Jane Smith"
    }
  }
}
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `src/app/events/page.tsx` | Events discovery page (server) |
| `src/app/events/EventsDiscovery.tsx` | Interactive browser (client) |
| `src/app/events/[id]/page.tsx` | Event detail page (server) |
| `src/app/events/[id]/EventDetailClient.tsx` | Detail display (client) |
| `src/app/api/v1/events/route.ts` | Events list API |
| `src/app/api/v1/events/[id]/route.ts` | Event detail API |
| `tests/public/events-api.spec.ts` | API tests |
| `tests/public/events-pages.spec.ts` | Page tests |
