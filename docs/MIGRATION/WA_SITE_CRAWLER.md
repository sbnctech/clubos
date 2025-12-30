# Wild Apricot Site Crawler

The WA Site Crawler is a migration discovery tool that scans Wild Apricot public pages to assess content migration readiness.

## Purpose

When evaluating a Wild Apricot site for migration, this crawler:

- Discovers all publicly accessible pages
- Identifies custom HTML blocks that need manual review
- Detects embeds (YouTube, Vimeo, Google Maps, etc.) and classifies them
- Finds external images that need re-uploading
- Detects scripts/tracking pixels that cannot migrate
- Produces a migration readiness assessment

## Usage

```bash
npx tsx scripts/migration/crawl-wa-site.ts <site-url> [options]
```

### Options

| Option | Default | Description |
|--------|---------|-------------|
| `--max-pages=N` | 50 | Maximum pages to crawl |
| `--depth=N` | 3 | Maximum link depth from homepage |
| `--delay=N` | 1000 | Delay between requests in ms |
| `--output=FILE` | - | Save JSON report to file |
| `--quiet` | - | Only output summary |

### Examples

```bash
# Basic crawl
npx tsx scripts/migration/crawl-wa-site.ts https://example.wildapricot.org

# Limited crawl for quick assessment
npx tsx scripts/migration/crawl-wa-site.ts https://example.wildapricot.org --max-pages=10 --depth=2

# Save full report to JSON
npx tsx scripts/migration/crawl-wa-site.ts https://example.org --output=./reports/example-crawl.json

# Quick summary only
npx tsx scripts/migration/crawl-wa-site.ts https://example.org --quiet
```

## Output

### Console Report

The crawler produces a detailed console report with:

1. **Summary Statistics**
   - Pages discovered and crawled
   - Custom HTML blocks count
   - Scripts and forms detected
   - Embed counts by type

2. **Page Details**
   - Title
   - Sections, embeds, images per page
   - Custom HTML block count

3. **Migration Readiness Assessment**
   - Content that can auto-migrate (static pages, allowlisted embeds)
   - Content requiring manual review (custom HTML, non-allowlisted embeds)
   - Content that cannot migrate (scripts, unsupported embeds)

### JSON Report

When using `--output`, the full report includes:

```typescript
interface CrawlReport {
  config: {
    baseUrl: string;
    maxPages: number;
    maxDepth: number;
  };
  crawledAt: string;
  duration: number;
  pagesDiscovered: number;
  pagesCrawled: number;
  pages: PageContent[];
  summary: {
    totalSections: number;
    totalCustomHtmlBlocks: number;
    totalEmbeds: number;
    embedsByDomain: Record<string, number>;
    embedsByClassification: Record<string, number>;
    scriptsDetected: number;
    formsDetected: number;
    totalImages: number;
    externalImages: number;
    externalStylesheets: string[];
  };
  errors: CrawlError[];
}
```

## Embed Classification

Embeds are classified into three categories:

### Allowlisted (Auto-Migrate)

These embed sources are on our SafeEmbed allowlist and migrate automatically:

- YouTube (`youtube.com`, `youtube-nocookie.com`)
- Vimeo (`player.vimeo.com`)
- Google Maps (`google.com/maps`)
- Spotify (`open.spotify.com`)
- SoundCloud (`soundcloud.com`)
- CodePen (`codepen.io`)
- Google Forms (`docs.google.com/forms`)
- Canva (`canva.com`)

### Manual Review Required

These sources may be safe but require manual verification:

- Google Drive (`drive.google.com`)
- Dropbox embeds
- Microsoft embeds
- Generic `docs.google.com` content

### Unsupported

These patterns cannot migrate:

- Wild Apricot system widgets (`wildapricot.org`)
- Unknown or potentially risky sources

## What the Crawler Detects

### Custom HTML Blocks

Wild Apricot uses a pattern like:

```html
<div class="contentBox" id="contentBox_...">
```

These are custom content blocks that need conversion to our block system. The crawler counts these to estimate migration effort.

### Scripts

Inline scripts and external script tags are detected. These typically include:

- Analytics (Google Analytics, Facebook Pixel)
- Chat widgets
- Custom JavaScript
- Tracking pixels

Scripts cannot be migrated and require native Murmurant alternatives.

### Forms

HTML forms are detected but NOT counted as embeds since WA forms are typically system-generated membership/event forms that will be replaced by native Murmurant forms.

### Images

- **Internal images**: Hosted on the WA domain, migrate automatically
- **External images**: Hosted elsewhere, need re-uploading or URL preservation

## Authentication

For real customer migrations, the crawler accepts WA credentials to access the full site:

```bash
npx tsx scripts/migration/crawl-wa-site.ts https://example.wildapricot.org \
  --wa-account-id=12345 \
  --wa-api-key=YOUR_API_KEY
```

With authentication, the crawler can access:

- Member-only pages
- Admin configuration pages
- Draft/unpublished content
- Email templates
- Form definitions

**Note**: The sample crawls in this repo used public-only access for testing purposes.

## Limitations

1. **JavaScript Rendering**: The crawler uses HTTP requests, not a browser. Content rendered client-side by JavaScript won't be captured.

2. **Rate Limiting**: Wild Apricot may rate-limit aggressive crawling. Use appropriate delays (default 1000ms).

3. **Binary Assets**: The crawler catalogs images but doesn't download them. Use the image migration tool for asset transfer.

## Integration with Migration Workflow

This crawler is part of the Presentation Discovery phase of migration:

1. **Run crawler** on prospect site
2. **Review report** to estimate migration effort
3. **Identify blockers** (unsupported embeds, heavy scripting)
4. **Plan manual review** for custom HTML blocks
5. **Quote migration** based on complexity

## Files

- `scripts/migration/crawl-wa-site.ts` - CLI runner
- `scripts/migration/lib/wa-crawler.ts` - Core crawler library
- `docs/migration/WA_SITE_CRAWLER.md` - This documentation
