<!--
  Copyright © 2025 Murmurant, Inc. All rights reserved.
-->

# Layout Template System

**Status:** Backlog
**Priority:** P2
**Charter:** P6 (human-first UI), N8 (no template fragility)

---

## Summary

Layout Templates define the structural skeleton of pages: navigation placement, panel arrangement, header/footer style, and content zone organization. This layer sits ABOVE Theme (visual styling) and provides the architectural framework that blocks are placed within.

Unlike Wild Apricot's rigid "stripe" system (horizontal bands only), our Layout Templates leverage our block-based architecture for flexible, modern layouts.

---

## Conceptual Model

```
┌─────────────────────────────────────────────────────────────┐
│ LAYOUT TEMPLATE                                             │
│ Controls STRUCTURE:                                         │
│ • Shell selection (which React wrapper)                     │
│ • Navigation placement (top, left, right)                   │
│ • Panel arrangement (zones where blocks go)                 │
│ • Header/footer style (hero, compact, banner)               │
│ • Content grid (columns, sidebar width)                     │
├─────────────────────────────────────────────────────────────┤
│ THEME                                                       │
│ Controls APPEARANCE:                                        │
│ • Colors, typography, shape, voice, branding                │
│ Applied via CSS custom properties                           │
├─────────────────────────────────────────────────────────────┤
│ PAGE TEMPLATE (CMS)                                         │
│ Controls CONTENT:                                           │
│ • Default block arrangement within zones                    │
│ • Block type restrictions per zone                          │
│ Operator configures in admin                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Layout Template Types

### 1. Classic (Top Nav + Full Width)

```
┌─────────────────────────────────────────────────────┐
│                    HEADER / NAV                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│                  HERO ZONE (optional)               │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│                   MAIN CONTENT                      │
│                                                     │
│                                                     │
├─────────────────────────────────────────────────────┤
│                      FOOTER                         │
└─────────────────────────────────────────────────────┘
```

**Use case:** Simple pages, landing pages, marketing sites
**Current implementation:** `MemberShell.tsx`

### 2. Magazine (Top Nav + Sidebar)

```
┌─────────────────────────────────────────────────────┐
│                    HEADER / NAV                     │
├─────────────────────────────────────────────────────┤
│                   HERO ZONE                         │
├─────────────────────────────────────────────────────┤
│                              │                      │
│       MAIN CONTENT           │      SIDEBAR         │
│       (70%)                  │      (30%)           │
│                              │   - News feed        │
│                              │   - Calendar         │
│                              │   - Sponsors         │
├──────────────────────────────┴──────────────────────┤
│                      FOOTER                         │
└─────────────────────────────────────────────────────┘
```

**Use case:** Member home, content-heavy pages, dashboards
**Advantage over WA:** Sidebar can contain any blocks, not just widgets

### 3. Dashboard (Top Nav + Left Sidebar)

```
┌─────────────────────────────────────────────────────┐
│                    HEADER / NAV                     │
├─────────────┬───────────────────────────────────────┤
│             │                                       │
│   SIDEBAR   │          MAIN CONTENT                 │
│   (240px)   │                                       │
│             │                                       │
│   - Nav     │                                       │
│   - Filters │                                       │
│             │                                       │
├─────────────┴───────────────────────────────────────┤
│                      FOOTER                         │
└─────────────────────────────────────────────────────┘
```

**Use case:** Admin interfaces, complex navigation
**Current implementation:** `AdminShell.tsx` with `showSidebar=true`

### 4. Portal (Top + Left Navigation)

```
┌─────────────────────────────────────────────────────┐
│                    TOP BAR                          │
├─────────────┬───────────────────────────────────────┤
│             │                                       │
│   LEFT NAV  │          MAIN CONTENT                 │
│             │                                       │
│   Sections: │   ┌─────────┬─────────┬─────────┐    │
│   - Home    │   │  Card   │  Card   │  Card   │    │
│   - Events  │   ├─────────┼─────────┼─────────┤    │
│   - Groups  │   │  Card   │  Card   │  Card   │    │
│   - ...     │   └─────────┴─────────┴─────────┘    │
│             │                                       │
└─────────────┴───────────────────────────────────────┘
```

**Use case:** Member portals with many sections
**Advantage over WA:** Left nav + grid content (impossible in WA stripes)

### 5. Intranet (Top + Dual Sidebar)

```
┌─────────────────────────────────────────────────────┐
│                    HEADER / NAV                     │
├───────────┬─────────────────────────────┬───────────┤
│           │                             │           │
│  LEFT     │       MAIN CONTENT          │   RIGHT   │
│  SIDEBAR  │                             │   SIDEBAR │
│  (200px)  │                             │   (280px) │
│           │                             │           │
│  - Nav    │                             │  - News   │
│  - Quick  │                             │  - Events │
│    links  │                             │  - Chat   │
│           │                             │           │
├───────────┴─────────────────────────────┴───────────┤
│                      FOOTER                         │
└─────────────────────────────────────────────────────┘
```

**Use case:** Rich intranets, social platforms
**Advantage over WA:** Multiple sidebars impossible in WA

### 6. Focus (Minimal Chrome)

```
┌─────────────────────────────────────────────────────┐
│  Logo                              [Account] [Menu] │
├─────────────────────────────────────────────────────┤
│                                                     │
│                                                     │
│               CENTERED CONTENT                      │
│               (max-width: 720px)                    │
│                                                     │
│                                                     │
├─────────────────────────────────────────────────────┤
│                   Minimal footer                    │
└─────────────────────────────────────────────────────┘
```

**Use case:** Reading pages, articles, forms, checkout
**Advantage over WA:** True focused reading experience

---

## Content Zones

Each layout template defines named zones where blocks can be placed:

| Zone | Description | Typical Blocks |
|------|-------------|----------------|
| `header` | Top navigation area | Logo, nav, search, account |
| `hero` | Full-width showcase area | Carousel, image, video |
| `main` | Primary content area | Any blocks |
| `sidebar` | Secondary content area | News, calendar, widgets |
| `sidebar-left` | Navigation sidebar | Menu, filters |
| `sidebar-right` | Utility sidebar | News, sponsors |
| `footer` | Bottom area | Links, copyright, social |

---

## Schema Design

```prisma
model LayoutTemplate {
  id          String   @id @default(uuid()) @db.Uuid
  slug        String   @unique
  name        String
  description String?

  // Structure definition
  shellComponent String   // React component name: "MemberShell", "PortalShell"
  zones          Json     // Zone definitions: { main: {...}, sidebar: {...} }

  // Display settings
  navPosition    NavPosition @default(TOP)
  sidebarWidth   Int?        // Pixels, null = no sidebar
  maxContentWidth Int        @default(1200)
  hasHero        Boolean     @default(false)
  hasFooter      Boolean     @default(true)

  // Defaults
  isDefault      Boolean  @default(false)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  pages       Page[]

  @@index([isDefault])
}

enum NavPosition {
  TOP           // Horizontal top bar
  LEFT          // Vertical left sidebar
  RIGHT         // Vertical right sidebar (rare)
  TOP_LEFT      // Top bar + left sidebar
  TOP_RIGHT     // Top bar + right sidebar
  TOP_DUAL      // Top bar + both sidebars
}
```

---

## Zone Configuration

```typescript
interface ZoneConfig {
  // Zone identification
  id: string;           // e.g., "main", "sidebar", "hero"
  name: string;         // Display name

  // Layout
  gridColumn?: string;  // CSS grid column: "1 / 2", "2 / 3"
  gridRow?: string;     // CSS grid row
  width?: string;       // Fixed width: "280px", "30%"
  minWidth?: string;
  maxWidth?: string;

  // Block restrictions
  allowedBlockTypes?: string[];  // null = all allowed
  maxBlocks?: number;            // null = unlimited

  // Responsive
  hideOnMobile?: boolean;
  stackOrder?: number;  // Order when stacked on mobile
}

// Example zone configuration for "Magazine" layout
const magazineZones: Record<string, ZoneConfig> = {
  hero: {
    id: "hero",
    name: "Hero Area",
    gridColumn: "1 / -1",
    maxBlocks: 1,
    allowedBlockTypes: ["hero", "carousel", "image"],
  },
  main: {
    id: "main",
    name: "Main Content",
    gridColumn: "1 / 2",
    width: "70%",
    stackOrder: 1,
  },
  sidebar: {
    id: "sidebar",
    name: "Sidebar",
    gridColumn: "2 / 3",
    width: "30%",
    minWidth: "280px",
    hideOnMobile: false,
    stackOrder: 2,
    allowedBlockTypes: ["news-feed", "calendar-mini", "sponsors", "text"],
  },
};
```

---

## Advantage Over Wild Apricot "Stripes"

### Wild Apricot Stripes

```
[====== STRIPE 1: Full width, horizontal ======]
[====== STRIPE 2: Full width, horizontal ======]
[====== STRIPE 3: Full width, horizontal ======]
```

- Every section spans full width
- Limited column control WITHIN stripes
- No true sidebars (must fake with columns in stripe)
- Cannot have persistent sidebar across multiple stripes
- Predictable but rigid

### ClubOS Block-Based Layouts

```
┌───────────────┬────────────┐
│               │            │
│  Main zone    │  Sidebar   │
│  (any blocks) │  (persists │
│               │   across   │
│  [Block]      │   scroll)  │
│  [Block]      │            │
│  [Block]      │  [Widget]  │
│               │  [Widget]  │
└───────────────┴────────────┘
```

- True structural zones (not faked with columns)
- Blocks can be any shape within zone
- Sidebars persist while main content scrolls
- CSS Grid-based responsive behavior
- Magazine, portal, and dashboard layouts impossible in WA

---

## Implementation Plan

### Phase 1: Foundation

1. Create `LayoutTemplate` Prisma model
2. Define built-in templates (Classic, Magazine, Dashboard, Portal, Focus)
3. Create zone configuration schema

### Phase 2: Shell Refactor

4. Refactor `MemberShell.tsx` to be zone-aware
5. Create `PortalShell.tsx` for left-nav layouts
6. Create `MagazineShell.tsx` for sidebar layouts
7. Create generic `ZoneContainer` component

### Phase 3: Page Integration

8. Add `layoutTemplateId` to Page model
9. Update page builder to render zones
10. Allow block drag-drop between zones

### Phase 4: Brand Configuration

11. Allow brands to select default layout template
12. Allow per-page template override
13. Admin UI for template selection

---

## Files to Create/Modify

### Schema (HOTSPOT)
- `prisma/schema.prisma` - Add LayoutTemplate model, Page relation

### Shell Components
- `src/templates/shells/ClassicShell.tsx` - Rename from MemberShell
- `src/templates/shells/MagazineShell.tsx` - Top nav + right sidebar
- `src/templates/shells/PortalShell.tsx` - Top nav + left nav
- `src/templates/shells/DashboardShell.tsx` - Rename from AdminShell
- `src/templates/shells/FocusShell.tsx` - Minimal reading layout
- `src/templates/shells/IntranetShell.tsx` - Dual sidebar

### Zone Components
- `src/components/layout/ZoneContainer.tsx` - Renders zone with blocks
- `src/components/layout/ZoneDropTarget.tsx` - Drag-drop for page builder

### Configuration
- `src/lib/layouts/layoutRegistry.ts` - Built-in template definitions
- `src/lib/layouts/zoneConfig.ts` - Zone configuration types

### Page Builder Updates
- `src/app/admin/content/pages/[id]/PageEditorClient.tsx` - Zone-aware editing

---

## Default Templates

| Template | Nav | Sidebar | Use Case |
|----------|-----|---------|----------|
| `classic` | Top | None | Landing pages, simple content |
| `magazine` | Top | Right | Member home, content pages |
| `portal` | Top + Left | None | Complex navigation |
| `dashboard` | Top | Left | Admin, management |
| `focus` | Minimal | None | Articles, forms |
| `intranet` | Top | Both | Rich social platforms |

---

## Migration Strategy

1. Current `MemberShell` → `classic` template
2. Current `AdminShell` → `dashboard` template
3. Member home page → `magazine` template (add sidebar)
4. Public pages → `classic` or `focus` based on content

---

## Related

- Theme schema: `src/lib/themes/schema.ts`
- Current shells: `src/templates/member/MemberShell.tsx`, `src/templates/admin/AdminShell.tsx`
- Page model: `prisma/schema.prisma`
- Competitive analysis: `docs/COMPETITIVE_ANALYSIS.md` (WA stripes section)
