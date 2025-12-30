<!--
  Copyright © 2025 Murmurant, Inc. All rights reserved.
-->

# Page & Email Composition: Additional Requirements

What else the system needs beyond layout, blocks, and preview.

---

## High Priority (Should Include)

### 1. Version History & Revisions

**Problem:** Users make mistakes, want to see what changed, need to restore previous versions.

**Requirements:**
- Auto-save drafts (every 30 seconds or on change)
- Version history (last 10-20 versions)
- Compare versions (diff view)
- Restore previous version
- "Last edited by [name] at [time]"

```
┌─────────────────────────────────────────────────────────────┐
│  Version History                                            │
├─────────────────────────────────────────────────────────────┤
│  ● Current draft                              Just now      │
│  ○ Auto-saved                                 2 min ago     │
│  ○ Published version                          Jan 15, 3pm   │
│  ○ Susan Martinez edited                      Jan 14, 2pm   │
│  ○ Created                                    Jan 10, 9am   │
│                                                             │
│  [Compare Selected]  [Restore Selected]                     │
└─────────────────────────────────────────────────────────────┘
```

---

### 2. Media Library

**Problem:** Users need to upload, organize, and reuse images across pages.

**Requirements:**
- Upload images (drag-drop, file picker)
- Auto-resize and optimize for web
- Organize by folder/tag
- Search media library
- See where image is used
- Alt text management
- Replace image across all uses

```
┌─────────────────────────────────────────────────────────────┐
│  Media Library                              [Upload]        │
├─────────────────────────────────────────────────────────────┤
│  🔍 Search...                    [All ▾] [Recent ▾]        │
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │
│  │  [img]  │ │  [img]  │ │  [img]  │ │  [img]  │          │
│  │ wine.jpg│ │ hike.jpg│ │ logo.png│ │ event.jp│          │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │
│                                                             │
│  Selected: wine-tasting-2024.jpg                           │
│  Size: 1.2 MB → 245 KB (optimized)                         │
│  Used on: 3 pages                                           │
│  Alt text: "Members enjoying wine tasting event"            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 3. SEO & Social Sharing

**Problem:** Pages need proper meta tags for search engines and social sharing.

**Requirements:**
- Page title (separate from H1)
- Meta description
- Open Graph image
- Preview how it looks in Google/Facebook/Twitter
- Auto-generate from content (with override)

```
┌─────────────────────────────────────────────────────────────┐
│  SEO & Sharing                                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Search Engine Preview:                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  January Wine Tasting Event | Newcomers Club        │   │
│  │  www.newcomersclub.org/events/wine-tasting          │   │
│  │  Join us for an evening of wine tasting at          │   │
│  │  Sunstone Winery. Open to all members...            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Page Title: [January Wine Tasting Event              ]     │
│  Description: [Join us for an evening of wine...      ]     │
│               142/160 characters                            │
│                                                             │
│  Social Image: [wine-tasting.jpg] [Change]                 │
│                                                             │
│  Facebook Preview:          Twitter Preview:                │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │ [image]          │      │ [image]          │            │
│  │ Title            │      │ Title            │            │
│  │ Description...   │      │ newcomersclub.org│            │
│  └──────────────────┘      └──────────────────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 4. Accessibility Checks

**Problem:** Pages should be accessible to all users, including those using screen readers.

**Requirements:**
- Alt text warnings for images
- Heading hierarchy check (no skipping levels)
- Color contrast warnings
- Link text check ("click here" is bad)
- Accessibility score/checklist

```
┌─────────────────────────────────────────────────────────────┐
│  Accessibility Check                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ⚠️ 2 issues found                                          │
│                                                             │
│  Images                                                     │
│  ├─ ⚠️ Image "DSC_0234.jpg" missing alt text     [Fix]     │
│  └─ ✓ 4 images have alt text                               │
│                                                             │
│  Headings                                                   │
│  └─ ✓ Heading hierarchy is correct                         │
│                                                             │
│  Links                                                      │
│  ├─ ⚠️ "Click here" is not descriptive          [Fix]     │
│  └─ ✓ 3 links have descriptive text                        │
│                                                             │
│  Color Contrast                                             │
│  └─ ✓ All text meets WCAG AA standards                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 5. Publish Scheduling

**Problem:** Users want to schedule content to publish/unpublish at specific times.

**Requirements:**
- Schedule publish date/time
- Schedule unpublish (expiration)
- Calendar view of scheduled content
- Email send scheduling

```
┌─────────────────────────────────────────────────────────────┐
│  Publishing                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Status: Draft                                              │
│                                                             │
│  ○ Publish immediately                                      │
│  ● Schedule for later                                       │
│     Date: [January 20, 2025]  Time: [9:00 AM ▾]            │
│                                                             │
│  ☐ Auto-unpublish                                          │
│     Remove from site after: [Date picker]                   │
│                                                             │
│  Visibility:                                                │
│  ○ Public (everyone)                                        │
│  ● Members only                                             │
│  ○ Specific roles: [Select roles...]                        │
│                                                             │
│                              [Save Draft]  [Schedule]       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 6. Copy & Duplicate

**Problem:** Users want to copy pages, blocks, or reuse content.

**Requirements:**
- Duplicate page (creates draft copy)
- Copy block(s) between pages
- "Save as template" from existing page
- Copy from another page (block picker)

```
┌─────────────────────────────────────────────────────────────┐
│  Page Actions                                       [⋯]     │
│  ├─ Duplicate page                                          │
│  ├─ Save as template                                        │
│  ├─ Copy blocks from another page                           │
│  ├─ Export as PDF                                           │
│  └─ Delete page                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 7. Conditional Content (Audience Targeting)

**Problem:** Different visitors should see different content (members vs public, by role).

**Requirements:**
- Block-level visibility rules
- "Show only to members"
- "Show only to [role]"
- "Show only to [group members]"
- Preview as different user types

```
┌─────────────────────────────────────────────────────────────┐
│  Block Settings: Member Directory                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Visibility                                                 │
│                                                             │
│  Who can see this block?                                    │
│                                                             │
│  ○ Everyone                                                 │
│  ● Logged-in members only                                   │
│  ○ Specific roles:                                          │
│     ☐ Board Members                                         │
│     ☐ Committee Chairs                                      │
│     ☐ Activity Group Coordinators                           │
│  ○ Members of specific groups:                              │
│     ☐ Book Club                                             │
│     ☐ Wine Tasting                                          │
│                                                             │
│  Preview as: [Member ▾]                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 8. Embed Support

**Problem:** Users want to embed external content (videos, maps, social posts).

**Requirements:**
- YouTube/Vimeo embed
- Google Maps embed
- Social media posts (Instagram, Facebook)
- Generic iframe embed (with allowlist)
- oEmbed auto-detection (paste URL, auto-embed)

```
┌─────────────────────────────────────────────────────────────┐
│  Add Embed                                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Paste a URL:                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  https://youtube.com/watch?v=abc123                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Detected: YouTube Video                                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │            [Video Preview]                          │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Or choose:                                                 │
│  [📺 Video]  [🗺️ Map]  [📱 Social]  [</> Code]             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Medium Priority (Should Consider)

### 9. Keyboard Shortcuts

For power users:

| Shortcut | Action |
|----------|--------|
| `Cmd+S` | Save |
| `Cmd+Z` | Undo |
| `Cmd+Shift+Z` | Redo |
| `Cmd+B` | Bold |
| `Cmd+I` | Italic |
| `Cmd+K` | Insert link |
| `Cmd+Shift+P` | Toggle preview |
| `Esc` | Deselect block |
| `Delete` | Delete selected block |
| `↑/↓` | Move between blocks |
| `/` | Quick insert (slash commands) |

---

### 10. Slash Commands (Quick Insert)

Type `/` to quickly insert blocks:

```
┌─────────────────────────────────────────────────────────────┐
│  Type to filter...                                          │
│                                                             │
│  /heading     → Insert heading                              │
│  /image       → Insert image                                │
│  /button      → Insert button                               │
│  /calendar    → Insert calendar widget                      │
│  /events      → Insert event list                           │
│  /divider     → Insert divider                              │
│  /columns     → Insert columns                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 11. Import from Word/Google Docs

**Problem:** Users have content in Word docs they want to add.

**Requirements:**
- Paste from Word (clean up formatting)
- Import .docx file
- Import from Google Docs (via URL)
- Preserve headings, lists, bold/italic
- Convert images

---

### 12. Print/PDF Export

**Requirements:**
- Print-friendly stylesheet
- Export as PDF
- Hide navigation/chrome in print
- Page break controls

---

## Email-Specific Additions

### 13. Email List Management

**Requirements:**
- Select recipients (all members, specific roles, groups)
- Exclude list (opted out, bounced)
- Test segment (send to subset first)
- Preview recipient count

```
┌─────────────────────────────────────────────────────────────┐
│  Recipients                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Send to:                                                   │
│  ☑ All active members (156)                                │
│  ☐ Board members only (8)                                  │
│  ☐ Specific groups:                                        │
│     ☐ Book Club (24)                                       │
│     ☐ Wine Tasting (32)                                    │
│                                                             │
│  Exclude:                                                   │
│  ☑ Unsubscribed (12)                                       │
│  ☑ Bounced emails (3)                                      │
│                                                             │
│  Total recipients: 141                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 14. Email Analytics

**Requirements:**
- Open rate
- Click rate (per link)
- Bounce rate
- Unsubscribe rate
- Device/client breakdown

```
┌─────────────────────────────────────────────────────────────┐
│  Email: January Newsletter                   Sent Jan 15    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📬 Delivered: 138/141 (98%)                               │
│  👁️ Opened: 89 (64%)                                        │
│  🖱️ Clicked: 34 (24%)                                       │
│  🚫 Bounced: 3                                              │
│  ❌ Unsubscribed: 1                                         │
│                                                             │
│  Top clicked links:                                         │
│  1. "Register for Wine Tasting" - 28 clicks                │
│  2. "View full calendar" - 12 clicks                        │
│  3. "Update your profile" - 8 clicks                        │
│                                                             │
│  Opened by device:                                          │
│  Desktop: 45%  Mobile: 48%  Tablet: 7%                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 15. Unsubscribe Management

**Requirements:**
- One-click unsubscribe (required by law)
- Preference center (choose what to receive)
- Re-subscribe option
- Unsubscribe reason collection (optional)

---

## Lower Priority (Future)

### 16. Collaboration Features
- Multiple editors
- Locking/checkout
- Comments on drafts
- Approval workflow

### 17. A/B Testing (Email)
- Test subject lines
- Test content variations
- Auto-select winner

### 18. AI Assistance
- Generate alt text for images
- Suggest meta descriptions
- Improve readability
- Check tone/voice consistency

### 19. Content Reuse (Synced Blocks)
- Create a block once, use in multiple pages
- Edit in one place, updates everywhere
- Like WordPress "reusable blocks"

### 20. Localization
- Multiple languages
- Language switcher
- (Probably not needed for local clubs)

---

## Summary: Priority Matrix

| Feature | Priority | Phase |
|---------|----------|-------|
| Version history | High | Phase 5 |
| Media library | High | Phase 3 |
| SEO & social | High | Phase 5 |
| Accessibility checks | High | Phase 5 |
| Publish scheduling | High | Phase 5 |
| Copy/duplicate | High | Phase 5 |
| Conditional content | High | Phase 3 |
| Embed support | High | Phase 3 |
| Keyboard shortcuts | Medium | Phase 5 |
| Slash commands | Medium | Phase 5 |
| Import from Word | Medium | Phase 7 |
| Print/PDF | Medium | Phase 7 |
| Email list management | High | Phase 6 |
| Email analytics | High | Phase 6 |
| Unsubscribe management | High | Phase 6 |
| Collaboration | Low | Future |
| A/B testing | Low | Future |
| AI assistance | Low | Future |
| Synced blocks | Low | Future |
