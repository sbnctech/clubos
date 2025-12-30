# Migration Scraper Test Results

**Date:** 2025-12-29

This document summarizes the trial migration results across 9 Wild Apricot reference sites.

---

## Summary Table

| Site | Auto-Migrate | Remove | Unknown | Rate |
|------|--------------|--------|---------|------|
| Bedford Riding Lanes | 121 | 179 | 0 | 40.3% |
| IWA Chicago | 417 | 220 | 0 | 65.5% |
| AFRA Association | 430 | 237 | 0 | 64.5% |
| GRC Dog Sports | 517 | 236 | 0 | 68.7% |
| Villa Grande | 243 | 252 | 0 | 49.1% |
| NBCFAE | 450 | 96 | 0 | 82.4% |
| Six Corners Chamber | 165 | 105 | 0 | 61.1% |
| CTAM | 387 | 153 | 0 | 71.7% |
| NACPO | 348 | 119 | 0 | 74.5% |
| **TOTAL** | **3,078** | **1,597** | **0** | **65.8%** |

---

## Key Findings

### Pattern Detection

All 9 sites achieved **0 unknown blocks**, meaning every content block was recognized by the pattern analyzer.

### Detected Patterns (by frequency)

1. **simple-text** - Regular paragraph content → Text block
2. **empty-spacer** - Empty/whitespace blocks → Remove
3. **wa-system-widget** - Login, nav, mobile, search → Remove (native replacements)
4. **simple-heading** - Heading tags (h1-h6) → Heading block
5. **photo-album** - Camera.js galleries → Gallery widget
6. **contact-info** - Address/phone/email → Contact widget
7. **list-content** - Bulleted/numbered lists → List block
8. **link-list** - Multiple links → Links block
9. **embed-video** - YouTube/Vimeo iframes → Video block
10. **call-to-action** - Styled buttons → Button block
11. **single-image** - Individual images → Image block

### Content Categories

**Auto-Migratable (65.8%)**
- Text content (paragraphs, headings)
- Media (images, galleries, videos)
- Lists and links
- CTA buttons

**Removable (34.2%)**
- Empty spacers
- WA system widgets (replaced by native features)
- Navigation elements (handled by site layout)

### Issues Detected

| Issue | Occurrences |
|-------|-------------|
| Legacy `<font>` tags | Common - normalized to theme |
| Forms | Common - WA system forms replaced by native |
| Inline scripts | Some - need native alternatives |
| External resources | Some - may need re-upload |
| Complex inline styles | Rare - may lose formatting |
| Iframes (non-video) | Rare - needs review |

---

## Patterns Added During Testing

The following patterns were added to improve detection:

1. **blog-content** - Blog post body content (`blogPostBody`, `gadgetBlogEditableArea`)
2. **gadget-title** - WA styled titles (`gadgetStyleTitle`, `gadgetTitleH*`)
3. **heading-tags** - Explicit h1-h6 tags in content
4. **fallback-text** - Plain paragraph content without styling markers

---

## Automation Rates by Site Type

### High Automation (70%+)
- NBCFAE (82.4%) - Simple text-heavy site
- NACPO (74.5%) - Government/association site
- CTAM (71.7%) - Trade association site

### Medium Automation (60-70%)
- GRC Dog Sports (68.7%)
- IWA Chicago (65.5%)
- AFRA Association (64.5%)
- Six Corners (61.1%)

### Lower Automation (40-60%)
- Villa Grande (49.1%) - Community site with more complex layouts
- Bedford Riding Lanes (40.3%) - Heavy on system widgets

---

## Recommendations

1. **High-automation sites** - Good candidates for automated migration with minimal manual review

2. **Medium-automation sites** - Run automated migration, then manual pass for remaining content

3. **Sites with many system widgets** - Focus on configuring native replacements before migration

4. **Sites with scripts** - Identify script functionality and implement native alternatives

---

## Next Steps

1. Continue testing more reference sites
2. Improve theme extraction for sites with "not detected" colors
3. Add detection for any new patterns encountered
4. Build automated block conversion pipeline
