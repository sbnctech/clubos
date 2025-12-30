/**
 * Dashboard Shell
 *
 * Admin-style layout with left sidebar navigation.
 * Supports bottom-left auth position (Linear/Notion style).
 * NOT WA-compatible.
 *
 * Structure:
 * ┌────────────┬────────────────────────┐
 * │            │        Header          │
 * │            ├────────────────────────┤
 * │   NavLeft  │                        │
 * │            │         Main           │
 * │            │                        │
 * │   [Auth]   │                        │
 * └────────────┴────────────────────────┘
 *
 * Auth can be bottom-left (in sidebar) or top-right (in header)
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

"use client";

import type { ReactNode, CSSProperties } from "react";
import type { ShellProps } from "./types";
import { ShellProvider, useShell, useSidebar } from "./ShellContext";
import { getLayout } from "@/lib/layouts/registry";

// ============================================================================
// Dashboard Shell Props
// ============================================================================

export interface DashboardShellProps extends Omit<ShellProps, "layout"> {
  /** Header content (appears in main area) */
  header?: ReactNode;

  /** Left sidebar navigation content */
  navLeft?: ReactNode;

  /** Main content */
  main?: ReactNode;

  /** Logo/brand element for sidebar top */
  logo?: ReactNode;

  /** Auth element for bottom-left position */
  sidebarAuth?: ReactNode;

  /** Auth element for top-right position (in header) */
  headerAuth?: ReactNode;

  /** Navigation sidebar width */
  navWidth?: string;

  /** Collapsed sidebar width */
  collapsedWidth?: string;

  /** Whether sidebar is collapsible */
  collapsible?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function DashboardShell({
  authPosition = "bottom-left",
  children,
  sections,
  className,
  isPreview = false,
  isAuthenticated = false,
  user,
  navItems = [],
  onLogin: _onLogin,
  onLogout: _onLogout,
  onNavigate: _onNavigate,
  header,
  navLeft,
  main,
  logo,
  sidebarAuth,
  headerAuth,
  navWidth = "250px",
  collapsedWidth = "60px",
  collapsible = true,
}: DashboardShellProps) {
  const layout = getLayout("dashboard");

  return (
    <ShellProvider
      layout={layout}
      authPosition={authPosition}
      isPreview={isPreview}
      isAuthenticated={isAuthenticated}
      user={user}
      navItems={navItems}
    >
      <DashboardShellInner
        className={className}
        isPreview={isPreview}
        header={header ?? sections?.header}
        navLeft={navLeft ?? sections?.["nav-left"]}
        main={main ?? sections?.main ?? children}
        logo={logo}
        sidebarAuth={sidebarAuth}
        headerAuth={headerAuth}
        navWidth={navWidth}
        collapsedWidth={collapsedWidth}
        collapsible={collapsible}
      />
    </ShellProvider>
  );
}

// Inner component to access context
interface DashboardShellInnerProps {
  className?: string;
  isPreview: boolean;
  header: ReactNode;
  navLeft: ReactNode;
  main: ReactNode;
  logo?: ReactNode;
  sidebarAuth?: ReactNode;
  headerAuth?: ReactNode;
  navWidth: string;
  collapsedWidth: string;
  collapsible: boolean;
}

function DashboardShellInner({
  className,
  isPreview,
  header,
  navLeft,
  main,
  logo,
  sidebarAuth,
  headerAuth,
  navWidth,
  collapsedWidth,
  collapsible,
}: DashboardShellInnerProps) {
  const { authPosition, isAuthenticated: _isAuthenticated } = useShell();
  const { collapsed, toggle } = useSidebar();

  const currentNavWidth = collapsed ? collapsedWidth : navWidth;

  const gridStyles: CSSProperties = {
    display: "grid",
    gridTemplateAreas: `
      "nav-left header"
      "nav-left main"
    `,
    gridTemplateColumns: `${currentNavWidth} 1fr`,
    gridTemplateRows: "auto 1fr",
    minHeight: "100vh",
    transition: "grid-template-columns 0.2s ease",
  };

  const showSidebarAuth = authPosition === "bottom-left" && !isPreview;
  const showHeaderAuth = authPosition === "top-right" && !isPreview;

  return (
    <div
      className={`shell shell-dashboard ${className || ""}`}
      style={gridStyles}
      data-layout="dashboard"
      data-preview={isPreview || undefined}
      data-sidebar-collapsed={collapsed || undefined}
    >
      {/* Left Sidebar */}
      <aside
        className="shell-section shell-section-nav-left"
        style={{
          gridArea: "nav-left",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid var(--token-color-border, #e5e5e5)",
          backgroundColor: "var(--token-color-surface-dark, #1f2937)",
          color: "var(--token-color-text-inverse, #fff)",
          overflow: "hidden",
        }}
        data-section="nav-left"
      >
        {/* Logo / Brand */}
        <div
          className="dashboard-sidebar-logo"
          style={{
            padding: "var(--token-spacing-space4, 1rem)",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
          }}
        >
          {!collapsed && logo}
          {collapsible && (
            <button
              type="button"
              onClick={toggle}
              className="dashboard-collapse-toggle"
              style={{
                padding: "var(--token-spacing-space1, 0.25rem)",
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: "var(--token-shape-radius-sm, 4px)",
                color: "inherit",
                cursor: "pointer",
              }}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? "→" : "←"}
            </button>
          )}
        </div>

        {/* Navigation Content */}
        <nav
          className="dashboard-sidebar-nav"
          style={{
            flex: 1,
            overflow: "auto",
            padding: collapsed ? "var(--token-spacing-space2, 0.5rem)" : "var(--token-spacing-space3, 0.75rem)",
          }}
        >
          {navLeft}
        </nav>

        {/* Bottom Auth (if bottom-left position) */}
        {showSidebarAuth && (
          <div
            className="dashboard-sidebar-auth"
            style={{
              padding: "var(--token-spacing-space3, 0.75rem)",
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {sidebarAuth}
          </div>
        )}
      </aside>

      {/* Header (in main area) */}
      <header
        className="shell-section shell-section-header"
        style={{
          gridArea: "header",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--token-spacing-space3, 0.75rem) var(--token-spacing-space4, 1rem)",
          borderBottom: "1px solid var(--token-color-border, #e5e5e5)",
          backgroundColor: "var(--token-color-background, #fff)",
        }}
        data-section="header"
      >
        <div className="dashboard-header-content" style={{ flex: 1 }}>
          {header}
        </div>
        {showHeaderAuth && (
          <div className="dashboard-header-auth">{headerAuth}</div>
        )}
      </header>

      {/* Main Content */}
      <main
        className="shell-section shell-section-main"
        style={{
          gridArea: "main",
          padding: "var(--token-spacing-space4, 1rem)",
          overflow: "auto",
          backgroundColor: "var(--token-color-background, #fff)",
        }}
        data-section="main"
      >
        {main}
      </main>
    </div>
  );
}

// ============================================================================
// CSS Generation
// ============================================================================

export function generateDashboardShellCSS(): string {
  return `
.shell-dashboard {
  display: grid;
  grid-template-areas:
    "nav-left header"
    "nav-left main";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
}

.shell-dashboard .shell-section-nav-left {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.shell-dashboard[data-sidebar-collapsed] {
  grid-template-columns: 60px 1fr;
}

.shell-dashboard .dashboard-sidebar-nav {
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.3) transparent;
}

/* Responsive - overlay sidebar on mobile */
@media (max-width: 768px) {
  .shell-dashboard {
    grid-template-areas:
      "header"
      "main";
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
  }

  .shell-dashboard .shell-section-nav-left {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 250px;
    z-index: 200;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .shell-dashboard[data-mobile-nav-open] .shell-section-nav-left {
    transform: translateX(0);
  }
}
`.trim();
}
