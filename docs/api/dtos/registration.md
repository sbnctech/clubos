# Registration DTO Schemas

This document defines the request and response data transfer objects (DTOs) for registration-related API endpoints.

---

## Waitlist Promotion Strategy

**V1 Decision: MANUAL promotion only**

In v1, waitlist promotions are explicit admin actions. When a spot opens (due to cancellation), the system does NOT automatically promote the next person. Instead:

1. Admin reviews the waitlist via `GET /api/admin/registrations/pending`
2. Admin manually promotes using `POST /api/admin/registrations/:id/promote`
3. Promoted member receives notification

**Rationale:**
- Gives admins control over who gets promoted
- Avoids race conditions and notification complexity
- Allows for special considerations (e.g., member seniority, past attendance)

**Future consideration:** Auto-promotion may be added in v2 with configurable rules.

---

## POST /api/admin/registrations/:id/promote

Promotes a waitlisted registration to confirmed status.

### Path Parameters

| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| `id`      | string | Yes      | Registration identifier  |

### Request: PromoteRegistrationRequest

```typescript
interface PromoteRegistrationRequest {
  notify?: boolean;              // Send notification (default: true)
  notes?: string;                // Optional admin notes
  overrideCapacity?: boolean;    // Allow promotion even if at capacity (default: false)
}
```

### Example Request

```json
{
  "notify": true,
  "notes": "Promoted due to member seniority",
  "overrideCapacity": false
}
```

### Response: PromoteRegistrationResponse

**HTTP 200 OK**

```typescript
interface PromoteRegistrationResponse {
  registration: {
    id: string;
    memberId: string;
    memberName: string;
    eventId: string;
    eventTitle: string;
    status: "REGISTERED";        // Always REGISTERED after promotion
    promotedAt: string;          // ISO 8601 timestamp
    previousStatus: "WAITLISTED";
    waitlistPosition: null;      // Cleared after promotion
  };
  notificationSent: boolean;
  remainingWaitlist: number;     // How many still on waitlist
  spotsAvailable: number;        // Spots remaining after promotion
}
```

### Example Response

```json
{
  "registration": {
    "id": "r-uuid-002",
    "memberId": "m-uuid-67890",
    "memberName": "Bob Smith",
    "eventId": "e-uuid-101",
    "eventTitle": "Welcome Hike",
    "status": "REGISTERED",
    "promotedAt": "2025-06-01T12:00:00Z",
    "previousStatus": "WAITLISTED",
    "waitlistPosition": null
  },
  "notificationSent": true,
  "remainingWaitlist": 2,
  "spotsAvailable": 0
}
```

### Error Responses

| HTTP Status | Error Code          | When                                         |
|-------------|---------------------|----------------------------------------------|
| 400         | VALIDATION_ERROR    | Registration is not in WAITLISTED status     |
| 401         | UNAUTHORIZED        | Missing or invalid token                     |
| 403         | FORBIDDEN           | User is not an admin                         |
| 404         | RESOURCE_NOT_FOUND  | Registration ID does not exist               |
| 409         | CONFLICT            | Registration already promoted or cancelled   |
| 422         | CAPACITY_EXCEEDED   | Event at capacity (use overrideCapacity)     |

### Capacity Override

If `overrideCapacity: true` is set and the event is at capacity:
- Promotion proceeds anyway
- Response includes a warning in the details
- This allows admins to exceed capacity for special cases

```json
{
  "registration": { ... },
  "notificationSent": true,
  "remainingWaitlist": 2,
  "spotsAvailable": -1,
  "warning": "Event is now over capacity"
}
```

---

## GET /api/admin/registrations/pending

Retrieves all registrations awaiting action (waitlisted or pending approval).

### Query Parameters

| Parameter | Type   | Required | Default | Description                    |
|-----------|--------|----------|---------|--------------------------------|
| `eventId` | string | No       | all     | Filter by specific event       |
| `sort`    | string | No       | oldest  | "oldest" or "newest"           |
| `limit`   | number | No       | 50      | Maximum items to return        |

### Response: PendingRegistrationsResponse

**HTTP 200 OK**

```typescript
interface PendingRegistrationsResponse {
  registrations: PendingRegistration[];
  totalCount: number;
}

interface PendingRegistration {
  id: string;
  memberId: string;
  memberName: string;
  memberEmail: string;
  eventId: string;
  eventTitle: string;
  eventStartTime: string;        // ISO 8601
  status: "WAITLISTED" | "PENDING";
  registeredAt: string;          // ISO 8601
  waitlistPosition: number;      // 1-indexed position
  daysWaiting: number;           // Days since registration
}
```

### Example Response

```json
{
  "registrations": [
    {
      "id": "r-uuid-002",
      "memberId": "m-uuid-67890",
      "memberName": "Bob Smith",
      "memberEmail": "bob@example.com",
      "eventId": "e-uuid-101",
      "eventTitle": "Welcome Hike",
      "eventStartTime": "2025-06-01T09:00:00Z",
      "status": "WAITLISTED",
      "registeredAt": "2025-05-21T10:00:00Z",
      "waitlistPosition": 1,
      "daysWaiting": 11
    },
    {
      "id": "r-uuid-003",
      "memberId": "m-uuid-11111",
      "memberName": "Carol White",
      "memberEmail": "carol@example.com",
      "eventId": "e-uuid-101",
      "eventTitle": "Welcome Hike",
      "eventStartTime": "2025-06-01T09:00:00Z",
      "status": "WAITLISTED",
      "registeredAt": "2025-05-22T08:00:00Z",
      "waitlistPosition": 2,
      "daysWaiting": 10
    }
  ],
  "totalCount": 2
}
```

---

## GET /api/admin/registrations/:id

Retrieves detailed information about a specific registration.

### Path Parameters

| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| `id`      | string | Yes      | Registration identifier  |

### Response: RegistrationDetailResponse

**HTTP 200 OK**

```typescript
interface RegistrationDetailResponse {
  registration: RegistrationDetail;
  member: MemberSummary;
  event: EventSummary;
  history: RegistrationHistoryEntry[];
}

interface RegistrationDetail {
  id: string;
  status: RegistrationStatus;
  registeredAt: string;
  updatedAt: string;
  waitlistPosition: number | null;
  paymentStatus: PaymentStatus | null;
  paymentAmount: number | null;
  notes: string | null;
  source: "web" | "admin" | "import";  // How registration was created
}

type RegistrationStatus = "REGISTERED" | "WAITLISTED" | "CANCELLED";
type PaymentStatus = "pending" | "paid" | "refunded";

interface MemberSummary {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

interface EventSummary {
  id: string;
  title: string;
  category: string;
  startTime: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";
}

interface RegistrationHistoryEntry {
  action: "CREATED" | "PROMOTED" | "CANCELLED" | "PAYMENT_UPDATED";
  timestamp: string;
  performedBy: string | null;    // Admin who performed action
  details: Record<string, unknown>;
}
```

### Example Response

```json
{
  "registration": {
    "id": "r-uuid-002",
    "status": "WAITLISTED",
    "registeredAt": "2025-05-21T10:00:00Z",
    "updatedAt": "2025-05-21T10:00:00Z",
    "waitlistPosition": 1,
    "paymentStatus": null,
    "paymentAmount": null,
    "notes": "Prefers morning events",
    "source": "web"
  },
  "member": {
    "id": "m-uuid-67890",
    "name": "Bob Smith",
    "email": "bob@example.com",
    "phone": "+15559876543",
    "status": "ACTIVE"
  },
  "event": {
    "id": "e-uuid-101",
    "title": "Welcome Hike",
    "category": "Outdoors",
    "startTime": "2025-06-01T09:00:00Z",
    "status": "PUBLISHED"
  },
  "history": [
    {
      "action": "CREATED",
      "timestamp": "2025-05-21T10:00:00Z",
      "performedBy": null,
      "details": {
        "source": "web",
        "initialStatus": "WAITLISTED"
      }
    }
  ]
}
```

---

## DELETE /api/admin/registrations/:id

Cancels a registration.

### Path Parameters

| Parameter | Type   | Required | Description              |
|-----------|--------|----------|--------------------------|
| `id`      | string | Yes      | Registration identifier  |

### Request: CancelRegistrationRequest

```typescript
interface CancelRegistrationRequest {
  reason?: string;               // Cancellation reason
  notify?: boolean;              // Send notification (default: true)
  refund?: boolean;              // Initiate refund if paid (default: false)
}
```

### Example Request

```json
{
  "reason": "Member requested cancellation",
  "notify": true,
  "refund": false
}
```

### Response: CancelRegistrationResponse

**HTTP 200 OK**

```typescript
interface CancelRegistrationResponse {
  registration: {
    id: string;
    status: "CANCELLED";
    cancelledAt: string;
    cancelReason: string | null;
    previousStatus: RegistrationStatus;
  };
  notificationSent: boolean;
  refundInitiated: boolean;
  spotsFreed: number;            // Usually 1 if was REGISTERED, 0 if was WAITLISTED
}
```

### Example Response

```json
{
  "registration": {
    "id": "r-uuid-001",
    "status": "CANCELLED",
    "cancelledAt": "2025-05-28T14:00:00Z",
    "cancelReason": "Member requested cancellation",
    "previousStatus": "REGISTERED"
  },
  "notificationSent": true,
  "refundInitiated": false,
  "spotsFreed": 1
}
```

### Side Effects

When a REGISTERED registration is cancelled:
1. One spot opens on the event
2. Notification sent to cancelled member (if notify=true)
3. **No automatic waitlist promotion** - admin must manually promote

---

## Shared Types Reference

```typescript
// Common types used across registration DTOs

type RegistrationStatus = "REGISTERED" | "WAITLISTED" | "CANCELLED";

type PaymentStatus = "pending" | "paid" | "refunded";

type RegistrationSource = "web" | "admin" | "import";

interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```
