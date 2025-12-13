# Worker 4 (W4) — Photo Gallery Widget Contract

**Document Type**: Widget Contract
**Status**: Authoritative
**Audience**: Developers, Tech Chair, Security Reviewers

---

## Preamble

This document defines the strict contract between ClubOS and the Photo Gallery
widget. The widget is a **renderer only**. It has no authority. It makes no
decisions about who can see what. All authorization, privacy enforcement, and
access control are the exclusive responsibility of ClubOS.

Any implementation that violates this contract is non-compliant and must not
be deployed.

---

## Fundamental Principle

```
+------------------+          +------------------+
|     ClubOS       |  ------> |   Photo Widget   |
|  (Authority)     |  Data    |   (Renderer)     |
+------------------+          +------------------+
        |                              |
        v                              v
  - Authentication            - Displays what it receives
  - Authorization             - Emits user interactions
  - Privacy filtering         - Nothing else
  - Data ownership
```

The widget MUST NOT:

- Make access control decisions
- Fetch data directly from external sources
- Cache data beyond the current render cycle
- Store user state
- Bypass ClubOS data filtering

---

## Inputs Provided by ClubOS

The widget receives all data from ClubOS. The widget MUST NOT fetch data from
any other source.

### Required Inputs

| Input | Type | Description |
|-------|------|-------------|
| `galleryId` | string | Unique identifier for this gallery instance |
| `photos` | PhotoItem[] | Array of photo objects to display |
| `viewerContext` | ViewerContext | Current viewer's permissions (read-only) |
| `config` | GalleryConfig | Display configuration |

### PhotoItem Structure

```
PhotoItem {
  id: string               // Unique photo identifier
  src: string              // Pre-signed URL (expires, scoped)
  thumbnailSrc: string     // Pre-signed thumbnail URL
  alt: string              // Accessibility text
  caption: string | null   // Optional caption
  dateTaken: string | null // ISO date string
  eventId: string | null   // Linked event if applicable
  visibleFaces: FaceTag[]  // ONLY faces the viewer may see
}
```

### FaceTag Structure

```
FaceTag {
  id: string               // Tag identifier
  label: string            // Display name (may be redacted)
  boundingBox: BoundingBox // Position on image
  contactId: string | null // Linked contact (may be null if anonymous)
}
```

**Critical**: The `visibleFaces` array contains ONLY the faces that the current
viewer is authorized to see. ClubOS performs this filtering. The widget displays
what it receives. The widget MUST NOT request additional face data.

### ViewerContext Structure

```
ViewerContext {
  isAuthenticated: boolean  // Is user logged in
  canDownload: boolean      // Can download full-resolution
  canShare: boolean         // Can generate share links
  canTagFaces: boolean      // Can add face tags (NOT label permissions)
  canDeletePhotos: boolean  // Can delete photos (admin only)
}
```

The widget uses ViewerContext to show/hide UI affordances (download button, etc.).
The widget MUST NOT use ViewerContext to make access control decisions. ClubOS
has already filtered the data before providing it.

### GalleryConfig Structure

```
GalleryConfig {
  layout: "grid" | "masonry" | "slideshow"
  thumbnailSize: "small" | "medium" | "large"
  showCaptions: boolean
  showDates: boolean
  showFaceTags: boolean
  enableLightbox: boolean
}
```

---

## Events Emitted by Widget

The widget emits events for user interactions. ClubOS handles all resulting
actions. The widget MUST NOT perform actions directly.

### Event Catalog

| Event | Payload | ClubOS Responsibility |
|-------|---------|----------------------|
| `photo:view` | `{ photoId }` | Log view, check permissions |
| `photo:download` | `{ photoId }` | Authorize, generate signed URL, log |
| `photo:share` | `{ photoId }` | Authorize, generate share token |
| `face:tag:add` | `{ photoId, boundingBox }` | Authorize, create tag record |
| `face:tag:remove` | `{ photoId, faceTagId }` | Authorize, remove tag |
| `photo:delete` | `{ photoId }` | Authorize (admin), soft-delete |
| `gallery:paginate` | `{ galleryId, page }` | Fetch next page, filter, return |
| `lightbox:open` | `{ photoId }` | Log, return full-size URL if authorized |
| `lightbox:close` | `{}` | Optional logging |

### Event Flow Example

```
User clicks download button
        |
        v
Widget emits: photo:download { photoId: "abc123" }
        |
        v
ClubOS receives event
        |
        v
ClubOS checks: Is user authenticated? Has download permission?
        |
   YES  |  NO
   |    |    |
   v    |    v
Generate |  Return error
signed  |  Widget shows
URL     |  "Not authorized"
   |    |
   v    |
Return URL to widget
        |
        v
Widget triggers browser download
```

The widget MUST NOT:

- Generate download URLs itself
- Access photo storage directly
- Bypass the event system for any action

---

## Responsibilities Explicitly Excluded from Widget

The following are NOT the widget's responsibility. Any implementation that
attempts these is non-compliant.

### Authentication

The widget does not know who the user is. It receives a `viewerContext` that
describes what the viewer can do. The widget does not verify identity.

- Widget MUST NOT read cookies or tokens
- Widget MUST NOT call authentication APIs
- Widget MUST NOT store session state

### Authorization

The widget does not decide what the user can see. ClubOS filters all data
before providing it to the widget.

- Widget MUST NOT filter photos based on permissions
- Widget MUST NOT hide faces based on privacy settings
- Widget MUST NOT check membership status
- Widget MUST NOT implement access control logic

### Privacy Enforcement

The widget does not enforce privacy. ClubOS enforces privacy by filtering data
before the widget receives it.

- Widget MUST NOT check photo visibility rules
- Widget MUST NOT check face opt-out status
- Widget MUST NOT implement GDPR/privacy logic
- Widget MUST NOT redact or blur faces (ClubOS provides pre-filtered data)

### Membership Checks

The widget does not know about membership. ClubOS knows.

- Widget MUST NOT check if viewer is a member
- Widget MUST NOT check membership level
- Widget MUST NOT implement member-only features

### Face Labeling Permissions

Face labeling involves complex consent rules. The widget does not handle these.

- Widget MUST NOT decide who can label a face
- Widget MUST NOT check face consent status
- Widget MUST NOT store face label mappings
- Widget MUST NOT train facial recognition models

The widget may emit `face:tag:add` events. ClubOS decides whether to allow
the tag based on consent rules.

---

## SmugMug Considerations

SmugMug may be used as a photo storage backend. The widget MUST treat SmugMug
as an untrusted external system.

### SmugMug as Untrusted

SmugMug's native UI, embed codes, and JavaScript libraries are NOT authorized
to make access control decisions for ClubOS data.

```
UNTRUSTED                      TRUSTED
+------------------+           +------------------+
| SmugMug UI       |           | ClubOS           |
| SmugMug Embeds   |           | ClubOS Widget    |
| SmugMug API      |           |                  |
+------------------+           +------------------+
        |                              |
        v                              v
  May leak data                 Enforces access
  No ClubOS auth                Uses pre-signed URLs
  Wrong privacy model           ClubOS-filtered data
```

### Acceptable Patterns

| Pattern | Description | Why Acceptable |
|---------|-------------|----------------|
| Pre-signed URLs | ClubOS generates time-limited, scoped URLs to SmugMug images | ClubOS controls access; URL expires |
| Proxied images | ClubOS fetches from SmugMug, serves to widget | ClubOS verifies auth before proxy |
| ClubOS thumbnail cache | ClubOS caches thumbnails, serves directly | ClubOS controls cache population |

### Unacceptable Patterns

| Pattern | Description | Why Unacceptable |
|---------|-------------|------------------|
| Direct SmugMug embed | `<iframe src="smugmug.com/gallery/...">` | Bypasses ClubOS auth entirely |
| SmugMug JavaScript SDK | Using SmugMug's JS library in widget | SmugMug SDK may expose all photos |
| Public SmugMug gallery links | Linking to SmugMug's public gallery UI | No ClubOS access control |
| SmugMug API calls from widget | Widget fetches from SmugMug API directly | Widget has no auth context |
| Hotlinking SmugMug URLs | Using permanent SmugMug URLs | URLs don't expire; no access logging |

### SmugMug URL Requirements

When ClubOS generates URLs pointing to SmugMug:

- URLs MUST be pre-signed with expiration (max 1 hour for full-size, 24 hours for thumbnails)
- URLs MUST be scoped to specific image
- URLs MUST NOT be reusable after expiration
- URL generation MUST be logged with viewer identity

### SmugMug Sync Boundary

```
SmugMug (Storage)              ClubOS (Authority)
+------------------+           +------------------+
| Stores photos    | <-------- | Syncs metadata   |
| Generates URLs   |           | Stores access    |
| (dumb storage)   |           |   rules          |
+------------------+           | Enforces privacy |
                               | Logs access      |
                               +------------------+
```

SmugMug knows nothing about:

- ClubOS users
- Membership status
- Face consent
- Photo visibility rules

SmugMug is a storage bucket with a URL generator. All intelligence lives in ClubOS.

---

## Security Invariants

These invariants MUST hold at all times. Violation indicates a security defect.

### Invariant 1: No Direct External Fetch

```
INVARIANT: Widget network requests go ONLY to ClubOS origin
```

The widget MUST NOT make requests to:

- smugmug.com
- Any third-party CDN not proxied by ClubOS
- Any external API

### Invariant 2: Data Comes Pre-Filtered

```
INVARIANT: Widget receives only data the viewer is authorized to see
```

The widget MUST NOT:

- Request "all photos" and filter client-side
- Request face data beyond what's in `visibleFaces`
- Cache data across sessions

### Invariant 3: Actions Go Through Events

```
INVARIANT: All user actions emit events; widget does not perform actions directly
```

The widget MUST NOT:

- Call APIs directly
- Modify data directly
- Store state that persists beyond the current render

### Invariant 4: No Credential Handling

```
INVARIANT: Widget never touches authentication credentials
```

The widget MUST NOT:

- Read cookies
- Store tokens
- Access localStorage for auth data
- Pass credentials to external systems

---

## Failure Modes

When something goes wrong, the widget fails safe.

| Failure | Widget Behavior | ClubOS Responsibility |
|---------|-----------------|----------------------|
| No photos provided | Show "No photos available" | Return empty array, not error |
| Photo URL expired | Show placeholder, emit `photo:error` | Generate new URL on retry |
| Event delivery fails | Retry with exponential backoff, then show error | Monitor for failures |
| Invalid viewerContext | Disable all actions, show read-only | Never provide invalid context |
| Network error | Show offline indicator | Provide retry mechanism |

The widget MUST NOT:

- Attempt to "fix" authorization errors by retrying with different params
- Cache expired data and serve it
- Fall back to direct external fetches

---

## Audit Requirements

All widget interactions are logged by ClubOS.

### What ClubOS Logs

| Event | Logged Data |
|-------|-------------|
| Gallery load | viewerId, galleryId, photoCount, timestamp |
| Photo view | viewerId, photoId, timestamp |
| Photo download | viewerId, photoId, IP, timestamp |
| Face tag add | viewerId, photoId, tagId, timestamp |
| Face tag remove | viewerId, photoId, tagId, reason, timestamp |
| Photo delete | viewerId (admin), photoId, timestamp |

### What Widget MUST NOT Log

- User identity (widget doesn't know it)
- Authentication tokens
- Face recognition data
- Any PII

---

## Compliance Checklist

Before deployment, verify:

- [ ] Widget fetches data ONLY from ClubOS origin
- [ ] Widget does not embed SmugMug iframes or use SmugMug SDK
- [ ] Widget does not filter photos based on permissions (data arrives pre-filtered)
- [ ] Widget does not check authentication status (receives viewerContext)
- [ ] Widget emits events for all actions (does not perform actions directly)
- [ ] Widget does not cache data across page loads
- [ ] Widget does not store credentials
- [ ] Widget handles missing/invalid data gracefully
- [ ] Widget shows appropriate error states without exposing system details

---

## Related Documents

- [RBAC Overview](../rbac/AUTH_AND_RBAC.md)
- [External Systems Spec](../external/EXTERNAL_SYSTEMS_AND_SSO_SPEC.md)
- [Privacy Policy](../../PRIVACY.md) (if exists)

---

*This contract is authoritative. Implementations that deviate from this contract
are non-compliant and must not be deployed.*

*Document maintained by ClubOS development team. Last updated: December 2024*
