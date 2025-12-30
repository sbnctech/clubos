/**
 * Portal Shell
 *
 * Member portal layout with left navigation sidebar.
 * Good for member sections with secondary navigation.
 * NOT WA-compatible.
 *
 * Structure:
 * ┌─────────────────────────────────────┐
 * │             Header                  │
 * ├────────────┬────────────────────────┤
 * │            │                        │
 * │   NavLeft  │         Main           │
 * │            │                        │
 * ├────────────┴────────────────────────┤
 * │             Footer                  │
 * └─────────────────────────────────────┘
 *
 * Charter: P6 (human-first UI), P8 (stable contracts)
 */

"use client";

import type { ReactNode, CSSProperties } from "react";
import type { ShellProps } from "./types";
import { ShellProvider, useSidebar } from "./ShellContext";
import { getLayout } from "@/lib/layouts/registry";

// ============================================================================
// Portal Shell Props
// ============================================================================

export interface PortalShellProps extends Omit<ShellProps, "layout"> {
  /** Header content */
  header?: ReactNode;

  /** Left navigation sidebar content */
  navLeft?: ReactNode;

  /** Main content */
  main?: ReactNode;

  /** Footer content */
  footer?: ReactNode;

  /** Navigation sidebar width */
  navWidth?: string;

  /** Whether sidebar is collapsible */
  collapsible?: boolean;

  /** Initial collapsed state */
  defaultCollapsed?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function PortalShell({
  authPosition,
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
  footer,
  navWidth = "250px",
  collapsible = true,
  defaultCollapsed: _defaultCollapsed = false,
}: PortalShellProps) {
  const layout = getLayout("portal");

  // Grid styles
  const gridStyles: CSSProperties = {
    display: "grid",
    gridTemplateAreas: `
      "header header"
      "nav-left main"
      "footer footer"
    `,
    gridTemplateColumns: `minmax(200px, ${navWidth}) 1fr`,
    gridTemplateRows: "auto 1fr auto",
    minHeight: "100vh",
  };

  // Resolve content
  const headerContent = header ?? sections?.header;
  const navLeftContent = navLeft ?? sections?.["nav-left"];
  const mainContent = main ?? sections?.main ?? children;
  const footerContent = footer ?? sections?.footer;

  return (
    <ShellProvider
      layout={layout}
      authPosition={authPosition}
      isPreview={isPreview}
      isAuthenticated={isAuthenticated}
      user={user}
      navItems={navItems}
    >
      <PortalShellInner
        className={className}
        gridStyles={gridStyles}
        isPreview={isPreview}
        headerContent={headerContent}
        navLeftContent={navLeftContent}
        mainContent={mainContent}
        footerContent={footerContent}
        navWidth={navWidth}
        collapsible={collapsible}
      />
    </ShellProvider>
  );
}

// Inner component to access context
interface PortalShellInnerProps {
  className?: string;
  gridStyles: CSSProperties;
  isPreview: boolean;
  headerContent: ReactNode;
  navLeftContent: ReactNode;
  mainContent: ReactNode;
  footerContent: ReactNode;
  navWidth: string;
  collapsible: boolean;
}

function PortalShellInner({
  className,
  gridStyles,
  isPreview,
  headerContent,
  navLeftContent,
  mainContent,
  footerContent,
  navWidth,
  collapsible,
}: PortalShellInnerProps) {
  const { collapsed, toggle } = useSidebar();

  // Adjust grid when collapsed
  const adjustedGridStyles: CSSProperties = {
    ...gridStyles,
    gridTemplateColumns: collapsed ? "60px 1fr" : `minmax(200px, ${navWidth}) 1fr`,
    transition: "grid-template-columns 0.2s ease",
  };

  return (
    <div
      className={`shell shell-portal ${className || ""}`}
      style={adjustedGridStyles}
      data-layout="portal"
      data-preview={isPreview || undefined}
      data-sidebar-collapsed={collapsed || undefined}
    >
      {/* Header */}
      <header
        className="shell-section shell-section-header"
        style={{ gridArea: "header" }}
        data-section="header"
      >
        {headerContent}
      </header>

      {/* Left Navigation Sidebar */}
      <nav
        className="shell-section shell-section-nav-left"
        style={{
          gridArea: "nav-left",
          borderRight: "1px solid var(--token-color-border, #e5e5e5)",
          backgroundColor: "var(--token-color-surface, #f9fafb)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        data-section="nav-left"
      >
        {collapsible && (
          <button
            type="button"
            onClick={toggle}
            className="portal-collapse-toggle"
            style={{
              padding: "var(--token-spacing-space2, 0.5rem)",
              background: "none",
              border: "none",
              cursor: "pointer",
              alignSelf: collapsed ? "center" : "flex-end",
            }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "→" : "←"}
          </button>
        )}
        <div
          className="portal-nav-content"
          style={{
            flex: 1,
            overflow: "auto",
            opacity: collapsed ? 0 : 1,
            transition: "opacity 0.2s ease",
          }}
        >
          {navLeftContent}
        </div>
      </nav>

      {/* Main Content */}
      <main
        className="shell-section shell-section-main"
        style={{
          gridArea: "main",
          padding: "var(--token-spacing-space4, 1rem)",
          overflow: "auto",
        }}
        data-section="main"
      >
        {mainContent}
      </main>

      {/* Footer */}
      <footer
        className="shell-section shell-section-footer"
        style={{ gridArea: "footer" }}
        data-section="footer"
      >
        {footerContent}
      </footer>
    </div>
  );
}

// ============================================================================
// CSS Generation
// ============================================================================

export function generatePortalShellCSS(): string {
  return `
.shell-portal {
  display: grid;
  grid-template-areas:
    "header header"
    "nav-left main"
    "footer footer";
  grid-template-columns: 250px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
}

.shell-portal .shell-section-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--token-color-background, #fff);
}

.shell-portal .shell-section-nav-left {
  position: sticky;
  top: 60px;
  height: calc(100vh - 60px);
  overflow-y: auto;
}

.shell-portal[data-sidebar-collapsed] .shell-section-nav-left {
  width: 60px;
}

/* Responsive - hide nav on mobile */
@media (max-width: 768px) {
  .shell-portal {
    grid-template-areas:
      "header"
      "main"
      "footer";
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr auto;
  }

  .shell-portal .shell-section-nav-left {
    display: none;
  }
}
`.trim();
}
