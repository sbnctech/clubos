/**
 * Shell Context
 *
 * React context for sharing shell state across child components.
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

"use client";

import { createContext, useContext, useState, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import type {
  ShellContextValue,
  NavItem,
  ShellUser,
} from "./types";
import type { LayoutConfig, LayoutType, AuthPosition } from "@/lib/layouts/schema";

// ============================================================================
// Context
// ============================================================================

const ShellContext = createContext<ShellContextValue | null>(null);

// ============================================================================
// Provider Props
// ============================================================================

export interface ShellProviderProps {
  /** Layout configuration */
  layout: LayoutConfig;

  /** Override auth position */
  authPosition?: AuthPosition;

  /** Whether in preview mode */
  isPreview?: boolean;

  /** Whether user is authenticated */
  isAuthenticated?: boolean;

  /** Current user */
  user?: ShellUser | null;

  /** Navigation items */
  navItems?: NavItem[];

  /** Children */
  children: ReactNode;
}

// ============================================================================
// Provider
// ============================================================================

export function ShellProvider({
  layout,
  authPosition,
  isPreview = false,
  isAuthenticated = false,
  user = null,
  navItems = [],
  children,
}: ShellProviderProps) {
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sidebar collapse state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Resolve auth position
  const resolvedAuthPosition = useMemo(() => {
    if (authPosition && layout.allowedAuthPositions.includes(authPosition)) {
      return authPosition;
    }
    return layout.defaultAuthPosition;
  }, [authPosition, layout.allowedAuthPositions, layout.defaultAuthPosition]);

  // Toggle callbacks
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  // Context value
  const value = useMemo<ShellContextValue>(
    () => ({
      layout,
      layoutType: layout.id as LayoutType,
      authPosition: resolvedAuthPosition,
      isPreview,
      isAuthenticated,
      user,
      navItems,
      mobileMenuOpen,
      toggleMobileMenu,
      sidebarCollapsed,
      toggleSidebar,
    }),
    [
      layout,
      resolvedAuthPosition,
      isPreview,
      isAuthenticated,
      user,
      navItems,
      mobileMenuOpen,
      toggleMobileMenu,
      sidebarCollapsed,
      toggleSidebar,
    ]
  );

  return (
    <ShellContext.Provider value={value}>{children}</ShellContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook to access shell context.
 *
 * @throws Error if used outside ShellProvider
 */
export function useShell(): ShellContextValue {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error("useShell must be used within a ShellProvider");
  }
  return context;
}

/**
 * Hook to access shell context, returns null if not in provider.
 */
export function useShellOptional(): ShellContextValue | null {
  return useContext(ShellContext);
}

// ============================================================================
// Selector Hooks
// ============================================================================

/**
 * Hook to get just the layout configuration.
 */
export function useLayout(): LayoutConfig {
  const { layout } = useShell();
  return layout;
}

/**
 * Hook to get just the layout type.
 */
export function useLayoutType(): LayoutType {
  const { layoutType } = useShell();
  return layoutType;
}

/**
 * Hook to get the auth position.
 */
export function useAuthPosition(): AuthPosition {
  const { authPosition } = useShell();
  return authPosition;
}

/**
 * Hook to check if in preview mode.
 */
export function useIsPreview(): boolean {
  const { isPreview } = useShell();
  return isPreview;
}

/**
 * Hook to get mobile menu state.
 */
export function useMobileMenu(): {
  isOpen: boolean;
  toggle: () => void;
} {
  const { mobileMenuOpen, toggleMobileMenu } = useShell();
  return { isOpen: mobileMenuOpen, toggle: toggleMobileMenu };
}

/**
 * Hook to get sidebar state.
 */
export function useSidebar(): {
  collapsed: boolean;
  toggle: () => void;
} {
  const { sidebarCollapsed, toggleSidebar } = useShell();
  return { collapsed: sidebarCollapsed, toggle: toggleSidebar };
}
