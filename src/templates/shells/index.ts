/**
 * Shell System
 *
 * Layout shells provide the structural skeleton for pages.
 * Each layout type has a corresponding shell component.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 *
 * @see docs/projects/PAGE_PRESENTATION_SYSTEM.md
 */

// Types
export type {
  ShellProps,
  ShellUser,
  NavItem,
  SectionRenderProps,
  MainSectionProps,
  SidebarSectionProps,
  TopNavProps,
  SideNavProps,
  MobileNavProps,
  AuthCornerProps,
  SidebarAuthProps,
  UserMenuProps,
  UserMenuItem,
  UserAvatarProps,
  ShellContextValue,
  ShellComponent,
  ShellRegistryEntry,
  ShellRegistry,
  SectionContentMap,
  GridAreaAssignment,
} from "./types";

// Context
export {
  ShellProvider,
  useShell,
  useShellOptional,
  useLayout,
  useLayoutType,
  useAuthPosition,
  useIsPreview,
  useMobileMenu,
  useSidebar,
} from "./ShellContext";

// Base Shell
export {
  BaseShell,
  ShellSection,
  generateShellCSS,
  getSection,
  getSectionsByType,
} from "./BaseShell";
export type { BaseShellProps, ShellSectionProps } from "./BaseShell";

// Layout-specific shells
export { ClassicShell, ClassicHeader, ClassicFooter, generateClassicShellCSS } from "./ClassicShell";
export type { ClassicShellProps, ClassicHeaderProps, ClassicFooterProps } from "./ClassicShell";

export { MagazineShell, generateMagazineShellCSS } from "./MagazineShell";
export type { MagazineShellProps } from "./MagazineShell";

export { PortalShell, generatePortalShellCSS } from "./PortalShell";
export type { PortalShellProps } from "./PortalShell";

export { DashboardShell, generateDashboardShellCSS } from "./DashboardShell";
export type { DashboardShellProps } from "./DashboardShell";

export { FocusShell, FocusContent, generateFocusShellCSS } from "./FocusShell";
export type { FocusShellProps, FocusContentProps } from "./FocusShell";

export { IntranetShell, generateIntranetShellCSS } from "./IntranetShell";
export type { IntranetShellProps } from "./IntranetShell";

// ============================================================================
// Shell Registry
// ============================================================================

import type { LayoutType } from "@/lib/layouts/schema";
import type { ShellComponent } from "./types";

import { ClassicShell } from "./ClassicShell";
import { MagazineShell } from "./MagazineShell";
import { PortalShell } from "./PortalShell";
import { DashboardShell } from "./DashboardShell";
import { FocusShell } from "./FocusShell";
import { IntranetShell } from "./IntranetShell";

/**
 * Map of layout types to shell components.
 */
export const SHELL_REGISTRY: Record<LayoutType, ShellComponent> = {
  classic: ClassicShell as ShellComponent,
  magazine: MagazineShell as ShellComponent,
  portal: PortalShell as ShellComponent,
  dashboard: DashboardShell as ShellComponent,
  focus: FocusShell as ShellComponent,
  intranet: IntranetShell as ShellComponent,
};

/**
 * Get the shell component for a layout type.
 */
export function getShell(layoutType: LayoutType): ShellComponent {
  const shell = SHELL_REGISTRY[layoutType];
  if (!shell) {
    throw new Error(`No shell registered for layout type: ${layoutType}`);
  }
  return shell;
}

/**
 * Check if a shell exists for a layout type.
 */
export function hasShell(layoutType: LayoutType): boolean {
  return layoutType in SHELL_REGISTRY;
}
