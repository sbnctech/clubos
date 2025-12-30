<!--
  Copyright © 2025 Murmurant, Inc. All rights reserved.
-->

# Navigation System Design

How users configure and manage site navigation.

---

## Navigation Types We Support

### 1. Primary Navigation (Site-Wide)

The main way visitors move between major sections.

#### A. Top Bar (Horizontal)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]    Home   Events   Groups   About   Contact  [Login]│
└─────────────────────────────────────────────────────────────┘
```

**Characteristics:**
- Most familiar to users
- Works well for 4-8 main items
- Can include dropdowns for sub-items
- Collapses to hamburger on mobile

**Best for:** Most club sites, public-facing pages

#### B. Left Sidebar

```
┌──────────┬──────────────────────────────────────────────────┐
│  [Logo]  │                                                  │
│          │                                                  │
│  Home    │              Page Content                        │
│  Events  │                                                  │
│  Groups  │                                                  │
│  ├─Book  │                                                  │
│  ├─Wine  │                                                  │
│  └─Hike  │                                                  │
│  About   │                                                  │
│  Contact │                                                  │
│          │                                                  │
│  [Login] │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

**Characteristics:**
- Shows hierarchy clearly (expandable sections)
- Good for many items (10-20+)
- Always visible while scrolling
- Uses horizontal space

**Best for:** Complex sites, member portals, admin areas

#### C. Top Bar + Left Sidebar (Combined)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]         Home   Events   Groups   About      [Login] │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                  │
│  Section │              Page Content                        │
│  ├─Sub1  │                                                  │
│  ├─Sub2  │                                                  │
│  └─Sub3  │                                                  │
│          │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

**Characteristics:**
- Top bar for main sections
- Left sidebar for current section's sub-pages
- Best of both worlds
- More complex to set up

**Best for:** Large sites with deep hierarchy

### 2. Secondary Navigation

Additional navigation within the page structure.

#### A. Breadcrumbs

```
Home > Events > Wine Tasting > January 2025
```

**When shown:** Automatically on pages 2+ levels deep

#### B. Section Navigation (In-Page)

```
┌─────────────────────────────────────────────────────────────┐
│  On This Page:                                              │
│  • Overview  • Details  • How to Register  • FAQ            │
└─────────────────────────────────────────────────────────────┘
```

**When shown:** Long pages with multiple sections

#### C. Footer Navigation

```
┌─────────────────────────────────────────────────────────────┐
│  Quick Links        About           Connect                 │
│  • Home             • Our History   • Contact Us            │
│  • Events           • Leadership    • Facebook              │
│  • Join             • Bylaws        • Newsletter            │
└─────────────────────────────────────────────────────────────┘
```

**When shown:** All pages (part of layout)

### 3. Contextual Navigation

Navigation that changes based on context.

#### A. Group Navigation (Within Activity Group)

```
┌──────────┬──────────────────────────────────────────────────┐
│  📚      │                                                  │
│  BOOK    │   Book Club Home                                 │
│  CLUB    │                                                  │
│  ─────── │   Currently reading: "The Midnight Library"      │
│  Home    │                                                  │
│  Events  │                                                  │
│  Members │                                                  │
│  Photos  │                                                  │
│  ─────── │                                                  │
│  ← Back  │                                                  │
│  to Club │                                                  │
└──────────┴──────────────────────────────────────────────────┘
```

**When shown:** Inside an activity group's pages

#### B. Member Account Navigation

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]    Home   Events   Groups   About    [Susan ▾]      │
│                                               ├─ My Profile │
│                                               ├─ My Events  │
│                                               ├─ My Groups  │
│                                               ├─ Settings   │
│                                               └─ Log Out    │
└─────────────────────────────────────────────────────────────┘
```

**When shown:** For logged-in members

---

## When Navigation Is Configured

### Phase 1: Site Setup (One-Time)

**When:** First time setting up the club's site
**Who:** Site administrator or initial setup wizard
**What they choose:**

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  How should your site navigation look?                      │
│                                                             │
│  ┌─────────────────┐   ┌─────────────────┐                 │
│  │ ┌─────────────┐ │   │ ┌───┬─────────┐ │                 │
│  │ │ ▬▬▬▬▬▬▬▬▬▬▬ │ │   │ │   │         │ │                 │
│  │ ├─────────────┤ │   │ │ ▌ │         │ │                 │
│  │ │             │ │   │ │ ▌ │         │ │                 │
│  │ │             │ │   │ │ ▌ │         │ │                 │
│  │ └─────────────┘ │   │ └───┴─────────┘ │                 │
│  │                 │   │                 │                 │
│  │  Top Navigation │   │ Side Navigation │                 │
│  │  (Recommended)  │   │                 │                 │
│  └─────────────────┘   └─────────────────┘                 │
│                                                             │
│  ○ Top navigation - clean, familiar, works for most clubs  │
│  ○ Side navigation - better for many pages or sections     │
│                                                             │
│  You can change this later in Settings.                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Phase 2: Menu Editor (Ongoing)

**When:** Anytime in admin
**Who:** Site administrator
**What they do:** Add, remove, reorder menu items

```
┌─────────────────────────────────────────────────────────────┐
│  Navigation Editor                              [Preview]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Primary Menu                                   [+ Add]     │
│  ─────────────────────────────────────────────────────────  │
│  ≡ Home                                            [Edit]   │
│  ≡ Events ▾                                        [Edit]   │
│     ├─ Calendar                                    [Edit]   │
│     ├─ Upcoming Events                             [Edit]   │
│     └─ Past Events                                 [Edit]   │
│  ≡ Activity Groups ▾                               [Edit]   │
│     ├─ Book Club                                   [Edit]   │
│     ├─ Wine Tasting                                [Edit]   │
│     └─ Hiking                                      [Edit]   │
│  ≡ About Us ▾                                      [Edit]   │
│     ├─ Our History                                 [Edit]   │
│     ├─ Leadership                                  [Edit]   │
│     └─ Bylaws                                      [Edit]   │
│  ≡ Contact                                         [Edit]   │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Footer Menu                                    [+ Add]     │
│  ─────────────────────────────────────────────────────────  │
│  ≡ Privacy Policy                                  [Edit]   │
│  ≡ Terms of Use                                    [Edit]   │
│                                                             │
│                              [Cancel]  [Save Changes]       │
└─────────────────────────────────────────────────────────────┘
```

### Phase 3: Page Settings (Per-Page)

**When:** Editing a specific page
**Who:** Content editor
**What they choose:**

```
┌─────────────────────────────────────────────────────────────┐
│  Page Settings: Wine Tasting Event                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Navigation                                                 │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Show in menu?                                              │
│  ○ Yes, add to primary menu                                 │
│  ○ Yes, add as sub-item under: [Events ▾]                  │
│  ● No, don't show in menu (page is still accessible)       │
│                                                             │
│  Show breadcrumbs?                                          │
│  ● Yes (Recommended)                                        │
│  ○ No                                                       │
│                                                             │
│  Show navigation on this page?                              │
│  ● Standard navigation                                      │
│  ○ Minimal (logo + account only) - for focused pages       │
│  ○ Hidden - for landing pages or embeds                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Navigation Configuration Model

### Data Structure

```prisma
model NavigationMenu {
  id        String   @id @default(uuid()) @db.Uuid
  brandId   String   @db.Uuid
  slug      String   // "primary", "footer", "mobile"
  name      String   // "Primary Menu", "Footer Menu"
  items     Json     // Ordered list of NavigationItem

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  brand     Brand    @relation(fields: [brandId], references: [id])

  @@unique([brandId, slug])
}

// NavigationItem structure (stored as JSON)
interface NavigationItem {
  id: string;
  label: string;
  type: "page" | "url" | "section";

  // For type="page"
  pageId?: string;

  // For type="url"
  url?: string;
  openInNewTab?: boolean;

  // For type="section" (expandable group)
  children?: NavigationItem[];

  // Visibility
  visibility: "public" | "members" | "admins";

  // Display
  icon?: string;    // Optional icon
  highlight?: boolean; // e.g., "Join" button styling
}
```

### Brand Settings

```prisma
model Brand {
  // ... existing fields

  // Navigation style
  navStyle        NavStyle   @default(TOP_BAR)
  navPosition     NavPosition @default(STICKY)
  showBreadcrumbs Boolean    @default(true)

  // Mobile behavior
  mobileNavStyle  MobileNavStyle @default(HAMBURGER)
}

enum NavStyle {
  TOP_BAR         // Horizontal top navigation
  LEFT_SIDEBAR    // Vertical left navigation
  TOP_WITH_LEFT   // Both (top for main, left for section)
}

enum NavPosition {
  STICKY          // Stays visible when scrolling
  FIXED           // Always at top (content scrolls under)
  STATIC          // Scrolls with page
}

enum MobileNavStyle {
  HAMBURGER       // ☰ menu that slides in
  BOTTOM_BAR      // Fixed bottom navigation
  DRAWER          // Full-screen drawer
}
```

---

## User Flows

### Flow 1: Initial Setup

```
1. Welcome wizard
   ↓
2. "What kind of club is this?"
   [Social Club] [Professional Association] [Hobby Group] [Other]
   ↓
3. "How many main sections will your site have?"
   [Just a few (3-5)] [Several (6-10)] [Many (10+)]
   ↓
4. Based on answers, recommend navigation style:

   ┌─────────────────────────────────────────────────────────┐
   │                                                         │
   │  Based on your answers, we recommend:                   │
   │                                                         │
   │  ┌───────────────────────────────────────────────────┐ │
   │  │  ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬  │ │
   │  │                                                   │ │
   │  │            Top Navigation                         │ │
   │  │                                                   │ │
   │  │  Clean and familiar - perfect for social clubs   │ │
   │  │  with a moderate number of pages.                │ │
   │  │                                                   │ │
   │  └───────────────────────────────────────────────────┘ │
   │                                                         │
   │              [Use This]   [See Other Options]           │
   │                                                         │
   └─────────────────────────────────────────────────────────┘
   ↓
5. Build initial menu from pages
```

### Flow 2: Adding a Page to Navigation

```
1. User creates new page "Wine Tasting Group"
   ↓
2. In page settings, sees:

   ┌─────────────────────────────────────────────────────────┐
   │                                                         │
   │  Add to menu?                                           │
   │                                                         │
   │  ● Don't add to menu                                    │
   │  ○ Add to primary menu                                  │
   │  ○ Add under: [Activity Groups ▾]                       │
   │                                                         │
   └─────────────────────────────────────────────────────────┘
   ↓
3. If they choose "Add under Activity Groups":
   - Page automatically appears in that menu section
   - No separate trip to menu editor needed
```

### Flow 3: Reorganizing Navigation

```
1. Admin goes to Settings → Navigation
   ↓
2. Sees drag-and-drop menu editor:

   ┌─────────────────────────────────────────────────────────┐
   │  Primary Menu                                           │
   │  ─────────────────────────                              │
   │  ≡ Home                                        [⋮]      │
   │  ≡ Events                                      [⋮]      │
   │  ≡ Activity Groups                             [⋮]      │
   │     ├─ Book Club          ← drag to reorder   [⋮]      │
   │     ├─ Wine Tasting                            [⋮]      │
   │     └─ Hiking                                  [⋮]      │
   │  ≡ About                                       [⋮]      │
   │                                                         │
   │  [+ Add Menu Item]                                      │
   └─────────────────────────────────────────────────────────┘
   ↓
3. Drag items to reorder
4. Click [⋮] for options: Edit, Move, Delete
5. Changes save automatically (with undo)
```

---

## Navigation Components

### React Components Needed

```
src/components/navigation/
├── PrimaryNav/
│   ├── TopNav.tsx           # Horizontal navigation
│   ├── SideNav.tsx          # Vertical sidebar navigation
│   ├── NavItem.tsx          # Individual menu item
│   ├── NavDropdown.tsx      # Dropdown for sub-items
│   └── MobileNav.tsx        # Hamburger menu
│
├── SecondaryNav/
│   ├── Breadcrumbs.tsx      # Breadcrumb trail
│   ├── SectionNav.tsx       # In-page navigation
│   └── FooterNav.tsx        # Footer links
│
├── ContextualNav/
│   ├── GroupNav.tsx         # Activity group sidebar
│   ├── AccountMenu.tsx      # Logged-in user menu
│   └── AdminNav.tsx         # Admin section navigation
│
└── Editor/
    ├── MenuEditor.tsx       # Drag-drop menu editor
    ├── MenuItemEditor.tsx   # Edit single item
    └── MenuPreview.tsx      # Live preview
```

---

## Smart Defaults

### For Social Clubs (Default)

- **Nav style:** Top bar
- **Position:** Sticky
- **Default items:** Home, Events, About, Contact, [Login/Account]
- **Mobile:** Hamburger menu

### For Large Organizations

- **Nav style:** Top bar + left sidebar
- **Position:** Sticky
- **Default items:** Main sections in top, sub-sections in left
- **Mobile:** Hamburger with expandable sections

### For Activity Groups

- **Nav style:** Context sidebar (auto-generated)
- **Items:** Home, Events, Members, Photos, back to main site

---

## Summary: User Decision Points

| When | What They Decide | How |
|------|-----------------|-----|
| **Site setup** | Navigation style (top vs side) | Setup wizard with recommendation |
| **Adding pages** | Whether page appears in menu | Page settings checkbox |
| **Organizing** | Menu structure and order | Drag-drop menu editor |
| **Per-page** | Show/hide nav, breadcrumbs | Page settings panel |
| **Styling** | Colors, hover effects | Theme settings (global) |

**Key principle:** Navigation style is a site-wide decision made once. Menu contents are managed as pages are created. Most users never touch the menu editor directly - they just check "add to menu" when creating pages.
