# JSON-LD Metadata for Public Pages

## Goal

For all publicly visible pages, emit structured metadata (JSON-LD) in addition to basic SEO tags.
This improves search engine understanding and future-proofs content for AI/search surfaces.

## Non-Goals

- No per-tenant customization yet (single-tenant reality).
- No complex schema graphing on day one.
- No manual editing of JSON-LD blobs by admins (generate from canonical models).

## Scope

### Surfaces
- Public website pages (published + public visibility)
- Public events (if/when a public event listing exists)
- Organization identity (Club/tenant) if a tenant model exists later

### JSON-LD types (MVP)
- WebSite
- WebPage
- BreadcrumbList (only if breadcrumbs are present)
- Organization (optional in MVP; required once Tenant exists)

## Requirements

1. JSON-LD is rendered server-side for public pages.
2. JSON-LD matches canonical page fields:
   - slug / URL
   - title
   - description
   - publishedAt
   - breadcrumb (if present)
3. If a page is not public, no JSON-LD is emitted.

## Implementation Notes (Next.js App Router)

- Add a small library: src/lib/seo/jsonld.ts
  - buildWebPageJsonLd(page, siteConfig) => object
  - buildWebSiteJsonLd(siteConfig) => object
  - buildBreadcrumbJsonLd(breadcrumb) => object | null

- In the public page route/layout, inject:
  <script type="application/ld+json">{JSON.stringify(obj)}</script>

## Acceptance Criteria

- For a public published page:
  - View source contains a valid JSON-LD script tag
  - JSON validates as JSON
  - URL + title + description match the page model
- For a non-public page:
  - JSON-LD is absent
- Unit tests:
  - jsonld builder outputs stable JSON for known fixtures
  - does not include undefined/null noise except where required (e.g., publishedAt optional)

## Open Questions
- What is the canonical site URL source? (env BASE_URL vs config model)
- Do we want Organization JSON-LD before Tenant exists?
