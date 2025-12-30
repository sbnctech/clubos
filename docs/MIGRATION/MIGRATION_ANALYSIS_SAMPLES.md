# Migration Analysis: Sample WA Sites

Analysis of two Wild Apricot sites crawled on 2025-12-29 to assess Murmurant migration capabilities.

## Sites Analyzed

| Site | Pages Crawled | Custom HTML | Embeds | Scripts | Images |
|------|---------------|-------------|--------|---------|--------|
| Bedford Riding Lanes | 10 | 153 | 0 | 4 | 36 (0 external) |
| IWA Chicago | 10 | 304 | 2 | 4 | 85 (3 external) |

## Migration Capability Assessment

### What We CAN Migrate Automatically

| Content Type | Status | Notes |
|--------------|--------|-------|
| Static page structure | Ready | Page titles, URLs, navigation structure |
| Internal images | Ready | Images hosted on WA domain |
| Allowlisted embeds | Ready | YouTube, Vimeo, Google Maps detected on allowlist |
| Member data | Ready | Via WA API (requires credentials) |
| Event data | Ready | Via WA API (requires credentials) |
| Registration data | Ready | Via WA API (requires credentials) |

### What Requires Manual Review

| Content Type | Count (Bedford) | Count (IWA) | Effort |
|--------------|-----------------|-------------|--------|
| Custom HTML blocks | 153 | 304 | High - content conversion |
| External images | 0 | 3 | Low - re-upload or preserve URL |
| External stylesheets | 1 (FontAwesome) | 0 | Medium - use system icons |

### What Cannot Migrate

| Content Type | Impact | Alternative |
|--------------|--------|-------------|
| Analytics scripts | Low | Native Murmurant analytics |
| Tracking pixels | Low | Remove or use native integrations |
| WA system widgets | N/A | Native Murmurant features |
| WA forms | N/A | Native membership/event forms |

## Key Findings

### 1. Custom HTML Is the Migration Challenge

Both sites have significant custom HTML content (153-304 blocks in just 10 pages). Full site migration would involve:

- Converting custom HTML to Murmurant block format
- Preserving layout structure where possible
- Reviewing for embedded scripts or styles

**Recommendation**: Build a HTML-to-blocks converter that handles common patterns.

### 2. Embed Coverage Is Good

The 2 embeds found (Vimeo) are on our SafeEmbed allowlist. No unsupported embed providers detected. Sites using standard video/map embeds will migrate cleanly.

### 3. Image Migration Is Straightforward

Most images are hosted on the WA domain and can be downloaded/re-uploaded. Only 3 external images found across both sites.

### 4. Scripts Are Analytics Only

The 4 scripts detected per site are likely:

- Google Analytics
- Facebook Pixel
- Font loading
- WA system scripts

None are custom functionality that would block migration.

### 5. Forms Are System-Generated

The forms detected (11-14 per site) are WA system forms for:

- Login/registration
- Event signup
- Member profile
- Donations

These are replaced by native Murmurant equivalents, not migrated.

## Migration Complexity Estimates

Based on custom HTML block density:

| Pages | Blocks (est.) | Migration Effort |
|-------|---------------|------------------|
| 10-20 | 150-600 | Light (1-2 hours manual review) |
| 20-50 | 600-1500 | Medium (4-8 hours manual review) |
| 50-100 | 1500-3000 | Heavy (1-2 days manual review) |
| 100+ | 3000+ | Enterprise (scoped engagement) |

## Gaps to Address

### High Priority

1. **HTML-to-Blocks Converter**: Automated conversion of common HTML patterns to our block system

2. **Image Migration Tool**: Download WA-hosted images and re-upload to Murmurant storage

3. **Style Extraction**: Parse inline styles and classes to map to theme tokens

### Medium Priority

4. **Layout Detection**: Identify common WA layout patterns (columns, grids) for automatic conversion

5. **Link Rewriting**: Update internal links to new URL structure

### Low Priority

6. **CSS Analysis**: Extract custom CSS from pages for theme generation

7. **Font Detection**: Identify font families for theme configuration

## Next Steps

1. Build HTML-to-blocks converter for common patterns
2. Create image migration pipeline
3. Test full-site crawl on a real prospect
4. Develop migration preview feature for sales demos
