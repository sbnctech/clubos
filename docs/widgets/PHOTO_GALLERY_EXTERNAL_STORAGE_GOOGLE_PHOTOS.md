# Photo Gallery Widget: External Storage Options (Google Photos, SmugMug)  
Last updated: 2025-12-13  

## Purpose  
We want a member-only photo gallery "widget" that integrates with ClubOS and supports:  
- Browsing event albums and photos  
- Filtering by term, committee/activity, and event  
- "My Photos" (photos where a member is identified)  
- "My Events" (events a member attended, optionally cross-linking photos)  
- Face labeling and face search within SBNC context  
- Opt-out from face labeling per member  
- Potentially: hide photos containing a member (not enabled by default, but architecturally possible)  
- Strong access control: only SBNC members can view; only "Photo Editor" role can edit labels  

We want to keep the widget design compatible with different photo storage backends, even if we start with storage on our own server (mail.sbnewcomers.org).  

## Key privacy and governance requirements  
1) Member privacy and access control  
- Photos must be restricted to SBNC members (and possibly specific roles/groups).  
- Lapsed members may remain in the face-identification database for historical labeling and continuity, but they are not necessarily entitled to access member-only photos.  
- Photo access policy should be enforceable by ClubOS (not "security by obscurity").  

2) Editing controls  
- Only users with Photo Editor role can create/edit face labels, face regions, and "member identified in photo" links.  
- General members can view labels (if we choose) but cannot edit them.  
- Members can opt out of face labeling.  

3) Consent model  
- Consent is assumed for members (media release) but we must support opt-out for face labeling.  
- Optional future capability: hide any photo containing an opted-out member (likely expensive and complex; do not assume we will enable).  

## Current reference: legacy widget behavior (functional spec)  
The current gallery widget (legacy) includes:  
- Tabs: All Events, My Photos, My Events  
- Filters: term, committee, type (people/scenic), event; plus layout modes  
- Lightbox overlay that can show names, show info, download photo  
- Uses a backend API for: events list, gallery items, member list, and photo labeling data  

This document is about storage backends, not the UI.  

## Storage backends: what we need from a backend  
Minimum backend capabilities:  
- Store original image files and derived thumbnails  
- Provide stable URLs for images/thumbnails  
- Support access control checks (member-only)  
- Support event/album grouping  
- Support metadata join: event <-> photo <-> faces <-> member identities  

Optional but valuable:  
- CDN-like delivery for performance  
- Built-in browsing UI (as a fallback)  
- Native sharing controls (but must not weaken SBNC access model)  

## Option A: Store photos on SBNC server (recommended initial plan)  
Summary: keep photo binaries and thumbnails under SBNC control (object storage or filesystem), with ClubOS enforcing auth and serving signed URLs.  

Pros  
- Strongest and simplest privacy enforcement (ClubOS is the policy engine).  
- Full control over metadata (faces, labels, opt-outs, hide rules).  
- No dependency on third-party product changes.  

Cons  
- We own storage costs, bandwidth, backups, lifecycle policies, and abuse prevention.  
- Need a scalable storage pattern (avoid "random files in webroot").  

Implementation notes (good architecture)  
- Store originals in private storage, not directly web-accessible.  
- Serve photos via signed URLs (short TTL) or via an authenticated image proxy route.  
- Generate and cache thumbnails (multiple sizes).  
- Maintain all SBNC-specific metadata in our database (see "Data model" below).  

## Option B: Google Photos as the photo repository  
### Reality check: what Google Photos can and cannot do for us  
Google Photos is excellent for personal photo management, but it is not designed to be an embedded, third-party, RBAC-controlled member portal with custom face-label governance.  

Hard problems with Google Photos for SBNC  
1) Access control mismatch  
- Google Photos sharing is not an RBAC system tied to SBNC membership status.  
- "Shared album link" or "anyone with link" does not meet our member-only requirement.  
- Even if we shared to a Google Group, we would still be coupling SBNC membership to Google account management and group membership hygiene.  

2) Metadata injection limitations  
- Google Photos does not provide a clean, supported way for third parties to attach arbitrary private metadata (face boxes, labels, opt-outs, audit history) to photos such that it behaves like "SBNC-private tags" inside Google Photos.  
- At best, we could maintain metadata in our own DB and map it to Google Photos mediaItem IDs. That means functionality "inside Google Photos" will remain limited.  

3) Face labeling inside Google Photos is not ours  
- Google Photos face recognition and labels are user-centric and not under SBNC governance.  
- We need "Photo Editor" role controls, opt-outs, and possibly hide rules. Google Photos does not implement those SBNC-specific policies.  

4) API constraints and churn risk  
- Google Photos APIs have evolved and have constraints about what an app can read/write and how users grant access. Plan for change risk.  

### What *can* work with Google Photos (narrow use cases)  
- As an ingestion source: admins pick photos from a Google Photos account and import them into SBNC storage.  
- As a convenience mirror: photos also live in Google Photos for the photographer/admin workflow, but SBNC member access is served from SBNC storage.  
- As an archive reference: keep a "source of truth" in Google Photos but publish a curated, access-controlled copy for members.  

### Can we store SBNC metadata "inside Google Photos privately"?  
Practical answer: not in the way we need.  
- Google Photos does not offer a general-purpose private metadata store per media item that is hidden from viewers but queryable by our system as "SBNC tags".  
- We can store SBNC metadata in our own DB keyed by Google Photos mediaItem IDs, but that does not make Google Photos itself behave like our labeled member gallery.  
- We could put some information in captions/descriptions, but that is not private and not structured enough for face boxes, opt-outs, and audit logs.  

References (starting points)  
- Google Photos APIs documentation (legacy and current entry points):  
  https://developers.google.com/photos  
- Library API reference example (mediaItems.batchCreate):  
  https://developers.google.com/photos/library/legacy/reference/rest/v1/mediaItems/batchCreate  

## Option C: Google Drive instead of Google Photos  
Google Drive is better than Google Photos for "files as objects" with permissions, but:  
- It is still not a clean RBAC substitute for SBNC membership policy unless we fully manage Drive sharing and identity mapping.  
- It does not solve "face metadata inside the repository"; we still need our DB for faces/labels.  

Drive can be a viable external object store if:  
- We treat Drive like a blob store (files + IDs)  
- We keep metadata in ClubOS DB  
- We enforce access in ClubOS by proxying or signed download mechanisms  
But this is usually inferior to purpose-built object storage (S3/R2/etc.) or our own storage due to complexity and quota limits.  

Reference: Drive upload guide  
- https://developers.google.com/workspace/drive/api/guides/manage-uploads  

## Option D: SmugMug as the photo repository  
SmugMug is designed for photographers and galleries, and it has privacy features that are closer to our needs than Google Photos.  

What SmugMug can do well  
- Host galleries/albums with privacy modes (public, unlisted, password-protected, private sharing).  
- Deliver images efficiently and provide a polished viewing experience.  

But the SBNC-specific problems remain  
- RBAC mismatch: SmugMug privacy controls are not SBNC membership RBAC. We would still need a reliable mapping from "SBNC member in good standing" to "authorized viewer" (which SmugMug does not natively understand).  
- Face labeling: SmugMug does not natively provide SBNC-governed face boxes, opt-outs, and "member identified" views in the way we need. We still need our DB and our widget UI.  

Potential SmugMug-compatible model  
- SmugMug stores images and thumbnails.  
- ClubOS stores all SBNC metadata (faces, labels, opt-outs, event links).  
- ClubOS widget enforces access and uses SmugMug image URLs only after authorization (ideally signed or otherwise protected).  

Risk note  
- If we rely on "unlisted link" or shared passwords, we are not meeting the requirement of member-only access with strong enforcement.  

Reference: SmugMug privacy options overview  
- https://www.smugmughelp.com/hc/en-us/articles/18212288553620-Available-privacy-options  

## Recommended plan (now + future-proofing)  
Decision for now  
- Store photo binaries on SBNC infrastructure (mail server or future object storage).  
- Enforce access and roles in ClubOS.  
- Keep face labeling and all SBNC metadata in the ClubOS database.  

Design for future (pluggable storage)  
- Implement a storage abstraction so photos can later be served from:  
  - Local SBNC storage (filesystem or object storage)  
  - SmugMug (as external gallery host)  
  - Google Drive (not preferred, but possible)  
- Avoid coding the widget to assume a specific host or URL structure.  

## Data model: what must live in ClubOS DB (regardless of storage)  
Core entities (suggested)  
- photo_asset  
  - id (uuid)  
  - storage_backend (local, smugmug, gdrive, etc.)  
  - storage_key (path or remote ID)  
  - mime_type, width, height  
  - created_at, taken_at (if known)  
  - checksum (dedupe)  

- photo_derivative  
  - id  
  - photo_asset_id  
  - kind (thumb_200, thumb_800, etc.)  
  - storage_key (or generated on demand)  

- event_photo_link  
  - event_id  
  - photo_asset_id  

- face_detection  
  - id  
  - photo_asset_id  
  - box (x,y,w,h normalized)  
  - confidence  
  - source (manual, model_v1, etc.)  

- face_identity  
  - id  
  - face_detection_id  
  - member_id (nullable if unknown)  
  - labeled_by_user_id  
  - labeled_at  
  - label_status (confirmed, suggested, rejected)  

- member_privacy_preference  
  - member_id  
  - allow_face_labeling (boolean)  
  - allow_face_search (boolean)  
  - allow_display_name_on_photo (boolean)  
  - allow_photo_hiding (boolean, default false, likely unused)  

- photo_visibility_override (future)  
  - photo_asset_id  
  - hidden_reason  
  - hidden_by_user_id  
  - hidden_at  

Audit and RBAC  
- All label edits should be audited (who, when, what changed).  
- Access checks should be performed in ClubOS for every photo view.  

## What we likely cannot realize "inside Google Photos"  
Even if we used Google Photos as storage, these are not practically achievable within Google Photos itself:  
- SBNC role-based edit permissions for face labels (Photo Editor role).  
- SBNC-wide face labeling and search governed by SBNC opt-out rules.  
- Full audit log of label changes integrated with ClubOS governance.  
- Strong member-only access control based on SBNC membership status (without duplicating identity and access logic into Google).  
- "Hide photos containing this member" enforced for SBNC viewers (without building our own viewer).  

## Conclusion  
- We can architect the widget so photo binaries are stored on our server now, but storage can later be swapped (SmugMug or other) without rewriting the entire feature.  
- Google Photos is not a practical target for "embed our private metadata and replicate our SBNC face-labeling functionality inside Google Photos."  
- SmugMug is a more plausible external host than Google Photos for gallery delivery, but RBAC and SBNC-specific metadata still need to be enforced and stored by ClubOS.  

## SmugMug: can we reuse their UI to reduce software we maintain?

### Summary
Yes, SmugMug can reduce the amount of gallery UI we maintain (album browsing, lightbox viewer, slideshow, theming, delivery/CDN),
but it cannot enforce SBNC-specific governance (RBAC, membership-based access decisions, face labeling opt-outs, audit logs).
If we use SmugMug, ClubOS must remain the system-of-record for identity, RBAC, and SBNC metadata, and should be the enforcement point
for "who can see what."

### What SmugMug can help with
SmugMug can provide:
- A polished album/gallery browsing UI and lightbox viewer.
- Theming and layout configuration on the SmugMug side.
- Hosting and image delivery (including derivatives/resizing and fast delivery).
- Some protective controls (eg, discourage downloads), depending on plan/features.

This can significantly reduce custom UI code compared to a fully bespoke gallery.

### What SmugMug cannot practically do for SBNC
Even if SmugMug hosts the photos and provides the viewer UI, it cannot natively implement:
- ClubOS membership-based access control ("only current SBNC members may view").
- SBNC role-based edit permissions for face labels ("Photo Editor" role).
- SBNC-wide opt-out rules for face labeling and face search.
- An SBNC audit trail for labeling and moderation actions.
- "Hide photos containing member X" enforced for SBNC viewers (even if we keep this disabled by policy).

Therefore, if we embed SmugMug UI directly, we should assume we are giving up strong guarantees that access is controlled solely by ClubOS.

### Viable integration patterns

#### Pattern A (recommended): SmugMug for storage/delivery, ClubOS for policy and metadata
- Photo binaries and albums live in SmugMug.
- ClubOS stores all SBNC metadata:
  - face labels (including status: suggested/confirmed/rejected)
  - member privacy preferences (opt-out controls)
  - audit logs
  - optional photo visibility overrides (future)
- ClubOS provides the member-facing experience:
  - browse events/albums
  - search by member name (if permitted)
  - enforce opt-out rules
  - enforce RBAC and membership gating
- ClubOS can deep-link to SmugMug viewer for specific albums/photos when appropriate, but the "front door" remains ClubOS.

Pros:
- Strong governance and privacy controls remain centralized in ClubOS.
- SmugMug reduces storage/delivery burden and can reduce viewer UI work (if we choose to link-out or selectively embed).

Cons:
- Some UI is still maintained by ClubOS (at least the shell and policy-driven features).

#### Pattern B (lower maintenance, weaker control): ClubOS gate page + embedded SmugMug UI
- ClubOS requires login, then embeds a SmugMug gallery/slideshow.
- SmugMug privacy is set to reduce public exposure (unlisted/password/private).

Pros:
- Minimal UI work for ClubOS.
- Faster time-to-value.

Cons (often a deal-breaker):
- Once a SmugMug link/password is shared, ClubOS is no longer the effective enforcement mechanism.
- SBNC-specific face labeling/search and audit cannot be enforced inside SmugMug.

Conclusion: Pattern B is only acceptable if SBNC is comfortable with weaker access guarantees.

### Design requirement for ClubOS: storage provider abstraction
We should explicitly design the photo system so storage is swappable without rewriting the feature.

Create a "PhotoStorageProvider" interface for:
- putObject/getObject (or signed URL generation)
- listObjects by event/album
- deleteObject (admin-only)
- resolveDisplayUrls for thumbnails and originals

Providers:
- LocalDiskProvider (initial: mail server storage)
- SmugMugProvider (future)
- Other providers (future)

In all cases, SBNC metadata remains in ClubOS tables (face labels, preferences, audit logs).

