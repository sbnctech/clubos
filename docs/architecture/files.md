# File Management API

## Overview

The File Management API provides visibility-based authorization for file storage and retrieval. Files are associated with objects (events, committees, etc.) and have visibility levels that control access.

## Charter Principles

- **P2: Default Deny** - All file access requires authentication (except PUBLIC files)
- **P7: Observability** - All file access is logged for audit
- **P9: Fail Closed** - Invalid/missing auth returns 401/403

## Visibility Hierarchy

Files have a visibility level that determines who can access them:

| Visibility | Who Can Access |
|------------|----------------|
| BOARD | Admin, President, VP Activities, Past President |
| OFFICER | Above + Event Chair |
| MEMBER | All authenticated members |
| PUBLIC | Anyone (no auth required) |

## Object Types

Files are associated with objects via `objectType` and `objectId`:

- EVENT
- COMMITTEE
- BOARD_RECORD
- MEETING
- TRANSITION_PLAN
- PAGE
- MEMBER

## API Endpoints

### GET /api/v1/files

Returns paginated list of files the user has access to. Files are filtered by visibility based on the user's role.

**Authentication:** Required (returns 401 if missing)

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page (max 100) |
| objectType | string | - | Filter by object type |
| objectId | string | - | Filter by object ID (requires objectType) |
| mimeType | string | - | Filter by MIME type prefix (e.g., "image/") |

**Response:**

```json
{
  "files": [
    {
      "id": "uuid",
      "filename": "document.pdf",
      "mimeType": "application/pdf",
      "size": 12345,
      "visibility": "MEMBER",
      "createdAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Data Model

### File

```
id           UUID (PK)
objectType   FileObjectType
objectId     UUID
visibility   FileVisibility (default: MEMBER)
filename     String
originalName String
mimeType     String
size         Int (bytes)
storageKey   String (unique, S3 path)
uploadedById UUID (FK -> Member)
deletedAt    DateTime? (soft delete)
createdAt    DateTime
updatedAt    DateTime
```

### FileAccessLog

Audit trail for all file access (Charter P7).

```
id           UUID (PK)
fileId       UUID (FK -> File)
accessedById UUID? (FK -> Member, null for anonymous)
accessType   FileAccessType
ipAddress    String?
userAgent    String?
expiresAt    DateTime? (for signed URLs)
createdAt    DateTime
```

## Authorization Helper

The `@/lib/fileAuthorization` module provides:

- `authorizeFileList(req)` - Authorize list access
- `authorizeFileAccess(req, fileId)` - Authorize single file access
- `getVisibilityFilter(role)` - Get Prisma where clause for visibility
- `canAccessVisibility(role, visibility)` - Check visibility access
- `logFileAccess(...)` - Log access for audit

## Error Responses

| Status | Meaning |
|--------|---------|
| 401 | Authentication missing or invalid |
| 403 | Insufficient permissions or file not found |
| 500 | Internal server error |

Note: 404 is returned as 403 to prevent file enumeration attacks.
