# Intent Manifest Schema

This document defines the intermediate representation for capturing organizational presentation intent during Wild Apricot migration.

**Related:** Epic #306 (Assisted Organizational Representation Reconstruction)

---

## Overview

The Intent Manifest captures **what we observe** about an organization's WA presentation, separate from **what we generate** in Murmurant. This separation enables:

- Re-rendering without re-extraction
- Diffing between extraction runs
- Audit trail of observations vs. outputs
- Human review of interpretations

---

## Schema Definition

```typescript
/**
 * Root container for all observed organizational intent
 */
interface IntentManifest {
  // Manifest metadata
  manifestId: string;           // UUID
  version: number;              // Schema version (currently 1)
  extractedAt: string;          // ISO timestamp
  extractedBy: string;          // Operator or system ID
  sourceType: "wild_apricot";   // Source platform (extensible)
  sourceUrl: string;            // WA site URL

  // Extraction status
  status: ManifestStatus;
  completenessScore: number;    // 0-100, how much was captured
  warnings: ExtractionWarning[];

  // Observed intent
  identity: OrganizationIdentity;
  navigation: NavigationIntent[];
  pages: PageIntent[];
  assets: AssetReference[];
  styles: StyleObservations;
}

type ManifestStatus =
  | "extracting"      // Extraction in progress
  | "extracted"       // Extraction complete, awaiting review
  | "reviewed"        // Human reviewed observations
  | "committed"       // Used to generate output
  | "abandoned";      // Customer aborted

/**
 * Core organizational identity observations
 */
interface OrganizationIdentity {
  observedName: string;           // Organization name as displayed
  observedTagline?: string;       // Subtitle/tagline if present
  primaryColor?: string;          // Dominant color observed (hex)
  secondaryColor?: string;        // Accent color observed
  logoUrl?: string;               // Logo asset reference
  faviconUrl?: string;            // Favicon if present
  socialLinks: SocialLink[];      // Observed social media links
}

interface SocialLink {
  platform: string;   // facebook, instagram, etc.
  url: string;
  observedFrom: string;  // Where we found this (footer, header, etc.)
}

/**
 * Navigation structure observations
 */
interface NavigationIntent {
  navId: string;                  // Unique ID for this nav element
  observedLabel: string;          // Text shown to users
  observedPosition: number;       // Order in navigation
  navType: NavType;
  targetUrl?: string;             // Where it links (if link)
  children: NavigationIntent[];   // Nested items
  observedFrom: string;           // Where we found this (header, footer, sidebar)
}

type NavType =
  | "page_link"       // Links to internal page
  | "external_link"   // Links to external URL
  | "dropdown"        // Container for nested items
  | "action"          // Login, register, etc.
  | "unknown";

/**
 * Page content observations
 */
interface PageIntent {
  pageId: string;                 // Unique ID
  observedTitle: string;          // Page title
  observedUrl: string;            // URL path in WA
  pageType: PageType;             // Classification
  sections: SectionIntent[];      // Content sections
  metadata: PageMetadata;
}

type PageType =
  | "home"            // Homepage
  | "about"           // About/info pages
  | "events"          // Event listing
  | "members"         // Member directory or info
  | "contact"         // Contact page
  | "content"         // Generic content page
  | "form"            // Registration or contact form
  | "unknown";

interface SectionIntent {
  sectionId: string;
  observedHeading?: string;       // Section heading if present
  contentType: ContentType;
  observedContent: string;        // Raw observed content (HTML or text)
  position: number;               // Order on page
  assets: string[];               // Asset IDs referenced
}

type ContentType =
  | "text"            // Paragraph text
  | "heading"         // Heading element
  | "image"           // Image content
  | "gallery"         // Multiple images
  | "video"           // Embedded video
  | "form"            // Input form
  | "list"            // Bulleted/numbered list
  | "table"           // Tabular data
  | "calendar"        // Calendar widget
  | "member_widget"   // WA member-specific widget
  | "unknown";

interface PageMetadata {
  observedDescription?: string;   // Meta description
  observedKeywords?: string[];    // Meta keywords
  lastModified?: string;          // If detectable
  isPublic: boolean;              // Public vs member-only
}

/**
 * Asset references
 */
interface AssetReference {
  assetId: string;                // Unique ID
  sourceUrl: string;              // Original URL in WA
  assetType: AssetType;
  filename?: string;              // Original filename
  mimeType?: string;              // Detected MIME type
  dimensions?: { width: number; height: number };
  capturedLocally: boolean;       // Whether we downloaded a copy
  localPath?: string;             // Local cache path if captured
}

type AssetType =
  | "image"
  | "document"
  | "video"
  | "audio"
  | "unknown";

/**
 * Visual style observations
 */
interface StyleObservations {
  // Colors observed
  colors: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
  };

  // Typography observations
  fonts: {
    heading?: string;     // Font family for headings
    body?: string;        // Font family for body text
  };

  // Layout patterns
  layoutPattern: LayoutPattern;

  // Raw CSS if captured
  capturedCss?: string;
}

type LayoutPattern =
  | "centered"        // Centered content, fixed width
  | "full_width"      // Edge-to-edge content
  | "sidebar_left"    // Content with left sidebar
  | "sidebar_right"   // Content with right sidebar
  | "unknown";

/**
 * Extraction warnings and notes
 */
interface ExtractionWarning {
  code: WarningCode;
  message: string;
  affectedElements: string[];     // IDs of affected manifest elements
  severity: "info" | "warning" | "error";
}

type WarningCode =
  | "member_only_content"     // Content behind login
  | "dynamic_content"         // JS-rendered content
  | "missing_asset"           // Asset URL not accessible
  | "unrecognized_widget"     // WA widget we don't understand
  | "partial_extraction"      // Incomplete due to error
  | "rate_limited";           // Hit WA rate limits
```

---

## Storage Format

Manifests are stored as JSON files in `data/migration/manifests/`:

```
data/migration/manifests/
├── {org-slug}/
│   ├── manifest-{timestamp}.json     # Complete manifest
│   ├── assets/                       # Cached assets
│   │   ├── {asset-id}.{ext}
│   │   └── ...
│   └── history/                      # Previous versions
│       └── manifest-{timestamp}.json
```

---

## Versioning

Each extraction creates a new manifest version. The manifest includes a `version` field for schema compatibility and `extractedAt` for temporal ordering.

**Version history:**
- v1 (2025-12-30): Initial schema

---

## Usage Patterns

### Extraction Phase
```typescript
// Crawler populates manifest during extraction
const manifest = createEmptyManifest(orgSlug, waUrl);
for (const page of discoveredPages) {
  manifest.pages.push(extractPageIntent(page));
}
manifest.status = "extracted";
saveManifest(manifest);
```

### Review Phase
```typescript
// Operator reviews and may annotate
const manifest = loadManifest(orgSlug);
// UI presents observations for review
// Operator marks reviewed
manifest.status = "reviewed";
saveManifest(manifest);
```

### Generation Phase
```typescript
// Generator reads intent, creates Murmurant content
const manifest = loadManifest(orgSlug);
const suggestions = generateSuggestions(manifest);
// See SUGGESTION_REVIEW_WORKFLOW.md for next steps
```

---

## Invariants

1. **Manifest is immutable after extraction** - modifications create new versions
2. **Observations are raw** - no interpretation in manifest, only observation
3. **Asset references are stable** - assetId never changes for same source URL
4. **Status transitions are one-way** - cannot go from "committed" back to "extracting"

---

## Related Documents

- [SUGGESTION_REVIEW_WORKFLOW.md](./SUGGESTION_REVIEW_WORKFLOW.md) - How suggestions are reviewed
- Epic #306 - Parent epic
- Epic #301 - Cutover Rehearsal Mode (commit/abort mechanics)
