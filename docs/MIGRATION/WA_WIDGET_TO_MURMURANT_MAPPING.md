# Wild Apricot Widget to Murmurant Block Mapping

**Last updated:** 2025-12-29

This document maps WA gadgets/widgets to Murmurant blocks and describes which properties can be automatically migrated.

---

## Summary

| Category | Auto-Migrate | Manual Review | Remove/Replace |
|----------|--------------|---------------|----------------|
| Content blocks | ✓ | - | - |
| Media blocks | ✓ | Sometimes | - |
| Navigation | - | - | Replace with native |
| System widgets | - | - | Replace with native |
| Forms | - | - | Replace with native |

---

## Content Blocks

### WaGadgetContent → text/heading/list

**Source:** `gadgetContentEditableArea` class

| WA Property | Murmurant Property | Auto-Migrate |
|-------------|-------------------|--------------|
| Text content | `content` (HTML) | ✓ Yes |
| Alignment (style) | `align` | ✓ Yes |
| Font styling | Normalized to theme | Partial |

**Notes:**
- Legacy `<font>` tags are normalized to theme typography
- Inline styles are preserved where possible
- Complex CSS may lose formatting

### WaGadgetHeadline → heading

**Source:** `WaGadgetHeadline` class

| WA Property | Murmurant Property | Auto-Migrate |
|-------------|-------------------|--------------|
| Heading text | `text` | ✓ Yes |
| Alignment | `align` | ✓ Yes |
| Level (implicit) | `level` | ✓ Yes (detected from h1-h6) |

---

## Media Blocks

### Single Image → image

**Source:** Single `<img>` in content area

| WA Property | Murmurant Property | Auto-Migrate |
|-------------|-------------------|--------------|
| `src` | `src` | ✓ Yes |
| `alt` | `alt` | ✓ Yes |
| Link wrapper | `link` | ✓ Yes |
| Width/height | `size` | ✓ Yes |

### WaGadgetSlideshow (Camera.js) → gallery

**Source:** `camera_wrap` class with Camera.js script

| WA Property | Murmurant Property | Auto-Migrate |
|-------------|-------------------|--------------|
| Image URLs | `images[].src` | ✓ Yes |
| Time (autoplay interval) | - | No (use defaults) |
| Transition effect | - | No (use defaults) |
| Navigation | `lightbox: true` | Partial |

**Notes:**
- Camera.js galleries are detected via `camera_wrap` ID
- Images extracted from child divs with `data-src` or background images
- Layout set to `slider` for animated behavior

### Photo Album → gallery

**Source:** `camera_wrap` with multiple images

| WA Property | Murmurant Property | Auto-Migrate |
|-------------|-------------------|--------------|
| Album images | `images[]` | ✓ Yes |
| Columns (implicit) | `columns: 3` | Default |
| Lightbox | `lightbox: true` | ✓ Yes |

### Video Embed (YouTube/Vimeo) → video

**Source:** `<iframe>` with video provider URL

| WA Property | Murmurant Property | Auto-Migrate |
|-------------|-------------------|--------------|
| Provider URL | `src` | ✓ Yes |
| Provider type | `provider` | ✓ Yes (detected) |
| Width/height | `aspectRatio` | ✓ Yes (calculated) |
| Autoplay | `autoplay` | ✓ Yes (from params) |

**Supported providers:**
- YouTube (`youtube.com`, `youtu.be`)
- Vimeo (`vimeo.com`, `player.vimeo.com`)
- Wistia (`wistia.com`)

### Google Map Embed → map

**Source:** `<iframe>` with Google Maps URL

| WA Property | Murmurant Property | Auto-Migrate |
|-------------|-------------------|--------------|
| Center coords | `centerLat`, `centerLng` | ✓ Yes (extracted) |
| Zoom | `zoom` | ✓ Yes (from q param) |
| Marker | `markers[0]` | ✓ Yes |

---

## Navigation Blocks

### WaGadgetNavigation → REMOVE

**Action:** Remove - replaced by native site navigation

WA navigation gadgets are site chrome, not page content. Murmurant handles navigation through the theme/layout system.

### WaGadgetMenu (menuInner) → REMOVE

**Action:** Remove - replaced by native menu

Menu structure is extracted during theme analysis and applied to the Murmurant site settings, not as page content.

### WaGadgetMobileSwitch → REMOVE

**Action:** Remove - native responsive design

Murmurant uses responsive CSS; no mobile toggle needed.

---

## System Widgets

### WaGadgetLoginForm → REMOVE

**Action:** Remove - replaced by native auth

Murmurant provides passkey-based authentication. Login/logout is handled by the auth system, not page widgets.

### WaGadgetSiteSearch → search

**Source:** `WaGadgetSiteSearch` or `WaGadgetSearch` class

| WA Property | Murmurant Property | Auto-Migrate |
|-------------|-------------------|--------------|
| Placeholder | `placeholder: "Search..."` | Default |
| Scope | `scope: "all"` | Default |

**Notes:**
- WA search typically searches all site content
- Murmurant search block provides similar functionality
- Can be auto-migrated with default settings

### WaGadgetEvents → interactive-calendar

**Source:** `WaGadgetEvents` class

| WA Property | Murmurant Property | Auto-Migrate |
|-------------|-------------------|--------------|
| View (month/list) | `view` | Partial |
| Categories | `categoryFilter` | ✓ Yes |
| Show navigation | `showNavigation: true` | Default |

**Notes:**
- WA events widget shows upcoming events from their API
- Murmurant calendar fetches from native events API
- Set `eventSource: "api"` for live data

### WaGadgetMembershipApplication → REMOVE

**Action:** Remove - replaced by native membership

Membership applications are handled by the Murmurant membership system. Pages with this widget should link to the native application flow.

### WaGadgetDonationForm → REMOVE

**Action:** Remove - replaced by native donations

Donation forms are handled by the Murmurant finance system. Pages with this widget should link to the native donation flow.

---

## Store Widgets (UNSUPPORTED)

### WaGadgetStore → MANUAL

**Action:** Manual review required

WA's online store functionality requires significant manual migration. Options:

1. Link to external store (Shopify, etc.)
2. Use native Murmurant store (if implemented)
3. Replace with static product information

---

## Layout/Formatting

### Empty Spacer → REMOVE

**Source:** Content areas with only whitespace, `&nbsp;`, or `<br>` tags

**Action:** Remove - Murmurant uses explicit spacer blocks

### Content Divider → divider

**Source:** `<hr>` or styled divider elements

| WA Property | Murmurant Property | Auto-Migrate |
|-------------|-------------------|--------------|
| Style | `style` | Partial |
| Width | `width` | Default |

---

## Migration Confidence Levels

| Confidence | Description | Action |
|------------|-------------|--------|
| 0.9-1.0 | Exact match, safe to auto-apply | Auto-migrate |
| 0.7-0.9 | High match, minor adjustments needed | Auto with review |
| 0.5-0.7 | Reasonable match, may need edits | Manual review |
| 0.0-0.5 | Low confidence, significant changes needed | Manual |

---

## Issues That Require Manual Review

1. **Inline scripts** - Cannot migrate JavaScript; need native alternatives
2. **Custom iframes** - Non-video iframes need review (security)
3. **Complex CSS** - Inline styles >100 chars may lose formatting
4. **External resources** - Images/assets may need re-upload
5. **Forms** - Custom forms need native replacement

---

## Trial Migration Results

### Bedford Riding Lanes

- **Auto-migrate:** 40.3% (121 blocks)
- **Remove:** 59.7% (179 blocks)
- **Unknown:** 0 blocks

Top patterns:
- `empty-spacer`: 104 (remove)
- `simple-text`: 82 (auto)
- `wa-system-widget`: 73 (remove)
- `simple-heading`: 38 (auto)

### IWA Chicago

- **Auto-migrate:** 65.5% (417 blocks)
- **Remove:** 34.5% (220 blocks)
- **Unknown:** 0 blocks

Top patterns:
- `simple-text`: 400 (auto)
- `empty-spacer`: 119 (remove)
- `wa-system-widget`: 101 (remove)
- `photo-album`: 2 (auto)

---

## Property Mapping Quick Reference

| WA Widget Class | Murmurant Block | Auto? |
|-----------------|-----------------|-------|
| `gadgetContentEditableArea` | `text` | ✓ |
| `WaGadgetHeadline` | `heading` | ✓ |
| `WaGadgetSlideshow` | `gallery` (slider) | ✓ |
| `WaGadgetPhotoAlbum` | `gallery` | ✓ |
| `camera_wrap` | `gallery` | ✓ |
| YouTube/Vimeo iframe | `video` | ✓ |
| Google Maps iframe | `map` | ✓ |
| `WaGadgetEvents` | `interactive-calendar` | ✓ |
| `WaGadgetSiteSearch` | `search` | ✓ |
| `WaGadgetLoginForm` | Remove (native auth) | - |
| `WaGadgetNavigation` | Remove (native nav) | - |
| `WaGadgetMobileSwitch` | Remove (responsive) | - |
| `WaGadgetStore` | Manual review | ✗ |
| `WaGadgetDonationForm` | Remove (native) | - |
| `WaGadgetMembershipApplication` | Remove (native) | - |
