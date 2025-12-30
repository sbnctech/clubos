/**
 * Shell System Types
 *
 * Type definitions for layout shells - the structural wrappers that
 * implement each layout type's grid and section arrangement.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 *
 * @see docs/projects/PAGE_PRESENTATION_SYSTEM.md
 */

import type { ReactNode } from "react";
import type {
  LayoutType,
  LayoutConfig,
  SectionConfig,
  AuthPosition,
  NavPosition,
} from "@/lib/layouts/schema";

// ============================================================================
// Shell Props
// ============================================================================

/**
 * Props passed to all shell components.
 */
export interface ShellProps {
  /** Layout configuration from registry */
  layout: LayoutConfig;

  /** Override auth position (must be in allowedAuthPositions) */
  authPosition?: AuthPosition;

  /** Child content for each section */
  children?: ReactNode;

  /** Section content map (alternative to children) */
  sections?: Record<string, ReactNode>;

  /** Custom CSS class for the shell container */
  className?: string;

  /** Whether this is a preview render (disables interactions) */
  isPreview?: boolean;

  /** Whether the user is authenticated */
  isAuthenticated?: boolean;

  /** Current user data for auth UI */
  user?: ShellUser | null;

  /** Navigation items */
  navItems?: NavItem[];

  /** Callbacks for auth actions */
  onLogin?: () => void;
  onLogout?: () => void;
  onNavigate?: (href: string) => void;
}

/**
 * Minimal user data needed for shell auth UI.
 */
export interface ShellUser {
  id: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  initials?: string;
}

/**
 * Navigation item for shell nav components.
 */
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  isActive?: boolean;
  isExternal?: boolean;
  children?: NavItem[];
  /** Capability required to see this item */
  capability?: string;
}

// ============================================================================
// Section Render Props
// ============================================================================

/**
 * Props passed to section render functions.
 */
export interface SectionRenderProps {
  /** Section configuration */
  section: SectionConfig;

  /** Content for this section */
  content: ReactNode;

  /** Whether shell is in preview mode */
  isPreview?: boolean;

  /** Custom className for the section */
  className?: string;
}

/**
 * Props for the main content section.
 */
export interface MainSectionProps extends SectionRenderProps {
  /** Maximum width constraint */
  maxWidth?: string;
}

/**
 * Props for sidebar sections.
 */
export interface SidebarSectionProps extends SectionRenderProps {
  /** Position: left or right */
  position: "left" | "right";

  /** Width of the sidebar */
  width?: string;

  /** Whether sidebar is collapsible */
  collapsible?: boolean;

  /** Whether sidebar is currently collapsed */
  collapsed?: boolean;

  /** Callback when collapse state changes */
  onToggleCollapse?: () => void;
}

// ============================================================================
// Navigation Props
// ============================================================================

/**
 * Props for top navigation component.
 */
export interface TopNavProps {
  /** Navigation items */
  items: NavItem[];

  /** Logo/brand element */
  logo?: ReactNode;

  /** Auth UI element (when authPosition is top-right) */
  authUI?: ReactNode;

  /** Navigation position configuration */
  navPosition: NavPosition;

  /** Whether to show mobile menu toggle */
  showMobileToggle?: boolean;

  /** Mobile menu open state */
  mobileMenuOpen?: boolean;

  /** Toggle mobile menu */
  onMobileToggle?: () => void;

  /** Custom className */
  className?: string;
}

/**
 * Props for side navigation component.
 */
export interface SideNavProps {
  /** Navigation items */
  items: NavItem[];

  /** Position: left or right */
  position: "left" | "right";

  /** Auth UI element (when authPosition is bottom-left) */
  authUI?: ReactNode;

  /** Whether collapsed */
  collapsed?: boolean;

  /** Custom className */
  className?: string;
}

/**
 * Props for mobile navigation component.
 */
export interface MobileNavProps {
  /** Navigation items */
  items: NavItem[];

  /** Whether menu is open */
  isOpen: boolean;

  /** Close the menu */
  onClose: () => void;

  /** Auth UI element */
  authUI?: ReactNode;

  /** Custom className */
  className?: string;
}

// ============================================================================
// Auth UI Props
// ============================================================================

/**
 * Props for auth corner component (top-right).
 */
export interface AuthCornerProps {
  /** Whether user is authenticated */
  isAuthenticated: boolean;

  /** Current user */
  user?: ShellUser | null;

  /** Login callback */
  onLogin?: () => void;

  /** Logout callback */
  onLogout?: () => void;

  /** Whether in preview mode */
  isPreview?: boolean;

  /** Custom className */
  className?: string;
}

/**
 * Props for sidebar auth component (bottom-left).
 */
export interface SidebarAuthProps extends AuthCornerProps {
  /** Whether sidebar is collapsed */
  collapsed?: boolean;
}

/**
 * Props for user menu dropdown.
 */
export interface UserMenuProps {
  /** Current user */
  user: ShellUser;

  /** Menu items */
  menuItems?: UserMenuItem[];

  /** Logout callback */
  onLogout?: () => void;

  /** Custom className */
  className?: string;
}

/**
 * User menu item.
 */
export interface UserMenuItem {
  id: string;
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: string;
  divider?: boolean;
}

/**
 * Props for user avatar.
 */
export interface UserAvatarProps {
  /** User data */
  user: ShellUser;

  /** Size variant */
  size?: "sm" | "md" | "lg";

  /** Show online status indicator */
  showStatus?: boolean;

  /** Custom className */
  className?: string;
}

// ============================================================================
// Shell Context
// ============================================================================

/**
 * Context value for shell components.
 */
export interface ShellContextValue {
  /** Current layout configuration */
  layout: LayoutConfig;

  /** Current layout type */
  layoutType: LayoutType;

  /** Current auth position */
  authPosition: AuthPosition;

  /** Whether in preview mode */
  isPreview: boolean;

  /** Whether user is authenticated */
  isAuthenticated: boolean;

  /** Current user */
  user: ShellUser | null;

  /** Navigation items */
  navItems: NavItem[];

  /** Mobile menu state */
  mobileMenuOpen: boolean;

  /** Toggle mobile menu */
  toggleMobileMenu: () => void;

  /** Sidebar collapse state (for layouts with collapsible sidebars) */
  sidebarCollapsed: boolean;

  /** Toggle sidebar collapse */
  toggleSidebar: () => void;
}

// ============================================================================
// Shell Registry Types
// ============================================================================

/**
 * Shell component type.
 */
export type ShellComponent = React.ComponentType<ShellProps>;

/**
 * Shell registry entry.
 */
export interface ShellRegistryEntry {
  /** Layout type this shell implements */
  layoutType: LayoutType;

  /** Shell component */
  component: ShellComponent;

  /** Display name */
  name: string;

  /** Description */
  description?: string;
}

/**
 * Shell registry.
 */
export type ShellRegistry = Map<LayoutType, ShellRegistryEntry>;

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Extract section IDs from a layout config.
 */
export type SectionIds<T extends LayoutConfig> =
  T["sections"][number]["id"];

/**
 * Section content map type.
 */
export type SectionContentMap = Record<string, ReactNode>;

/**
 * CSS Grid area assignment.
 */
export interface GridAreaAssignment {
  sectionId: string;
  gridArea: string;
  element: ReactNode;
}
