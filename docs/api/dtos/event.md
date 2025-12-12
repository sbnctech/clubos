# Event DTO Schemas

This document defines the request and response data transfer objects (DTOs) for event-related API endpoints.

---

## GET /api/events

Retrieves a list of all events (public endpoint for members).

### Query Parameters

| Parameter  | Type   | Required | Default  | Description                      |
|------------|--------|----------|----------|----------------------------------|
| `page`     | number | No       | 1        | Page number (1-indexed)          |
| `limit`    | number | No       | 20       | Items per page (max 50)          |
| `category` | string | No       | all      | Filter by category               |
| `from`     | string | No       | now      | Filter events starting after     |
| `to`       | string | No       | -        | Filter events starting before    |
| `status`   | string | No       | upcoming | "upcoming", "past", or "all"     |

### Response: EventListResponse

**HTTP 200 OK**

```typescript
interface EventListResponse {
  events: EventSummary[];
  pagination: PaginationMeta;
}

interface EventSummary {
  id: string;                    // Unique event identifier
  title: string;                 // Event title
  category: string;              // Event category
  startTime: string;             // ISO 8601 timestamp
  endTime: string | null;        // ISO 8601 timestamp (optional)
  location: string | null;       // Event location
  spotsAvailable: number | null; // Remaining capacity (null = unlimited)
  isWaitlistOpen: boolean;       // Can join waitlist if full
}

interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

### Example Response

```json
{
  "events": [
    {
      "id": "e-uuid-101",
      "title": "Welcome Hike",
      "category": "Outdoors",
      "startTime": "2025-06-01T09:00:00Z",
      "endTime": "2025-06-01T12:00:00Z",
      "location": "Trailhead Parking Lot",
      "spotsAvailable": 8,
      "isWaitlistOpen": true
    },
    {
      "id": "e-uuid-102",
      "title": "Wine Mixer",
      "category": "Social",
      "startTime": "2025-06-05T18:00:00Z",
      "endTime": "2025-06-05T21:00:00Z",
      "location": "Community Center",
      "spotsAvailable": 0,
      "isWaitlistOpen": true
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## GET /api/events/:id

Retrieves detailed information about a specific event.

### Path Parameters

| Parameter | Type   | Required | Description           |
|-----------|--------|----------|-----------------------|
| `id`      | string | Yes      | Event identifier      |

### Response: EventDetailResponse

**HTTP 200 OK**

```typescript
interface EventDetailResponse {
  event: EventDetail;
  userRegistration: UserEventRegistration | null;  // Current user's registration
}

interface EventDetail {
  id: string;
  title: string;
  description: string | null;
  category: string;
  startTime: string;             // ISO 8601
  endTime: string | null;        // ISO 8601
  location: string | null;
  address: string | null;
  capacity: number | null;       // Max attendees (null = unlimited)
  registeredCount: number;       // Current confirmed registrations
  waitlistedCount: number;       // Current waitlist size
  spotsAvailable: number | null;
  isWaitlistOpen: boolean;
  status: EventStatus;
  hostId: string | null;         // Member ID of event host
  hostName: string | null;       // Display name of host
  fee: EventFee | null;          // Cost information
  tags: string[];                // Event tags for filtering
  createdAt: string;
  updatedAt: string;
}

type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

interface EventFee {
  amount: number;
  currency: string;              // ISO 4217 code (e.g., "USD")
  description: string | null;    // e.g., "Includes lunch"
}

interface UserEventRegistration {
  id: string;
  status: RegistrationStatus;
  registeredAt: string;
  waitlistPosition: number | null;  // Position if waitlisted
}

type RegistrationStatus = "REGISTERED" | "WAITLISTED" | "CANCELLED";
```

### Example Response (Member View)

```json
{
  "event": {
    "id": "e-uuid-101",
    "title": "Welcome Hike",
    "description": "A casual 3-mile hike for new members. All skill levels welcome.",
    "category": "Outdoors",
    "startTime": "2025-06-01T09:00:00Z",
    "endTime": "2025-06-01T12:00:00Z",
    "location": "Trailhead Parking Lot",
    "address": "123 Mountain Road, Hillside CA 90210",
    "capacity": 20,
    "registeredCount": 12,
    "waitlistedCount": 3,
    "spotsAvailable": 8,
    "isWaitlistOpen": true,
    "status": "PUBLISHED",
    "hostId": "m-uuid-host",
    "hostName": "Jane Doe",
    "fee": {
      "amount": 0,
      "currency": "USD",
      "description": null
    },
    "tags": ["beginner-friendly", "outdoors", "new-members"],
    "createdAt": "2025-05-01T10:00:00Z",
    "updatedAt": "2025-05-15T14:30:00Z"
  },
  "userRegistration": {
    "id": "r-uuid-001",
    "status": "REGISTERED",
    "registeredAt": "2025-05-20T14:30:00Z",
    "waitlistPosition": null
  }
}
```

### Error Responses

| HTTP Status | Error Code          | When                         |
|-------------|---------------------|------------------------------|
| 401         | UNAUTHORIZED        | Missing or invalid token     |
| 404         | RESOURCE_NOT_FOUND  | Event ID does not exist      |

---

## GET /api/admin/events/:id

Retrieves detailed event information with full registration list (admin view).

### Path Parameters

| Parameter | Type   | Required | Description           |
|-----------|--------|----------|-----------------------|
| `id`      | string | Yes      | Event identifier      |

### Response: AdminEventDetailResponse

**HTTP 200 OK**

```typescript
interface AdminEventDetailResponse {
  event: EventDetail;            // Same as public EventDetail
  registrations: EventRegistration[];
  stats: EventStats;
}

interface EventRegistration {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  status: RegistrationStatus;
  registeredAt: string;
  waitlistPosition: number | null;
  paymentStatus: PaymentStatus | null;
  notes: string | null;          // Admin notes on this registration
}

type PaymentStatus = "pending" | "paid" | "refunded";

interface EventStats {
  totalRegistrations: number;
  confirmedCount: number;
  waitlistedCount: number;
  cancelledCount: number;
  capacityUtilization: number;   // Percentage (0-100)
}
```

### Example Response

```json
{
  "event": {
    "id": "e-uuid-101",
    "title": "Welcome Hike",
    "description": "A casual 3-mile hike for new members.",
    "category": "Outdoors",
    "startTime": "2025-06-01T09:00:00Z",
    "endTime": "2025-06-01T12:00:00Z",
    "location": "Trailhead Parking Lot",
    "address": "123 Mountain Road, Hillside CA 90210",
    "capacity": 20,
    "registeredCount": 12,
    "waitlistedCount": 3,
    "spotsAvailable": 8,
    "isWaitlistOpen": true,
    "status": "PUBLISHED",
    "hostId": "m-uuid-host",
    "hostName": "Jane Doe",
    "fee": null,
    "tags": ["beginner-friendly", "outdoors"],
    "createdAt": "2025-05-01T10:00:00Z",
    "updatedAt": "2025-05-15T14:30:00Z"
  },
  "registrations": [
    {
      "id": "r-uuid-001",
      "memberId": "m-uuid-12345",
      "memberName": "Alice Johnson",
      "memberEmail": "alice@example.com",
      "status": "REGISTERED",
      "registeredAt": "2025-05-20T14:30:00Z",
      "waitlistPosition": null,
      "paymentStatus": null,
      "notes": null
    },
    {
      "id": "r-uuid-002",
      "memberId": "m-uuid-67890",
      "memberName": "Bob Smith",
      "memberEmail": "bob@example.com",
      "status": "WAITLISTED",
      "registeredAt": "2025-05-21T10:00:00Z",
      "waitlistPosition": 1,
      "paymentStatus": null,
      "notes": "Prefers morning events"
    }
  ],
  "stats": {
    "totalRegistrations": 15,
    "confirmedCount": 12,
    "waitlistedCount": 3,
    "cancelledCount": 0,
    "capacityUtilization": 60
  }
}
```

---

## POST /api/admin/events/:id/duplicate

Creates a copy of an existing event.

### Path Parameters

| Parameter | Type   | Required | Description                  |
|-----------|--------|----------|------------------------------|
| `id`      | string | Yes      | Source event identifier      |

### Request: EventDuplicateRequest

```typescript
interface EventDuplicateRequest {
  title?: string;                // Override title (default: "Original (Copy)")
  startTime?: string;            // Override start time (ISO 8601)
  endTime?: string;              // Override end time (ISO 8601)
  status?: "DRAFT" | "PUBLISHED"; // New event status (default: DRAFT)
}
```

### Example Request

```json
{
  "title": "Welcome Hike - July",
  "startTime": "2025-07-01T09:00:00Z",
  "endTime": "2025-07-01T12:00:00Z",
  "status": "DRAFT"
}
```

### Response: EventDuplicateResponse

**HTTP 201 Created**

```typescript
interface EventDuplicateResponse {
  event: EventDetail;
  sourceEventId: string;
}
```

---

## PATCH /api/admin/events/:id/cancel

Cancels an event and optionally notifies registrants.

### Path Parameters

| Parameter | Type   | Required | Description           |
|-----------|--------|----------|-----------------------|
| `id`      | string | Yes      | Event identifier      |

### Request: EventCancelRequest

```typescript
interface EventCancelRequest {
  reason?: string;               // Cancellation reason
  notifyRegistrants?: boolean;   // Send notifications (default: true)
}
```

### Example Request

```json
{
  "reason": "Inclement weather forecast",
  "notifyRegistrants": true
}
```

### Response: EventCancelResponse

**HTTP 200 OK**

```typescript
interface EventCancelResponse {
  event: {
    id: string;
    title: string;
    status: "CANCELLED";
    cancelledAt: string;
    cancelReason: string | null;
  };
  notificationsSent: number;     // Count of notifications sent
  registrationsAffected: number; // Count of registrations cancelled
}
```

### Example Response

```json
{
  "event": {
    "id": "e-uuid-101",
    "title": "Welcome Hike",
    "status": "CANCELLED",
    "cancelledAt": "2025-05-30T08:00:00Z",
    "cancelReason": "Inclement weather forecast"
  },
  "notificationsSent": 15,
  "registrationsAffected": 15
}
```

### Error Responses

| HTTP Status | Error Code         | When                                  |
|-------------|--------------------|-----------------------------------------|
| 400         | VALIDATION_ERROR   | Event is already cancelled or completed |
| 401         | UNAUTHORIZED       | Missing or invalid token                |
| 403         | FORBIDDEN          | User is not an admin                    |
| 404         | RESOURCE_NOT_FOUND | Event ID does not exist                 |
