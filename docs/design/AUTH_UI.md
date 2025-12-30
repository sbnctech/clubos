<!--
  Copyright © 2025 Murmurant, Inc. All rights reserved.
-->

# Authentication UI Design

How users see their login status and access account functions.

---

## The Auth Corner

Authentication status is always shown in the **top-right corner** of the navigation bar - the universal web convention.

### Logged Out State

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]    Home   Events   Groups   About      [Log In]     │
└─────────────────────────────────────────────────────────────┘
```

Or with a prominent join CTA:

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]    Home   Events   Groups   About    [Log In] [Join]│
└─────────────────────────────────────────────────────────────┘
                                                         ↑
                                               Highlighted button
```

**Design:**
- "Log In" as text link or subtle button
- "Join" as primary colored button (stands out)
- On mobile: both in hamburger menu

---

### Logged In State - Member

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]    Home   Events   Groups   About     [👤 Susan ▾]  │
└─────────────────────────────────────────────────────────────┘
                                                      ↓ click
                                        ┌─────────────────────┐
                                        │  Susan Martinez     │
                                        │  Member since 2022  │
                                        ├─────────────────────┤
                                        │  👤 My Profile      │
                                        │  📅 My Events       │
                                        │  👥 My Groups       │
                                        │  ⚙️ Settings        │
                                        ├─────────────────────┤
                                        │  🚪 Log Out         │
                                        └─────────────────────┘
```

**What's shown:**
- First name (truncated if long: "Alexandr…")
- Optional: avatar/photo if uploaded
- Dropdown arrow indicates menu available

**Dropdown contains:**
- Full name + member status
- Quick links to personal pages
- Settings
- Log out

---

### Logged In State - Admin/Leader

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]    Home   Events   Groups   About   [👤 Susan ▾] ⚙️ │
└─────────────────────────────────────────────────────────────┘
                                                           ↑
                                              Admin gear icon
                                              (links to /admin)
```

Or with role badge:

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]    Home   Events   Groups   About  [👤 Susan ▾]     │
│                                             Admin           │
└─────────────────────────────────────────────────────────────┘
                                                ↑
                                        Small role badge
```

**Dropdown for admins:**

```
                                        ┌─────────────────────┐
                                        │  Susan Martinez     │
                                        │  President          │
                                        ├─────────────────────┤
                                        │  ⚙️ Admin Dashboard │
                                        ├─────────────────────┤
                                        │  👤 My Profile      │
                                        │  📅 My Events       │
                                        │  👥 My Groups       │
                                        │  ⚙️ Settings        │
                                        ├─────────────────────┤
                                        │  🚪 Log Out         │
                                        └─────────────────────┘
```

---

## Mobile Navigation

### Logged Out

```
┌─────────────────────────┐
│  [Logo]           [☰]   │
└─────────────────────────┘
              ↓ tap hamburger
┌─────────────────────────┐
│                    [✕]  │
│                         │
│  Home                   │
│  Events                 │
│  Groups                 │
│  About                  │
│                         │
│  ─────────────────────  │
│                         │
│  [Log In]               │
│  [Join - It's Free]     │
│                         │
└─────────────────────────┘
```

### Logged In

```
┌─────────────────────────┐
│  [Logo]           [☰]   │
└─────────────────────────┘
              ↓ tap hamburger
┌─────────────────────────┐
│  ┌─────┐                │
│  │ 👤  │ Susan Martinez │
│  └─────┘ Member         │
│                    [✕]  │
│  ─────────────────────  │
│                         │
│  Home                   │
│  Events                 │
│  Groups                 │
│  About                  │
│                         │
│  ─────────────────────  │
│                         │
│  My Profile             │
│  My Events              │
│  My Groups              │
│  Settings               │
│                         │
│  ─────────────────────  │
│                         │
│  Log Out                │
│                         │
└─────────────────────────┘
```

---

## Avatar Options

### With Photo

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]    Home   Events   Groups   About    [📷] Susan ▾   │
└─────────────────────────────────────────────────────────────┘
                                                 ↑
                                           32px circle
                                           with member photo
```

### Without Photo (Initials)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]    Home   Events   Groups   About    [SM] Susan ▾   │
└─────────────────────────────────────────────────────────────┘
                                                 ↑
                                           32px circle
                                           with initials
                                           on brand color
```

### Icon Only (Compact)

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]    Home   Events   Groups   About         [👤 ▾]    │
└─────────────────────────────────────────────────────────────┘
```

Used when space is tight or name would be too long.

---

## Session Status Indicators

### Active Session (Normal)

No special indicator - just shows name/avatar.

### Session Expiring Soon

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo]    Home   Events   Groups   About    [👤 Susan ▾]   │
└─────────────────────────────────────────────────────────────┘
                                                      │
                        ┌─────────────────────────────┴───────┐
                        │  ⚠️ Your session expires in 5 min   │
                        │                                     │
                        │  [Stay Logged In]  [Log Out Now]    │
                        └─────────────────────────────────────┘
```

### After Logout (Confirmation)

```
┌─────────────────────────────────────────────────────────────┐
│  ✓ You've been logged out                          [✕]      │
└─────────────────────────────────────────────────────────────┘
```

Brief toast notification, auto-dismisses after 3 seconds.

---

## Role Visibility

### What Roles Are Shown

| Role | Badge/Indicator | Where Visible |
|------|-----------------|---------------|
| Member | None (default) | Dropdown only |
| Board Member | "Board" badge | Dropdown, optional in nav |
| Committee Chair | Committee name | Dropdown only |
| President/VP | Title | Dropdown, optional badge |
| Admin | "Admin" badge or ⚙️ icon | Nav bar + dropdown |

### Admin Indicator Options

**Option A: Gear Icon**
```
[👤 Susan ▾] [⚙️]
```

**Option B: Text Badge**
```
[👤 Susan ▾]
    Admin
```

**Option C: Combined**
```
[👤 Susan (Admin) ▾]
```

**Recommendation:** Option A (gear icon) - less visual clutter, universally understood.

---

## Component Structure

```tsx
// AuthCorner.tsx - The complete auth UI component

interface AuthCornerProps {
  variant?: "full" | "compact" | "icon-only";
  showJoinButton?: boolean;
}

// States handled:
// 1. Loading (checking session)
// 2. Logged out
// 3. Logged in (member)
// 4. Logged in (admin/leader)
```

### Subcomponents

```
src/components/auth/
├── AuthCorner.tsx          # Main container
├── LoginButton.tsx         # "Log In" link/button
├── JoinButton.tsx          # "Join" CTA button
├── UserMenu.tsx            # Logged-in dropdown
├── UserAvatar.tsx          # Photo or initials
├── RoleBadge.tsx           # Admin/Board badge
├── SessionWarning.tsx      # Expiring session alert
└── MobileAuthMenu.tsx      # Mobile-specific layout
```

---

## Accessibility

### Keyboard Navigation

- **Tab** to focus auth corner
- **Enter/Space** to open dropdown
- **Arrow keys** to navigate dropdown items
- **Escape** to close dropdown
- **Tab** out to close and move to next element

### Screen Readers

```html
<!-- Logged out -->
<button aria-label="Log in to your account">Log In</button>

<!-- Logged in -->
<button
  aria-label="Account menu for Susan Martinez"
  aria-expanded="false"
  aria-haspopup="menu"
>
  <span class="avatar" aria-hidden="true">SM</span>
  <span>Susan</span>
</button>

<!-- Dropdown -->
<menu role="menu" aria-label="Account options">
  <menuitem role="menuitem">My Profile</menuitem>
  ...
</menu>
```

### Focus Indicators

```css
.auth-corner:focus-visible {
  outline: 2px solid var(--token-color-primary);
  outline-offset: 2px;
}
```

---

## Page Context Indicators

### On Member-Only Pages

When viewing a page that requires login, show context:

```
┌─────────────────────────────────────────────────────────────┐
│  🔒 Members Only                                            │
│                                                             │
│  This page is only visible to logged-in members.            │
│                                                             │
│  [Log In]  or  [Join to Access]                             │
└─────────────────────────────────────────────────────────────┘
```

### Viewing as Different Role (Admin Preview)

```
┌─────────────────────────────────────────────────────────────┐
│  👁️ Viewing as: Public (not logged in)              [Exit] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [Page content as public would see it]                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Login Flow Integration

### From "Log In" Click

```
1. User clicks [Log In]
   ↓
2. Modal or page shows login options:

   ┌─────────────────────────────────────────────────────────┐
   │                                                         │
   │              Welcome Back                               │
   │                                                         │
   │  ┌─────────────────────────────────────────────────┐   │
   │  │  📧 Email                                       │   │
   │  │  susan@example.com                              │   │
   │  └─────────────────────────────────────────────────┘   │
   │                                                         │
   │  [Continue with Passkey]                                │
   │                                                         │
   │  ─────────── or ───────────                             │
   │                                                         │
   │  [Send Magic Link]                                      │
   │                                                         │
   │  ─────────────────────────────────────────────────────  │
   │                                                         │
   │  Not a member? [Join the club]                          │
   │                                                         │
   └─────────────────────────────────────────────────────────┘
   ↓
3. After successful auth:
   - Modal closes
   - Nav updates to show logged-in state
   - Brief "Welcome back, Susan!" toast
```

### Redirect After Login

If user was trying to access a protected page:

```
1. User clicks link to "Members-Only Photos"
   ↓
2. Not logged in → redirect to login with return URL
   ↓
3. Login successful → redirect back to "Members-Only Photos"
   ↓
4. User sees the page they wanted
```

---

---

## App-Style Sidebar (Bottom-Left Identity)

Modern SaaS/developer tools (Linear, Notion, Discord, Slack, Figma) use a different pattern: **persistent left sidebar with user identity anchored at bottom-left**.

### When to Use This Style

| Use Case | Top-Right (Classic) | Bottom-Left (App) |
|----------|--------------------|--------------------|
| Public website | ✅ Recommended | ❌ Not appropriate |
| Member home/portal | ✅ Works | ✅ Works |
| Admin dashboard | ✅ Works | ✅ Recommended |
| Power user interfaces | ⚠️ Feels dated | ✅ Modern feel |

### App-Style Layout

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌────────────┬─────────────────────────────────────────┐   │
│  │            │                                         │   │
│  │  [Logo]    │         Page Title                      │   │
│  │            │                                         │   │
│  │  ────────  │  ┌─────────────────────────────────┐   │   │
│  │            │  │                                 │   │   │
│  │  🏠 Home   │  │                                 │   │   │
│  │  📅 Events │  │        Main Content             │   │   │
│  │  👥 Groups │  │                                 │   │   │
│  │  📸 Photos │  │                                 │   │   │
│  │            │  │                                 │   │   │
│  │            │  │                                 │   │   │
│  │            │  │                                 │   │   │
│  │            │  └─────────────────────────────────┘   │   │
│  │            │                                         │   │
│  │  ────────  │                                         │   │
│  │            │                                         │   │
│  │  ┌──────┐  │                                         │   │
│  │  │ [SM] │  │                                         │   │
│  │  │Susan │  │                                         │   │
│  │  └──────┘  │                                         │   │
│  │            │                                         │   │
│  └────────────┴─────────────────────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Bottom-Left User Component

```
┌────────────────────┐
│                    │
│  ┌────┐            │
│  │ 📷 │  Susan M.  │  ← Avatar + truncated name
│  └────┘  Member    │  ← Role/status (subtle)
│              [▾]   │  ← Dropdown trigger
│                    │
└────────────────────┘
```

Clicking opens upward popover:

```
                    ┌─────────────────────┐
                    │  Susan Martinez     │
                    │  susan@example.com  │
                    ├─────────────────────┤
                    │  👤 Profile         │
                    │  ⚙️ Settings        │
                    │  🎨 Appearance      │
                    ├─────────────────────┤
                    │  🚪 Log Out         │
                    └─────────────────────┘
┌────────────────────┐
│  ┌────┐            │
│  │ 📷 │  Susan M.  │
│  └────┘  Member    │
└────────────────────┘
```

### Expanded vs Collapsed Sidebar

**Expanded (default):**
```
┌────────────────────┐
│  [Logo] ClubName   │
│  ────────────────  │
│  🏠 Home           │
│  📅 Events         │
│  👥 Groups         │
│  📸 Photos         │
│                    │
│  ────────────────  │
│  ┌────┐            │
│  │ SM │ Susan M.   │
│  └────┘            │
└────────────────────┘
     240px wide
```

**Collapsed (icon-only):**
```
┌──────┐
│ [🔷] │  ← Logo bug
│ ──── │
│  🏠  │
│  📅  │
│  👥  │
│  📸  │
│      │
│ ──── │
│ [SM] │  ← Avatar only
└──────┘
  64px
```

Hover on collapsed shows tooltip with label.

### When Logged Out (App-Style)

Bottom area shows login prompt:

```
┌────────────────────┐
│                    │
│  🏠 Home           │
│  📅 Events         │
│  ℹ️ About          │
│                    │
│  ────────────────  │
│                    │
│  [Log In]          │
│                    │
└────────────────────┘
```

---

## Choosing Auth Placement

### Configuration Option

In brand/site settings:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  User Account Location                                      │
│                                                             │
│  Where should the login/account menu appear?                │
│                                                             │
│  ┌───────────────────────┐  ┌───────────────────────┐      │
│  │ ┌───────────────────┐ │  │ ┌───┬───────────────┐ │      │
│  │ │ Logo    Nav [User]│ │  │ │   │               │ │      │
│  │ ├───────────────────┤ │  │ │ N │   Content     │ │      │
│  │ │                   │ │  │ │ a │               │ │      │
│  │ │     Content       │ │  │ │ v │               │ │      │
│  │ │                   │ │  │ │   │               │ │      │
│  │ └───────────────────┘ │  │ │[U]│               │ │      │
│  │                       │  │ └───┴───────────────┘ │      │
│  │   Top-Right           │  │   Bottom-Left (App)   │      │
│  │   Traditional sites   │  │   Modern dashboards   │      │
│  └───────────────────────┘  └───────────────────────┘      │
│                                                             │
│  ● Top-right (recommended for club websites)               │
│  ○ Bottom-left sidebar (for portal/dashboard feel)         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Automatic Based on Layout

| Layout | Default Auth Position |
|--------|----------------------|
| Classic (top nav) | Top-right |
| Magazine (top + sidebar) | Top-right |
| Portal (left nav) | Bottom-left |
| Dashboard (left nav) | Bottom-left |
| Focus (minimal) | Top-right (minimal) |

User can override in settings.

---

## Compatibility Rules

### The Core Rule

> **Bottom-left auth requires a left sidebar to exist.**

You can't put the user menu at bottom-left if there's no left sidebar.

### Compatibility Matrix

| Layout | Has Left Sidebar? | Top-Right | Bottom-Left |
|--------|-------------------|-----------|-------------|
| Classic | ❌ No | ✅ Allowed | 🚫 Blocked |
| Magazine | ❌ No (right only) | ✅ Allowed | 🚫 Blocked |
| Portal | ✅ Yes | ✅ Allowed | ✅ Allowed |
| Dashboard | ✅ Yes | ✅ Allowed | ✅ Allowed |
| Focus | ❌ No | ✅ Allowed | 🚫 Blocked |
| Intranet | ✅ Yes (both) | ✅ Allowed | ✅ Allowed |

### System Behavior

#### When User Changes Layout

```
User has: Portal layout + Bottom-left auth
User switches to: Classic layout (no left sidebar)

System response:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ℹ️ Layout Changed                                          │
│                                                             │
│  Classic layout doesn't have a left sidebar, so the         │
│  login menu will move to the top-right.                     │
│                                                             │
│                                          [Got it]           │
└─────────────────────────────────────────────────────────────┘
```

Auth position auto-adjusts. No broken state possible.

#### When User Tries Invalid Combination

```
User has: Classic layout
User tries: Change auth to bottom-left

System response:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  User Account Location                                      │
│                                                             │
│  ● Top-right (current)                                      │
│  ○ Bottom-left sidebar                                      │
│       ↳ Requires a layout with left navigation.             │
│         [Switch to Portal layout]                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

Option is shown but disabled with explanation and fix action.

### Validation in Code

```typescript
// src/lib/layouts/validation.ts

interface LayoutAuthCompatibility {
  layout: LayoutType;
  hasLeftSidebar: boolean;
  allowedAuthPositions: AuthPosition[];
  defaultAuthPosition: AuthPosition;
}

const COMPATIBILITY: LayoutAuthCompatibility[] = [
  {
    layout: "classic",
    hasLeftSidebar: false,
    allowedAuthPositions: ["top-right"],
    defaultAuthPosition: "top-right",
  },
  {
    layout: "magazine",
    hasLeftSidebar: false,
    allowedAuthPositions: ["top-right"],
    defaultAuthPosition: "top-right",
  },
  {
    layout: "portal",
    hasLeftSidebar: true,
    allowedAuthPositions: ["top-right", "bottom-left"],
    defaultAuthPosition: "bottom-left",
  },
  {
    layout: "dashboard",
    hasLeftSidebar: true,
    allowedAuthPositions: ["top-right", "bottom-left"],
    defaultAuthPosition: "bottom-left",
  },
  {
    layout: "focus",
    hasLeftSidebar: false,
    allowedAuthPositions: ["top-right"],
    defaultAuthPosition: "top-right",
  },
  {
    layout: "intranet",
    hasLeftSidebar: true,
    allowedAuthPositions: ["top-right", "bottom-left"],
    defaultAuthPosition: "bottom-left",
  },
];

/**
 * Check if auth position is valid for layout
 */
export function isAuthPositionValid(
  layout: LayoutType,
  authPosition: AuthPosition
): boolean {
  const config = COMPATIBILITY.find((c) => c.layout === layout);
  return config?.allowedAuthPositions.includes(authPosition) ?? false;
}

/**
 * Get valid auth position, falling back to default if current is invalid
 */
export function getValidAuthPosition(
  layout: LayoutType,
  requestedPosition: AuthPosition
): AuthPosition {
  const config = COMPATIBILITY.find((c) => c.layout === layout);
  if (!config) return "top-right";

  if (config.allowedAuthPositions.includes(requestedPosition)) {
    return requestedPosition;
  }

  return config.defaultAuthPosition;
}

/**
 * Called when layout changes - returns new auth position if adjustment needed
 */
export function adjustAuthForLayout(
  newLayout: LayoutType,
  currentAuth: AuthPosition
): { position: AuthPosition; wasAdjusted: boolean } {
  const validPosition = getValidAuthPosition(newLayout, currentAuth);
  return {
    position: validPosition,
    wasAdjusted: validPosition !== currentAuth,
  };
}
```

### Database Constraint

```prisma
model Brand {
  // ...
  layout        LayoutType    @default(CLASSIC)
  authPosition  AuthPosition  @default(TOP_RIGHT)

  // Application-level validation ensures compatibility
  // No DB constraint needed - handled in service layer
}
```

### Service Layer Enforcement

```typescript
// src/lib/brands/brandService.ts

export async function updateBrandSettings(
  brandId: string,
  updates: Partial<BrandSettings>
): Promise<BrandSettings> {
  const current = await getBrandSettings(brandId);

  // If layout is changing, validate/adjust auth position
  if (updates.layout && updates.layout !== current.layout) {
    const { position, wasAdjusted } = adjustAuthForLayout(
      updates.layout,
      updates.authPosition ?? current.authPosition
    );

    if (wasAdjusted) {
      updates.authPosition = position;
      // Could return this info to show user notification
    }
  }

  // If auth position is changing, validate against current/new layout
  if (updates.authPosition) {
    const layout = updates.layout ?? current.layout;
    if (!isAuthPositionValid(layout, updates.authPosition)) {
      throw new ValidationError(
        `Auth position "${updates.authPosition}" is not compatible with layout "${layout}"`
      );
    }
  }

  return prisma.brand.update({
    where: { id: brandId },
    data: updates,
  });
}
```

### UI Prevention

Settings UI never allows invalid state:

```tsx
// LayoutSettings.tsx

function AuthPositionPicker({ layout, value, onChange }) {
  const config = COMPATIBILITY.find((c) => c.layout === layout);

  return (
    <RadioGroup value={value} onChange={onChange}>
      <RadioOption
        value="top-right"
        label="Top-right"
        description="Traditional website style"
        disabled={false} // Always available
      />
      <RadioOption
        value="bottom-left"
        label="Bottom-left sidebar"
        description="Modern app style"
        disabled={!config?.hasLeftSidebar}
        disabledReason={
          !config?.hasLeftSidebar
            ? "Requires a layout with left navigation"
            : undefined
        }
      />
    </RadioGroup>
  );
}
```

---

## Summary: Fail-Safe Behavior

| Scenario | System Behavior |
|----------|-----------------|
| User picks incompatible combo in UI | Option disabled with explanation |
| Layout changes, auth now invalid | Auto-adjust + notify user |
| API receives invalid combo | Validation error returned |
| Database has invalid state (legacy) | Runtime falls back to valid default |

**Principle:** The system should make it impossible to create a broken layout. Invalid states are prevented in UI, validated in API, and gracefully handled if they somehow occur.

---

## Summary: Visual States

| State | Nav Shows | Dropdown |
|-------|-----------|----------|
| **Loading** | Skeleton shimmer | N/A |
| **Logged out** | [Log In] [Join] | N/A |
| **Member** | [Avatar] Name ▾ | Profile, Events, Groups, Settings, Logout |
| **Admin** | [Avatar] Name ▾ ⚙️ | Admin Dashboard + member options |
| **Session expiring** | Warning badge | Stay logged in / Logout |

**Placement options:**
- **Top-right:** Traditional, best for public-facing club sites
- **Bottom-left:** Modern app-style, best for member portals and admin
