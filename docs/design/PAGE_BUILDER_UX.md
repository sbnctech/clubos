<!--
  Copyright © 2025 Murmurant, Inc. All rights reserved.
-->

# Page Builder UX Design

How to make page editing understandable for all skill levels.

---

## User Personas

### 1. "Carol" - The Club Volunteer (Primary)

**Profile:**
- 60-70 years old, retired professional
- Uses email and Facebook confidently
- Has used Word and maybe PowerPoint
- Never built a website
- Rotating into a club role for 1-2 years

**Mental Model:**
- Thinks in terms of "documents" not "websites"
- Understands paragraphs, headings, images
- Comfortable with "fill in the blank" forms
- Anxious about "breaking something"

**Needs:**
- Can't look bad (guardrails prevent ugly)
- Clear undo (mistakes are recoverable)
- Templates as starting points
- Minimal decisions required

### 2. "Jennifer" - The Tech-Comfortable Volunteer

**Profile:**
- 45-55 years old, works in marketing or admin
- Has used Canva, Mailchimp, maybe Squarespace
- Understands drag-and-drop
- Wants things to "look professional"

**Mental Model:**
- Understands "sections" and "layouts"
- Comfortable with visual editors
- Wants customization within reason
- Appreciates good defaults

**Needs:**
- Visual preview as she works
- Ability to tweak colors/fonts
- Professional templates to start from
- Quick way to add common elements

### 3. "Marcus" - The Wild Apricot Migrator

**Profile:**
- 40-60 years old, managed WA site
- Understands WA's widget/gadget model
- Frustrated with WA limitations
- Wants more flexibility

**Mental Model:**
- Thinks in "stripes" with "gadgets"
- Understands event calendars, member directories
- Knows what's possible, wants more
- Comfortable with some complexity

**Needs:**
- Clear mapping from WA concepts
- Same widgets he knows (calendar, directory)
- Better layout options
- Documentation for WA→Murmurant transition

---

## The Key UX Insight

From [Wix vs Squarespace comparisons](https://www.websitebuilderexpert.com/website-builders/comparisons/wix-vs-squarespace/):

> "Squarespace's structured Fluid Engine Editor means you can't move an element anywhere on the canvas; you can only drag elements into rows and columns within a section. This makes it harder to create a bad-looking site."

**Translation for us:**

| Approach | Wix-style | Squarespace-style |
|----------|-----------|-------------------|
| Freedom | Drag anywhere | Drag into containers |
| Skill required | Higher | Lower |
| Result quality | Varies wildly | Consistently good |
| Target user | Designers | Everyone else |

**Our choice: Squarespace-style (Constrained Editing)**

Users can only place blocks into predefined sections. This means:
- ✅ Can't accidentally overlap elements
- ✅ Can't create misaligned layouts
- ✅ Responsive design "just works"
- ✅ Brand consistency maintained
- ❌ Less "creative freedom" (acceptable tradeoff)

---

## Progressive Disclosure

Different modes for different skill levels:

### Level 1: "Easy Mode" (Default for Carol)

**What they see:**
- Pre-filled template with placeholder content
- Click any text to edit it (Word-like)
- Click any image to replace it
- "Add section" button with curated choices

**What's hidden:**
- Layout selection
- Custom blocks
- Advanced settings
- Code/CSS access

**Example flow:**

```
1. "You're editing: January Newsletter"

   ┌─────────────────────────────────────────┐
   │  [Click to edit headline]               │
   │                                         │
   │  [Click to edit or replace image]       │
   │                                         │
   │  [Click to edit paragraph text...]      │
   │                                         │
   │  ─────────────────────────────────────  │
   │                                         │
   │  [+ Add another section]                │
   │                                         │
   └─────────────────────────────────────────┘

2. Clicking "Add section" shows:

   ┌─────────────────────────────────────────┐
   │  What would you like to add?            │
   │                                         │
   │  [📝 Text]     [🖼️ Image]    [📅 Event] │
   │                                         │
   │  [📋 List]     [🔗 Button]   [📰 News]  │
   │                                         │
   └─────────────────────────────────────────┘
```

### Level 2: "Standard Mode" (For Jennifer)

**What they see:**
- Block palette on the left
- Page with visible sections
- Drag blocks into sections
- Settings panel on right

**Example:**

```
┌──────────┬─────────────────────────────┬──────────┐
│          │                             │          │
│  BLOCKS  │      PAGE PREVIEW           │ SETTINGS │
│          │                             │          │
│  Text    │  ┌──── HERO ─────────────┐  │ Block:   │
│  Image   │  │                       │  │ Heading  │
│  Heading │  │  [Hero content]       │  │          │
│  Button  │  │                       │  │ Size: H1 │
│  ───     │  └───────────────────────┘  │ Align: C │
│  Calendar│                             │          │
│  Events  │  ┌──── MAIN ─────────────┐  │          │
│  News    │  │                       │  │          │
│  Gallery │  │  [Selected block]     │  │          │
│  ───     │  │                       │  │          │
│  Columns │  └───────────────────────┘  │          │
│  Spacer  │                             │          │
│          │                             │          │
└──────────┴─────────────────────────────┴──────────┘
```

### Level 3: "Power Mode" (For Marcus)

**What they see:**
- Everything in Standard, plus:
- Layout template selector
- Custom section creation
- Block HTML/CSS access
- Theme token overrides

---

## Start From Templates (Not Blank Pages)

**Never show a blank page.** Always start from a template.

### Template Categories:

1. **Page Type Templates**
   - Home page
   - Events page
   - About us
   - Contact
   - Group hub
   - Member directory

2. **Purpose Templates**
   - "Announce an event"
   - "Welcome new members"
   - "Share photos"
   - "Monthly newsletter"

3. **Style Templates**
   - Classic (traditional club look)
   - Modern (clean, minimal)
   - Friendly (warm, inviting)
   - Professional (business-like)

### Template Selection Flow:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  What are you creating?                                     │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │             │  │             │  │             │         │
│  │  📄 Page    │  │  📰 Post    │  │  📧 Email   │         │
│  │             │  │             │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  What kind of page?                                         │
│                                                             │
│  [🏠 Home Page]  [📅 Event]  [📝 Article]  [📸 Photos]     │
│                                                             │
│  [ℹ️ About Us]   [📞 Contact]  [👥 Group]   [📋 Other]     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Choose a starting point:                                   │
│                                                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│  │ [Preview] │  │ [Preview] │  │ [Preview] │               │
│  │           │  │           │  │           │               │
│  │  Classic  │  │  Modern   │  │  Friendly │               │
│  │           │  │           │  │           │               │
│  │  [Use ►]  │  │  [Use ►]  │  │  [Use ►]  │               │
│  └───────────┘  └───────────┘  └───────────┘               │
│                                                             │
│           ○ ○ ●    [More styles...]                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Block Terminology for Novices

**Don't say "block"** - it's technical jargon.

| Technical | User-Friendly | Icon |
|-----------|---------------|------|
| Heading Block | Headline | 📰 |
| Paragraph Block | Text | 📝 |
| Image Block | Photo | 🖼️ |
| Button Block | Button | 🔲 |
| Columns Block | Side by Side | ▥ |
| Calendar Block | Calendar | 📅 |
| Event List Block | Upcoming Events | 📋 |
| News Feed Block | Latest News | 📰 |
| Gallery Block | Photo Gallery | 🖼️ |
| Embed Block | Video or Map | 🎬 |

**Group by purpose, not type:**

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  📝 Write                                                   │
│     Headline · Text · Quote · List                          │
│                                                             │
│  🖼️ Show                                                    │
│     Photo · Gallery · Video                                 │
│                                                             │
│  📅 Club Stuff                                              │
│     Events · Calendar · News · Members                      │
│                                                             │
│  🔧 Layout                                                  │
│     Side by Side · Spacer · Divider                         │
│                                                             │
│  🔗 Actions                                                 │
│     Button · Form · Link                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Prevention & Recovery

### Guardrails (Prevent Bad Outcomes)

1. **Auto-save** - Never lose work
2. **Constrained drops** - Blocks snap to valid positions
3. **Preview mode** - See result before publishing
4. **Publish confirmation** - "Ready to make this live?"
5. **Revert option** - "Go back to last published version"

### Helpful Constraints

1. **Section limits** - Max 10 sections per page
2. **Block limits** - Max 20 blocks per section
3. **Image sizing** - Auto-resize to fit
4. **Text limits** - Character counts for key fields
5. **Color harmony** - Theme colors always work together

### Undo/Redo

- **Cmd+Z / Ctrl+Z** for keyboard users
- **Visible undo button** for mouse users
- **History panel** in Power mode

---

## Onboarding for First-Time Users

### Guided Tour (First Page Edit)

```
Step 1:
┌─────────────────────────────────────────────────────────────┐
│                                                     [Skip]  │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                       │ │
│  │  👋 Welcome! Let's edit your first page.              │ │
│  │                                                       │ │
│  │  Click any text to change it - just like Word.        │ │
│  │                                                       │ │
│  │                                    [Got it →]         │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ← Click here to edit this headline                 │   │
│  │      ↑                                              │   │
│  │      │                                              │   │
│  │  [  Your Page Title  ]                              │   │
│  │                                                     │   │
└──┴─────────────────────────────────────────────────────────┘

Step 2:
┌─────────────────────────────────────────────────────────────┐
│                                                     [Skip]  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                       │ │
│  │  Great! Now try adding a photo.                       │ │
│  │                                                       │ │
│  │  Click the image below, then choose a new one.        │ │
│  │                                                       │ │
│  │                                    [Got it →]         │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│    Your Page Title                                          │
│                                                             │
│    ┌──────────────────────┐  ← Click to replace            │
│    │      [Image]         │                                 │
│    │                      │                                 │
│    └──────────────────────┘                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘

Step 3:
┌─────────────────────────────────────────────────────────────┐
│                                                     [Skip]  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │                                                       │ │
│  │  Perfect! When you're done, click Preview.            │ │
│  │                                                       │ │
│  │  You can always come back and make changes.           │ │
│  │                                                       │ │
│  │                              [Start editing →]        │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│                                         [Preview] [Publish] │
│                                              ↑              │
│    Your Page Title                           │              │
│                                         Click here          │
│    ┌──────────────────────┐            when ready           │
│    │      [Image]         │                                 │
│    └──────────────────────┘                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## WA User Migration Guide

For Marcus and other WA users, show familiar concepts:

| WA Concept | Murmurant Equivalent | Where to Find It |
|------------|---------------------|------------------|
| Stripe/Section | Section | Automatic in layout |
| Widget | Block | Left panel |
| Gadget | Block | Left panel (Club Stuff) |
| Theme | Theme (appearance only) | Settings |
| Template | Layout (structure) | Page Settings |
| Site pages | Pages | Pages menu |
| Member-only page | Page visibility | Page Settings |

**Migration callout in UI:**

```
┌─────────────────────────────────────────────────────────────┐
│  💡 Coming from Wild Apricot?                              │
│                                                             │
│  Your widgets are now "blocks" in the left panel.          │
│  Sections work similarly, but you can have sidebars!       │
│                                                             │
│  [Show me how →]                              [Dismiss]     │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary: Design Principles

1. **Start from templates, not blank pages**
2. **Constrained editing > total freedom** (Squarespace model)
3. **Progressive disclosure** (hide complexity until needed)
4. **Familiar terminology** (no jargon)
5. **Visible undo** (safety net always available)
6. **Preview before publish** (see what members will see)
7. **Auto-save everything** (never lose work)
8. **Mobile preview** (one-click to see mobile view)
