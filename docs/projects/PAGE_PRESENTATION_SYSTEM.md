<!--
  Copyright © 2025 Murmurant, Inc. All rights reserved.
-->

# Page Presentation System

**Status:** Planning
**Priority:** P2
**Owner:** TBD

---

## Executive Summary

Define a clear, industry-standard terminology and architecture for page presentation in Murmurant. The system must be understandable to:

- Web developers (familiar with CSS, React, Figma)
- WordPress users (familiar with FSE, Gutenberg blocks)
- Wild Apricot consultants (transitioning clients)

---

## Terminology (Industry-Aligned)

Based on analysis of WordPress FSE, Webflow, Figma, and CSS frameworks:

| Our Term | Based On | Definition |
|----------|----------|------------|
| **Layout** | CSS/Webflow | Structural skeleton: nav position, sections, grid |
| **Theme** | Universal | Visual styling: colors, typography, shape |
| **Token** | Figma/CSS | Single design value (color, spacing, radius) |
| **Section** | Webflow/WA | Named area in a layout (header, main, sidebar) |
| **Block** | WordPress | Content building block (text, image, calendar) |
| **Pattern** | WordPress | Pre-arranged combination of blocks |

### Terminology Comparison

| Concept | Murmurant | WordPress FSE | Webflow | Wild Apricot | Figma |
|---------|-----------|---------------|---------|--------------|-------|
| Page structure | Layout | Template | Page | Theme (bundled) | Frame |
| Reusable section | Section | Template Part | Section | Stripe | Component |
| Design values | Token | theme.json | Variable | N/A | Variable |
| Visual styling | Theme | Global Styles | Style | Theme | Style |
| Content unit | Block | Block | Component | Widget/Gadget | Component |
| Starter content | Pattern | Pattern | N/A | N/A | N/A |

---

## Architecture Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                         BRAND                               │
│  An organization's complete visual and structural identity  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐   ┌─────────────────────┐         │
│  │       LAYOUT        │   │        THEME        │         │
│  │                     │   │                     │         │
│  │  Structure:         │   │  Appearance:        │         │
│  │  • Nav position     │   │  • Tokens (colors,  │         │
│  │  • Section grid     │   │    fonts, spacing)  │         │
│  │  • Sidebar presence │   │  • Shape (corners,  │         │
│  │  • Header/footer    │   │    shadows)         │         │
│  │    style            │   │  • Voice (tone,     │         │
│  │                     │   │    terminology)     │         │
│  └─────────────────────┘   └─────────────────────┘         │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                          PAGE                               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                     SECTIONS                         │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  HEADER SECTION                              │   │   │
│  │  │  [Logo Block] [Nav Block] [Search Block]     │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  HERO SECTION                                │   │   │
│  │  │  [Carousel Block]                            │   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  │  ┌────────────────────────┬─────────────────────┐   │   │
│  │  │  MAIN SECTION          │  SIDEBAR SECTION    │   │   │
│  │  │                        │                     │   │   │
│  │  │  [Text Block]          │  [News Feed Block]  │   │   │
│  │  │  [Image Block]         │  [Calendar Block]   │   │   │
│  │  │  [Event List Block]    │  [Sponsors Block]   │   │   │
│  │  │                        │                     │   │   │
│  │  └────────────────────────┴─────────────────────┘   │   │
│  │                                                      │   │
│  │  ┌──────────────────────────────────────────────┐   │   │
│  │  │  FOOTER SECTION                              │   │   │
│  │  │  [Links Block] [Contact Block] [Social Block]│   │   │
│  │  └──────────────────────────────────────────────┘   │   │
│  │                                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Layout Types

### 1. Classic

```
┌─────────────────────────────────────┐
│            HEADER                   │
├─────────────────────────────────────┤
│            HERO (optional)          │
├─────────────────────────────────────┤
│                                     │
│            MAIN                     │
│                                     │
├─────────────────────────────────────┤
│            FOOTER                   │
└─────────────────────────────────────┘
```

**Sections:** header, hero?, main, footer
**Nav:** Top horizontal
**Use:** Landing pages, simple content
**WA equivalent:** Standard theme layout

### 2. Magazine

```
┌─────────────────────────────────────┐
│            HEADER                   │
├─────────────────────────────────────┤
│            HERO                     │
├──────────────────────┬──────────────┤
│                      │              │
│       MAIN           │   SIDEBAR    │
│       (70%)          │   (30%)      │
│                      │              │
├──────────────────────┴──────────────┤
│            FOOTER                   │
└─────────────────────────────────────┘
```

**Sections:** header, hero, main, sidebar, footer
**Nav:** Top horizontal
**Use:** Member home, content pages
**WA equivalent:** NOT POSSIBLE (sidebars can't span stripes)

### 3. Portal

```
┌─────────────────────────────────────┐
│            HEADER                   │
├──────────┬──────────────────────────┤
│          │                          │
│  LEFT    │         MAIN             │
│  NAV     │                          │
│  (200px) │                          │
│          │                          │
├──────────┴──────────────────────────┤
│            FOOTER                   │
└─────────────────────────────────────┘
```

**Sections:** header, nav-left, main, footer
**Nav:** Top bar + left sidebar
**Use:** Complex navigation, many sections
**WA equivalent:** NOT POSSIBLE

### 4. Dashboard

```
┌─────────────────────────────────────┐
│            HEADER                   │
├──────────┬──────────────────────────┤
│          │                          │
│  SIDEBAR │         MAIN             │
│  (240px) │                          │
│          │                          │
│          │                          │
└──────────┴──────────────────────────┘
```

**Sections:** header, sidebar, main
**Nav:** Top bar + left sidebar
**Use:** Admin interfaces, management
**WA equivalent:** NOT POSSIBLE

### 5. Focus

```
┌─────────────────────────────────────┐
│  Logo                    [Account]  │
├─────────────────────────────────────┤
│                                     │
│        MAIN (max-width: 720px)      │
│        centered                     │
│                                     │
├─────────────────────────────────────┤
│           Minimal footer            │
└─────────────────────────────────────┘
```

**Sections:** header-minimal, main, footer-minimal
**Nav:** Minimal (logo + account only)
**Use:** Articles, forms, checkout
**WA equivalent:** Possible but not common

### 6. Intranet

```
┌─────────────────────────────────────┐
│            HEADER                   │
├────────┬───────────────────┬────────┤
│        │                   │        │
│  LEFT  │       MAIN        │  RIGHT │
│  NAV   │                   │  PANEL │
│        │                   │        │
├────────┴───────────────────┴────────┤
│            FOOTER                   │
└─────────────────────────────────────┘
```

**Sections:** header, nav-left, main, panel-right, footer
**Nav:** Top + left sidebar + right panel
**Use:** Rich intranets, social platforms
**WA equivalent:** NOT POSSIBLE

---

## Token System

Tokens are the atomic design values that Theme uses:

```typescript
interface TokenSet {
  // Color tokens
  color: {
    primary: string;        // Brand primary
    secondary: string;      // Brand secondary
    background: string;     // Page background
    surface: string;        // Card/panel background
    text: string;           // Primary text
    textMuted: string;      // Secondary text
    border: string;         // Borders
    success: string;
    warning: string;
    error: string;
  };

  // Typography tokens
  font: {
    heading: string;        // Font family for headings
    body: string;           // Font family for body
    mono: string;           // Font family for code
  };

  // Spacing tokens (based on 4px grid)
  space: {
    xs: string;   // 4px
    sm: string;   // 8px
    md: string;   // 16px
    lg: string;   // 24px
    xl: string;   // 32px
    xxl: string;  // 48px
  };

  // Shape tokens
  radius: {
    none: string;   // 0
    sm: string;     // 4px
    md: string;     // 8px
    lg: string;     // 16px
    full: string;   // 9999px (pill)
  };

  // Shadow tokens
  shadow: {
    none: string;
    sm: string;
    md: string;
    lg: string;
  };
}
```

Tokens become CSS custom properties:

```css
:root {
  --token-color-primary: #1e40af;
  --token-color-background: #ffffff;
  --token-space-md: 16px;
  --token-radius-md: 8px;
  /* ... */
}
```

---

## Section Configuration

Each Layout defines its sections:

```typescript
interface SectionConfig {
  id: string;           // "main", "sidebar", "hero"
  name: string;         // "Main Content", "Sidebar"

  // Grid placement
  gridArea: string;     // CSS grid-area name

  // Constraints
  minWidth?: string;
  maxWidth?: string;

  // Block restrictions
  allowedBlocks?: string[];   // null = all
  maxBlocks?: number;

  // Responsive
  hideOnMobile?: boolean;
  mobileOrder?: number;
}
```

---

## Block Categories

Blocks are categorized for the page builder:

| Category | Blocks | Description |
|----------|--------|-------------|
| **Text** | Heading, Paragraph, Quote, List | Basic text content |
| **Media** | Image, Gallery, Video, File | Visual content |
| **Layout** | Columns, Spacer, Divider | Structure within section |
| **Widgets** | Calendar, News Feed, Event List | Dynamic content |
| **Forms** | Contact, RSVP, Survey | User input |
| **Navigation** | Menu, Breadcrumb, TOC | Navigation aids |
| **Embeds** | Map, Social, YouTube | Third-party content |

---

## Pattern Library

Patterns are pre-arranged blocks for common use cases:

| Pattern | Blocks | Use Case |
|---------|--------|----------|
| **Hero + CTA** | Image + Heading + Button | Landing page header |
| **Feature Grid** | 3-column with icons | Service showcase |
| **Testimonial** | Quote + Avatar + Name | Social proof |
| **Event Card** | Image + Title + Date + Button | Event promotion |
| **News List** | News Feed (compact) | Sidebar widget |

---

## Wild Apricot Migration Path

For WA consultants migrating clients:

| WA Concept | Murmurant Equivalent | Notes |
|------------|---------------------|-------|
| Theme | Layout + Theme | We separate structure from style |
| Stripe/Section | Section | But we support sidebars |
| Widget/Gadget | Block | Same concept, more flexibility |
| Page template | Pattern | Pre-arranged blocks |
| Theme colors | Theme tokens | More granular control |

### Migration Pitch

> "In Wild Apricot, your theme controls everything at once. In Murmurant, we separate **Layout** (where things go) from **Theme** (how they look). This means you can switch from a sidebar layout to a full-width layout without losing your brand colors. And unlike WA's horizontal stripes, our sections let you build true sidebars and multi-column layouts."

---

## Related Design Documents

| Document | Purpose |
|----------|---------|
| `docs/design/LAYOUT_CONCEPTS.md` | Innovative layout patterns beyond WA |
| `docs/design/PAGE_BUILDER_UX.md` | UX for different skill levels |
| `docs/design/NAVIGATION_SYSTEM.md` | Navigation types and configuration |
| `docs/design/AUTH_UI.md` | Login status and user menu placement |
| `docs/design/COMPATIBILITY_SYSTEM.md` | Rules engine for valid combinations |
| `docs/design/PREVIEW_SYSTEM.md` | Preview throughout editing |

---

## Project Plan

### Phase 1: Foundation

**Goal:** Core infrastructure for layouts and compatibility

**1.1 Token System**
- [ ] Define token schema (`src/lib/tokens/schema.ts`)
- [ ] Create token-to-CSS-variable generator
- [ ] Migrate existing theme to token-based system
- [ ] Create theme provider component
- [ ] Unit tests for token validation

**1.2 Compatibility Engine**
- [ ] Define rule types (requires, excludes, restricts, suggests)
- [ ] Create validation engine (`src/lib/compatibility/engine.ts`)
- [ ] Define layout + auth rules
- [ ] Define section + block rules
- [ ] Define email context rules
- [ ] Unit tests for all rule types

**Deliverables:**
- Token type definitions and default set
- Compatibility rule engine with tests

---

### Phase 2: Layout System

**Goal:** Implement layouts with navigation and auth

**2.1 Layout Definitions**
- [ ] Define Layout schema (`src/lib/layouts/schema.ts`)
- [ ] Create 6 built-in layouts (Classic, Magazine, Portal, Dashboard, Focus, Intranet)
- [ ] Define sections per layout (header, hero, main, sidebar, footer)
- [ ] Add layout selection to Brand model (HOTSPOT)

**2.2 Shell Components**
- [ ] Create `ClassicShell.tsx` (refactor from MemberShell)
- [ ] Create `MagazineShell.tsx` (top nav + right sidebar)
- [ ] Create `PortalShell.tsx` (top nav + left nav)
- [ ] Create `DashboardShell.tsx` (refactor from AdminShell)
- [ ] Create `FocusShell.tsx` (minimal chrome)
- [ ] Create `IntranetShell.tsx` (dual sidebar)

**2.3 Navigation Components**
- [ ] Create `TopNav.tsx` (horizontal navigation)
- [ ] Create `SideNav.tsx` (vertical sidebar navigation)
- [ ] Create `NavItem.tsx` and `NavDropdown.tsx`
- [ ] Create `MobileNav.tsx` (hamburger menu)
- [ ] Create navigation data model (HOTSPOT)
- [ ] Create menu editor UI

**2.4 Auth UI Components**
- [ ] Create `AuthCorner.tsx` (top-right placement)
- [ ] Create `SidebarAuth.tsx` (bottom-left placement)
- [ ] Create `UserMenu.tsx` (dropdown)
- [ ] Create `UserAvatar.tsx` (photo or initials)
- [ ] Wire auth position to layout compatibility

**Deliverables:**
- 6 layout shells with navigation
- Auth UI in both positions
- Menu editor for navigation
- Compatibility validation integrated

---

### Phase 3: Block System

**Goal:** Block registry, core blocks, and section constraints

**3.1 Block Infrastructure**
- [ ] Define Block interface and registry
- [ ] Create block categories (Text, Media, Widgets, Layout, Forms)
- [ ] Create `BlockRenderer.tsx`
- [ ] Create `SectionContainer.tsx` with block constraints

**3.2 Core Blocks**
- [ ] Text blocks: Heading, Paragraph, List, Quote, Divider
- [ ] Media blocks: Image, Gallery, Video
- [ ] Layout blocks: Columns, Spacer
- [ ] Action blocks: Button, Link

**3.3 Widget Blocks**
- [ ] `CalendarMini.tsx` - Compact calendar
- [ ] `NewsFeed.tsx` - Recent news (exists, adapt)
- [ ] `EventList.tsx` - Upcoming events
- [ ] `MemberGreeting.tsx` - Personalized hello
- [ ] `Sponsors.tsx` - Sponsor logos

**3.4 Section Constraints**
- [ ] Implement section → allowed blocks rules
- [ ] Implement block nesting rules
- [ ] UI: disabled blocks in palette with reason
- [ ] UI: blocked drop zones with message

**Deliverables:**
- Block registry with 15+ blocks
- Section-aware rendering
- Constraint enforcement in UI

---

### Phase 4: Preview System

**Goal:** Preview everywhere editing happens

**4.1 Page Preview**
- [ ] Create `PreviewFrame.tsx` (iframe-based preview)
- [ ] Create `/preview/[pageId]` route
- [ ] Implement split view in page editor
- [ ] Implement full preview mode
- [ ] Implement responsive preview (desktop/tablet/mobile)

**4.2 Email Preview**
- [ ] Create `EmailPreviewFrame.tsx`
- [ ] Implement email client simulation (Gmail, Outlook styles)
- [ ] Implement "images off" preview mode
- [ ] Implement "Send Test Email" functionality

**4.3 Settings Preview**
- [ ] Layout change preview (before/after)
- [ ] Theme change preview (live update)
- [ ] "Preview on site" (new tab with draft settings)

**Deliverables:**
- Real-time preview in all editors
- Responsive preview breakpoints
- Email client simulation
- Test email sending

---

### Phase 5: Page Builder UX

**Goal:** Editing experience for all skill levels

**5.1 Easy Mode (Novice)**
- [ ] Template-first page creation flow
- [ ] Click-to-edit text (Word-like)
- [ ] Click-to-replace images
- [ ] Simplified "Add section" with curated blocks
- [ ] Guided onboarding tour

**5.2 Standard Mode**
- [ ] Block palette (categorized)
- [ ] Drag-drop into sections
- [ ] Settings panel for selected block
- [ ] Section management

**5.3 Power Mode**
- [ ] Layout template selector
- [ ] Custom CSS per block
- [ ] HTML embed block
- [ ] Developer-focused tools

**5.4 Templates & Patterns**
- [ ] Define Pattern schema
- [ ] Create 10+ starter patterns
- [ ] Pattern picker UI
- [ ] Page template selection flow

**Deliverables:**
- Progressive disclosure UI
- Template/pattern library
- Onboarding flow

---

### Phase 6: Email Layout System

**Goal:** Email-specific editing with strict compatibility

**6.1 Email Editor**
- [ ] Email-only block palette (filtered by compatibility)
- [ ] Email-safe section layouts (max 2 columns)
- [ ] Table-based rendering for Outlook
- [ ] Plain text fallback generation

**6.2 Email Templates**
- [ ] Define email layout templates
- [ ] Create email header/footer components
- [ ] Personalization token system
- [ ] Unsubscribe link enforcement

**6.3 Email Preview**
- [ ] Multi-client preview (Gmail, Outlook, Apple Mail)
- [ ] Mobile email preview
- [ ] Images-off preview
- [ ] Test send functionality

**Deliverables:**
- Email-specific editor
- Email templates
- Multi-client preview

---

### Phase 7: Brand Configuration

**Goal:** Per-brand layout, theme, and navigation defaults

**7.1 Brand Settings UI**
- [ ] Layout selection with preview
- [ ] Theme customization (colors, fonts)
- [ ] Navigation structure editor
- [ ] Auth position selection (with compatibility)

**7.2 Defaults & Overrides**
- [ ] Brand-level defaults
- [ ] Per-page layout override
- [ ] Per-page navigation override

**7.3 Import/Export**
- [ ] Export brand configuration
- [ ] Import brand configuration
- [ ] Theme preset library

**Deliverables:**
- Brand settings UI
- Import/export tools
- Theme presets

---

## File Structure

```
src/
├── lib/
│   ├── tokens/
│   │   ├── schema.ts          # Token type definitions
│   │   ├── defaults.ts        # Default token values
│   │   └── generator.ts       # Token → CSS output
│   │
│   ├── layouts/
│   │   ├── schema.ts          # Layout type definitions
│   │   ├── registry.ts        # Built-in layouts
│   │   └── sections.ts        # Section configuration
│   │
│   ├── themes/
│   │   ├── schema.ts          # Theme type definitions (exists)
│   │   └── provider.tsx       # Theme context
│   │
│   └── blocks/
│       ├── registry.ts        # Block registration
│       ├── types.ts           # Block interfaces
│       └── renderer.tsx       # Block rendering
│
├── templates/
│   └── shells/
│       ├── ClassicShell.tsx
│       ├── MagazineShell.tsx
│       ├── PortalShell.tsx
│       ├── DashboardShell.tsx
│       ├── FocusShell.tsx
│       └── IntranetShell.tsx
│
├── components/
│   ├── layout/
│   │   ├── Section.tsx        # Section container
│   │   └── SectionGrid.tsx    # CSS Grid wrapper
│   │
│   └── blocks/
│       ├── text/
│       │   ├── Heading.tsx
│       │   ├── Paragraph.tsx
│       │   └── ...
│       ├── media/
│       │   ├── Image.tsx
│       │   └── ...
│       └── widgets/
│           ├── CalendarMini.tsx
│           ├── NewsFeed.tsx
│           └── ...
│
└── patterns/
    ├── hero-cta.json
    ├── feature-grid.json
    └── ...
```

---

## Success Metrics

1. **Terminology adoption:** Docs consistently use Layout/Theme/Section/Block
2. **Layout flexibility:** 6 distinct layouts available
3. **WA parity:** All WA layouts reproducible, plus new capabilities
4. **Consultant readiness:** Migration guide with clear mapping
5. **Developer experience:** Clear separation of concerns

---

## References

- [WordPress Theme.json](https://developer.wordpress.org/block-editor/how-to-guides/themes/global-settings-and-styles/)
- [Webflow Components](https://help.webflow.com/hc/en-us/articles/33961303934611-Components-overview)
- [Figma Design Tokens](https://help.figma.com/hc/en-us/articles/18490793776023-Update-1-Tokens-variables-and-styles)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- Wild Apricot example sites: iwachicago.org, bedfordridinglanes.wildapricot.org
